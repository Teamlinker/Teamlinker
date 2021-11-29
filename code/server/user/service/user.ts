import * as jwt from "jsonwebtoken";
import { ICommon_Route_Res_User_List } from "../../../common/routes/response";
import { Err } from '../../../common/status/error';
import { REDIS_USER } from "../../common/cache/keys/user";
import { Entity } from "../../common/entity/entity";
import { getNacosInstance } from '../../common/nacos/nacos';
import { userMapper } from '../mapper/user';
import { userModel } from './../../../common/model/user';
import { EServer_Common_User_Type } from './../../common/types/user';
export default class User extends Entity<typeof userModel,typeof userMapper> {
    constructor(){
        super(userMapper)
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

    static async list(page:number,size:number,keyword?:string):Promise<ICommon_Route_Res_User_List>{
        let ret=await userMapper.list(page,size,keyword)
        ret.data.forEach(item=>{
            delete item.password
            delete item.admin
        })
        return {
            count:ret.count,
            totalPage:ret.totalPage,
            page:page,
            data:ret.data
        }
    }

    async projectList(page:number,size:number,keyword?:string){
        let ret= await userMapper.projectList(page,size,this.item.id,keyword)
        return {
            ...ret,
            page:page
        };
    }

    async teamList(page:number,size:number,keyword?:string){
        let ret= await userMapper.teamList(page,size,this.item.id,keyword)
        return {
            ...ret,
            page:page
        };
    }

    async profile(){
        let ret={
            info:this.getItem(),
            project:(await this.projectList(0,10)).data,
            team:(await this.teamList(0,10)).data
        }
        delete ret.info.password
        return ret;
    }
}