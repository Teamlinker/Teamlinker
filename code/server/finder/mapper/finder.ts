import {Mapper} from "../../common/entity/mapper";
import {
    ECommon_Model_Finder_Item_Type,
    finderItemModel,
    ICommon_Model_Finder_Item
} from "../../../common/model/finder_item";
import {getMysqlInstance} from "../../common/db/mysql";
import {generateQuerySql} from "../../common/util/sql";
import {Err} from "../../../common/status/error";

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
}

export const finderItemMapper=new FinderItemMapper()