import {Mapper} from "../../common/entity/mapper";
import {
    ECommon_Model_Finder_Item_Type,
    finderItemModel,
    ICommon_Model_Finder_Item
} from "../../../common/model/finder_item";
import {getMysqlInstance} from "../../common/db/mysql";
import {generateDeleteSql, generateQuerySql} from "../../common/util/sql";
import {Err} from "../../../common/status/error";
import {emitServiceEvent} from "../../common/event/event";
import Application from "../../common/app/app";
import {ECommon_Application_Mode} from "../../../common/types";

class FinderItemMapper extends Mapper<typeof finderItemModel> {
    constructor() {
        super(finderItemModel)
    }
    async listChild(folderId:string,userId:string,type:"all"|"folder") {
        let mysql=getMysqlInstance()
        let arr=await mysql.execute(generateQuerySql(finderItemModel,null,{
            parent_folder_id:folderId?folderId:null,
            created_by_pure:userId,
            ...(type==="folder" && {
                type:ECommon_Model_Finder_Item_Type.FOLDER
            })
        },"and",{
            field:"name",
            type:"asc"
        }))
        return arr;
    }

    async search(folderId:string,keyword:string,userId:string) {
        let ret:ICommon_Model_Finder_Item[]=[]
        let mysql=getMysqlInstance()
        async function _search(folderId:string) {
            let arr=await mysql.execute(generateQuerySql(finderItemModel,null,{
                parent_folder_id:folderId,
                created_by_pure:userId
            }))
            for(let obj of arr) {
                if(obj.name.includes(keyword)) {
                    ret.push(obj)
                }
                if(obj.type===ECommon_Model_Finder_Item_Type.FOLDER) {
                    await _search(obj.id)
                }
            }
        }
        await _search(folderId?folderId:null)
        return ret;
    }

    async findParentFolderPath(parentFolderId:string) {
        let ret:{
           name:string,
           id:string
        }[]=[]
        let mysql=getMysqlInstance()
        while (parentFolderId!==null) {
            let obj=await mysql.executeOne(generateQuerySql(finderItemModel,["id","name","parent_folder_id"],{
                id:parentFolderId
            }))
            if(!obj) {
                throw Err.Finder.itemNotFound
            }
            ret.unshift({
                name:obj.name,
                id:obj.id
            })
            parentFolderId=obj.parent_folder_id
        }
        ret.unshift({
            name:"Desktop",
            id:""
        })
        return ret;
    }

    async clearByOrganizationId(organizationId:string) {
        if(!organizationId) {
            return
        }
        let mysql=getMysqlInstance()
        let arr=await mysql.execute(generateQuerySql(finderItemModel,["id","file_id"],{
            organization_id:organizationId
        }))
        if(arr.length>0) {
            arr.forEach(item=>{
                emitServiceEvent("fileUnref",item.file_id)
            })
        }
        await mysql.execute(generateDeleteSql(finderItemModel,{
            organization_id:organizationId
        }))
    }

    async clearByOrganizationAndUserId(organizationId:string,userId:string) {
        if(!organizationId || !userId) {
            return
        }
        let mysql=getMysqlInstance()
        if(Application.mode===ECommon_Application_Mode.OFFLINE) {
            await mysql.execute(generateDeleteSql(finderItemModel,{
                created_by_pure:userId
            }))
        } else {
            await mysql.execute(generateDeleteSql(finderItemModel,{
                organization_id:organizationId,
                created_by_pure:userId
            }))
        }
    }

    async clearByUserId(userId:string) {
        if(!userId) {
            return
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(finderItemModel,{
            created_by_pure:userId
        }))
    }
}

export const finderItemMapper=new FinderItemMapper()