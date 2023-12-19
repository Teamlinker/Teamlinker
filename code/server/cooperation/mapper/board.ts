import {Mapper} from "../../common/entity/mapper";
import {boardModel, ICommon_Model_Board} from "../../../common/model/board";
import {boardColumnModel, ICommon_Model_Board_Column} from "../../../common/model/board_column";
import {boardColumnWorkflowNodeModel} from "../../../common/model/board_column_workflow_node";
import {boardIssueTypeModel} from "../../../common/model/board_issue_type";
import {
    boardSprintModel,
    ECommon_Model_Board_Sprint_Status,
    ICommon_Model_Board_Sprint
} from "../../../common/model/board_sprint";
import {
    boardSprintSwimLaneModel,
    ICommon_Model_Board_Sprint_SwimLane
} from "../../../common/model/board_sprint_swimlane";
import {boardSprintIssueModel} from "../../../common/model/board_sprint_issue";
import {Err} from "../../../common/status/error";
import {getMysqlInstance} from "../../common/db/mysql";
import {
    convertCountAndExecute,
    generateCommonListData,
    generateDeleteLeftJoinSql,
    generateDeleteSql,
    generateGroupLeftJoin4Sql,
    generateGroupLeftJoin5Sql,
    generateLeftJoin2Sql,
    generateLeftJoin3Sql,
    generateLeftJoinSql,
    generateQuerySql,
    generateUpdateSql
} from "../../common/util/sql";
import {keys} from "../../../common/transform";
import {ICommon_Model_Workflow_Node, workflowNodeModel} from "../../../common/model/workflow_node";
import {ICommon_Model_Issue_Type, issueTypeModel} from "../../../common/model/issue_type";
import {ICommon_Model_Project_Issue, projectIssueModel} from "../../../common/model/project_issue";
import {ICommon_Model_Project, projectModel} from "../../../common/model/project";
import {roleMemberModel} from "../../../common/model/role_member";
import {teamUserModel} from "../../../common/model/team_user";
import {memberTagMemberModel} from "../../../common/model/member_tag_member";
import {ECommon_Model_Organization_Member_Type} from "../../../common/model/organization";
import {
    ICommon_Route_Res_Global_Search_Board_Item,
    ICommon_Route_Res_Global_Search_Board_Sprint_Item
} from "../../../common/routes/response";

class BoardMapper extends Mapper<typeof boardModel> {
    constructor() {
        super(boardModel)
    }

    async count(projectId:string) {
        if(!projectId) {
            throw Err.Project.projectNotFound
        }
        let count=await convertCountAndExecute(generateQuerySql(boardModel,null,{
            project_id:projectId
        }))
        return count
    }

    async list(projectId:string,page:number,size:number,keyword?:string) {
        if(!projectId) {
            throw Err.Project.projectNotFound
        }
        let sql=generateQuerySql(boardModel,null,{
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

    async clearByProjects(projectIds:string[]) {
        if(projectIds.length==0) {
            return
        }
        let mysql=getMysqlInstance()
        let arrBoard=await mysql.execute(generateQuerySql(boardModel,["id"],{
            project_id:{
                exp:"in",
                value:projectIds
            }
        }))
        if(arrBoard.length>0) {
            let boardIds=arrBoard.map(item=>item.id)
            await Promise.all([
                mysql.execute(generateDeleteSql(boardModel,{
                    project_id:{
                        exp:"in",
                        value:projectIds
                    }
                })),
                mysql.execute(generateDeleteSql(boardColumnModel,{
                    board_id:{
                        exp:"in",
                        value:boardIds
                    }
                })),
                mysql.execute(generateDeleteSql(boardColumnWorkflowNodeModel,{
                    board_id:{
                        exp:"in",
                        value:boardIds
                    }
                })),
                mysql.execute(generateDeleteSql(boardIssueTypeModel,{
                    board_id:{
                        exp:"in",
                        value:boardIds
                    }
                })),
                mysql.execute(generateDeleteSql(boardSprintModel,{
                    board_id:{
                        exp:"in",
                        value:boardIds
                    }
                })),
                mysql.execute(generateDeleteSql(boardSprintIssueModel,{
                    board_id:{
                        exp:"in",
                        value:boardIds
                    }
                })),
                mysql.execute(generateDeleteSql(boardSprintSwimLaneModel,{
                    board_id:{
                        exp:"in",
                        value:boardIds
                    }
                }))
            ])
        }

    }

    async globalSearch(keyword:string,size:number,organizationUserId:string):Promise<ICommon_Route_Res_Global_Search_Board_Item[]> {
        let mysql=getMysqlInstance()
        let sql=generateGroupLeftJoin4Sql({
            model:boardModel,
            columns:{
                columns:keys<ICommon_Model_Board>().map(item=>item.name),
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
                    model:boardModel,
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
                    model:boardModel,
                    value:{
                        exp:"%like%",
                        value:keyword
                    }
                }
            }),
        },"and",null,"and",{
            field:"name",
            model:boardModel,
            type:"asc",
            isVirtualField:false
        },0,size)
        let ret=await mysql.execute(sql)
        return ret;
    }

    async updateIssueType(relationship:{
        [id:string]:string
    },projectId:string) {
        if(!projectId) {
            throw Err.Project.projectNotFound
        }
        let mysql=getMysqlInstance()
        let arrBoard=await mysql.execute(generateQuerySql(boardModel,null,{
            project_id:projectId
        }))
        if(arrBoard.length>0) {
            await Promise.all(Object.keys(relationship).map(originId=>{
                return mysql.execute(generateUpdateSql(boardIssueTypeModel,{
                    issue_type_id:relationship[originId]
                },{
                    issue_type_id:originId,
                    board_id:{
                        exp:"in",
                        value:arrBoard.map(item=>item.id)
                    }
                }))
            }))
            await mysql.execute(generateDeleteSql(boardColumnWorkflowNodeModel,{
                board_id:{
                    exp:"in",
                    value:arrBoard.map(item=>item.id)
                }
            }))
        }
    }
}

export let boardMapper=new BoardMapper


class BoardColumnMapper extends Mapper<typeof boardColumnModel> {
    constructor() {
        super(boardColumnModel)
    }
    async list(boardId:string) {
        if(!boardId) {
            throw Err.Project.Board.boardNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(boardColumnModel,null,{
            board_id:boardId
        },"and",{
            type:"asc",
            field:"weight"
        }))
        return ret;
    }
    async shrink(boardId:string,weight:number) {
        if(!boardId) {
            throw Err.Project.Board.boardNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateUpdateSql(boardColumnModel,{
            weight:{
                exp:"-",
                value:1
            }
        },{
            board_id:boardId,
            weight:{
                exp:">",
                value:weight
            }
        }))
    }
    async move(boardColumnId:string,newWeight:number) {
        if(!boardColumnId) {
            throw Err.Project.Board.boardColumnNotFound
        }
        let mysql=getMysqlInstance()
        let objColumn=await mysql.executeOne(generateQuerySql(boardColumnModel,null,{
            id:boardColumnId
        }))
        if(!objColumn) {
            throw Err.Project.Board.boardColumnNotFound
        }
        if(objColumn.weight>newWeight) {
            await mysql.execute(generateUpdateSql(boardColumnModel,{
                weight:{
                    exp:"+",
                    value:1
                }
            },{
                board_id:objColumn.board_id,
                weight:{
                    exp:"between",
                    value:[newWeight,objColumn.weight-1]
                }
            }))
        } else if(objColumn.weight<newWeight) {
            await mysql.execute(generateUpdateSql(boardColumnModel,{
                weight:{
                    exp:"-",
                    value:1
                }
            },{
                board_id:objColumn.board_id,
                weight:{
                    exp:"between",
                    value:[objColumn.weight+1,newWeight]
                }
            }))
        }
        await mysql.execute(generateUpdateSql(boardColumnModel,{
            weight:newWeight
        },{
            id:boardColumnId
        }))
    }
}

export let boardColumnMapper=new BoardColumnMapper

class BoardColumnWorkflowNodeMapper extends Mapper<typeof boardColumnWorkflowNodeModel> {
    constructor() {
        super(boardColumnWorkflowNodeModel)
    }
    async list(boardColumnId:string) {
        if(!boardColumnId) {
            throw Err.Project.Board.boardColumnNotFound
        }
        let mysql=getMysqlInstance()
        let sql=generateLeftJoin3Sql({
            model:boardColumnWorkflowNodeModel
        },{
            model:workflowNodeModel,
            columns:keys<ICommon_Model_Workflow_Node>().map(item=>item.name),
            expression:{
                id:{
                    model:boardColumnWorkflowNodeModel,
                    field:"workflow_node_id"
                }
            },
            aggregation:"workflowNode"
        },{
            model:issueTypeModel,
            columns:keys<ICommon_Model_Issue_Type>().map(item=>item.name),
            expression:{
                id:{
                    model: boardColumnWorkflowNodeModel,
                    field: "issue_type_id"
                }
            },
            aggregation:"issueType"
        },{
            model:boardColumnModel,
            columns:keys<ICommon_Model_Board_Column>().map(item=>item.name),
            expression:{
                id:{
                    model:boardColumnWorkflowNodeModel,
                    field:"board_column_id"
                }
            },
            aggregation:"boardColumn"
        }, {
            board_column_id:{
                model:boardColumnWorkflowNodeModel,
                value:boardColumnId
            }
        })
        let arr=await mysql.execute(sql)
        return arr;
    }
    async clear(boardColumnId:string) {
        if(!boardColumnId) {
            throw Err.Project.Board.boardColumnNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(boardColumnWorkflowNodeModel,{
            board_column_id:boardColumnId
        }))
    }
    async clearByIssueTypeId(issueTypeId:string) {
        if(!issueTypeId) {
            throw Err.Project.Issue.issueTypeNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(boardColumnWorkflowNodeModel,{
            issue_type_id:issueTypeId
        }))
    }

    async listAllWorkflowNode(boardId:string,issuerTypeId:string) {
        if(!boardId) {
            throw Err.Project.Board.boardNotFound
        } else if(!issuerTypeId) {
            throw Err.Project.Issue.issueTypeNotFound
        }
        let mysql=getMysqlInstance()
        let sql=generateLeftJoinSql({
            model:boardColumnWorkflowNodeModel
        },{
            model:workflowNodeModel,
            columns:keys<ICommon_Model_Workflow_Node>().map(item=>item.name),
            expression:{
                id:{
                    model:boardColumnWorkflowNodeModel,
                    field:"workflow_node_id"
                }
            }
        },{
            board_id:{
                model:boardColumnWorkflowNodeModel,
                value:boardId
            },
            issue_type_id:{
                model:boardColumnWorkflowNodeModel,
                value:issuerTypeId
            }
        })
        let ret=await mysql.execute(sql)
        return ret;
    }
}

export let boardColumnWorkflowNodeMapper=new BoardColumnWorkflowNodeMapper

class BoardIssueTypeMapper extends Mapper<typeof boardIssueTypeModel> {
    constructor() {
        super(boardIssueTypeModel)
    }
    async list(boardId:string) {
        if(!boardId) {
            throw Err.Project.Board.boardNotFound
        }
        let mysql=getMysqlInstance()
        let sql=generateLeftJoinSql({
            model:boardIssueTypeModel
        },{
            model:issueTypeModel,
            columns:keys<ICommon_Model_Issue_Type>().map(item=>item.name),
            expression:{
                id:{
                    model:boardIssueTypeModel,
                    field:"issue_type_id"
                }
            }
        },{
            board_id:{
                model:boardIssueTypeModel,
                value:boardId
            }
        })
        let ret=await mysql.execute(sql)
        return ret;
    }
    async clear(boardId:string) {
        if(!boardId) {
            throw Err.Project.Board.boardNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(boardIssueTypeModel,{
            board_id:boardId
        }))
    }
}

export let boardIssueTypeMapper=new BoardIssueTypeMapper

class BoardSprintMapper extends Mapper<typeof boardSprintModel> {
    constructor() {
        super(boardSprintModel)
    }
    async list(boardId:string,page:number,size:number,keyword?:string,status?:ECommon_Model_Board_Sprint_Status) {
        if(!boardId) {
            throw Err.Project.Board.boardNotFound
        }
        let mysql=getMysqlInstance()
        let sql=generateQuerySql(boardSprintModel,null,{
            board_id:boardId,
            ...(keyword && {
                name:{
                    exp: "%like%",
                    value:keyword
                }
            }),
            ...(status!=null && {
                status
            })
        },"and",{
            type:"desc",
            field:"id"
        },page*size,size)
        let ret=await generateCommonListData(sql,page,size)
        return ret;
    }

    async filter(organizationId:string,projectId:string,page:number,size:number,keyword?:string,boardSprintIds?:string[]) {
        let sql=generateLeftJoin2Sql({
            model:boardSprintModel,
            columns:keys<ICommon_Model_Board_Sprint>().map(item=>item.name)
        },{
            model:boardModel,
            columns:keys<ICommon_Model_Board>().map(item=>item.name),
            expression:{
                id:{
                    model:boardSprintModel,
                    field:"board_id"
                }
            },
            aggregation:"board"
        },{
            model:projectModel,
            columns:keys<ICommon_Model_Project>().map(item=>item.name),
            expression:{
                id:{
                    model:boardModel,
                    field:"project_id"
                }
            },
            aggregation:"project"
        },{
            organization_id:{
                model:projectModel,
                value:organizationId
            },
            ...(projectId && {
                project_id:{
                    model:boardModel,
                    value:projectId
                }
            }),
            ...(boardSprintIds?.length>0 && {
                id:{
                    model:boardSprintModel,
                    value:{
                        exp:"in",
                        value:boardSprintIds
                    }
                }
            }),
            ...(keyword && {
                name:{
                    model:boardSprintModel,
                    value:{
                        exp:"%like%",
                        value:keyword
                    }
                }
            })
        },"and",{
            type:"desc",
            field:"name",
            model:boardSprintModel
        },page*size,size)
        let ret=await generateCommonListData(sql,page,size)
        return ret;
    }

    async globalSearch(keyword:string,size:number,organizationUserId:string):Promise<ICommon_Route_Res_Global_Search_Board_Sprint_Item[]> {
        let mysql=getMysqlInstance()
        let sql=generateGroupLeftJoin5Sql({
            model:boardSprintModel,
            columns:{
                columns:keys<ICommon_Model_Board_Sprint>().map(item=>item.name),
                calcColumns:[]
            },
        },{
            model:boardModel,
            columns:{
                columns:keys<ICommon_Model_Board>().map(item=>item.name),
                calcColumns:[]
            },
            expression:{
                id:{
                    model:boardSprintModel,
                    field:"board_id"
                }
            },
            aggregation:"board"
        },{
            model:projectModel,
            columns:{
                columns:keys<ICommon_Model_Project>().map(item=>item.name),
                calcColumns:[]
            },
            expression:{
                id:{
                    model:boardModel,
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
                    model:boardSprintModel,
                    value:{
                        exp:"%like%",
                        value:keyword
                    }
                }
            }),
        },"and",null,"and",{
            field:"name",
            model:boardSprintModel,
            type:"asc",
            isVirtualField:false
        },0,size)
        let ret=await mysql.execute(sql)
        return ret;
    }

    async boardAndProject(boardSprintId:string) {
        if(!boardSprintId) {
            throw Err.Project.Board.boardSprintNotFound
        }
        let mysql=getMysqlInstance()
        let sql=generateLeftJoin2Sql({
            model:boardSprintModel,
            columns:keys<ICommon_Model_Board_Sprint>().map(item=>item.name),
        },{
            model:boardModel,
            columns:keys<ICommon_Model_Board>().map(item=>item.name),
            expression:{
                id:{
                    model:boardSprintModel,
                    field:"board_id"
                }
            },
            aggregation:"board"
        },{
            model:projectModel,
            columns:keys<ICommon_Model_Project>().map(item=>item.name),
            expression:{
                id:{
                    model:boardModel,
                    field:"project_id"
                }
            },
            aggregation:"project"
        },{
            id:{
                model:boardSprintModel,
                value:boardSprintId
            }
        })
        let obj=await mysql.executeOne(sql)
        return obj
    }
}

export let boardSprintMapper=new BoardSprintMapper

class BoardSprintIssueMapper extends Mapper<typeof boardSprintIssueModel> {
    constructor() {
        super(boardSprintIssueModel)
    }
    async list(boardSprintId:string) {
        if(!boardSprintId) {
            throw Err.Project.Board.boardSprintNotFound
        }
        let mysql=getMysqlInstance()
        let sql=generateLeftJoin3Sql({
            model:boardSprintIssueModel,
            columns:["board_sprint_swimlane_id"],
            rename:{
                fields:["board_sprint_swimlane_id"],
                newFields:["swimLaneId"]
            }
        },{
            model:projectIssueModel,
            columns:keys<ICommon_Model_Project_Issue>().map(item=>item.name),
            expression:{
                id:{
                    model:boardSprintIssueModel,
                    field:"project_issue_id"
                }
            }
        },{
            model:issueTypeModel,
            columns:keys<ICommon_Model_Issue_Type>().map(item=>item.name),
            expression:{
                id: {
                    model:projectIssueModel,
                    field:"issue_type_id"
                }
            },
            aggregation:"issueType"
        },{
            model:workflowNodeModel,
            columns:keys<ICommon_Model_Workflow_Node>().map(item=>item.name),
            expression:{
                id: {
                    model:projectIssueModel,
                    field:"workflow_node_id"
                }
            },
            aggregation:"workflowNode"
        },{
            board_sprint_id:{
                model:boardSprintIssueModel,
                value:boardSprintId
            }
        })
        let ret=await mysql.execute(sql)
        return ret;
    }

    async listWithSwimLane(boardSprintId:string) {
        if(!boardSprintId) {
            throw Err.Project.Board.boardSprintNotFound
        }
        let mysql=getMysqlInstance()
        let sql=generateLeftJoin2Sql({
            model:boardSprintIssueModel
        },{
            model:projectIssueModel,
            columns:keys<ICommon_Model_Project_Issue>().map(item=>item.name),
            expression:{
                id:{
                    model:boardSprintIssueModel,
                    field:"project_issue_id"
                }
            }
        },{
            model:boardSprintSwimLaneModel,
            columns:keys<ICommon_Model_Board_Sprint_SwimLane>().map(item=>item.name),
            expression:{
                id: {
                    model:boardSprintIssueModel,
                    field:"board_sprint_swimlane_id"
                }
            },
            aggregation:"swimLane"
        },{
            board_sprint_id:{
                model:boardSprintIssueModel,
                value:boardSprintId
            }
        })
        let ret=await mysql.execute(sql)
        return ret;
    }
    async clear(boardSprintId:string) {
        if(!boardSprintId) {
            throw Err.Project.Board.boardSprintNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(boardSprintIssueModel,{
            board_sprint_id:boardSprintId
        }))
    }
    async clearByIssueTypeIds(issueTypeIds:string[]) {
        if(issueTypeIds.length==0) {
            return
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteLeftJoinSql(boardSprintIssueModel,{
            model:projectIssueModel,
            expression:{
                id:{
                    model:boardSprintIssueModel,
                    field:"project_issue_id"
                }
            },
            isDelete:false
        },{
            issue_type_id:{
                model:projectIssueModel,
                value:{
                    exp:"in",
                    value:issueTypeIds
                }
            }
        }))
    }
}

export let boardSprintIssueMapper=new BoardSprintIssueMapper

class BoardSprintSwimLaneMapper extends Mapper<typeof boardSprintSwimLaneModel> {
    constructor() {
        super(boardSprintSwimLaneModel)
    }
    async list(boardSprintId:string) {
        if(!boardSprintId) {
            throw Err.Project.Board.boardSprintNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(boardSprintSwimLaneModel,null,{
            board_sprint_id:boardSprintId
        },"and",{
            type:"desc",
            field:"priority"
        }))
        return ret;
    }

    async clear(boardSprintId:string) {
        if(!boardSprintId) {
            throw Err.Project.Board.boardSprintNotFound
        }
        let mysql=getMysqlInstance()
        let arr=await mysql.execute(generateQuerySql(boardSprintSwimLaneModel,["id"],{
            board_sprint_id:boardSprintId
        }))
        await mysql.execute(generateDeleteSql(boardSprintSwimLaneModel,{
            board_sprint_id:boardSprintId
        }))
        if(arr.length>0) {
            await mysql.execute(generateUpdateSql(boardSprintIssueModel,{
                board_sprint_swimlane_id:null,
            },{
                board_sprint_swimlane_id:{
                    exp:"in",
                    value:arr.map(item=>item.id)
                }
            }))
        }
    }

    async clearIssue(boardSprintSwimLaneId:string) {
        if(!boardSprintSwimLaneId) {
            throw Err.Project.Board.boardSprintSwimLaneNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateUpdateSql(boardSprintIssueModel,{
            board_sprint_swimlane_id:null,
        },{
            board_sprint_swimlane_id:boardSprintSwimLaneId
        }))
    }

}

export let boardSprintSwimLaneMapper=new BoardSprintSwimLaneMapper


