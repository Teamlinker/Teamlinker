import { ICommon_Route_Res_Project_ListTag } from "../../../common/routes/response";
import { Err } from "../../../common/status/error";
import { getMysqlInstance } from "../../common/db/mysql";
import { Mapper } from "../../common/entity/mapper";
import CommonUtil from "../../common/util/common";
import { generateDeleteSql, generateQuerySql } from '../../common/util/sql';
import { projectLabelModel, Table_Project_Label } from './../../../common/model/project_label';
class TagMapper extends Mapper<typeof projectLabelModel> {
    constructor() {
        super(projectLabelModel)
    }
    async listTag(projectId:string,page:number,size:number,keyword?:string):Promise<ICommon_Route_Res_Project_ListTag> {
        if(!projectId || page===undefined || page<0 || size===undefined || size<=0) {
            throw Err.Common.paramError
        }
        let mysql=getMysqlInstance()
        let ret:Pick<typeof projectLabelModel["model"],"id"|"name">[]=[]
        let count=Object.values(await mysql.executeOne<number>(`select count(1) from ${Table_Project_Label} where project_id='${projectId}'${keyword?` and name like %${keyword}%`:""}`))[0]
        let totalPage=CommonUtil.pageTotal(count,size)
        if(count>0) {
            ret=await mysql.execute(generateQuerySql(projectLabelModel,["id","name"],{
                project_id:projectId,
                ...(keyword && {
                    name:{
                        exp:"%like%",
                        value:keyword
                }}),
            },"and",{
                field:"name",
                type:"asc"
            },page*size,size))
        }
        return {
            count:count,
            totalPage:totalPage,
            page:page,
            data:ret
        }
    }
    async deleteByProjectId(projectId:string) {
        if(!projectId) {
            throw Err.Project.Module.moduleNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(projectLabelModel,{
            project_id:projectId
        }))
    }
}
export let tagMapper=new TagMapper
