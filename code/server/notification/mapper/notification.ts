import {Mapper} from "../../common/entity/mapper";
import {ECommon_Model_Notification_Type, notificationModel} from "../../../common/model/notification";
import {Err} from "../../../common/status/error";
import {getMysqlInstance} from "../../common/db/mysql";
import {
    generateCommonListData,
    generateDeleteSql,
    generateLeftJoin3Sql,
    generateQuerySql,
    generateUpdateSql
} from "../../common/util/sql";
import {keys} from "../../../common/transform";
import {organizationUserModel} from "../../../common/model/organization_user";
import {userModel} from "../../../common/model/user";
import {organizationModel} from "../../../common/model/organization";

class NotificationMapper extends Mapper<typeof notificationModel> {
    constructor() {
        super(notificationModel)
    }
    async list(userId:string,types:ECommon_Model_Notification_Type[],page:number,size:number) {
        if(page===undefined || page<0 || size===undefined || size<=0) {
            throw Err.Common.paramError
        } else if(!userId) {
            throw Err.User.userNotFound
        }
        let sql=generateLeftJoin3Sql({
            model:notificationModel,
            columns:keys<typeof notificationModel["model"]>().map(item=>item.name)
        },{
            model:organizationUserModel,
            columns:["id","nickname"],
            rename:{
                fields:["nickname"],
                newFields:["name"]
            },
            aggregation:"operationOrganizationUser",
            expression:{
                id:{
                    model:notificationModel,
                    field:"operation_organization_user_id"
                }
            }
        },{
            model:userModel,
            columns:["photo"],
            aggregation:"operationOrganizationUser",
            expression:{
                id:{
                    model: organizationUserModel,
                    field: "user_id"
                }
            }
        },{
            model:organizationModel,
            columns:keys<typeof organizationModel["model"]>().map(item=>item.name),
            aggregation:"organization",
            expression:{
                id:{
                    model:notificationModel,
                    field:"organization_id"
                }
            }
        },{
            user_id:{
                model:notificationModel,
                value:userId
            },
            ...((types && types.length>0) && {
                type:{
                    model:notificationModel,
                    value: {
                        exp:"in",
                        value:types
                    }
                }
            })
        },"and",{
            type:"desc",
            model:notificationModel,
            field:"id"
        },size*page,size)
        let ret=await generateCommonListData(sql,page,size)
        return ret;
    }

    async unReadCount(userId:string) {
        if(!userId) {
            throw Err.Organization.userNotFound
        }
        let mysql=getMysqlInstance()
        let arr=await mysql.execute(generateQuerySql(notificationModel,["id"],{
            user_id:userId,
            is_read:0
        }))
        return arr.length
    }

    async info(notificationId:string) {
        let mysql=getMysqlInstance()
        let sql=generateLeftJoin3Sql({
            model:notificationModel,
            columns:keys<typeof notificationModel["model"]>().map(item=>item.name)
        },{
            model:organizationUserModel,
            columns:["id","nickname"],
            rename:{
                fields:["nickname"],
                newFields:["name"]
            },
            aggregation:"operationOrganizationUser",
            expression:{
                id:{
                    model:notificationModel,
                    field:"operation_organization_user_id"
                }
            }
        },{
            model:userModel,
            columns:["photo"],
            aggregation:"operationOrganizationUser",
            expression:{
                id:{
                    model: organizationUserModel,
                    field: "user_id"
                }
            }
        },{
            model:organizationModel,
            columns:keys<typeof organizationModel["model"]>().map(item=>item.name),
            expression:{
                id:{
                    model:notificationModel,
                    field:"organization_id"
                }
            }
        },{
            id:{
                model:notificationModel,
                value:notificationId
            }
        })
        let obj=await mysql.executeOne(sql)
        return obj
    }

    async clearByOrganizationId(organizationId:string) {
        if(!organizationId) {
            return
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(notificationModel,{
            organization_id:organizationId
        }))
    }

    async clearByUserId(userId:string) {
        if(!userId) {
            return
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(notificationModel,{
            user_id:userId
        }))
    }

    async updateMember(organizationUserId:string,updateOrganizationUserId:string) {
        if(!organizationUserId || !updateOrganizationUserId) {
            return
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateUpdateSql(notificationModel,{
            operation_organization_user_id:updateOrganizationUserId
        },{
            operation_organization_user_id:organizationUserId
        }))
    }
}

export const notificationMapper=new NotificationMapper()










