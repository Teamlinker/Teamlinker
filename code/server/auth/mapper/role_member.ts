import {ECommon_Model_Role_Type, ICommon_Model_Role, roleModel} from "../../../common/model/role";
import {getMysqlInstance} from "../../common/db/mysql";
import {Mapper} from "../../common/entity/mapper";
import {
    generateDeleteSql,
    generateLeftJoin2Sql,
    generateLeftJoin3Sql,
    generateLeftJoinSql,
    generateQuerySql
} from "../../common/util/sql";
import {roleMemberModel, Table_Role_Member} from './../../../common/model/role_member';
import {ECommon_Model_Organization_Member_Type} from "../../../common/model/organization";
import {
    ICommon_Model_Organization_User,
    organizationUserModel,
    Table_Organization_User
} from "../../../common/model/organization_user";
import {keys} from "../../../common/transform";
import {projectModel} from "../../../common/model/project";
import {ICommon_Model_Team, Table_Team, teamModel} from "../../../common/model/team";
import {Err} from "../../../common/status/error";
import {ICommon_Model_User, userModel} from "../../../common/model/user";
import CommonUtil from "../../common/util/common";
import {ICommon_Model_Member_Tag, memberTagModel, Table_Member_Tag} from "../../../common/model/member_tag";
import {wikiModel} from "../../../common/model/wiki";

class RoleMemberMapper extends Mapper<typeof roleMemberModel> {
    constructor(){
        super(roleMemberModel)
    }

    async getRolesByMemberIds(items: { itemId: string; memberId: string; }[]){
        let mysql=getMysqlInstance()
        let query:any={}
        for(let i=0;i<items.length;i++) {
            query["$and"+i]={
                item_id:{
                    model:roleMemberModel,
                    value:items[i].itemId
                },
                member_id:{
                    model:roleMemberModel,
                    value:items[i].memberId
                }
            }
        }
        let sql=generateLeftJoinSql({
            model:roleMemberModel,
            columns:["item_id","member_id","member_type"]
        },{
            model:roleModel,
            columns:keys<ICommon_Model_Role>().map(item=>item.name),
            expression:{
                id:{
                    model:roleMemberModel,
                    field:"role_id"
                }
            },
            aggregation:"role"
        },query,"or")
        let arr=await mysql.execute(sql);
        let ret:typeof arr=[]
        for(let item of items) {
            for(let obj of arr) {
                if(item.memberId==obj.member_id && item.itemId==obj.item_id) {
                    ret.push(obj)
                }
            }
        }
        return ret;
    }

    async listRoleMember(itemId:string,roleType:ECommon_Model_Role_Type,memberType:ECommon_Model_Organization_Member_Type,page?:number,size?:number,key?:string,roleId?:string):Promise<{
        data:{
            member?:ICommon_Model_Organization_User,
            memberType:ECommon_Model_Organization_Member_Type
            role:ICommon_Model_Role,
            user?:ICommon_Model_User,
            team?:ICommon_Model_Team,
            tag?:ICommon_Model_Member_Tag
        }[],
        page:number,
        totalPage:number,
        count:number
    }>{
        let mysql=getMysqlInstance()
        let ret = <Awaited<ReturnType<typeof this.listRoleMember>>> {};
        let organizationId:string;
        if(roleType===ECommon_Model_Role_Type.PROJECT) {
            let obj=await mysql.executeOne(generateQuerySql(projectModel,["organization_id"],{
                id:itemId
            }))
            if(obj) {
                organizationId=obj.organization_id
            }
        } else if (roleType === ECommon_Model_Role_Type.TEAM) {
            let obj=await mysql.executeOne(generateQuerySql(teamModel,["organization_id"],{
                id:itemId
            }))
            if(obj) {
                organizationId=obj.organization_id
            }
        } else if(roleType===ECommon_Model_Role_Type.ORGANIZATION) {
            organizationId=itemId
        } else if (roleType === ECommon_Model_Role_Type.WIKI) {
            let obj=await mysql.executeOne(generateQuerySql(wikiModel,["organization_id"],{
                id:itemId
            }))
            if(obj) {
                organizationId=obj.organization_id
            }
        }
        if(!organizationId) {
            throw Err.Organization.organizationNotFound
        }
        if(memberType===ECommon_Model_Organization_Member_Type.DEFAULT) {
            ret.count=0;
            ret.page=0;
            ret.totalPage=0;
            ret.data=[]
            let sql=generateLeftJoinSql({
                model:roleMemberModel,
                columns:["member_type"],
                rename:{
                    fields:["member_type"],
                    newFields:["memberType"]
                }
            },{
                model:roleModel,
                columns:keys<ICommon_Model_Role>().map(item=>item.name),
                expression:{
                    id:{
                        model:roleMemberModel,
                        field: "role_id"
                    }
                },
                aggregation:"role"
            },{
                member_type:{
                    model:roleMemberModel,
                    value:ECommon_Model_Organization_Member_Type.DEFAULT
                },
                item_id:{
                    model:roleMemberModel,
                    value:itemId
                }
            })
            let obj=await mysql.executeOne(sql);
            if(obj) {
                ret.count=1;
                ret.page=0;
                ret.totalPage=1;
                ret.data.push({
                    member:null,
                    ...obj
                })
            }
        } else if(memberType===ECommon_Model_Organization_Member_Type.USER){
            let count:number;
            count=Number(Object.values(await mysql.executeOne<number>(`select count(1) from ${Table_Role_Member} rm left join ${Table_Organization_User} ou on ou.id=rm.member_id where rm.item_id=${itemId} and rm.member_type=${ECommon_Model_Organization_Member_Type.USER}${key?` and ou.nickname like '%${key}%'`:""}${roleId?` and rm.role_id=${roleId}`:""}`))[0])
            let totalPage=CommonUtil.pageTotal(count,size)
            let sql=generateLeftJoin3Sql({
                model:roleMemberModel,
                columns:["member_type"],
                rename:{
                    fields:["member_type"],
                    newFields:["memberType"]
                }
            },{
                model:roleModel,
                columns:keys<ICommon_Model_Role>().map(item=>item.name),
                expression:{
                    id:{
                        model:roleMemberModel,
                        field: "role_id"
                    }
                },
                aggregation:"role"
            },{
                model:organizationUserModel,
                columns:keys<ICommon_Model_Organization_User>().map(item=>item.name),
                expression:{
                    id:{
                        model:roleMemberModel,
                        field:"member_id"
                    }
                },
                aggregation:"member"
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
                item_id:{
                    model:roleMemberModel,
                    value:itemId
                },
                member_type:{
                    model:roleMemberModel,
                    value:ECommon_Model_Organization_Member_Type.USER
                },
                ...(key && {
                    nickname:{
                        model:organizationUserModel,
                        value:{
                            exp:"%like%",
                            value:key
                        }
                    }
                }),
                ...(roleId && {
                    role_id:{
                        model:roleMemberModel,
                        value:roleId
                    }
                })
            },"and",{
                model:organizationUserModel,
                field:"nickname",
                type:"asc"
            },page*size,size)
            let arr=await mysql.execute(sql);
            ret.page=page;
            ret.totalPage=totalPage;
            ret.count=count;
            ret.data=arr;
        } else if(memberType===ECommon_Model_Organization_Member_Type.TEAM){
            let count:number
            count=Number(Object.values(await mysql.executeOne<number>(`select count(1) from ${Table_Role_Member} rm left join ${Table_Team} t on t.id=rm.member_id where rm.item_id=${itemId} and rm.member_type=${ECommon_Model_Organization_Member_Type.TEAM}${key?` and t.name like '%${key}%'`:""}${roleId?` and rm.role_id=${roleId}`:""}`))[0])
            let totalPage=CommonUtil.pageTotal(count,size)
            let sql=generateLeftJoin2Sql({
                model:roleMemberModel,
                columns:["member_type"],
                rename:{
                    fields:["member_type"],
                    newFields:["memberType"]
                }
            },{
                model:roleModel,
                columns:keys<ICommon_Model_Role>().map(item=>item.name),
                expression:{
                    id:{
                        model:roleMemberModel,
                        field: "role_id"
                    }
                },
                aggregation:"role"
            },{
                model:teamModel,
                columns:keys<ICommon_Model_Team>().map(item=>item.name),
                expression:{
                    id:{
                        model:roleMemberModel,
                        field:"member_id"
                    }
                },
                aggregation:"team"
            },{
                item_id:{
                    model:roleMemberModel,
                    value:itemId
                },
                member_type:{
                    model:roleMemberModel,
                    value:ECommon_Model_Organization_Member_Type.TEAM
                },
                ...(key && {
                    name: {
                        model: teamModel,
                        value: {
                            exp: "%like%",
                            value: key
                        }
                    }
                }),
                ...(roleId && {
                    role_id:{
                        model:roleMemberModel,
                        value:roleId
                    }
                })
            },"and",{
                model:teamModel,
                field:"name",
                type:"asc"
            },page*size,size)
            let arr=await mysql.execute(sql);
            ret.page=page;
            ret.totalPage=totalPage;
            ret.count=count;
            ret.data=arr;
        } else if(memberType===ECommon_Model_Organization_Member_Type.MEMBERTAG){
            let count:number;
            count=Number(Object.values(await mysql.executeOne<number>(`select count(1) from ${Table_Role_Member} rm left join ${Table_Member_Tag} mt on mt.id=rm.member_id where rm.item_id=${itemId} and rm.member_type=${ECommon_Model_Organization_Member_Type.MEMBERTAG}${key?` and mt.name like '%${key}%'`:""}${roleId?` and rm.role_id=${roleId}`:""}`))[0])
            let totalPage=CommonUtil.pageTotal(count,size)
            let sql=generateLeftJoin2Sql({
                model:roleMemberModel,
                columns:["member_type"],
                rename:{
                    fields:["member_type"],
                    newFields:["memberType"]
                }
            },{
                model:roleModel,
                columns:keys<ICommon_Model_Role>().map(item=>item.name),
                expression:{
                    id:{
                        model:roleMemberModel,
                        field: "role_id"
                    }
                },
                aggregation:"role"
            },{
                model:memberTagModel,
                columns:keys<ICommon_Model_Member_Tag>().map(item=>item.name),
                expression:{
                    id:{
                        model:roleMemberModel,
                        field:"member_id"
                    }
                },
                aggregation:"tag"
            },{
                item_id:{
                    model:roleMemberModel,
                    value:itemId
                },
                member_type:{
                    model:roleMemberModel,
                    value:ECommon_Model_Organization_Member_Type.MEMBERTAG
                },
                ...(key && {
                    name: {
                        model: memberTagModel,
                        value: {
                            exp: "%like%",
                            value: key
                        }
                    }
                }),
                ...(roleId && {
                    role_id:{
                        model:roleMemberModel,
                        value:roleId
                    }
                })
            },"and",{
                model:memberTagModel,
                field:"name",
                type:"asc"
            },page*size,size)
            let arr=await mysql.execute(sql);
            ret.page=page;
            ret.totalPage=totalPage;
            ret.count=count;
            ret.data=arr;
        }
        return ret;
    }

    async clearByRoleId(roleId:string) {
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(roleMemberModel,{
            role_id:roleId
        }))
    }

    async checkRoleMember(roleId:string) {
        let mysql=getMysqlInstance()
        let ret=await mysql.executeOne(generateQuerySql(roleMemberModel,null,{
            role_id:roleId
        }))
        if(ret) {
            return true
        } else {
            return false;
        }
    }

    async clearMember(memberId:string) {
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(roleMemberModel,{
            member_id:memberId
        }))
    }
}

export let roleMemberMapper=new RoleMemberMapper()