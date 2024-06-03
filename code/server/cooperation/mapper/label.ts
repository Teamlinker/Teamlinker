import {ICommon_Route_Res_Project_ListTag} from "../../../common/routes/response";
import {Err} from "../../../common/status/error";
import {getMysqlInstance} from "../../common/db/mysql";
import {Mapper} from "../../common/entity/mapper";
import CommonUtil from "../../common/util/common";
import {generateQuerySql} from '../../common/util/sql';
import {projectLabelModel, Table_Project_Label} from './../../../common/model/project_label';
import {projectLabelIssueModel} from "../../../common/model/project_label_issue";

class LabelMapper extends Mapper<typeof projectLabelModel> {
    constructor() {
        super(projectLabelModel)
    }
    async listLabel(projectId:string, page:number, size:number, keyword?:string):Promise<ICommon_Route_Res_Project_ListTag> {
        if(!projectId || page===undefined || page<0 || size===undefined || size<=0) {
            throw Err.Common.paramError
        }
        let mysql=getMysqlInstance()
        let ret:Pick<typeof projectLabelModel["model"],"id"|"name">[]=[]
        let count=Number(Object.values(await mysql.executeOne<number>(`select count(1) from ${Table_Project_Label} where project_id='${projectId}'${keyword?` and name like '%${keyword}%'`:""}`))[0])
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
}
export let labelMapper=new LabelMapper


class LabelIssueMapper extends Mapper<typeof projectLabelIssueModel> {
    constructor() {
        super(projectLabelIssueModel)
    }
}
export let labelIssueMapper=new LabelIssueMapper
