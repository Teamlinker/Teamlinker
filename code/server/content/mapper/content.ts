import {Err} from "../../../common/status/error";
import {getMysqlInstance} from "../../common/db/mysql";
import {Mapper} from "../../common/entity/mapper";
import {generateQuerySql} from "../../common/util/sql";
import {contentModel, ECommon_Model_Content_Type} from '../../../common/model/content';

class ContentMapper extends Mapper<typeof contentModel> {
    constructor() {
        super(contentModel)
    }

    async list(refId:string,type:ECommon_Model_Content_Type,isAsc:boolean,lastMessageId?:string) {
        if(!refId) {
            throw Err.Content.contentTypeNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(contentModel,[],{
            ref_id:refId,
            type,
            ...(lastMessageId && {
                id:{
                    exp: ">",
                    value: lastMessageId
                }
            })
        },"and",{
            field:"created_time",
            type:isAsc?"asc":"desc"
        }))
        return ret;
    }

}

export let contentMapper=new ContentMapper