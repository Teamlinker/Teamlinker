import * as teamApi from "../../../common/routes/team";
import { Err } from '../../../common/status/error';
import { DComponent } from "../../common/decorate/component";
import { DHttpApi, DHttpReqParamRequired, DHttpUser } from "../../common/http/http";
import { IUserSession } from '../../common/rpc/api/user';
import { EServer_Common_User_Type } from '../../common/types/user';
import TeamService from "../service/team";
@DComponent
class TeamController {
    @DHttpApi(teamApi.routes.create)
    async create(@DHttpReqParamRequired("name") name:string,@DHttpUser user:IUserSession):Promise<typeof teamApi.routes.create.res>{
        let group=new TeamService
        group.assignItem({
            name,
            created_by:user.type==EServer_Common_User_Type.USER?user.userId:null
        });
        let obj=await group.create()
        return obj
    }

    @DHttpApi(teamApi.routes.info)
    async info(@DHttpReqParamRequired("teamId") teamId:string):Promise<typeof teamApi.routes.create.res> {
        let group = await TeamService.getItemById(teamId)
        if(!group) {
            throw Err.Team.teamNotFound
        }
        return group.getItem()
    }

    @DHttpApi(teamApi.routes.update)
    async update(@DHttpReqParamRequired("teamId") teamId:string,@DHttpReqParamRequired("name") name:string):Promise<typeof teamApi.routes.create.res> {
        let group = await TeamService.getItemById(teamId)
        if(!group) {
            throw Err.Team.teamNotFound
        }
        group.assignItem({
            name
        })
        let ret=await group.update()
        return ret
    }

    @DHttpApi(teamApi.routes.remove)
    async remove(@DHttpReqParamRequired("teamId") teamId:string) {
        let group=await TeamService.getItemById(teamId)
        if(!group) {
            throw Err.Team.teamNotFound
        }
        await group.delete()
    }
    
    @DHttpApi(teamApi.routes.roles)
    async roles(@DHttpReqParamRequired("teamId") teamId:string) :Promise<typeof teamApi.routes.roles.res> {
        let group=await TeamService.getItemById(teamId)
        if(!group) {
            throw Err.Team.teamNotFound
        }
        let ret=await group.getRoles()
        return ret;
    }

    @DHttpApi(teamApi.routes.members)
    async members(@DHttpReqParamRequired("teamId") teamId:string) :Promise<typeof teamApi.routes.members.res> {
        let group=await TeamService.getItemById(teamId)
        if(!group) {
            throw Err.Team.teamNotFound
        }
        let ret=await group.members()
        return ret;
    }

}