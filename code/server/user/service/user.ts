import * as jwt from "jsonwebtoken";
import {ICommon_Route_Res_User_List} from "../../../common/routes/response";
import {Err} from '../../../common/status/error';
import {REDIS_USER} from "../../common/cache/keys/user";
import {getConfigInstance} from '../../common/config/config';
import {Entity} from "../../common/entity/entity";
import {userMapper} from '../mapper/user';
import rpcFileApi from "../../file/rpc/file";
import {ECommon_User_Type, ICommon_Model_User, userModel} from './../../../common/model/user';
import {OrganizationUserService} from "./organization";

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
        let secret=getConfigInstance().jwt;
        if(!this.item || !this.item.id) {
            throw Err.User.userNotFound
        }
        return new Promise(async (resolve,reject)=>{
            jwt.sign({
                userId:this.item.id,
                type:ECommon_User_Type.USER
            },secret,async (err,token)=>{
                if(err) {
                    reject(err)
                    return
                } else {
                    let session=REDIS_USER.token(this.item.id)
                    await session.set(token);
                    let sessionInfo=REDIS_USER.info(this.item.id)
                    await sessionInfo.set(this.item);
                    let sessionOrganization=REDIS_USER.organizationInfo(this.item.id)
                    await sessionOrganization.del();
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
        let sessionOrganization=REDIS_USER.organizationInfo(this.item.id)
        await sessionOrganization.del();
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
        })
        return {
            count:ret.count,
            totalPage:ret.totalPage,
            page:page,
            data:ret.data
        }
    }


    async teamList(page:number,size:number,keyword?:string,organizationId?:string){
        let ret= await userMapper.teamList(page,size,this.item.id,organizationId,keyword)
        return {
            ...ret,
            page:page
        };
    }

    async profile(organizationId?:string){
        let obj=await OrganizationUserService.getItemByExp({
            user_id:this.getId(),
            organization_id:organizationId
        })
        if(!obj) {
            throw Err.Organization.userNotFound
        }
        let ret={
            info:(await User.userInfos(obj.getId(),true))[0],
            team:(await this.teamList(0,10,undefined,organizationId)).data
        }
        return ret;
    }

    static async userInfos(userIds:string,isGetPhoto:boolean=true):Promise<(Omit<ICommon_Model_User,"password">)[]>{
        if(!userIds) {
            throw Err.User.userNotFound
        }
        let ret=await userMapper.users(userIds.split(","))
        for(let obj of ret) {
            delete obj.password;
            if(obj.photo && isGetPhoto) {
                obj.photo=await rpcFileApi.getPath(obj.photo)
            }
        }
        return ret;
    }

    static async filter(name:string,size:number):Promise<{
        name:string,
        id:string,
        photo:string
    }[]>{
        if(!name) {
            throw Err.User.userNameNotExists
        }
        if(!size) {
            throw Err.Common.paramError
        }
        let ret=await userMapper.filter(name,size);
        let arr=<{
            name:string,
            id:string,
            photo:string
        }[]>[]
        for(let obj of ret) {
            arr.push({
                name:obj.username,
                id:obj.id,
                photo:obj.photo?(await rpcFileApi.getPath(obj.photo)):obj.photo
            })
        }
        return arr;
    }
}