import {Err} from "../../../common/status/error";
import {getMysqlInstance} from "../../common/db/mysql";
import {Mapper} from "../../common/entity/mapper";
import {generateDeleteSql, generateQuerySql} from "../../common/util/sql";
import {contentModel, ECommon_Model_Content_Type} from '../../../common/model/content';

class ContentMapper extends Mapper<typeof contentModel> {
    constructor() {
        super(contentModel)
    }

    async list(refId:string,type:ECommon_Model_Content_Type) {
        if(!refId) {
            throw Err.Content.contentTypeNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(contentModel,[],{
            ref_id:refId,
            type
        },"and",{
            field:"created_time",
            type:"desc"
        }))
        return ret;
    }

    async clearByRefId(refId:string) {
        if(!refId) {
            throw Err.Content.contentRefNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(contentModel,{
            ref_id:refId
        }))
    }

    async clearByRefIds(refIds:string[]) {
        if(!refIds || refIds.length==0) {
            return;
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(contentModel,{
            ref_id:{
                exp:"in",
                value:refIds
            }
        }))
    }

    async clearByOrganizationId(organizationId:string) {
        if(!organizationId) {
            throw Err.Organization.organizationNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(contentModel,{
            organization_id:organizationId
        }))
    }

}

export let contentMapper=new ContentMapper