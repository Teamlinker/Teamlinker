import {Mapper} from "../../common/entity/mapper";
import {ICommon_Model_Plan, planModel} from "../../../common/model/plan";
import {ECommon_Model_Plan_Table, ICommon_Model_Plan_Table, planTableModel} from "../../../common/model/plan_table";
import {Err} from "../../../common/status/error";
import {
    generateCommonListData,
    generateDeleteSql,
    generateGroupLeftJoinSql,
    generateLeftJoin2Sql,
    generateQuerySql,
    generateUpdateSql
} from "../../common/util/sql";
import {getMysqlInstance} from "../../common/db/mysql";
import {keys} from "../../../common/transform";
import {ICommon_Model_Project_Issue, projectIssueModel} from "../../../common/model/project_issue";
import {ICommon_Model_Workflow_Node, workflowNodeModel} from "../../../common/model/workflow_node";
import {ICommon_Route_Res_Plan_Info_Item} from "../../../common/routes/response";

class PlanMapper extends Mapper<typeof planModel> {
    constructor() {
        super(planModel)
    }

    async list(projectId:string,page:number,size:number,keyword?:string) {
        if(!projectId) {
            throw Err.Project.projectNotFound
        }
        let sql=generateQuerySql(planModel,null,{
            project_id:projectId,
            ...(keyword && {
                name:{
                    exp:"%like%",
                    value:keyword
                }
            })
        },"and",{
            type:"asc",
            field:"name"
        },page*size,size)
        let ret=generateCommonListData(sql,page,size)
        return ret;
    }

    async info(planId:string) {
        if(!planId) {
            throw Err.Project.Plan.planNotFound
        }
        let mysql=getMysqlInstance()
        let sql=generateLeftJoin2Sql({
            model:planTableModel,
            columns:keys<ICommon_Model_Plan_Table>().map(item=>item.name)
        },{
            model:projectIssueModel,
            columns:keys<ICommon_Model_Project_Issue>().map(item=>item.name),
            expression:{
                id:{
                    model:planTableModel,
                    field:"ref_id"
                }
            },
            aggregation:"issue"
        },{
            model:workflowNodeModel,
            columns:keys<ICommon_Model_Workflow_Node>().map(item=>item.name),
            expression:{
                id:{
                    model:projectIssueModel,
                    field: "workflow_node_id"
                }
            },
            aggregation:"workflow"
        },{
            plan_id:{
                model:planTableModel,
                value:planId
            }
        },"and",{
            type:"asc",
            model:planTableModel,
            field:"sort"
        })
        let arr=await mysql.execute(sql)
        let ret=this.handle(arr,null)
        return ret;
    }

    handle(arr:ICommon_Route_Res_Plan_Info_Item[],parentId:string):ICommon_Route_Res_Plan_Info_Item[] {
        let ret:ICommon_Route_Res_Plan_Info_Item[]=[]
        for(let obj of arr) {
            if(obj.parent_id===parentId) {
                ret.push(obj)
                if(obj.type===ECommon_Model_Plan_Table.ISSUE || obj.type===ECommon_Model_Plan_Table.STAGE) {
                    let temp=this.handle(arr,obj.id)
                    if(temp?.length>0) {
                        obj.children=temp
                    }
                }
            }
        }
        return ret;
    }

    async clearByProjects(projectIds:string[]) {
        if(projectIds.length==0) {
            return
        }
        let mysql=getMysqlInstance()
        await Promise.all([
            mysql.execute(generateDeleteSql(planModel,{
                project_id:{
                    exp:"in",
                    value:projectIds
                }
            })),
            mysql.execute(generateDeleteSql(planTableModel,{
                project_id:{
                    exp:"in",
                    value:projectIds
                }
            }))
        ])

    }

    async issuePlanList(projectIssueId:string) {
        if(!projectIssueId) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        let mysql=getMysqlInstance()
        let sql=generateGroupLeftJoinSql({
            model:planTableModel
        },{
            model:planModel,
            columns:{
                columns:keys<ICommon_Model_Plan>().map(item=>item.name),
                calcColumns:[]
            },
            expression:{
                id:{
                    model:planTableModel,
                    field:"plan_id"
                }
            }
        },["plan_id"],{
            ref_id:{
                model:planTableModel,
                value:projectIssueId
            }
        })
        let arr=await mysql.execute(sql)
        return arr;
    }
}

export const planMapper=new PlanMapper

class PlanTableMapper extends Mapper<typeof planTableModel> {
    constructor() {
        super(planTableModel)
    }
    async clearByPlanId(planId:string) {
        if(!planId) {
            throw Err.Project.Plan.planNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(planTableModel,{
            plan_id:planId
        }))
    }

    async getNewSort(planItemId:string,planId:string) {
        let mysql=getMysqlInstance()
        let obj=await mysql.executeOne(generateQuerySql(planTableModel,["sort"],{
            plan_id:planId,
            parent_id:planItemId
        },"and",{
            type:"desc",
            field:"sort"
        }))
        if(obj) {
            return obj.sort+1
        } else {
            return 0
        }
    }

    async moveUp(parentId:string,index:number,planId:string) {
        let mysql=getMysqlInstance()
        await mysql.execute(generateUpdateSql(planTableModel,{
            sort:{
                exp:"-",
                value:1
            }
        },{
            sort:{
                exp:">",
                value:index
            },
            parent_id:parentId,
            plan_id:planId
        }))
    }

    async moveDown(parentId:string,index:number,planId:string) {
        let mysql=getMysqlInstance()
        await mysql.execute(generateUpdateSql(planTableModel,{
            sort:{
                exp:"+",
                value:1
            }
        },{
            sort:{
                exp:">=",
                value:index
            },
            parent_id:parentId,
            plan_id:planId
        }))
    }

    async removeItems(ids:string[]) {
        if(ids?.length==0) {
            return
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(planTableModel,{
            id:{
                exp:"in",
                value:ids
            }
        }))
    }

    async hasChild(planItemId:string) {
        let mysql=getMysqlInstance()
        let arr=await mysql.execute(generateQuerySql(planTableModel,["id"],{
            parent_id:planItemId
        }))
        return arr.length>0
    }

    async clearDepend(planItemId:string) {
        let mysql=getMysqlInstance()
        await mysql.execute(generateUpdateSql(planTableModel,{
            depend_id:null
        },{
            depend_id:planItemId
        }))
    }
}
export const planTableMapper=new PlanTableMapper
