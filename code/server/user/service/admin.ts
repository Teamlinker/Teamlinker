import * as jwt from "jsonwebtoken";
import { Err } from '../../../common/status/error';
import { REDIS_USER } from "../../common/cache/keys/user";
import { Entity } from "../../common/entity/entity";
import { getNacosInstance } from '../../common/nacos/nacos';
import { userModel } from './../../../common/model/user';
import { EServer_Common_User_Type } from './../../common/types/user';
import { adminMapper } from './../mapper/admin';
export default class Admin extends Entity<typeof userModel,typeof adminMapper> {
    constructor(){
        super(adminMapper)
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