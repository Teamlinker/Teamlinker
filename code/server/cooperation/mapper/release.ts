import {ECommon_Model_Workflow_Node_Status, workflowNodeModel} from '../../../common/model/workflow_node';
import {Err} from "../../../common/status/error";
import {keys} from '../../../common/transform';
import {getMysqlInstance} from "../../common/db/mysql";
import {Mapper} from "../../common/entity/mapper";
import CommonUtil from "../../common/util/common";
import {
    convertCountSql,
    generateCreateSql,
    generateDeleteSql,
    generateGroupLeftJoin2Sql,
    generateGroupLeftJoin4Sql,
    generateLeftJoin3Sql,
    generateLeftJoinSql,
    generateQuerySql,
    generateSnowId
} from '../../common/util/sql';
import {issueTypeModel} from './../../../common/model/issue_type';
import {projectIssueModel} from './../../../common/model/project_issue';
import {
    ECommon_Model_Project_Release_Status,
    ICommon_Model_Project_Release,
    projectReleaseModel
} from './../../../common/model/project_release';
import {projectReleaseIssueModel} from './../../../common/model/project_release_issue';
import {
    ICommon_Route_Res_Global_Search_Project_Release_Item,
    ICommon_Route_Res_Release_Info,
    ICommon_Route_Res_Release_Item,
    ICommon_Route_Res_Release_List
} from './../../../common/routes/response';
import {ICommon_Model_Project, projectModel} from "../../../common/model/project";
import {roleMemberModel} from "../../../common/model/role_member";
import {teamUserModel} from "../../../common/model/team_user";
import {memberTagMemberModel} from "../../../common/model/member_tag_member";
import {ECommon_Model_Organization_Member_Type} from "../../../common/model/organization";

class ReleaseMapper extends Mapper<typeof projectReleaseModel> {
    constructor() {
        super(projectReleaseModel)
    }

    async globalSearch(keyword:string,size:number,organizationUserId:string):Promise<ICommon_Route_Res_Global_Search_Project_Release_Item[]> {
        let mysql=getMysqlInstance()
        let sql=generateGroupLeftJoin4Sql({
            model:projectReleaseModel,
            columns:{
                columns:keys<ICommon_Model_Project_Release>().map(item=>item.name),
                calcColumns:[]
            }
        },{
            model:projectModel,
            columns:{
                columns:keys<ICommon_Model_Project>().map(item=>item.name),
                calcColumns:[]
            },
            expression:{
                id:{
                    model:projectReleaseModel,
                    field:"project_id"
                }
            },
            aggregation:"project"
        },{
            model:roleMemberModel,
            expression:{
                item_id:{
                    model:projectModel,
                    field:"id"
                }
            }
        },{
            model:teamUserModel,
            expression:{
                team_id:{
                    model:roleMemberModel,
                    field:"member_id"
                }
            }
        },{
            model:memberTagMemberModel,
            expression:{
                member_tag_id:{
                    model:roleMemberModel,
                    field:"member_id"
                }
            }
        },["id"],{
            "$or0":{
                member_id:{
                    model:roleMemberModel,
                    value:organizationUserId
                },
                member_type:{
                    model:roleMemberModel,
                    value:ECommon_Model_Organization_Member_Type.DEFAULT
                },
                organization_user_id:{
                    model:teamUserModel,
                    value:organizationUserId
                },
                "organization_user_id ": {
                    model:memberTagMemberModel,
                    value:organizationUserId
                }
            },
            id:{
                model:projectModel,
                value:{
                    exp:"is not null"
                }
            },
            ...(keyword && {
                name:{
                    model:projectReleaseModel,
                    value:{
                        exp:"%like%",
                        value:keyword
                    }
                }
            }),
        },"and",null,"and",{
            field:"name",
            model:projectReleaseModel,
            type:"asc",
            isVirtualField:false
        },0,size)
        let ret=await mysql.execute(sql)
        return ret;
    }

    async list(organizationId:string,projectId:string,page:number,size:number,name?:string,status?:ECommon_Model_Project_Release_Status,projectReleaseIds?:string[]):Promise<ICommon_Route_Res_Release_List> {
        if(page===undefined || page<0 || size===undefined || size<=0) {
            throw Err.Common.paramError
        }
        let mysql=getMysqlInstance()
        let ret:ICommon_Route_Res_Release_Item[]=[]
        let sql=generateLeftJoinSql({
            model:projectReleaseModel,
            columns:keys<typeof projectReleaseModel["model"]>().map(item=>item.name)
        },{
            model:projectModel,
            columns:keys<typeof projectModel["model"]>().map(item=>item.name),
            aggregation:"project",
            expression:{
                id:{
                    model:projectReleaseModel,
                    field:"project_id"
                }
            }
        },{
            organization_id:{
                model:projectModel,
                value:organizationId
            },
            ...(projectId && {
                project_id:{
                    model:projectReleaseModel,
                    value:projectId
                }
            }),
            ...(name && {
                name:{
                    model:projectReleaseModel,
                    value:{
                        exp:"%like%",
                        value:name
                    }
                }
            }),
            ...(status && {
                status:{
                    model:projectReleaseModel,
                    value:status
                }
            }),
            ...(projectReleaseIds?.length>0 && {
                id:{
                    model:projectReleaseModel,
                    value:{
                        exp:"in",
                        value:projectReleaseIds
                    }
                }
            })
        },"and",projectReleaseIds?.length>0?{
            model:projectReleaseModel,
            field:"id",
            type:"field",
            value:projectReleaseIds
        }:{
            model:projectReleaseModel,
            field:"name",
            type:"asc"
        },page*size,size)
        let countSql=convertCountSql(sql);
        let count=Number(Object.values(await mysql.executeOne(countSql))[0])
        let totalPage=CommonUtil.pageTotal(count,size)
        if(count>0) {
            let arr=await mysql.execute(sql)
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
                            exp:"count",
                            value:{
                                field:"status",
                                exp:"=",
                                value:ECommon_Model_Workflow_Node_Status.NOTSTART
                            },
                            rename:"notstart"
                        },{
                            exp:"count",
                            value:{
                                field:"status",
                                exp:"=",
                                value:ECommon_Model_Workflow_Node_Status.INPROGRESS
                            },
                            rename:"inprogress",
                        },{
                            exp:"count",
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
                        notstart:objTemp[obj.id]?Number(objTemp[obj.id].notstart):0,
                        inprogress:objTemp[obj.id]?Number(objTemp[obj.id].inprogress):0,
                        done:objTemp[obj.id]?Number(objTemp[obj.id].done):0,
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
        let sqlRelease=generateLeftJoinSql({
            model:projectReleaseModel,
            columns:keys<typeof projectReleaseModel["model"]>().map(item=>item.name)
        },{
            model:projectModel,
            columns:keys<typeof projectModel["model"]>().map(item=>item.name),
            aggregation:"project",
            expression:{
                id:{
                    model:projectReleaseModel,
                    field:"project_id"
                }
            }
        },{
            id:{
                model:projectReleaseModel,
                value:projectReleaseId
            }
        })
        let objRelease = await mysql.executeOne(sqlRelease)
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
            ...(obj?{
                notstart:Number(obj.notstart),
                inprogress:Number(obj.inprogress),
                done:Number(obj.done)
            }:{
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

    async clear(projectId:string) {
        if(!projectId) {
            throw Err.Project.projectNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(projectReleaseModel,["id"],{
            project_id:projectId
        }))
        if(ret.length>0) {
            await mysql.execute(generateDeleteSql(projectReleaseModel,{
                project_id:projectId
            }))
            await mysql.execute(generateDeleteSql(projectReleaseIssueModel,{
                project_release_id:{
                    exp:"in",
                    value:ret.map(item=>item.id)
                }
            }))
        }
    }

    async clearIssue(projectReleaseId:string) {
        if(!projectReleaseId) {
            throw Err.Project.Release.releaseNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(projectReleaseIssueModel,{
            project_release_id:projectReleaseId
        }))
    }

    async clearByProjectIds(projectIds:string[]) {
        if(!projectIds || projectIds.length==0) {
            return
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(projectReleaseModel,["id"],{
            project_id:{
                exp:"in",
                value:projectIds
            }
        }))
        if(ret.length>0) {
            await mysql.execute(generateDeleteSql(projectReleaseModel,{
                project_id:{
                    exp:"in",
                    value:projectIds
                }
            }))
            await mysql.execute(generateDeleteSql(projectReleaseIssueModel,{
                project_release_id:{
                    exp:"in",
                    value:ret.map(item=>item.id)
                }
            }))
        }
    }

    async issueReleaseList(projectIssueId:string) {
        if(!projectIssueId) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        let mysql=getMysqlInstance()
        let sql=generateLeftJoinSql({
            model:projectReleaseIssueModel
        },{
            model:projectReleaseModel,
            columns:keys<ICommon_Model_Project_Release>().map(item=>item.name),
            expression:{
                id:{
                    model:projectReleaseIssueModel,
                    field:"project_release_id"
                }
            }
        },{
            project_issue_id:{
                model:projectReleaseIssueModel,
                value:projectIssueId
            }
        },"and",{
            model:projectReleaseModel,
            field:"name",
            type:"asc"
        })
        let ret=await mysql.execute(sql)
        return ret;
    }

    async issueBindReleaseList(projectIssueId:string,projectReleaseIds:string[]) {
        if(!projectIssueId) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(projectReleaseIssueModel,{
            project_issue_id:projectIssueId
        }))
        if(projectReleaseIds.length>0) {
            let arr=[]
            for(let id of projectReleaseIds) {
                arr.push(mysql.execute(generateCreateSql(projectReleaseIssueModel,{
                    id:await generateSnowId(),
                    project_issue_id:projectIssueId,
                    project_release_id:id
                })))
            }
            await Promise.all(arr);
        }
        let ret=await this.issueReleaseList(projectIssueId)
        return ret;
    }
}
export let releaseMapper=new ReleaseMapper