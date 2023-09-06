import {Mapper} from "../../common/entity/mapper";
import {stickyNoteModel} from "../../../common/model/sticky_note";
import {Err} from "../../../common/status/error";
import {getMysqlInstance} from "../../common/db/mysql";
import {generateQuerySql} from "../../common/util/sql";
import {photoModel} from "../../../common/model/photo";

class StickyNoteMapper extends Mapper<typeof stickyNoteModel> {
    constructor() {
        super(stickyNoteModel)
    }

    async list(userId:string) {
        if(!userId) {
            throw Err.User.userNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(stickyNoteModel,null,{
            user_id:userId
        }))
        return ret;
    }
}

export let stickyNoteMapper=new StickyNoteMapper()

class PhotoMapper extends Mapper<typeof photoModel> {
    constructor() {
        super(photoModel)
    }

    async list(userId:string) {
        if(!userId) {
            throw Err.User.userNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(photoModel,null,{
            user_id:userId
        }))
        return ret;
    }
}

export let photoMapper=new PhotoMapper()