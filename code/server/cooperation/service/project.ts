import { ICommon_Model_Project_Role } from "../../../common/model/project_role";
import { ICommon_Route_Res_Project_List } from "../../../common/routes/response";
import { Err } from "../../../common/status/error";
import { Entity } from "../../common/entity/entity";
import { EServer_Common_Event_Types } from "../../common/event/types";
import { moduleMapper } from "../mapper/module";
import { projectMapper } from '../mapper/project';
import { projectModel } from './../../../common/model/project';
import { ECommon_Model_Project_Member_Type } from './../../../common/model/project_member';
import { tagMapper } from './../mapper/tag';
export default class Project extends Entity<typeof projectModel,typeof projectMapper> {
    constructor(){
        super(projectMapper)
    }
    override async delete(type?:EServer_Common_Event_Types.Types) {
        await super.delete(EServer_Common_Event_Types.Project.DELETE)
        await moduleMapper.deleteByProjectId(this.item.id)
        await tagMapper.deleteByProjectId(this.item.id)
        await projectMapper.clearMember(this.item.id);
    }

    async listMember(page:number,size:number){
        let ret=await projectMapper.listMember(this.item.id,page,size);
        return ret;
    }

    async addMember(memberId:string,type:ECommon_Model_Project_Member_Type,roleId:string) {
        await projectMapper.addMember(this.item.id,memberId,type,roleId)
    }

    async removeMember(memberId:string){
        await projectMapper.removeMember(this.item.id,memberId)
    }

    async editMember(memberId:string,roleId:string){
        await projectMapper.changeRole(this.item.id,memberId,roleId)
    }

    static async list(page:number,size:number,keyword?:string,userId?:string):Promise<ICommon_Route_Res_Project_List>{
        let ret=await projectMapper.list(page,size,keyword,userId)
        return {
            count:ret.count,
            totalPage:ret.totalPage,
            page:page,
            data:ret.data
        }
    }

    async getRoles():Promise<ICommon_Model_Project_Role[]>{
        if(!this.item || !this.item.id) {
            throw  Err.Project.projectNotFound;
        }
        let ret=await projectMapper.getRoles(this.item.id);
        return ret;
    }
}