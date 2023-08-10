import {Mapper} from "../../common/entity/mapper";
import {ICommon_Model_Wiki, Table_Wiki, wikiModel} from "../../../common/model/wiki";
import {wikiItemModel} from "../../../common/model/wiki_item";
import {Err} from "../../../common/status/error";
import {getMysqlInstance} from "../../common/db/mysql";
import {
    convertCountSql,
    generateDeleteSql,
    generateGroupLeftJoin2Sql,
    generateGroupLeftJoin3Sql,
    generateLeftJoinSql,
    generateQuerySql,
    generateUpdateSql
} from "../../common/util/sql";
import {keys} from "../../../common/transform";
import {roleMemberModel, Table_Role_Member} from "../../../common/model/role_member";
import {Table_Team_User, teamUserModel} from "../../../common/model/team_user";
import {memberTagMemberModel, Table_Member_Tag_Member} from "../../../common/model/member_tag_member";
import {ECommon_Model_Organization_Member_Type} from "../../../common/model/organization";
import CommonUtil from "../../common/util/common";
import {contentModel} from "../../../common/model/content";

class WikiMapper extends Mapper<typeof wikiModel> {
    constructor() {
        super(wikiModel)
    }
    async recentWikiList(organizationUserId:string):Promise<ICommon_Model_Wiki[]> {
        if(!organizationUserId) {
            throw Err.User.userIdNotExists
        }
        var mysql=getMysqlInstance();
        let sql=generateGroupLeftJoin2Sql({
            model:wikiItemModel
        },{
            model:contentModel,
            expression:{
                ref_id:{
                    model:wikiItemModel,
                    field:"id"
                }
            }
        },{
            model:wikiModel,
            columns:{
                columns:keys<ICommon_Model_Wiki>().map(item=>item.name),
                calcColumns:[]
            },
            expression:{
                id:{
                    model:wikiItemModel,
                    field:"wiki_id"
                }
            }
        },["wiki_id"],{
            modified_by:{
                model:contentModel,
                value:organizationUserId
            }
        },"and",null,"and",{
            isVirtualField:false,
            field:"modified_time",
            model:contentModel,
            type:"desc"
        },0,20)
        let ret=await mysql.execute(sql)
        return ret;
    }

    async userWikiList(organizationId:string,organizationUserId:string,page:number,size:number,type:"all"|"created"|"joined",keyword?:string) {
        if(!organizationUserId) {
            throw Err.User.userIdNotExists
        }
        let mysql=getMysqlInstance();
        let calcCount=await mysql.executeOne<number>(`select count(1) from (select rm.item_id from ${Table_Role_Member} rm left join ${Table_Wiki} w on w.id=rm.item_id left join ${Table_Team_User} tu on tu.team_id=rm.member_id left join ${Table_Member_Tag_Member} mtm on mtm.member_tag_id=rm.member_id  where (rm.member_id='${organizationUserId}' or rm.member_type =${ECommon_Model_Organization_Member_Type.DEFAULT} or not isnull(tu.team_id) || not isnull(mtm.member_tag_id)) and not isnull(w.id)  ${type=="all"?``:type=="created"?`and w.created_by='${organizationUserId}'`:`and w.created_by<>'${organizationUserId}'`} ${keyword?` and w.name like '%${keyword}%'`:''} and organization_id='${organizationId}' GROUP BY rm.item_id) as Z`)
        let count=Number(Object.values(calcCount)[0]);
        let totalPage=CommonUtil.pageTotal(count,size)
        let sql=generateGroupLeftJoin3Sql({
            model:roleMemberModel,
        },{
            model:wikiModel,
            columns:{
                columns:keys<ICommon_Model_Wiki>().map(item=>item.name),
                calcColumns:[]
            },
            expression:{
                id:{
                    model:roleMemberModel,
                    field:"item_id"
                }
            }
        },{
            model:teamUserModel,
            expression:{
                team_id:{
                    model:roleMemberModel,
                    field:"member_id"
                }
            }
        },{
            model:memberTagMemberModel,
            expression:{
                member_tag_id:{
                    model:roleMemberModel,
                    field:"member_id"
                }
            }
        },["item_id"],{
            "$or0":{
                member_id:{
                    model:roleMemberModel,
                    value:organizationUserId
                },
                member_type:{
                    model:roleMemberModel,
                    value:ECommon_Model_Organization_Member_Type.DEFAULT
                },
                team_id:{
                    model:teamUserModel,
                    value:{
                        exp:"is not null"
                    }
                },
                member_tag_id: {
                    model:memberTagMemberModel,
                    value:{
                        exp:"is not null"
                    }
                }
            },
            id:{
                model:wikiModel,
                value:{
                    exp:"is not null"
                }
            },
            ...(keyword && {
                name:{
                    model:wikiModel,
                    value:{
                        exp:"%like%",
                        value:keyword
                    }
                }
            }),
            ...((type=="created" || type=="joined") && {
                created_by:{
                    model:wikiModel,
                    value:{
                        exp:type=="created"?"=":"<>",
                        value:organizationUserId
                    }
                }
            }),
            organization_id:{
                model:wikiModel,
                value:organizationId
            }
        },"and",null,"and",{
            field:"name",
            model:wikiModel,
            type:"asc",
            isVirtualField:false
        },page*size,size)
        let arr=await mysql.execute(sql);
        return {
            page:page,
            count:count,
            totalPage:totalPage,
            data:arr
        };
    }

    async list(organizationId:string,page:number,size:number,keyword?:string,organizationUserId?:string):Promise<{
        count:number,
        totalPage:number,
        data:ICommon_Model_Wiki[]
    }> {
        if(page===undefined || page<0 || size===undefined || size<=0) {
            throw Err.Common.paramError
        }
        if(!organizationId) {
            throw Err.Organization.organizationNotFound
        }
        let mysql=getMysqlInstance();
        let str=`select count(1) from ${Table_Wiki} where organization_id=${organizationId}`,keywordStr="",userIdStr=""
        if(keyword) {
            keywordStr=`name like '%${keyword}%'`
        }
        if(organizationUserId) {
            userIdStr=`created_by='${organizationUserId}'`
        }
        if(keywordStr && userIdStr) {
            str+=" and "+keywordStr+" and "+userIdStr
        } else if(keywordStr) {
            str+=" and "+keywordStr
        } else if(userIdStr) {
            str+=" and "+userIdStr
        }
        let count=Number(Object.values(await mysql.executeOne<number>(str))[0])
        let totalPage=CommonUtil.pageTotal(count,size)
        let ret=await mysql.execute(generateQuerySql(wikiModel,[],{
            organization_id:organizationId,
            ...(keyword && {
                name:{
                    exp:"%like%",
                    value:keyword
                }
            }),
            ...(organizationUserId && {
                created_by:organizationUserId
            })
        },"and",{
            field:"name",
            type:"asc"
        },page*size,size))
        return {
            count:count,
            totalPage:totalPage,
            data:ret
        };
    }

    async getWikiItemIds(wikiId:string) {
        if(!wikiId) {
            throw Err.Wiki.wikiNotFound
        }
        let mysql=getMysqlInstance()
        let arr=await mysql.execute(generateQuerySql(wikiItemModel,["id"],{
            wiki_id:wikiId
        }))
        return arr.map(item=>item.id)
    }

    async clearWiki(wikiId:string) {
        if(!wikiId) {
            throw Err.Wiki.wikiNotFound
        }
        let mysql=getMysqlInstance()
        await mysql.execute(generateDeleteSql(wikiItemModel,{
            wiki_id:wikiId
        }))
    }

    async info(wikiId:string,keyword?:string) {
        if(!wikiId) {
            throw Err.Wiki.wikiNotFound
        }
        let mysql=getMysqlInstance()
        let arr=await mysql.execute(generateQuerySql(wikiItemModel,["id","name","weight","parent_id"],{
            wiki_id:wikiId
        }))
        function _access(obj:any,parentWikiItemId:string) {
            let data=[]
            for(let obj of arr) {
                if(obj.parent_id===parentWikiItemId) {
                    data.push(obj)
                }
            }
            data=data.sort((item1,item2)=>{
                return item1.weight-item2.weight
            }).map(item=>{
                return {
                    id:item.id,
                    name:item.name
                }
            })
            if(data.length>0) {
                obj.data=data;
                for(let obj of data) {
                    _access(obj,obj.id)
                }
            }
        }
        let ret:any={}
        _access(ret,null)
        const loop = (data) => {
            const result = [];
            data?.forEach(item => {
                if (item.name.toLowerCase().indexOf(keyword.toLowerCase()) > -1) {
                    result.push({...item});
                } else if (item.data && item.data.length>0) {
                    const filterData = loop(item.data);
                    if (filterData.length>0) {
                        result.push({
                            ...item,
                            data: filterData
                        })
                    }
                }
            })
            return result;
        }
        if(keyword) {
            ret.data=loop(ret.data);
        }
        return ret;
    }
}

export const wikiMapper=new WikiMapper()

class WikiItemMapper extends Mapper<typeof wikiItemModel> {
    constructor() {
        super(wikiItemModel);
    }

    async clearWikiItem(wikiItemId:string,parentWikiItemId:string,wikiId:string,weight:number,isChildren:boolean) {
        if(!wikiItemId) {
            throw Err.Wiki.wikiNotFound
        }
        let mysql=getMysqlInstance()
        await Promise.all([
            mysql.execute(generateUpdateSql(wikiItemModel,{
                weight:{
                    exp:"-",
                    value:1
                }
            },{
                wiki_id:wikiId,
                parent_id:parentWikiItemId,
                weight:{
                    exp:">",
                    value:weight
                }
            }))
        ])
        if(isChildren) {
            await mysql.execute(generateDeleteSql(wikiItemModel,{
                parent_id:wikiItemId
            }))
        } else {
            let weight=await this.generatorAddWeight(wikiItemId,wikiId)
            let arr=await mysql.execute(generateQuerySql(wikiItemModel,null,{
                parent_id:wikiItemId
            },"and",{
                field:"weight",
                type:"asc"
            }))
            let arrPromise=[]
            for(let i=0;i<arr.length;i++) {
                let obj=arr[i]
                arrPromise.push(mysql.execute(generateUpdateSql(wikiItemModel,{
                    parent_id:parentWikiItemId,
                    weight:weight+i
                },{
                    id:obj.id
                })))
            }
            await Promise.all(arrPromise)
        }
    }

    async generatorAddWeight(wikiItemId:string,wikiId:string):Promise<number> {
        if(!wikiId) {
            throw Err.Wiki.wikiNotFound
        }
        let mysql=getMysqlInstance()
        let arrWeight=await mysql.execute(generateQuerySql(wikiItemModel,["weight"],{
            parent_id:wikiItemId,
            wiki_id:wikiId
        },"and",{
            field:"weight",
            type:"desc"
        }))
        if(arrWeight.length==0) {
            return 0
        } else {
            return arrWeight[0].weight+1
        }
    }

    async moveWikiItem(wikiItemId:string,newWikiItemId:string,action:"up"|"down"|"child") {
        if(!wikiItemId || !newWikiItemId) {
            throw Err.Wiki.wikiNotFound
        }
        let mysql=getMysqlInstance()
        let objNewWikiItem=await mysql.executeOne(generateQuerySql(wikiItemModel,null,{
            id:newWikiItemId
        }))
        if(action=="up") {
            await mysql.execute(generateUpdateSql(wikiItemModel,{
                weight:{
                    exp:"+",
                    value:1
                }
            },{
                weight:{
                    exp:">=",
                    value:objNewWikiItem.weight
                }
            }))
            await mysql.execute(generateUpdateSql(wikiItemModel,{
                parent_id:objNewWikiItem.parent_id,
                weight:objNewWikiItem.weight
            },{
                id:wikiItemId
            }))
        } else if(action=="down") {
            await mysql.execute(generateUpdateSql(wikiItemModel,{
                weight:{
                    exp:"+",
                    value:1
                }
            },{
                weight:{
                    exp:">=",
                    value:objNewWikiItem.weight+1
                }
            }))
            await mysql.execute(generateUpdateSql(wikiItemModel,{
                parent_id:objNewWikiItem.parent_id,
                weight:objNewWikiItem.weight+1
            },{
                id:wikiItemId
            }))
        } else if(action=="child") {
            let weight=await this.generatorAddWeight(wikiItemId,objNewWikiItem.wiki_id)
            await mysql.execute(generateUpdateSql(wikiItemModel,{
                weight:weight,
                parent_id:newWikiItemId
            },{
                id:wikiItemId
            }))
        }
    }

    async filterWikiItem(organizationId:string,wikiId:string,name:string,page:number,size:number) {
        if(page===undefined || page<0 || size===undefined || size<=0) {
            throw Err.Common.paramError
        }
        let mysql=getMysqlInstance()
        let sql=generateLeftJoinSql({
            model:wikiItemModel,
            columns:keys<typeof wikiItemModel["model"]>().map(item=>item.name)
        },{
            model:wikiModel,
            columns:keys<typeof wikiModel["model"]>().map(item=>item.name),
            aggregation:"wiki",
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
            },
            ...(wikiId && {
                wiki_id:{
                    model:wikiItemModel,
                    value:wikiId
                }
            }),
            ...(name && {
                name:{
                    model:wikiItemModel,
                    value:{
                        exp:"%like%",
                        value:name
                    }
                }
            }),
        },"and",{
            model:wikiItemModel,
            field:"name",
            type:"asc"
        },page*size,size)
        let countSql=convertCountSql(sql);
        let count=Number(Object.values(await mysql.executeOne(countSql))[0])
        let totalPage=CommonUtil.pageTotal(count,size)
        let ret=await mysql.execute(sql)
        return {
            count:count,
            totalPage:totalPage,
            page:page,
            data:ret
        }
    }
}

export const wikiItemMapper=new WikiItemMapper()