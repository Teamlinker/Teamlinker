import { moduleMapper } from 'mapper/module';
import { Entity } from "../../common/entity/entity";
import { projectModuleModel } from './../../../common/model/project_module';
export default class ProjectModule extends Entity<typeof projectModuleModel,typeof moduleMapper> {
    constructor(){
        super(moduleMapper)
    }
    async listModule(){
        let ret=await moduleMapper.listModule(this.item.project_id)
        return ret
    }
    override async delete(){
        await super.loadItem()
        await super.delete()
        moduleMapper.deleteChildren(this.item.id,this.item.project_id);
    }
}