import * as jwt from "jsonwebtoken";
import {Err} from '../../../common/status/error';
import {REDIS_USER} from "../../common/cache/keys/user";
import {getConfigInstance} from '../../common/config/config';
import {Entity} from "../../common/entity/entity";
import {ECommon_User_Type, userModel} from './../../../common/model/user';
import {adminMapper} from './../mapper/admin';
import {UserSettingService} from "./user";
import {ECommon_Platform_Type} from "../../../common/types";

export class AdminService extends Entity<typeof userModel,typeof adminMapper> {
    constructor(){
        super(adminMapper)
    }
    static async getItemByName(name:string):Promise<InstanceType<typeof AdminService>>{
        let obj = await adminMapper.getUserByName(name);
        if(obj) {
            let user = new AdminService;
            user.setItem(obj);
            return user;
        } else {
            return null;
        }
    }

    override async create(...param): Promise<typeof userModel["model"]> {
        let ret=await super.create(...param);
        let obj=new UserSettingService()
        obj.assignItem({
            user_id:ret.id
        })
        await obj.create()
        return ret;
    }

    async startSession():Promise<string>{
        let secret=getConfigInstance().jwt;
        if(!this.item || !this.item.id) {
            throw Err.User.userNotFound
        }
        return new Promise(async (resolve,reject)=>{
            jwt.sign({
                userId:this.item.id,
                type:ECommon_User_Type.ADMIN
            },secret,async (err,token)=>{
                if(err) {
                    reject(err)
                    return
                } else {
                    let session=REDIS_USER.token(ECommon_Platform_Type.WEB, this.item.id)
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
        let session=REDIS_USER.token(ECommon_Platform_Type.WEB,this.item.id)
        await session.del()
    }
}