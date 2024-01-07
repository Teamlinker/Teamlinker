import {Entity} from "../../common/entity/entity";
import {moduleMapper} from '../mapper/module';
import {projectModuleModel} from './../../../common/model/project_module';

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
        moduleMapper.deleteChildren(this.item.id,this.item.project_id);
    }
}