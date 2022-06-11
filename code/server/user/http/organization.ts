import { ECommon_Organization_User_Role } from "../../../common/model/organization_user";
import organizationApi from "../../../common/routes/organization";
import { Err } from "../../../common/status/error";
import { REDIS_GATEWAY } from "../../common/cache/keys/gateway";
import { DComponent } from "../../common/decorate/component";
import { DHttpApi, DHttpController, DHttpReqParam, DHttpReqParamRequired, DHttpUser } from "../../common/http/http";
import { IUserSession } from "../../common/rpc/api/user";
import UserService from "../service/user";
import { OrganizationService, OrganizationUserService } from './../service/organization';
@DComponent
@DHttpController(organizationApi)
class OrganizationController {

    @DHttpApi(organizationApi.routes.list)
    async list(@DHttpUser user:IUserSession) :Promise<typeof organizationApi.routes.list.res>{
        let ret=await OrganizationService.list(user.userId)
        return ret;
    }

    @DHttpApi(organizationApi.routes.info)
    async info(@DHttpReqParamRequired("organizationId") organizationId:string) :Promise<typeof organizationApi.routes.info.res>{
        let obj=await OrganizationService.getItemById(organizationId)
        if(!obj) {
            throw Err.Organization.organizationNotFound
        }
        return obj.getItem();
    }

    @DHttpApi(organizationApi.routes.create)
    async create(@DHttpReqParamRequired("name") name:string,@DHttpReqParam("description") description:string,@DHttpReqParam("photo") photo:string,@DHttpUser user:IUserSession) :Promise<typeof organizationApi.routes.create.res>{
        let service=new OrganizationService()
        service.assignItem({
            name,
            description,
            photo,
            user_id:user.userId
        })
        let obj=await service.create()
        return obj;
    }

    @DHttpApi(organizationApi.routes.update)
    async update(@DHttpReqParamRequired("organizationId") organizationId:string,
    @DHttpReqParam("name")  name:string,
    @DHttpReqParam("description")   description:string,
    @DHttpReqParam("photo") photo:string,
    @DHttpReqParam("active")     active:number) :Promise<typeof organizationApi.routes.update.res>{
        let obj=await OrganizationService.getItemById(organizationId)
        if(!obj) {
            throw Err.Organization.organizationNotFound
        }
        obj.assignItem({
            name,
            description,
            photo,
            active
        })
        let ret=await obj.update()
        return ret;
    }

    @DHttpApi(organizationApi.routes.remove)
    async remove(@DHttpReqParamRequired("organizationId") organizationId:string) :Promise<typeof organizationApi.routes.remove.res>{
        let obj=await OrganizationService.getItemById(organizationId)
        if(!obj) {
            throw Err.Organization.organizationNotFound
        }
        await obj.delete()
        return
    }

    @DHttpApi(organizationApi.routes.listUser)
    async listUser(@DHttpReqParamRequired("organizationId") organizationId:string,
    @DHttpReqParamRequired("page") page:number,
    @DHttpReqParamRequired("size") size:number,
    @DHttpReqParam("keyword") keyword:string) :Promise<typeof organizationApi.routes.listUser.res>{
        let obj=await OrganizationService.getItemById(organizationId)
        if(!obj) {
            throw Err.Organization.organizationNotFound
        }
        let ret=await OrganizationUserService.listUser(organizationId,page,size,keyword)
        return ret;
    }

    @DHttpApi(organizationApi.routes.addUser)
    async addUser(@DHttpReqParamRequired("organizationId") organizationId:string,
    @DHttpReqParamRequired("username") username:string,
    @DHttpReqParamRequired("role") role:ECommon_Organization_User_Role,
    @DHttpReqParamRequired("nickname") nickname:string,
    @DHttpReqParamRequired("active") active:number,
    @DHttpReqParam("title") title:string,
    @DHttpReqParam("job") job:string,
    @DHttpReqParam("email") email:string,
    @DHttpReqParam("phone") phone:string,
    @DHttpReqParam("location") location:string) :Promise<typeof organizationApi.routes.addUser.res>{
        let user=await UserService.getItemByName(username);
        if(!user) {
            throw Err.User.userNotFound;
        }
        let obj=await OrganizationUserService.getItemByExp({
            organization_id:organizationId,
            user_id:user.getId()
        })
        if(obj) {
            throw Err.Organization.userAlreadyExists
        }
        let newUser=new OrganizationUserService;
        newUser.assignItem({
            organization_id:organizationId,
            user_id:user.getId(),
            role,
            nickname,
            active,
            title,
            job,
            email,
            phone,
            location
        })
        let ret=await newUser.create()
        return ret;
    }

    @DHttpApi(organizationApi.routes.updateUser)
    async updateUser(@DHttpReqParamRequired("organizationId") organizationId:string,
    @DHttpReqParamRequired("userId") userId:string,
    @DHttpReqParam("role") role:ECommon_Organization_User_Role,
    @DHttpReqParam("nickname") nickname:string,
    @DHttpReqParam("active") active:number,
    @DHttpReqParam("title") title:string,
    @DHttpReqParam("job") job:string,
    @DHttpReqParam("email") email:string,
    @DHttpReqParam("phone") phone:string,
    @DHttpReqParam("location") location:string) :Promise<typeof organizationApi.routes.updateUser.res>{
        if(nickname === "") {
            throw Err.Organization.nicknameEmpty
        }
        let obj=await OrganizationUserService.getItemByExp({
            organization_id:organizationId,
            user_id:userId
        })
        if(!obj) {
            throw Err.Organization.userNotFound
        }
        obj.assignItem({
            role,
            nickname,
            active,
            title,
            job,
            email,
            phone,
            location
        })
        let ret=await obj.update()
        let objRedis=REDIS_GATEWAY.Permission.organizationRole(organizationId,userId)
        await objRedis.del();
        return ret;
    }

    @DHttpApi(organizationApi.routes.deleteUser)
    async deleteUser(@DHttpReqParamRequired("organizationId") organizationId:string,
    @DHttpReqParamRequired("userId") userId:string) :Promise<typeof organizationApi.routes.deleteUser.res>{
        let obj=await OrganizationService.getItemById(organizationId)
        if(!obj) {
            throw Err.Organization.organizationNotFound
        } else if(obj.getItem().user_id==userId) {
            throw Err.Organization.ownerDeleteForbidden
        }
        let objUser=await OrganizationUserService.getItemByExp({
            organization_id:organizationId,
            user_id:userId
        })
        if(!objUser) {
            throw Err.Organization.userNotFound
        }
        await objUser.delete()
        let objRedis=REDIS_GATEWAY.Permission.organizationRole(organizationId,userId)
        await objRedis.del();
        return;
    }

}