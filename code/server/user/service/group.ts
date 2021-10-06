import { ICommon_Model_Group } from './../../../common/model/group';
import { ICommon_Model_Admin } from './../../../common/model/admin';
import { EServer_Common_User_Type } from './../../common/types/user';
import {Entity} from "../../common/entity/entity"
import { groupMapper } from '../mapper/group';
import { Err } from '../../../common/status/error';
import * as jwt from "jsonwebtoken"
import { getNacosInstance } from '../../common/nacos/nacos';
import admin from 'http/admin';
import { emitServiceEvent } from '../../common/rpc/rpc';
import { EServer_Common_Event_Types } from '../../common/event/types';
import { ICommon_Model_Group_Role } from '../../../common/model/group_role';
export default class Group extends Entity<ICommon_Model_Group> {
    
    async create():Promise<ICommon_Model_Group>{
        if(!this.item) {
            throw  Err.Group.groupNotFound;
        } else if(this.item.id) {
            throw  Err.Group.groupExists;
        }
        await groupMapper.createGroup(this.item)
        await this.loadItem();
        return this.item;
    }
    async update():Promise<ICommon_Model_Group>{
        if(!this.item || !this.item.id) {
            throw  Err.Group.groupNotFound;
        }
        await groupMapper.updateGroup(this.item)
        return this.item;
    }
    async delete(){
        await groupMapper.deleteGroup(this.item.id);
        emitServiceEvent(EServer_Common_Event_Types.Group.DELETE,this.item.id);
    }
    async loadItem():Promise<ICommon_Model_Group> {
        if(!this.item || !this.item.id) {
            throw  Err.Group.groupNotFound;
        }
        let obj = await groupMapper.getGroupById(this.item.id);
        this.item=obj;
        return this.item;
    }
    static async getItemById(id:string,reload:boolean=false):Promise<InstanceType<typeof Group>>{
        let obj = await groupMapper.getGroupById(id);
        if (!obj) {
            return null
        }
        let group = new Group;
        group.setItem(obj);
        return group;
    }

    async getRoles():Promise<ICommon_Model_Group_Role[]>{
        if(!this.item || !this.item.id) {
            throw  Err.Group.groupNotFound;
        }
        let ret=await groupMapper.getRoles(this.item.id);
        return ret;
    }

}