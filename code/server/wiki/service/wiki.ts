import {Entity} from "../../common/entity/entity";
import {wikiModel} from "../../../common/model/wiki";
import {wikiItemMapper, wikiMapper} from "../mapper/wiki";
import {wikiItemModel} from "../../../common/model/wiki_item";
import {ICommon_Route_Res_userWikiList} from "../../../common/routes/response";
import rpcAuthApi from "../../auth/rpc/auth";
import {ECommon_Model_Role_Reserved, ECommon_Model_Role_Type} from "../../../common/model/role";
import {ECommon_Model_Organization_Member_Type} from "../../../common/model/organization";
import {Err} from "../../../common/status/error";
import {IServer_Common_Event_Types} from "../../common/event/types";
import rpcContentApi from "../../content/rpc/content"
import {ECommon_Model_Content_Type} from "../../../common/model/content";
import {emitServiceEvent} from "../../common/event/event";
import rpcUserApi from "../../user/rpc/user";

export class WikiService extends Entity<typeof wikiModel,typeof wikiMapper> {
    constructor() {
        super(wikiMapper)
    }
    static async recentWikiList(organizationUserId:string) {
        let ret=await wikiMapper.recentWikiList(organizationUserId)
        return ret
    }

    static async userWikiList(organizationId:string,organizationUserId:string,page:number,size:number,type:"all"|"created"|"joined",keyword?:string,sort?:"name"|"created_time") {
        let ret=await wikiMapper.userWikiList(organizationId,organizationUserId,page,size,type,keyword,sort)
        return ret
    }

    static async list(organizationId:string,page:number,size:number,keyword?:string,organizationUserId?:string):Promise<ICommon_Route_Res_userWikiList>{
        let ret=await wikiMapper.list(organizationId,page,size,keyword,organizationUserId)
        return {
            count:ret.count,
            totalPage:ret.totalPage,
            page:page,
            data:ret.data
        }
    }



    override async delete(eventPublish?: keyof IServer_Common_Event_Types): Promise<void> {
        await super.delete(eventPublish);
        let ids=await wikiMapper.getWikiItemIds(this.getId())
        await rpcContentApi.clearByRefIds(ids)
        await wikiMapper.clearWiki(this.getId());
        await rpcAuthApi.clearRoleByItemId(this.getId())
    }

    override async create(): Promise<typeof wikiModel["model"]> {
        let ret=await super.create();
        let role=await rpcAuthApi.getAdminRoleByType(ECommon_Model_Role_Type.WIKI)
        if(role) {
            await rpcAuthApi.addRoleMember(this.getId(),role,ECommon_Model_Organization_Member_Type.USER,this.getItem().created_by)
        }
        return ret;
    }

    async info(keyword?:string) {
        let ret=await wikiMapper.info(this.getId(),keyword)
        return {
            ...ret,
            ...this.getItem()
        }
    }

    async listRole(){
        let ret=await rpcAuthApi.listRole(this.getId(),ECommon_Model_Role_Type.WIKI);
        return ret;
    }

    static async listGlobalRole(organizationId:string) {
        let ret=await rpcAuthApi.listRole(organizationId,ECommon_Model_Role_Type.WIKI);
        return ret;
    }

    async createRole(name :string,
                     description:string,
                     value:number){
        let ret=await rpcAuthApi.createRole({
            name,
            description,
            item_id:this.getId(),
            organization_id:this.item.organization_id,
            type:ECommon_Model_Role_Type.WIKI,
            reserved:ECommon_Model_Role_Reserved.NORMAL,
            value:value
        });
        return ret;
    }

    static async createGlobalRole(organizationId:string,name:string,description:string,value: number) {
        let ret=await rpcAuthApi.createRole({
            name,
            description,
            organization_id:organizationId,
            type:ECommon_Model_Role_Type.WIKI,
            reserved:ECommon_Model_Role_Reserved.NORMAL,
            value
        })
        return ret;
    }

    async editRole(roleId:string,name:string,description:string,value:number){
        let ret=await rpcAuthApi.updateRole({
            id:roleId,
            name,
            description,
            value:value
        });
        return ret;
    }

    async removeRole(roleId:string){
        let ret=await rpcAuthApi.removeRole(roleId);
        return ret;
    }

    async listMember(memberType:ECommon_Model_Organization_Member_Type,page:number,size:number,key:string){
        let ret=await rpcAuthApi.listRoleMember(this.getId(),ECommon_Model_Role_Type.WIKI,memberType,page,size,key);
        return ret;
    }

    async addMember(memberId:string, type:ECommon_Model_Organization_Member_Type, roleId:string) {
        let ret=await rpcAuthApi.addRoleMember(this.getId(),roleId,type,memberId)
        emitServiceEvent("wikiMemberAdd",this.getId(),memberId)
        return ret;
    }

    async removeMember(memberId:string,type:ECommon_Model_Organization_Member_Type){
        await rpcAuthApi.removeRoleMember(this.getId(),type,memberId)
        emitServiceEvent("wikiMemberDelete",this.getId(),memberId)
    }

    async editMember(memberId:string,type:ECommon_Model_Organization_Member_Type,roleId:string){
        if(this.getItem().created_by==memberId) {
            throw Err.Role.roleChangeForbidden
        }
        let ret=await rpcAuthApi.changeRoleMember(this.item.id,roleId,type,memberId)
        emitServiceEvent("wikiMemberEdit",this.getId(),memberId)
        return ret;
    }

    static async clearMember(organizationUserId:string) {
        let objOrganization=await rpcUserApi.organizationUser(organizationUserId)
        let objDeletedUser=await rpcUserApi.getDeletedOrganizationUser(objOrganization.organization_id)
        await wikiMapper.updateMember(organizationUserId,objDeletedUser.id)
    }
}

export class WikiItemService extends Entity<typeof wikiItemModel,typeof wikiItemMapper> {
    constructor() {
        super(wikiItemMapper)
    }

    static async globalSearch(keyword:string,size:number,organizationUserId:string) {
        let ret=await wikiItemMapper.globalSearch(keyword, size, organizationUserId)
        return ret;
    }

    async remove(isChildren:boolean,eventPublish?: keyof IServer_Common_Event_Types): Promise<void> {
        await super.delete(eventPublish);
        await wikiItemMapper.clearWikiItem(this.getId(),this.getItem().parent_id,this.getItem().wiki_id,this.getItem().weight,isChildren);
        await rpcContentApi.clearByRefId(this.getId())
    }

    override async create(): Promise<typeof wikiItemModel["model"]> {
        let weight=await wikiItemMapper.generatorAddWeight(this.getItem().parent_id,this.getItem().wiki_id)
        this.assignItem({
            weight
        })
        let ret=await super.create();
        await rpcContentApi.save(ret.id,ECommon_Model_Content_Type.WIKI_ITEM, ret.created_by,"")
        return ret
    }

    async moveWikiItem(newWikiItemId:string,action:"up"|"down"|"child") {
        await wikiItemMapper.moveWikiItem(this.getId(),newWikiItemId,action)
    }

    async saveContent(content:string,modified_by:string) {
        await rpcContentApi.save(this.getId(),ECommon_Model_Content_Type.WIKI_ITEM,modified_by,content)
    }



    static async filterWikiItem(organizationId:string,wikiId:string,name:string,page:number,size:number) {
        let ret=await wikiItemMapper.filterWikiItem(organizationId,wikiId,name,page,size)
        return ret;
    }
}