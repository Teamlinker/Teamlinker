import { IUserSession } from './../../common/rpc/api/user';
import { DHttpApi, DHttpContext, DHttpReqParam, DHttpReqParamFile,DHttpContent, DHttpReqParamRequired, DHttpUser } from "../../common/http/http"
import * as groupApi from "../../../common/routes/group"
import GroupService from "../service/group"
import { EServer_Common_User_Type } from '../../common/types/user';
import { Err } from '../../../common/status/error';
class GroupController {
    @DHttpApi(groupApi.routes.create)
    async create(@DHttpReqParamRequired("name") name:string,@DHttpUser user:IUserSession):Promise<typeof groupApi.routes.create.res>{
        let group=new GroupService
        group.assignItem({
            name,
            created_by:user.type==EServer_Common_User_Type.USER?user.userId:null
        });
        let obj=await group.create()
        return obj
    }

    @DHttpApi(groupApi.routes.info)
    async info(@DHttpReqParamRequired("groupId") groupId:string):Promise<typeof groupApi.routes.create.res> {
        let group = await GroupService.getItemById(groupId)
        if(!group) {
            throw Err.Group.groupNotFound
        }
        return group.getItem()
    }

    @DHttpApi(groupApi.routes.update)
    async update(@DHttpReqParamRequired("groupId") groupId:string,@DHttpReqParamRequired("name") name:string):Promise<typeof groupApi.routes.create.res> {
        let group = await GroupService.getItemById(groupId)
        if(!group) {
            throw Err.Group.groupNotFound
        }
        group.assignItem({
            name
        })
        let ret=await group.update()
        return ret
    }

    @DHttpApi(groupApi.routes.remove)
    async remove(@DHttpReqParamRequired("groupId") groupId:string) {
        let group=await GroupService.getItemById(groupId)
        if(!group) {
            throw Err.Group.groupNotFound
        }
        await group.delete()
    }
    
    @DHttpApi(groupApi.routes.roles)
    async roles(@DHttpReqParamRequired("groupId") groupId:string) :Promise<typeof groupApi.routes.roles.res> {
        let group=await GroupService.getItemById(groupId)
        if(!group) {
            throw Err.Group.groupNotFound
        }
        let ret=await group.getRoles()
        return ret;
    }

}
export default new GroupController