import {Err} from '../../../common/status/error';
import {keys} from '../../../common/transform';
import {getMysqlInstance} from '../../common/db/mysql';
import {Mapper} from '../../common/entity/mapper';
import {
    convertCountAndExecute,
    generateCommonListData,
    generateCreateSql,
    generateDeleteSql,
    generateGroupLeftJoin2Sql,
    generateGroupLeftJoinSql,
    generateLeftJoin3Sql,
    generateLeftJoinSql,
    generateQuerySql,
    generateSnowId
} from '../../common/util/sql';
import {ICommon_Model_Organization, organizationModel} from './../../../common/model/organization';
import {ICommon_Model_Organization_User, organizationUserModel} from './../../../common/model/organization_user';
import {ECommon_User_Type, ICommon_Model_User, userModel} from './../../../common/model/user';
import {ICommon_Model_Member_Tag, memberTagModel} from "../../../common/model/member_tag";
import {memberTagMemberModel} from "../../../common/model/member_tag_member";
import {ICommon_Model_Team, teamModel} from "../../../common/model/team";
import {ICommon_Model_Project, projectModel} from "../../../common/model/project";
import {projectIssueModel} from "../../../common/model/project_issue";
import {ICommon_Model_Wiki, wikiModel} from "../../../common/model/wiki";
import {wikiItemModel} from "../../../common/model/wiki_item";
import {ICommon_Route_Res_Organization_Statics} from "../../../common/routes/response";
import {ECommon_Model_Workflow_Node_Status, workflowNodeModel} from "../../../common/model/workflow_node";
import {teamUserModel} from "../../../common/model/team_user";

class OrganizationMapper extends Mapper<typeof organizationModel> {
    constructor(){
        super(organizationModel)
    }

    async statics(organizationId:string):Promise<ICommon_Route_Res_Organization_Statics> {
        if(!organizationId) {
            throw Err.Organization.organizationNotFound
        }
        let mysql=getMysqlInstance()
        let [projectCount,issueCount,wikiSpaceCount,wikiItemCount,userCount,teamCount,projectWithIssueList,projectWithUnDoneIssueList,wikiSpaceWithWikiItemList,teamWithUserList]=await Promise.all([
            convertCountAndExecute(generateQuerySql(projectModel,null,{
                organization_id:organizationId
            })),
            (async ()=>{
                let sql=generateLeftJoinSql({
                    model:projectIssueModel,
                },{
                    model:projectModel,
                    expression:{
                        id:{
                            model:projectIssueModel,
                            field:"project_id"
                        }
                    }
                },{
                    organization_id:{
                        model:projectModel,
                        value:organizationId
                    }
                })
                let count=await convertCountAndExecute(sql)
                return count
            })(),
            convertCountAndExecute(generateQuerySql(wikiModel,null,{
                organization_id:organizationId
            })),
            (async ()=>{
                let sql=generateLeftJoinSql({
                    model:wikiItemModel,
                },{
                    model:wikiModel,
                    expression:{
                        id:{
                            model:wikiItemModel,
                            field:"wiki_id"
                        }
                    }
                },{
                    organization_id:{
                        model:wikiModel,
                        value:organizationId
                    }
                })
                let count=await convertCountAndExecute(sql)
                return count
            })(),
            convertCountAndExecute(generateQuerySql(organizationUserModel,null,{
                organization_id:organizationId
            })),
            convertCountAndExecute(generateQuerySql(teamModel,null,{
                organization_id:organizationId
            })),
            (async ()=>{
                let sql=generateGroupLeftJoinSql({
                    model:projectIssueModel,
                    columns:{
                        columns:[],
                        calcColumns:[{
                            exp:"count",
                            value:"id",
                            rename:"issueCount"
                        }]
                    },
                },{
                    model:projectModel,
                    expression:{
                        id:{
                            model:projectIssueModel,
                            field:"project_id"
                        }
                    },
                    columns:{
                        columns:keys<ICommon_Model_Project>().map(item=>item.name),
                        calcColumns:[]
                    },
                    aggregation:"project"
                },["project_id"],{
                    organization_id:{
                        model:projectModel,
                        value:organizationId
                    }
                },"and",null,"and",{
                    isVirtualField:true,
                    field:"issueCount",
                    model:projectIssueModel,
                    type:"desc"
                },0,10)
                let arr=await mysql.execute(sql)
                return arr;
            })(),
            (async ()=>{
                let sql=generateGroupLeftJoin2Sql({
                    model:projectIssueModel,
                    columns:{
                        columns:[],
                        calcColumns:[{
                            exp:"count",
                            value:"id",
                            rename:"issueCount"
                        }]
                    },
                },{
                    model:projectModel,
                    expression:{
                        id:{
                            model:projectIssueModel,
                            field:"project_id"
                        }
                    },
                    columns:{
                        columns:keys<ICommon_Model_Project>().map(item=>item.name),
                        calcColumns:[]
                    },
                    aggregation:"project"
                },{
                    model:workflowNodeModel,
                    expression:{
                        id:{
                            model:projectIssueModel,
                            field:"workflow_node_id"
                        }
                    }
                },["project_id"],{
                    organization_id:{
                        model:projectModel,
                        value:organizationId
                    },
                    status:{
                        model:workflowNodeModel,
                        value:{
                            exp:"<>",
                            value:ECommon_Model_Workflow_Node_Status.DONE
                        }
                    }
                },"and",null,"and",{
                    isVirtualField:true,
                    field:"issueCount",
                    model:projectIssueModel,
                    type:"desc"
                },0,10)
                let arr=await mysql.execute(sql)
                return arr;
            })(),
            (async ()=>{
                let sql=generateGroupLeftJoinSql({
                    model:wikiItemModel,
                    columns:{
                        columns:[],
                        calcColumns:[{
                            exp:"count",
                            value:"id",
                            rename:"wikiItemCount"
                        }]
                    },
                },{
                    model:wikiModel,
                    expression:{
                        id:{
                            model:wikiItemModel,
                            field:"wiki_id"
                        }
                    },
                    columns:{
                        columns:keys<ICommon_Model_Wiki>().map(item=>item.name),
                        calcColumns:[]
                    },
                    aggregation:"wikiSpace"
                },["wiki_id"],{
                    organization_id:{
                        model:wikiModel,
                        value:organizationId
                    }
                },"and",null,"and",{
                    isVirtualField:true,
                    field:"wikiItemCount",
                    model:wikiItemModel,
                    type:"desc"
                },0,10)
                let arr=await mysql.execute(sql)
                return arr;
            })(),
            (async ()=>{
                let sql=generateGroupLeftJoinSql({
                    model:teamUserModel,
                    columns:{
                        columns:[],
                        calcColumns:[{
                            exp:"count",
                            value:"id",
                            rename:"userCount"
                        }]
                    },
                },{
                    model:teamModel,
                    expression:{
                        id:{
                            model:teamUserModel,
                            field:"team_id"
                        }
                    },
                    columns:{
                        columns:keys<ICommon_Model_Team>().map(item=>item.name),
                        calcColumns:[]
                    },
                    aggregation:"team"
                },["team_id"],{
                    organization_id:{
                        model:teamModel,
                        value:organizationId
                    }
                },"and",null,"and",{
                    isVirtualField:true,
                    field:"userCount",
                    model:teamUserModel,
                    type:"desc"
                },0,10)
                let arr=await mysql.execute(sql)
                return arr;
            })()
        ])
        return {
            projectCount,issueCount,wikiSpaceCount,wikiItemCount,userCount:userCount-1,teamCount,projectWithIssueList,projectWithUnDoneIssueList,wikiSpaceWithWikiItemList,teamWithUserList
        }
    }

    async list(userId:string) {
        if(!userId) {
            throw Err.Organization.ownerNotFound
        }
        let mysql=getMysqlInstance()
        let arrOrganizationOwner=await mysql.execute(generateQuerySql(organizationModel,[],{
            created_by_pure:userId
        },"and",{
            field:"name",
            type:"asc"
        }))
        let sql=generateLeftJoinSql({
            model:organizationUserModel
        },{
            model:organizationModel,
            columns:keys<ICommon_Model_Organization>().map(item=>item.name),
            expression:{
                id:{
                    model:organizationUserModel,
                    field:"organization_id"
                }
            }
        },{
            user_id:{
                model:organizationUserModel,
                value:userId
            }
        })
        let arrOrganizationOwnerId=arrOrganizationOwner.map(item=>item.id);
        let arrOrganization=await mysql.execute(sql);
        return {
            create:arrOrganizationOwner,
            join:arrOrganization.filter(item=>{
                return !arrOrganizationOwnerId.includes(item.id)
            })
        };
    }


    async clearUser(organizationId:string){
        if(!organizationId) {
            throw Err.Organization.organizationNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(organizationUserModel,{
            organization_id:organizationId
        }))
    }

    async clearTeam(organizationId:string){
        if(!organizationId) {
            throw Err.Organization.organizationNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(teamModel,["id"],{
            organization_id:organizationId
        }))
        await mysql.execute(generateDeleteSql(teamModel,{
            organization_id:organizationId
        }))
        return ret.map(item=>item.id)
    }

    async init(adminIds: string[], userIds: string[]) {
        let mysql=getMysqlInstance()
        let id=await generateSnowId()
        await mysql.executeOne(generateCreateSql(organizationModel,{
            id,
            name:"default",
            created_by_pure:adminIds[0]
        }))
        let i=0;
        for(let adminId of adminIds) {
            await mysql.execute(generateCreateSql(organizationUserModel,{
                id:await generateSnowId(),
                nickname:"test"+(i++),
                organization_id:id,
                user_id:adminId
            }))
        }
        for(let userId of userIds) {
            await mysql.execute(generateCreateSql(organizationUserModel,{
                id:await generateSnowId(),
                nickname:"test"+(i++),
                organization_id:id,
                user_id:userId
            }))
        }
        return id;
    }

    async memberInfo(organizationUserId:string) {
        if(!organizationUserId) {
            throw Err.Organization.userNotFound
        }
        let mysql=getMysqlInstance()
        let sql=generateLeftJoinSql({
            model:organizationUserModel,
            columns:keys<ICommon_Model_Organization_User>().map(item=>item.name),
            aggregation:"organizationUser"
        },{
            model:userModel,
            columns:keys<ICommon_Model_User>().map(item=>item.name),
            expression:{
                id:{
                    model:organizationUserModel,
                    field:"user_id"
                }
            },
            aggregation:"user"
        },{
            id:{
                model:organizationUserModel,
                value:organizationUserId
            },
        })
        let ret=await mysql.executeOne(sql);
        return ret;
    }

    async listUser(organizationId:string,page:number,size:number,keyword?:string,organizationUserIds?:string[]) {
        if(page===undefined || page<0 || size===undefined || size<=0 || !organizationId) {
            throw Err.Common.paramError
        }
        var mysql=getMysqlInstance();
        let sql=generateLeftJoinSql({
            model:organizationUserModel,
            columns:keys<ICommon_Model_Organization_User>().map(item=>item.name),
            aggregation:"organizationUser"
        },{
            model:userModel,
            columns:keys<ICommon_Model_User>().map(item=>item.name),
            expression:{
                id:{
                    model:organizationUserModel,
                    field:"user_id"
                }
            },
            aggregation:"user"
        },{
            role:{
                model:userModel,
                value:{
                    exp:"<>",
                    value:ECommon_User_Type.DELETED
                }
            },
            organization_id:{
                model:organizationUserModel,
                value:organizationId
            },
            ...(keyword && {
                "$or0":{
                    "username":{
                        model:userModel,
                        value:{
                            exp:"%like%",
                            value:keyword
                        }
                    },
                    "nickname":{
                        model:organizationUserModel,
                        value:{
                            exp:"%like%",
                            value:keyword
                        }
                    }
                }
            }),
            ...(organizationUserIds?.length>0 && {
                id:{
                    model:organizationUserModel,
                    value:{
                        exp:"in",
                        value:organizationUserIds
                    }
                }
            })
        },"and",organizationUserIds?.length>0?{
            field:"id",
            model:organizationUserModel,
            type:"field",
            value:organizationUserIds
        }:{
            field:"nickname",
            model:organizationUserModel,
            type:"asc"
        },size*page,size)
        let ret=await generateCommonListData(sql,page,size)
        return ret
    }

    async filterUser(organizationId:string,size:number,keyword:string) {
        if(size===undefined || size<=0 || !organizationId) {
            throw Err.Common.paramError
        }
        let mysql=getMysqlInstance();
        let sql=generateLeftJoinSql({
            model:organizationUserModel,
            columns:keys<ICommon_Model_Organization_User>().map(item=>item.name),
            aggregation:"organizationUser"
        },{
            model:userModel,
            columns:keys<ICommon_Model_User>().map(item=>item.name),
            expression:{
                id:{
                    model:organizationUserModel,
                    field:"user_id"
                }
            },
            aggregation:"user"
        },{
            organization_id:{
                model:organizationUserModel,
                value:organizationId
            },
            ...(keyword && {
                nickname:{
                    model:organizationUserModel,
                    value:{
                        exp:"%like%",
                        value:keyword
                    }
                }
            }),
            role:{
                model:userModel,
                value:{
                    exp:"<>",
                    value:ECommon_User_Type.DELETED
                }
            }
        },"and",{
            field:"nickname",
            model:organizationUserModel,
            type:"asc"
        },0,size)
        let ret=await mysql.execute(sql)
        return ret;
    }
}

export let organizationMapper=new OrganizationMapper()

class OrganizationUserMapper extends Mapper<typeof organizationUserModel> {
    constructor(){
        super(organizationUserModel)
    }

    async users(organizationUserIds:string[]){
        if(organizationUserIds.length==0) {
            return []
        }
        let mysql=getMysqlInstance()
        let ret:(ICommon_Model_User & {
            nickname:string
            organizationUserId:string
        })[]
        let sql=generateLeftJoinSql({
            model:organizationUserModel,
            columns:["nickname","id"],
            rename:{
                fields:["id"],
                newFields:["organizationUserId"]
            }
        },{
            model:userModel,
            columns:keys<ICommon_Model_User>().map(item=>item.name),
            expression:{
                id:{
                    model:organizationUserModel,
                    field:"user_id"
                },

            }
        },{
            id:{
                model:organizationUserModel,
                value:{
                    exp:"in",
                    value:organizationUserIds
                }
            }
        },"and",{
            field:"id",
            model:organizationUserModel,
            type:"field",
            value:organizationUserIds
        })
        ret=await mysql.execute(sql)
        return ret
    }
}

export let organizationUserMapper=new OrganizationUserMapper()

class MemberTagMapper extends Mapper<typeof memberTagModel> {
    constructor(){
        super(memberTagModel)
    }

    async listTag(organizationId:string,keyword?:string):Promise<ICommon_Model_Member_Tag[]> {
        if(!organizationId) {
            throw Err.Organization.organizationNotFound
        }
        let mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(memberTagModel,null,{
            organization_id:organizationId,
            ...(keyword && {
                name:{
                    exp:"%like%",
                    value:keyword
                }
            })
        },"and",{
            type:"asc",
            field:"name"
        }))
        return ret;
    }

    async clearMemberByTagId(memberTagId:string) {
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(memberTagMemberModel,{
            member_tag_id:memberTagId
        }))
    }

    async listMemberTag(memberId:string) {
        let mysql=getMysqlInstance()
        let sql=generateLeftJoinSql({
            model:memberTagMemberModel
        },{
            model:memberTagModel,
            columns:keys<ICommon_Model_Member_Tag>().map(item=>item.name),
            expression:{
                id:{
                    model:memberTagMemberModel,
                    field:"member_tag_id"
                }
            }
        },{
            organization_user_id:{
                model:memberTagMemberModel,
                value:memberId
            }
        })
        let ret=await mysql.execute(sql)
        return ret;
    }

    async listTagMember(memberTagId:string) {
        let mysql=getMysqlInstance()
        let sql=generateLeftJoin3Sql({
            model:memberTagMemberModel
        },{
            model:organizationUserModel,
            columns:keys<ICommon_Model_Organization_User>().map(item=>item.name),
            expression:{
                id:{
                    model:memberTagMemberModel,
                    field:"organization_user_id"
                }
            },
            aggregation:"organizationUser"
        },{
            model:userModel,
            columns:keys<ICommon_Model_User>().map(item=>item.name),
            expression:{
                id:{
                    model:organizationUserModel,
                    field:"user_id"
                }
            },
            aggregation:"user"
        },{
            model:memberTagModel,
            columns:keys<ICommon_Model_Member_Tag>().map(item=>item.name),
            expression:{
                id:{
                    model:memberTagMemberModel,
                    field:"member_tag_id"
                }
            },
            aggregation:"tag"
        },{
            member_tag_id:{
                model:memberTagMemberModel,
                value:memberTagId
            }
        },"and",{
            model:memberTagModel,
            field:"name",
            type:"asc"
        })
        let ret=await mysql.execute(sql);
        return ret;
    }

    async addTagMember(memberTagId:string,organizationUserId:string) {
        let mysql=getMysqlInstance()
        let obj=await mysql.executeOne(generateQuerySql(memberTagMemberModel,["id"],{
            member_tag_id:memberTagId,
            organization_user_id:organizationUserId
        }))
        if(obj) {
            throw Err.Organization.memberTagAlreadyExists
        }
        await mysql.executeOne(generateCreateSql(memberTagMemberModel,{
            id:await generateSnowId(),
            organization_user_id:organizationUserId,
            member_tag_id:memberTagId
        }))
        let sql=generateLeftJoin3Sql({
            model:memberTagMemberModel
        },{
            model:organizationUserModel,
            columns:keys<ICommon_Model_Organization_User>().map(item=>item.name),
            expression:{
                id:{
                    model:memberTagMemberModel,
                    field:"organization_user_id"
                }
            },
            aggregation:"organizationUser"
        },{
            model:userModel,
            columns:keys<ICommon_Model_User>().map(item=>item.name),
            expression:{
                id:{
                    model:organizationUserModel,
                    field:"user_id"
                }
            },
            aggregation:"user"
        },{
            model:memberTagModel,
            columns:keys<ICommon_Model_Member_Tag>().map(item=>item.name),
            expression:{
                id:{
                    model:memberTagMemberModel,
                    field:"member_tag_id"
                }
            },
            aggregation:"tag"
        },{
            member_tag_id:{
                model:memberTagMemberModel,
                value:memberTagId
            },
            organization_user_id:{
                model:memberTagMemberModel,
                value:organizationUserId
            }
        },"and",{
            model:memberTagModel,
            field:"name",
            type:"asc"
        })
        let ret=await mysql.executeOne(sql);
        return ret;
    }

    async removeTagMember(memberTagId:string,organizationUserId:string) {
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(memberTagMemberModel,{
            member_tag_id:memberTagId,
            organization_user_id:organizationUserId
        }))
    }

    async getTagsByOrganizationUserId(organizationUserId:string) {
        let mysql=getMysqlInstance()
        let sql=generateLeftJoinSql({
            model:memberTagMemberModel
        },{
            model:memberTagModel,
            columns:keys<ICommon_Model_Member_Tag>().map(item=>item.name),
            expression:{
                id:{
                    model:memberTagMemberModel,
                    field:"member_tag_id"
                }
            }
        },{
            organization_user_id:{
                model:memberTagMemberModel,
                value:organizationUserId
            }
        })
        let ret=await mysql.execute(sql)
        return ret;
    }

    async getTagsByOrganizationUserIds(organizationUserIds:string[]) {
        if(organizationUserIds.length==0) {
            return []
        }
        let mysql=getMysqlInstance()
        let sql=generateLeftJoinSql({
            model:memberTagMemberModel,
            columns:["organization_user_id"],
            aggregation:"organizationUser"
        },{
            model:memberTagModel,
            columns:keys<ICommon_Model_Member_Tag>().map(item=>item.name),
            expression:{
                id:{
                    model:memberTagMemberModel,
                    field:"member_tag_id"
                }
            },
            aggregation:"tag"
        },{
            organization_user_id:{
                model:memberTagMemberModel,
                value:{
                    exp:"in",
                    value:organizationUserIds
                }
            }
        })
        let arr=await mysql.execute(sql)
        let ret:ICommon_Model_Member_Tag[][]=[]
        for(let organizationUserId of organizationUserIds) {
            let arrTemp:ICommon_Model_Member_Tag[]=[]
            for(let obj of arr) {
                if(obj.organizationUser.organization_user_id==organizationUserId) {
                    arrTemp.push(obj.tag)
                }
            }
            ret.push(arrTemp)
        }
        return ret;
    }

    async clearMemberByMemberId(memberId:string) {
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(memberTagMemberModel,{
            organization_user_id:memberId
        }))
    }

}

export let memberTagMapper=new MemberTagMapper()