import { ICommon_Model_Admin } from './../../../common/model/admin';
import { EServer_Common_User_Type } from './../../common/types/user';
import {Entity} from "../../common/entity/entity"
import { adminMapper } from '../mapper/admin';
import { Err } from '../../../common/status/error';
import * as jwt from "jsonwebtoken"
import { getNacosInstance } from '../../common/nacos/nacos';
import {REDIS_USER} from "../../common/cache/keys/user"
import admin from 'http/admin';
export default class Admin extends Entity<ICommon_Model_Admin> {
    
    async create():Promise<ICommon_Model_Admin>{
        if(!this.item) {
            throw  Err.User.userNotFound;
        } else if(this.item.id) {
            throw  Err.User.userExists;
        }
        await adminMapper.createUser(this.item)
        await this.loadItem();
        return this.item;
    }
    async update():Promise<ICommon_Model_Admin>{
        if(!this.item || !this.item.id) {
            throw  Err.User.userNotFound;
        }
        await adminMapper.updateUser(this.item)
        return this.item;
    }
    async delete(){
        await adminMapper.deleteUser(this.item.id);
    }
    async loadItem():Promise<ICommon_Model_Admin> {
        if(!this.item || !this.item.id) {
            throw  Err.User.userNotFound;
        }
        let obj = await adminMapper.getUserById(this.item.id);
        this.item=obj;
        let session=REDIS_USER.adminInfo(this.item.id);
        await session.set(obj)
        return this.item;
    }
    static async getItemById(id:string,reload:boolean=false):Promise<InstanceType<typeof Admin>>{
        let session=REDIS_USER.adminInfo(id);
        let obj=await session.get();
        if(!obj || reload) {
            obj = await adminMapper.getUserById(id);
            if(!obj) {
                return null
            }
            await session.set(obj)
        } 
        let user = new Admin;
        user.setItem(obj);
        return user;
    }

    static async getItemByName(name:string):Promise<InstanceType<typeof Admin>>{
        let obj = await adminMapper.getUserByName(name);
        if(obj) {
            let user = new Admin;
            user.setItem(obj);
            return user;
        } else {
            return null;
        }
    }

    async startSession():Promise<string>{
        let secret=getNacosInstance().globalConfig.jwt;
        if(!this.item || !this.item.id) {
            throw Err.User.userNotFound
        }
        return new Promise(async (resolve,reject)=>{
            jwt.sign({
                userId:this.item.id,
                type:EServer_Common_User_Type.ADMIN
            },secret,async (err,token)=>{
                if(err) {
                    reject(err)
                    return
                } else {
                    let session=REDIS_USER.token(this.item.id)
                    await session.set(token);
                    let sessionInfo=REDIS_USER.adminInfo(this.item.id)
                    await sessionInfo.set(this.item);
                    resolve(token)
                }
            })
        })
    }

    async stopSession() {
        if(!this.item || !this.item.id) {
            throw Err.User.userNotFound
        }
        let session=REDIS_USER.token(this.item.id)
        await session.del()
    }
}