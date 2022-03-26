import { ECommon_Model_Workflow_Node_Status, workflowNodeModel } from '../../../common/model/workflow_node';
import { Err } from "../../../common/status/error";
import { keys } from '../../../common/transform';
import { getMysqlInstance } from "../../common/db/mysql";
import { Mapper } from "../../common/entity/mapper";
import CommonUtil from "../../common/util/common";
import { generateCountSql, generateCreateSql, generateDeleteSql, generateGroupLeftJoin2Sql, generateLeftJoin3Sql, generateQuerySql, generateSnowId } from '../../common/util/sql';
import { issueTypeModel } from './../../../common/model/issue_type';
import { projectIssueModel } from './../../../common/model/project_issue';
import { ECommon_Model_Project_Release_Status, projectReleaseModel } from './../../../common/model/project_release';
import { projectReleaseIssueModel } from './../../../common/model/project_release_issue';
import { ICommon_Route_Res_Release_Info, ICommon_Route_Res_Release_Item, ICommon_Route_Res_Release_List } from './../../../common/routes/response';
class ReleaseMapper extends Mapper<typeof projectReleaseModel> {
    constructor() {
        super(projectReleaseModel)
    }
    async list(projectId:string,page:number,size:number,name?:string,status?:ECommon_Model_Project_Release_Status):Promise<ICommon_Route_Res_Release_List> {
        if(!projectId || page===undefined || page<0 || size===undefined || size<=0) {
            throw Err.Common.paramError
        }
        let mysql=getMysqlInstance()
        let ret:ICommon_Route_Res_Release_Item[]=[]
        let count=Number(Object.values(await mysql.executeOne(generateCountSql(projectReleaseModel,{
            ...(name && {
                name:{
                    exp:"%like%",
                    value:name
                }
            }),
            ...(status && {
                status:status
            })
        })))[0])
        let totalPage=CommonUtil.pageTotal(count,size)
        if(count>0) {
            let arr=await mysql.execute(generateQuerySql(projectReleaseModel,null,{
                project_id:projectId,
                ...(name && {
                    name:{
                        exp:"%like%",
                        value:name
                    }
                }),
                ...(status && {
                    status:status
                })
            },"and",{
                field:"name",
                type:"asc"
            },page*size,size))
            if(arr.length>0) {
                let sql=generateGroupLeftJoin2Sql({
                    model:projectReleaseIssueModel,
                    columns:{
                        columns:["project_release_id"],
                        calcColumns:[]
                    }
                },{
                    model:projectIssueModel,
                    expression:{
                        id:{
                            model:projectReleaseIssueModel,
                            field:"project_issue_id"
                        }
                    }
                },{
                    model:workflowNodeModel,
                    expression:{
                        id:{
                            model:projectIssueModel,
                            field:"workflow_node_id"
                        }
                    },
                    columns:{
                        columns:[],
                        calcColumns:[{
                            exp:"sum",
                            value:{
                                field:"status",
                                exp:"=",
                                value:ECommon_Model_Workflow_Node_Status.NOTSTART
                            },
                            rename:"notstart"
                        },{
                            exp:"sum",
                            value:{
                                field:"status",
                                exp:"=",
                                value:ECommon_Model_Workflow_Node_Status.INPROGRESS
                            },
                            rename:"inprogress",
                        },{
                            exp:"sum",
                            value:{
                                field:"status",
                                exp:"=",
                                value:ECommon_Model_Workflow_Node_Status.DONE
                            },
                            rename:"done"
                        }]
                    }
                },["project_release_id"],{
                    project_release_id:{
                        model:projectReleaseIssueModel,
                        value:{
                            exp:"in",
                            value:arr.map(item=>item.id)
                        }
                    },
                })
                let arr1=await mysql.execute(sql)
                let objTemp:{
                    [param:string]:typeof arr1[number]
                }={}
                arr1.forEach(item=>{
                    objTemp[item.project_release_id]=item
                })
                for(let obj of arr) {
                    ret.push({
                        ...obj,
                        notstart:objTemp[obj.id]?objTemp[obj.id].notstart:0,
                        inprogress:objTemp[obj.id]?objTemp[obj.id].inprogress:0,
                        done:objTemp[obj.id]?objTemp[obj.id].done:0
                    })
                }
            }
        }
        return {
            count:count,
            totalPage:totalPage,
            page:page,
            data:ret
        }
    }

    async info(projectReleaseId:string):Promise<ICommon_Route_Res_Release_Info> {
        if(!projectReleaseId) {
            throw Err.Project.Release.releaseNotFound
        }
        let mysql=getMysqlInstance()
        let objRelease = await mysql.executeOne(generateQuerySql(projectReleaseModel,[],{
            id:projectReleaseId
        }))
        if(!objRelease) {
            throw Err.Project.Release.releaseNotFound
        }
        let sql=generateGroupLeftJoin2Sql({
            model:projectReleaseIssueModel,
        },{
            model:projectIssueModel,
            expression:{
                id:{
                    model:projectReleaseIssueModel,
                    field:"project_issue_id"
                }
            }
        },{
            model:workflowNodeModel,
            expression:{
                id:{
                    model:projectIssueModel,
                    field:"workflow_node_id"
                }
            },
            columns:{
                columns:[],
                calcColumns:[{
                    exp:"sum",
                    value:{
                        field:"status",
                        exp:"=",
                        value:ECommon_Model_Workflow_Node_Status.NOTSTART
                    },
                    rename:"notstart"
                },{
                    exp:"sum",
                    value:{
                        field:"status",
                        exp:"=",
                        value:ECommon_Model_Workflow_Node_Status.INPROGRESS
                    },
                    rename:"inprogress",
                },{
                    exp:"sum",
                    value:{
                        field:"status",
                        exp:"=",
                        value:ECommon_Model_Workflow_Node_Status.DONE
                    },
                    rename:"done"
                }]
            }
        },["project_release_id"],{
            project_release_id:{
                model:projectReleaseIssueModel,
                value:projectReleaseId
            },
        })
        let obj=await mysql.executeOne(sql)
        let sql1=generateLeftJoin3Sql({
            model:projectReleaseIssueModel
        },{
            model:projectIssueModel,
            columns:keys<typeof projectIssueModel["model"]>().map(item=>item.name),
            expression:{
                id:{
                    model:projectReleaseIssueModel,
                    field:"project_issue_id"
                }
            },
        },{
            model:issueTypeModel,
            columns:keys<typeof issueTypeModel["model"]>().map(item=>item.name),
            expression:{
                id:{
                    model:projectIssueModel,
                    field:"issue_type_id"
                }
            },
            aggregation:"issueType"
        },{
            model:workflowNodeModel,
            columns:keys<typeof workflowNodeModel["model"]>().map(item=>item.name),
            expression:{
                id:{
                    model:projectIssueModel,
                    field:"workflow_node_id"
                }
            },
            aggregation:"workflowNode"
        },{
            project_release_id:{
                model:projectReleaseIssueModel,
                value:projectReleaseId
            }
        })
        let issueList=await mysql.execute(sql1)
        return {
            ...objRelease,
            ...(obj??{
                notstart:0,
                inprogress:0,
                done:0
            }),
            issueList:issueList
        }
    }

    async addIssue(projectReleaseId:string,projectIssueId:string) {
        if(!projectReleaseId) {
            throw Err.Project.Release.releaseNotFound
        } else if(!projectIssueId) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        let mysql=getMysqlInstance()
        let obj=await mysql.executeOne(generateQuerySql(projectReleaseIssueModel,[],{
            project_issue_id:projectIssueId,
            project_release_id:projectReleaseId
        })) 
        if(obj) {
            throw Err.Project.Release.releaseIssueDuplicate
        }
        await mysql.execute(generateCreateSql(projectReleaseIssueModel,{
            id:await generateSnowId(),
            project_issue_id:projectIssueId,
            project_release_id:projectReleaseId
        }))
    }

    async removeIssue(projectReleaseId:string,projectIssueId:string) {
        if(!projectReleaseId) {
            throw Err.Project.Release.releaseNotFound
        } else if(!projectIssueId) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(projectReleaseIssueModel,{
            project_issue_id:projectIssueId,
            project_release_id:projectReleaseId
        }))
    } 

    async getUnDoneIssueList(projectReleaseId:string) {
        if(!projectReleaseId) {
            throw Err.Project.Release.releaseNotFound
        }
        let mysql=getMysqlInstance()
        let objRelease = await mysql.executeOne(generateQuerySql(projectReleaseModel,[],{
            id:projectReleaseId
        }))
        if(!objRelease) {
            throw Err.Project.Release.releaseNotFound
        }
        let sql=generateLeftJoin3Sql({
            model:projectReleaseIssueModel
        },{
            model:projectIssueModel,
            columns:keys<typeof projectIssueModel["model"]>().map(item=>item.name),
            expression:{
                id:{
                    model:projectReleaseIssueModel,
                    field:"project_issue_id"
                }
            },
        },{
            model:issueTypeModel,
            expression:{
                id:{
                    model:projectIssueModel,
                    field:"issue_type_id"
                }
            }
        },{
            model:workflowNodeModel,
            expression:{
                id:{
                    model:projectIssueModel,
                    field:"workflow_node_id"
                }
            }
        },{
            project_release_id:{
                model:projectReleaseIssueModel,
                value:projectReleaseId
            },
            status:{
                model:workflowNodeModel,
                value:{
                    exp:"in",
                    value:[ECommon_Model_Workflow_Node_Status.NOTSTART,ECommon_Model_Workflow_Node_Status.INPROGRESS]
                }
            }
        })
        let issueList=await mysql.execute(sql)
        return issueList
    }
    
}
export let releaseMapper=new ReleaseMapper