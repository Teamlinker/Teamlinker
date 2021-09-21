import { projectMapper } from '../mapper/project';
import { ICommon_Model_Project } from '../../../common/model/project';
import { Err } from '../../../common/status/error';
import {Entity} from "../../common/entity/entity"
import { EServer_Common_Event_Types } from '../../common/event/types';
import { emitServiceEvent } from '../../common/rpc/rpc';
export default class Project extends Entity<ICommon_Model_Project> {
    async create():Promise<ICommon_Model_Project> {
        if(!this.item) {
            throw  Err.Project.projectNotFound;
        } else if(this.item.id) {
            throw  Err.Project.projectExists;
        }
        await projectMapper.createProject(this.item)
        await this.loadItem();
        return this.item;
    }
    async update():Promise<ICommon_Model_Project>{
        if(!this.item || !this.item.id) {
            throw  Err.Project.projectNotFound;
        }
        await projectMapper.updateProject(this.item)
        return this.item;
    }
    async delete(){
        await projectMapper.deleteProject(this.item.id);
        emitServiceEvent(EServer_Common_Event_Types.Project.DELETE,this.item.id);
    }
    async loadItem():Promise<ICommon_Model_Project>{
        if(!this.item || !this.item.id) {
            throw  Err.Project.projectNotFound;
        }
        let obj = await projectMapper.getProjecById(this.item.id);
        this.item=obj;
        return this.item;
    }
    static async getItemById(id:string):Promise<InstanceType<typeof Project>>{
        let obj = await projectMapper.getProjecById(id);
        if(obj) {
            let user = new Project;
            user.setItem(obj);
            return user;
        } else {
            return null;
        }
    } 
}