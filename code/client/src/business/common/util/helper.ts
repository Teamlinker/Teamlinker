import {ICommon_Route_Res_Role_Member_Item} from "../../../../../common/routes/response";
import {ECommon_Model_Organization_Member_Type} from "../../../../../common/model/organization";
import {Message} from "@arco-design/web-vue";
import {Permission_Base} from "../../../../../common/permission/permission";
import {ECommon_Model_Finder_Item_Type} from "../../../../../common/model/finder_item";
import {EClient_Drag_Type} from "../../../teamOS/common/directive/drag";

export function getMemberIdFromRoleMember(item:ICommon_Route_Res_Role_Member_Item){
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

export function getNameFromRoleMember(item:ICommon_Route_Res_Role_Member_Item){
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
        if(typeof(res)=="object") {
            if(res?.code==0) {
                Message.success("operation success")
                return res
            } else {
                Message.error(res.msg);
                return false
            }
        } else {
            return res;
        }
    }
}

export function checkPermission(permission:number,permissionChecked:Permission_Base) {
    return (permission & permissionChecked.value) && permission>=permissionChecked.value
}

export function clone(o){
    let k, ret= o, b;
    if(o && ((b = (o instanceof Array)) || o instanceof Object)) {
        ret = b ? [] : {};
        for(k in o){
            if(o.hasOwnProperty(k)){
                ret[k] = arguments.callee(o[k]);
            }
        }
    }
    return ret;
}

export function calculateShortName(name:string) {
    if(name.includes(" ")) {
        let arr=name.split(" ")
        return arr[0][0].toUpperCase()+arr[1][0].toUpperCase()
    } else {
        return name[0].toUpperCase()
    }
}

export function compressImage (img:CanvasImageSource, width, height, ratio) {
    let canvas = document.createElement('canvas')
    canvas.width = width;
    canvas.height = height;
    let ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, width, height);
    let img64 = canvas.toDataURL("image/jpeg", ratio);
    return img64;
}


export function convertFinderItemTypeToDragItemType(type:ECommon_Model_Finder_Item_Type) {
    if(type===ECommon_Model_Finder_Item_Type.FILE) {
        return EClient_Drag_Type.FILE
    } else if(type===ECommon_Model_Finder_Item_Type.SHORTCUT) {
        return EClient_Drag_Type.SHORTCUT
    } else if(type===ECommon_Model_Finder_Item_Type.FOLDER) {
        return EClient_Drag_Type.FOLDER
    }
}
