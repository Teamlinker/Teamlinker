import * as jwt from "jsonwebtoken";
import { Err } from '../../../common/status/error';
import { REDIS_USER } from "../../common/cache/keys/user";
import { Entity } from "../../common/entity/entity";
import { EServer_Common_Event_Types } from '../../common/event/types';
import { getNacosInstance } from '../../common/nacos/nacos';
import { emitServiceEvent } from '../../common/rpc/rpc';
import { userMapper } from '../mapper/user';
import { ICommon_Model_User } from './../../../common/model/user';
import { EServer_Common_User_Type } from './../../common/types/user';
export default class User extends Entity<ICommon_Model_User> {
    
    async create():Promise<ICommon_Model_User>{
        if(!this.item) {
            throw  Err.User.userNotFound;
        } else if(this.item.id) {
            throw  Err.User.userExists;
        }
        await userMapper.createUser(this.item)
        await this.loadItem();
        return this.item;
    }
    async update():Promise<ICommon_Model_User>{
        if(!this.item || !this.item.id) {
            throw  Err.User.userNotFound;
        }
        await userMapper.updateUser(this.item)
        await this.loadItem();
        return this.item;
    }
    async delete(){
        await userMapper.deleteUser(this.item.id);
        await this.clearCache()
        emitServiceEvent(EServer_Common_Event_Types.User.DELETE,this.item.id);
    }
    async loadItem():Promise<ICommon_Model_User> {
        if(!this.item || !this.item.id) {
            throw  Err.User.userNotFound;
        }
        let obj = await userMapper.getUserById(this.item.id);
        this.item=obj;
        let session=REDIS_USER.info(this.item.id);
        await session.set(obj)
        return this.item;
    }
    static async getItemById(id:string,reload:boolean=false):Promise<InstanceType<typeof User>>{
        let session=REDIS_USER.info(id);
        let obj=await session.get();
        if(!obj || reload) {
            obj = await userMapper.getUserById(id);
            if(!obj) {
                return null
            }
            await session.set(obj)
        } 
        let user = new User;
        user.setItem(obj);
        return user;
    }

    static async getItemByName(name:string):Promise<InstanceType<typeof User>>{
        let obj = await userMapper.getUserByName(name);
        if(obj) {
            let user = new User;
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
                type:EServer_Common_User_Type.USER
            },secret,async (err,token)=>{
                if(err) {
                    reject(err)
                    return
                } else {
                    let session=REDIS_USER.token(this.item.id)
                    await session.set(token);
                    let sessionInfo=REDIS_USER.info(this.item.id)
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

    async active(active:number) {
        if(!this.item || !this.item.id) {
            throw Err.User.userNotFound
        }
        await userMapper.active(this.item.id,active);
        await this.loadItem();
    }

    async clearCache(){
        await REDIS_USER.token(this.item.id).del()
        await REDIS_USER.info(this.item.id).del()
    }
}