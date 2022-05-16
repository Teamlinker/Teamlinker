import { Err } from "../../../common/status/error";
import { getMysqlInstance } from "../../common/db/mysql";
import { Mapper } from "../../common/entity/mapper";
import { generateDeleteSql, generateQuerySql } from "../../common/util/sql";
import { commentModel } from './../../../common/model/comment';

class CommentMapper extends Mapper<typeof commentModel> {
    constructor() {
        super(commentModel)
    }

    async list(typeId:string) {
        if(!typeId) {
            throw Err.Comment.commentTypeNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(commentModel,[],{
            type_id:typeId
        },"and",{
            field:"created_time",
            type:"desc"
        }))
        return ret;
    }

    async clear(projectIssueId:string) {
        if(!projectIssueId) {
            throw Err.Project.Issue.issueTypeNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(commentModel,{
            type_id:projectIssueId
        }))
    }

    async clearByProjectIssueIds(projectIssueIds:string[]) {
        if(!projectIssueIds || projectIssueIds.length==0) {
            return;
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(commentModel,{
            type_id:{
                exp:"in",
                value:projectIssueIds
            }
        }))
    }

}

export let commentMapper=new CommentMapper