import {ICommon_Model_Project, projectModel, Table_Project} from '../../../common/model/project';
import {workflowNodeModel} from '../../../common/model/workflow_node';
import {Err} from '../../../common/status/error';
import {getMysqlInstance} from '../../common/db/mysql';
import {Mapper} from "../../common/entity/mapper";
import CommonUtil from "../../common/util/common";
import {
    convertCountAndExecute,
    convertCountSql,
    generateCommonListData,
    generateDeleteSql,
    generateGroupLeftJoin2Sql,
    generateGroupLeftJoin3Sql,
    generateLeftJoinSql,
    generateQuerySql,
    generateUpdateSql
} from '../../common/util/sql';
import {ICommon_Model_Project_Issue, projectIssueModel} from './../../../common/model/project_issue';
import {ECommon_Model_Workflow_Node_Status} from './../../../common/model/workflow_node';
import {roleMemberModel} from "../../../common/model/role_member";
import {teamUserModel} from "../../../common/model/team_user";
import {memberTagMemberModel} from "../../../common/model/member_tag_member";
import {ECommon_Model_Organization_Member_Type} from "../../../common/model/organization";
import {ICommon_Route_Res_Project_Statics} from "../../../common/routes/response";
import {ECommon_Model_Project_Release_Status, projectReleaseModel} from "../../../common/model/project_release";
import {boardSprintModel} from "../../../common/model/board_sprint";
import {boardModel} from "../../../common/model/board";
import * as moment from "moment";
import {organizationUserModel} from "../../../common/model/organization_user";
import {userModel} from "../../../common/model/user";
import {keys} from "../../../common/transform";
import {projectIssueHistoryModel} from "../../../common/model/project_issue_history";
import {projectIssueApprovalModel} from "../../../common/model/project_issue_approval";
import {Table_Project_Issue_Field_Value} from "../../../common/model/project_issue_field_value";
import {Table_Workflow_Approval} from "../../../common/model/workflow_approval";

class ProjectMapper extends Mapper<typeof projectModel>{
    constructor(){
        super(projectModel)
    }

    async statics(projectId:string,organizationUserId:string):Promise<ICommon_Route_Res_Project_Statics> {
        if(!projectId) {
            throw Err.Project.projectNotFound
        }
        let mysql=getMysqlInstance()
        let [issueCount,releaseCount,sprintCount,unDoneIssueCount,myRecentIssueList,recentReleaseList,userIssueList,userUnDoneIssueList]=await Promise.all([
            convertCountAndExecute(generateQuerySql(projectIssueModel,null,{
                project_id:projectId
            })),
            convertCountAndExecute(generateQuerySql(projectReleaseModel,null,{
                project_id:projectId
            })),
            (async ()=>{
                let sql=generateLeftJoinSql({
                    model:boardSprintModel,
                    columns:["id"]
                },{
                    model:boardModel,
                    expression:{
                        id:{
                            model:boardSprintModel,
                            field:"board_id"
                        }
                    }
                },{
                    project_id:{
                        model:boardModel,
                        value:projectId
                    }
                })
                let ret=await convertCountAndExecute(sql)
                return ret
            })(),
            (async ()=>{
                let sql=generateLeftJoinSql({
                    model:projectIssueModel,
                    columns:["id"]
                },{
                    model:workflowNodeModel,
                    expression:{
                        id:{
                            model:projectIssueModel,
                            field:"workflow_node_id"
                        }
                    }
                },{
                    project_id:{
                        model:projectIssueModel,
                        value:projectId
                    },
                    status:{
                        model:workflowNodeModel,
                        value:{
                            exp:"<>",
                            value:ECommon_Model_Workflow_Node_Status.DONE
                        }
                    }
                })
                let ret=await convertCountAndExecute(sql)
                return ret
            })(),
            (async ()=>{
                let sql=generateLeftJoinSql({
                    model:projectIssueModel,
                    columns:keys<ICommon_Model_Project_Issue>().map(item=>item.name)
                },{
                    model:workflowNodeModel,
                    expression:{
                        id:{
                            model:projectIssueModel,
                            field:"workflow_node_id"
                        }
                    }
                },{
                    project_id:{
                        model:projectIssueModel,
                        value:projectId
                    },
                    assigner_id:{
                        model:projectIssueModel,
                        value:organizationUserId
                    },
                    status:{
                        model:workflowNodeModel,
                        value:{
                            exp:"<>",
                            value:ECommon_Model_Workflow_Node_Status.DONE
                        }
                    }
                },"and",{
                    type:"desc",
                    field:"modified_time",
                    model:projectIssueModel
                },0,10)
                let ret=await mysql.execute(sql)
                return ret;
            })(),
            mysql.execute(generateQuerySql(projectReleaseModel,null,{
                status:ECommon_Model_Project_Release_Status.UNRELEASE,
                project_id:projectId,
                release_time:{
                    exp:">=",
                    value:moment().format("YYYY-MM-DD")
                }
            },"and",{
                type:"asc",
                field:"release_time"
            },0,10)),
            (async ()=>{
                let sql=generateGroupLeftJoin2Sql({
                    model:projectIssueModel,
                    columns:{
                        columns:[],
                        calcColumns:[
                            {
                                exp:"count",
                                value:"id",
                                rename:"count"
                            }
                        ]
                    }
                },{
                    model:organizationUserModel,
                    columns:{
                        columns:["id","nickname"],
                        calcColumns:[]
                    },
                    expression:{
                        id:{
                            model:projectIssueModel,
                            field:"assigner_id"
                        }
                    },
                    aggregation:"organizationUser"
                },{
                    model:userModel,
                    columns:{
                        columns:["photo"],
                        calcColumns:[]
                    },
                    expression:{
                        id:{
                            model:organizationUserModel,
                            field:"user_id"
                        }
                    },
                    aggregation:"user"
                },["assigner_id"],{
                    project_id:{
                        model:projectIssueModel,
                        value:projectId
                    },
                    assigner_id:{
                        model:projectIssueModel,
                        value:{
                            exp:"is not null"
                        }
                    }
                },"and",null,"and",{
                    isVirtualField:true,
                    field:"count",
                    model:projectIssueModel,
                    type:"desc"
                },0,10)
                let arr=await mysql.execute(sql)
                return arr.map(item=>{
                    return {
                        count:item.count,
                        user:{
                            organizationUserId:item.organizationUser.id,
                            name:item.organizationUser.nickname,
                            photo:item.user?.photo
                        }
                    }
                })
            })(),
            (async ()=>{
                let sql=generateGroupLeftJoin3Sql({
                    model:projectIssueModel,
                    columns:{
                        columns:[],
                        calcColumns:[
                            {
                                exp:"count",
                                value:"id",
                                rename:"count"
                            }
                        ]
                    }
                },{
                    model:organizationUserModel,
                    columns:{
                        columns:["id","nickname"],
                        calcColumns:[]
                    },
                    expression:{
                        id:{
                            model:projectIssueModel,
                            field:"assigner_id"
                        }
                    },
                    aggregation:"organizationUser"
                },{
                    model:userModel,
                    columns:{
                        columns:["photo"],
                        calcColumns:[]
                    },
                    expression:{
                        id:{
                            model:organizationUserModel,
                            field:"user_id"
                        }
                    },
                    aggregation:"user"
                },{
                    model:workflowNodeModel,
                    expression:{
                        id:{
                            model:projectIssueModel,
                            field:"workflow_node_id"
                        }
                    }
                },["assigner_id"],{
                    project_id:{
                        model:projectIssueModel,
                        value:projectId
                    },
                    status:{
                        model:workflowNodeModel,
                        value:{
                            exp:"<>",
                            value:ECommon_Model_Workflow_Node_Status.DONE
                        }
                    },
                    assigner_id:{
                        model:projectIssueModel,
                        value:{
                            exp:"is not null"
                        }
                    }
                },"and",null,"and",{
                    isVirtualField:true,
                    field:"count",
                    model:projectIssueModel,
                    type:"desc"
                },0,10)
                let arr=await mysql.execute(sql)
                return arr.map(item=>{
                    return {
                        count:item.count,
                        user:{
                            organizationUserId:item.organizationUser.id,
                            name:item.organizationUser.nickname,
                            photo:item.user?.photo
                        }
                    }
                })
            })()
        ])
        return {
            issueCount:issueCount,
            issueUnDoneCount:unDoneIssueCount,
            myRecentIssueList:myRecentIssueList,
            recentReleaseList:recentReleaseList,
            releaseCount:releaseCount,
            sprintCount:sprintCount,
            userIssueList:userIssueList,
            userUnDoneIssueList:userUnDoneIssueList
        }
    }

    async list(organizationId:string,page:number,size:number,keyword?:string,organizationUserId?:string):Promise<{
        count:number,
        totalPage:number,
        data:ICommon_Model_Project[]
    }> {
        if(page===undefined || page<0 || size===undefined || size<=0) {
            throw Err.Common.paramError
        }
        if(!organizationId) {
            throw Err.Organization.organizationNotFound
        }
        let mysql=getMysqlInstance();
        let str=`select count(1) from ${Table_Project} where organization_id=${organizationId}`,keywordStr="",userIdStr=""
        if(keyword) {
            keywordStr=`name like '%${keyword}%'`
        }
        if(organizationUserId) {
            userIdStr=`created_by='${organizationUserId}'`
        }
        if(keywordStr && userIdStr) {
            str+=" and "+keywordStr+" and "+userIdStr
        } else if(keywordStr) {
            str+=" and "+keywordStr
        } else if(userIdStr) {
            str+=" and "+userIdStr
        }
        let count=Number(Object.values(await mysql.executeOne<number>(str))[0])
        let totalPage=CommonUtil.pageTotal(count,size)
        let ret=await mysql.execute(generateQuerySql(projectModel,[],{
            organization_id:organizationId,
            ...(keyword && {
                name:{
                    exp:"%like%",
                    value:keyword
                }
            }),
            ...(organizationUserId && {
                created_by:organizationUserId
            })
        },"and",{
            field:"name",
            type:"asc"
        },page*size,size))
        return {
            count:count,
            totalPage:totalPage,
            data:ret
        };
    }

    async getItemByKeyword(keyword:string) {
        if(!keyword) {
            throw  Err.Project.projectKeywordNotFound
        }
        var mysql=getMysqlInstance();
        let ret=await mysql.executeOne(generateQuerySql(projectModel,null,{
            keyword:keyword
        }))
        return ret
    }

    async recentProjectList(organizationUserId:string) {
        if(!organizationUserId) {
            throw Err.User.userIdNotExists
        }
        var mysql=getMysqlInstance();
        let sql=generateGroupLeftJoin2Sql({
            model:projectIssueModel
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
        },{
            model:projectModel,
            expression:{
                id:{
                    model:projectIssueModel,
                    field:"project_id"
                }
            },
            columns:{
                columns:["id","name","photo","keyword"],
                calcColumns:[]
            }
        },["project_id"],{
            assigner_id:{
                model:projectIssueModel,
                value:organizationUserId
            }
        },"or",null,"and",{
            isVirtualField:true,
            field:"notstart",
            model:workflowNodeModel,
            type:"desc"
        },0,20)
        let ret=await mysql.execute(sql)
        ret=ret.map(item=>{
            return {
                keyword:item.keyword,
                id:item.id,
                name:item.name,
                photo:item.photo,
                notstart:Number(item.notstart),
                inprogress:Number(item.inprogress),
                done:Number(item.done)
            }
        })
        return ret;
    }

    async userProjectList(organizationId:string,organizationUserId:string,page:number,size:number,type:"all"|"created"|"joined",keyword?:string,sort?:"name"|"created_time") {
        if(!organizationUserId) {
            throw Err.User.userIdNotExists
        }
        let mysql=getMysqlInstance();
        let sql=generateGroupLeftJoin3Sql({
            model:roleMemberModel,
            columns:{
                columns:["item_id"],
                calcColumns:[]
            }
        },{
            model:projectModel,
            expression:{
                id:{
                    model:roleMemberModel,
                    field:"item_id"
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
        },["item_id"],{
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
                    model:projectModel,
                    value:{
                        exp:"%like%",
                        value:keyword
                    }
                }
            }),
            ...((type=="created" || type=="joined") && {
                created_by:{
                    model:projectModel,
                    value:{
                        exp:type=="created"?"=":"<>",
                        value:organizationUserId
                    }
                }
            }),
            organization_id:{
                model:projectModel,
                value:organizationId
            }
        },"and",null,"and",{
            field:sort??"name",
            model:projectModel,
            type:(!sort || sort==="name")?"asc":"desc",
            isVirtualField:false
        },page*size,size)
        let objPage=await generateCommonListData(sql,page,size)
        let arrProjectId=objPage.data.map(item=>item.item_id);
        if(arrProjectId.length>0) {
            let sql=generateGroupLeftJoin2Sql({
                model:projectModel,
                columns:{
                    columns:["id","name","photo","keyword"],
                    calcColumns:[]
                }
            },{
                model:projectIssueModel,
                expression:{
                    project_id:{
                        model:projectModel,
                        field:"id"
                    }
                },
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
            },["id"],{
                id:{
                    model:projectModel,
                    value:{
                        exp:"in",
                        value:arrProjectId
                    }
                }
            },"and",null,"and",{
                isVirtualField:false,
                field:"id",
                model:projectModel,
                type:"field",
                value:arrProjectId
            },0,20)
            let ret=await mysql.execute(sql)
            ret=ret.map(item=>{
                return {
                    keyword:item.keyword,
                    id:item.id,
                    name:item.name,
                    photo:item.photo,
                    notstart:Number(item.notstart),
                    inprogress:Number(item.inprogress),
                    done:Number(item.done)
                }
            })
            return {
                page:page,
                count:objPage.count,
                totalPage:objPage.totalPage,
                data:ret
            }
        } else {
            return {
                page:page,
                count:objPage.count,
                totalPage:objPage.totalPage,
                data:[]
            }
        }
    }

    async getProjectListByOrganizationId(organizationId:string) {
        if(!organizationId) {
            throw Err.Organization.organizationNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(projectModel,[],{
            organization_id:organizationId
        },"and",{
            field:"name",
            type:"asc"
        }))
        return ret;
    }
    async clearProjects(projectIds:string[]){
        if(!projectIds || projectIds.length==0) {
            return;
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(projectModel,{
            id:{
                exp:"in",
                value:projectIds
            }
        }))
    }

    async issueCount(projectId:string) {
        if(!projectId) {
            throw Err.Project.projectNotFound
        }
        let mysql=getMysqlInstance()
        let sql=convertCountSql(generateQuerySql(projectIssueModel,null,{
            project_id:projectId
        }))
        let count=Number(Object.values(await mysql.executeOne(sql))[0])
        return count
    }

    async updateMember(organizationUserId:string,updatedOrganizationUserId:string) {
        if(!organizationUserId || !updatedOrganizationUserId) {
            return
        }
        let mysql=getMysqlInstance()
        await Promise.all([
            mysql.execute(generateUpdateSql(projectModel,{
                created_by:updatedOrganizationUserId
            },{
                created_by:organizationUserId
            })),
            (async ()=>{
                await mysql.execute(generateUpdateSql(projectIssueModel,{
                    created_by:updatedOrganizationUserId
                },{
                    created_by:organizationUserId
                }))
                await mysql.execute(generateUpdateSql(projectIssueModel,{
                    assigner_id:updatedOrganizationUserId
                },{
                    assigner_id:organizationUserId
                }))
                await mysql.execute(generateUpdateSql(projectIssueModel,{
                    reporter_id:updatedOrganizationUserId
                },{
                    reporter_id:organizationUserId
                }))
            })(),
            mysql.execute(generateUpdateSql(projectReleaseModel,{
                created_by:updatedOrganizationUserId
            },{
                created_by:organizationUserId
            })),
            mysql.execute(generateUpdateSql(projectIssueHistoryModel,{
                organization_user_id:updatedOrganizationUserId
            },{
                organization_user_id:organizationUserId
            })),
            mysql.execute(generateUpdateSql(projectIssueApprovalModel,{
                approval_organization_user_id:updatedOrganizationUserId
            },{
                approval_organization_user_id:organizationUserId
            })),
            mysql.execute(`update ${Table_Project_Issue_Field_Value}  set ref_values=JSON_REMOVE(ref_values,JSON_UNQUOTE(JSON_SEARCH(ref_values,'one','${organizationUserId}'))) where JSON_SEARCH(ref_values,'one','${organizationUserId}') IS NOT NULL`),
            mysql.execute(`update ${Table_Workflow_Approval}  set value=JSON_REMOVE(value,JSON_UNQUOTE(JSON_SEARCH(value,'one','${organizationUserId}'))) where JSON_SEARCH(value,'one','${organizationUserId}') IS NOT NULL`)
        ])
    }
}
export let projectMapper=new ProjectMapper
