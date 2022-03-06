import { Err } from "../../../common/status/error";
import { getMysqlInstance } from "../../common/db/mysql";
import { Mapper } from "../../common/entity/mapper";
import { generateQuerySql } from "../../common/util/sql";
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

}

export let commentMapper=new CommentMapper