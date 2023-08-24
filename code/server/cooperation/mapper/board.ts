import {Mapper} from "../../common/entity/mapper";
import {boardModel} from "../../../common/model/board";
import {boardColumnModel, ICommon_Model_Board_Column} from "../../../common/model/board_column";
import {boardColumnWorkflowNodeModel} from "../../../common/model/board_column_workflow_node";
import {boardIssueTypeModel} from "../../../common/model/board_issue_type";
import {boardSprintModel} from "../../../common/model/board_sprint";
import {boardSprintSwimLaneModel} from "../../../common/model/board_sprint_swimlane";
import {boardSprintIssueModel} from "../../../common/model/board_sprint_issue";
import {Err} from "../../../common/status/error";
import {getMysqlInstance} from "../../common/db/mysql";
import {
    generateCommonListData,
    generateDeleteInnerJoinSql,
    generateDeleteSql,
    generateLeftJoin3Sql,
    generateLeftJoinSql,
    generateQuerySql,
    generateUpdateSql
} from "../../common/util/sql";
import {keys} from "../../../common/transform";
import {ICommon_Model_Workflow_Node, workflowNodeModel} from "../../../common/model/workflow_node";
import {ICommon_Model_Issue_Type, issueTypeModel} from "../../../common/model/issue_type";
import {ICommon_Model_Project_Issue, projectIssueModel} from "../../../common/model/project_issue";

class BoardMapper extends Mapper<typeof boardModel> {
    constructor() {
        super(boardModel)
    }
    async list(projectId:string,page:number,size:number,keyword?:string) {
        if(!projectId) {
            throw Err.Project.projectNotFound
        }
        let sql=generateQuerySql(boardModel,null,{
            id:projectId,
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
    async list(boardId:string,page:number,size:number,keyword?:string) {
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
            })
        },"and",{
            type:"desc",
            field:"id"
        },page*size,size)
        let ret=await generateCommonListData(sql,page,size)
        return ret;
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
        let sql=generateLeftJoinSql({
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
        await mysql.execute(generateDeleteInnerJoinSql(boardSprintIssueModel,{
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

    async clear(boardSprintId:string,boardSprintSwimLaneId?:string) {
        if(!boardSprintId) {
            throw Err.Project.Board.boardSprintNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(boardSprintSwimLaneModel,{
            board_sprint_id:boardSprintId
        }))
        if(boardSprintSwimLaneId) {
            await mysql.execute(generateUpdateSql(boardSprintIssueModel,{
                board_sprint_swimlane_id:null,
            },{
                board_sprint_swimlane_id:boardSprintSwimLaneId
            }))
        }
    }

}

export let boardSprintSwimLaneMapper=new BoardSprintSwimLaneMapper


