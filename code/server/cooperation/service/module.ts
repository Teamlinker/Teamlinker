import {Entity} from "../../common/entity/entity";
import {moduleIssueMapper, moduleMapper} from '../mapper/module';
import {projectModuleModel} from './../../../common/model/project_module';
import {projectModuleIssueModel} from "../../../common/model/project_module_issue";

export class ProjectModuleService extends Entity<typeof projectModuleModel,typeof moduleMapper> {
    constructor(){
        super(moduleMapper)
    }
    async listModule(){
        let ret=await moduleMapper.listModule(this.item.project_id)
        return ret
    }
    override async delete(){
        await super.delete()
        await ProjectModuleIssueService.batchDelete({
            project_module_id:this.getId()
        },true)
        let arr=await this.mapper.getChildren(this.getId(),this.getItem().project_id)
        if(arr.length>0) {
            ProjectModuleService.batchDelete({
                project_id:this.getItem().project_id,
                parent_module_id:this.getId()
            },false)
        }
    }

    static async clearByProjectId(projectId:string){
        await ProjectModuleService.batchDelete({
            project_id:projectId,
            parent_module_id:null
        },false)
    }

}

export class ProjectModuleIssueService extends Entity<typeof projectModuleIssueModel,typeof moduleIssueMapper> {
    constructor() {
        super(moduleIssueMapper)
    }
}