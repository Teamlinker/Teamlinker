import { roleModel } from "../../../common/model/role";
import { getMysqlInstance } from "../../common/db/mysql";
import { Mapper } from "../../common/entity/mapper";
import { generateLeftJoinSql } from "../../common/util/sql";
import { roleMemberModel } from './../../../common/model/role_member';

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
            columns:["item_id","member_id"]
        },{
            model:roleModel,
            columns:["id","name","description"],
            expression:{
                id:{
                    model:roleMemberModel,
                    field:"role_id"
                }
            }
        },query,"or")
        let arr=await mysql.execute(sql);
        let ret:{
            id:string,
            name:string,
            description:string
        }[]=[]
        for(let o of items) {
            let isFind=false;
            for(let obj of arr) {
                if(obj.item_id==o.itemId && obj.member_id==o.memberId) {
                    isFind=true;
                    ret.push({
                        id:obj.id,
                        name:obj.name,
                        description:obj.description
                    })
                    break;
                }
            }
            if(!isFind) {
                ret.push(null);
            }
        }
        return ret;
    }
}

export let roleMemberMapper=new RoleMemberMapper()