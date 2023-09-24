import {Err} from "../../../common/status/error";
import {getMysqlInstance} from "../../common/db/mysql";
import {Mapper} from "../../common/entity/mapper";
import {generateQuerySql, generateUpdateSql} from "../../common/util/sql";
import {contentModel, ECommon_Model_Content_Type} from '../../../common/model/content';
import {ICommon_Model_Organization_User} from "../../../common/model/organization_user";
import Application from "../../common/app/app";
import {ECommon_Application_Mode} from "../../../common/types";

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

    async updateUserInfo(organizationId:string,organizationUserId:string,userId:string,organizationUser:ICommon_Model_Organization_User) {
        if(!organizationId || !organizationUserId || !userId || !organizationUser) {
            return
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateUpdateSql(contentModel,{
            created_by:organizationUser.id
        },{
            created_by:organizationUserId
        }))
        await mysql.execute(generateUpdateSql(contentModel,{
            modified_by:organizationUser.id
        },{
            modified_by:organizationUserId
        }))
        if(Application.mode===ECommon_Application_Mode.OFFLINE) {
            await mysql.execute(generateUpdateSql(contentModel,{
                created_by_pure:organizationUser.user_id
            },{
                created_by_pure:userId
            }))
        }
    }

}

export let contentMapper=new ContentMapper