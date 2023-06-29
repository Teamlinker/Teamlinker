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
import {
    ECommon_Wiki_Content_Line_Config_Type,
    ICommon_Wiki_Content_Line
} from "../../../common/model/wiki_item_content";
import {emitServiceEvent} from "../../common/event/event";

export class WikiService extends Entity<typeof wikiModel,typeof wikiMapper> {
    constructor() {
        super(wikiMapper)
    }
    static async recentWikiList(organizationUserId:string) {
        let ret=await wikiMapper.recentWikiList(organizationUserId)
        return ret
    }

    static async userWikiList(organizationUserId:string,page:number,size:number,type:"all"|"created"|"joined",keyword?:string) {
        let ret=await wikiMapper.userWikiList(organizationUserId,page,size,type,keyword)
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
        await wikiMapper.clearWiki(this.getId());
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
        return ret;
    }

    async removeMember(memberId:string,type:ECommon_Model_Organization_Member_Type){
        await rpcAuthApi.removeRoleMember(this.getId(),type,memberId)
    }

    async editMember(memberId:string,type:ECommon_Model_Organization_Member_Type,roleId:string){
        if(this.getItem().created_by==memberId) {
            throw Err.Role.roleChangeForbidden
        }
        let ret=await rpcAuthApi.changeRoleMember(this.item.id,roleId,type,memberId)
        return ret;
    }
}

export class WikiItemService extends Entity<typeof wikiItemModel,typeof wikiItemMapper> {
    constructor() {
        super(wikiItemMapper)
    }

    async remove(isChildren:boolean,eventPublish?: keyof IServer_Common_Event_Types): Promise<void> {
        await super.delete(eventPublish);
        await wikiItemMapper.clearWikiItem(this.getId(),this.getItem().parent_id,this.getItem().wiki_id,this.getItem().weight,isChildren);
    }

    override async create(): Promise<typeof wikiItemModel["model"]> {
        let weight=await wikiItemMapper.generatorAddWeight(this.getItem().parent_id,this.getItem().wiki_id)
        this.assignItem({
            weight
        })
        let ret=await super.create();
        await wikiItemMapper.saveContent(ret.id,"",ret.created_by)
        return ret
    }

    async moveWikiItem(newWikiItemId:string,action:"up"|"down"|"child") {
        await wikiItemMapper.moveWikiItem(this.getId(),newWikiItemId,action)
    }

    async saveContent(content:string,modified_by:string) {
        let oldObjFile=await this.generateLineObj()
        content=content.replaceAll("\\\"","\\\\\"")
        await wikiItemMapper.saveContent(this.getId(),content,modified_by);
        let newObjFile=await this.generateLineObj()
        for(let key in oldObjFile) {
            let oldCount=oldObjFile[key]
            let newCount=newObjFile[key]
            if(newCount!==undefined) {
                if(oldCount!==newCount) {
                    if(oldCount>newCount) {
                        emitServiceEvent("fileUnref",key,oldCount-newCount)
                    } else {
                        emitServiceEvent("fileRef",key,newCount-oldCount)
                    }
                }
                delete newObjFile[key]
            } else {
                emitServiceEvent("fileUnref",key,oldCount)
            }
        }
        for(let key in newObjFile) {
            let count=newObjFile[key]
            emitServiceEvent("fileRef",key,count)
        }
    }

    async generateLineObj():Promise<{
        [param:string]:number
    }> {
        let objFile:{
            [param:string]:number
        }={}
        let content=await this.getContent()
        if(content.content) {
            let arr=JSON.parse(content.content) as ICommon_Wiki_Content_Line[]
            for(let obj of arr) {
                for(let obj1 of obj.arr) {
                    if(obj1.type===ECommon_Wiki_Content_Line_Config_Type.FILE || obj1.type===ECommon_Wiki_Content_Line_Config_Type.IMAGE) {
                        if(!objFile[obj1.value]) {
                            objFile[obj1.value]=1
                        } else {
                            objFile[obj1.value]++
                        }
                    }
                }
            }
        }
        return objFile
    }

    async getContent() {
        let ret=await wikiItemMapper.getContent(this.getId());
        return ret;
    }

    static async filterWikiItem(organizationId:string,wikiId:string,name:string,page:number,size:number) {
        let ret=await wikiItemMapper.filterWikiItem(organizationId,wikiId,name,page,size)
        return ret;
    }
}