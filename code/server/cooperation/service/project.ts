import { moduleMapper } from "../mapper/module";
import { Entity } from "../../common/entity/entity";
import { EServer_Common_Event_Types } from "../../common/event/types";
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
}