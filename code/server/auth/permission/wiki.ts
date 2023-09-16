import {REDIS_AUTH} from '../../common/cache/keys/auth';
import {DComponent} from '../../common/decorate/component';
import {PermissionBase} from './base';
import {ECommon_Model_Role_Reserved, ECommon_Model_Role_Type} from "../../../common/model/role";
import {Err} from "../../../common/status/error";
import {Permission_Types} from "../../../common/permission/permission";
import rpcWikiApi from "../../wiki/rpc/wiki";

@DComponent
class PermissionWiki extends PermissionBase {
    fieldName="wikiId"
    async translateToField({wikiItemId,roleId}: { [param: string]: any; isAdmin?: boolean;wikiItemId:string,roleId:string }): Promise<string> {
        let wikiId:string
        if(wikiItemId) {
            let obj=new REDIS_AUTH.Permission.Wiki.WikiIdFromWikiItem(wikiItemId);
            wikiId=await obj.getValue();
            return wikiId;
        } else if(roleId) {
            let objRole=new REDIS_AUTH.Permission.Role.RoleInfo(roleId);
            let value=await objRole.getValue()
            if(value?.type===ECommon_Model_Role_Type.WIKI) {
                return value.item_id
            }
        }
    }

    async generatorValue({organizationUserId,wikiId}: { [param: string]: any; organizationUserId?: string; isAdmin?: boolean;wikiId:string }):Promise<number> {
        let objWikiTourist=new REDIS_AUTH.Permission.Wiki.WikiTourist(wikiId);
        let objWikiOrganizationUsers=new REDIS_AUTH.Permission.Wiki.WikiOrganizationUsers(wikiId);
        let objWikiTeams=new REDIS_AUTH.Permission.Wiki.WikiTeams(wikiId);
        let objWikiTags=new REDIS_AUTH.Permission.Wiki.WikiTags(wikiId);
        await this.tryLock([objWikiOrganizationUsers.getKey().replace(/\:/g,""),objWikiTeams.getKey().replace(/\:/g,""),objWikiTags.getKey().replace(/\:/g,"")]);
        let permissionsSet = new Set<number>();
        let isAdmin:boolean=false;
        try {
            await Promise.all([(async ()=>{
                let roleId = await objWikiTourist.getValue();
                if(roleId) {
                    let objRole=new REDIS_AUTH.Permission.Role.RoleInfo(roleId);
                    let value=await objRole.getValue();
                    if(value) {
                        permissionsSet.add(Number(value.value))
                        if(value.reserved===ECommon_Model_Role_Reserved.ADMIN) {
                            throw Err.Common.admin;
                        }
                    }
                }
            })(),(async ()=>{
                let roleId = await objWikiOrganizationUsers.getValue(organizationUserId)
                if(roleId) {
                    let objRole=new REDIS_AUTH.Permission.Role.RoleInfo(roleId);
                    let value=await objRole.getValue();
                    if(value) {
                        permissionsSet.add(Number(value.value))
                        if(value.reserved===ECommon_Model_Role_Reserved.ADMIN) {
                            throw Err.Common.admin;
                        }
                    }
                }
            })(),(async ()=>{
                let teams=await objWikiTeams.getValue();
                let arrPromise=[];
                for(let teamId in teams) {
                    arrPromise.push((async ()=>{
                        let objTeam=new REDIS_AUTH.Permission.Team.OrganizationUsers(teamId);
                        let roleId=await objTeam.getValue(organizationUserId)
                        if(roleId) {
                            let objRole=new REDIS_AUTH.Permission.Role.RoleInfo(teams[teamId])
                            let value=await objRole.getValue();
                            if(value) {
                                permissionsSet.add(Number(value.value))
                                if(value.reserved===ECommon_Model_Role_Reserved.ADMIN) {
                                    throw Err.Common.admin;
                                }
                            }
                        }
                    })())
                }
                await Promise.all(arrPromise);
            })(),(async ()=>{
                let tags=await objWikiTags.getValue();
                let arrPromise=[];
                for(let tagId in tags) {
                    arrPromise.push((async ()=>{
                        let objTag=new REDIS_AUTH.Permission.Tag.TagOrganizationUsers(tagId);
                        let isExists=await objTag.getValue(organizationUserId)
                        if(isExists) {
                            let objRole=new REDIS_AUTH.Permission.Role.RoleInfo(tags[tagId])
                            let value=await objRole.getValue();
                            if(value) {
                                permissionsSet.add(Number(value.value))
                                if(value.reserved===ECommon_Model_Role_Reserved.ADMIN) {
                                    throw Err.Common.admin;
                                }
                            }
                        }
                    })())
                }
                await Promise.all(arrPromise);
            })()])
        } catch (err) {
            if(err.code===Err.Common.admin.code) {
                isAdmin=true
            } else {
                await this.unlock()
                throw err;
            }
        }
        await this.unlock()
        let ret=isAdmin?Permission_Types.Wiki.ADMIN.value:Array.from(permissionsSet).reduce((previousValue, currentValue, currentIndex, array)=>{
            return previousValue | currentValue;
        },0)
        let obj=REDIS_AUTH.Permission.Wiki.calPermission(wikiId,organizationUserId)
        await obj.set(ret);
        return ret;
    }

    override async checkOrganizationId(wikiId: string, currentOrganizationId: string): Promise<boolean> {
        let objRedis=REDIS_AUTH.Resource.resourceOrganization(wikiId)
        let organizationId=await objRedis.get()
        if(!organizationId) {
            let obj=await rpcWikiApi.wiki(wikiId)
            if(obj) {
                organizationId=obj.organization_id
                await objRedis.set(organizationId)
            }
        }
        return organizationId===currentOrganizationId
    }

}

