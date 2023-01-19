import {ICommon_Route_Res_Project_Member} from "../../../../../common/routes/response";
import {ECommon_Model_Organization_Member_Type} from "../../../../../common/model/organization";
import {Message} from "@arco-design/web-vue";
import {Permission_Base} from "../../../../../common/permission/permission";

export function getMemberIdFromProjectMember(item:ICommon_Route_Res_Project_Member){
    if(item.memberType==ECommon_Model_Organization_Member_Type.DEFAULT) {
        return null;
    } else if(item.memberType==ECommon_Model_Organization_Member_Type.TEAM) {
        return item.team.id
    } else if(item.memberType==ECommon_Model_Organization_Member_Type.USER) {
        return item.member.id
    } else if(item.memberType==ECommon_Model_Organization_Member_Type.MEMBERTAG) {
        return item.tag.id;
    }
}

export function getNameFromProjectMember(item:ICommon_Route_Res_Project_Member){
    if(item.memberType==ECommon_Model_Organization_Member_Type.DEFAULT) {
        return "";
    } else if(item.memberType==ECommon_Model_Organization_Member_Type.TEAM) {
        return item.team.name
    } else if(item.memberType==ECommon_Model_Organization_Member_Type.USER) {
        return item.member.nickname
    } else if(item.memberType==ECommon_Model_Organization_Member_Type.MEMBERTAG) {
        return item.tag.name;
    }
}

export function dialogFuncGenerator({func,form}:{
    func:()=>any,
    form?:()=>any
}) {
    return async function () {
        if(form) {
            let value=form();
            let ret=await value.validate()
            if(ret) {
                return false;
            }
        }
        let res=await func()
        if(res?.code==0) {
            Message.success("operation success")
            return res
        } else {
            Message.error(res.msg);
            return false
        }
    }
}

export function checkPermission(permission:number,permissionChecked:Permission_Base) {
    return (permission & permissionChecked.value) && permission>=permissionChecked.value
}