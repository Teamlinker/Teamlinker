<template>
  <div style="padding: 0px 10px;height: 100%;overflow-y: auto" ref="root">
    <a-collapse :default-active-key="['basic']">
      <a-collapse-item :header="$t('util.basic')" key="basic">
        <template v-if="checkPermission(permission,Permission_Types.Team.EDIT)">
          <a-form :model="basic" style="width: 400px" @submitSuccess="onSave">
            <a-form-item :label="$t('util.photo')" field="photo">
              <Upload types=".png,.jpg,.jpeg,.gif,.bmp,.svg" :default-uri="basic.photo" @upload="onUpload"></Upload>
            </a-form-item>
            <a-form-item :label="$t('util.name')" field="name" required>
              <a-input v-model="basic.name" allow-clear></a-input>
            </a-form-item>
            <a-form-item :label="$t('util.description')" field="description">
              <a-textarea v-model="basic.description" allow-clear></a-textarea>
            </a-form-item>
            <a-form-item :label="$t('util.creator')">
              <UserAvatar :organization-user-id="basic.created_by?.organizationUserId" :name="basic.created_by?.nickname" :photo="basic.created_by?.photo" v-if="basic.created_by"></UserAvatar>
            </a-form-item>
            <a-form-item>
              <a-space size="large">
                <a-button type="primary" html-type="submit">{{$t("util.save")}}</a-button>
	              <a-button type="primary" status="danger" html-type="button" @click="onQuit">{{$t("util.quit")}}</a-button>
                <a-button status="danger" html-type="button" v-if="checkPermission(permission,Permission_Types.Team.DELETE)" @click="onDelete">{{$t("util.delete")}}</a-button>
                <a-button type="outline" size="small" html-type="button" @click="onMessage">
                  <template #icon>
                    <icon-message></icon-message>
                  </template>
	                {{$t("util.message")}}
                </a-button>
              </a-space>
            </a-form-item>
          </a-form>
        </template>
        <template v-else>
          <a-list :bordered="false">
            <a-list-item>
              <a-list-item-meta>
                <template #title>
                  {{basic.name}}&nbsp;&nbsp;
	                <a-button type="primary" status="danger" size="mini" html-type="button" @click="onQuit">{{$t("util.quit")}}</a-button>&nbsp;&nbsp;
                  <a-button type="outline" size="mini" html-type="button" @click="onMessage">
                    <template #icon>
                      <icon-message></icon-message>
                    </template>
	                  {{$t("util.message")}}
                  </a-button>
                </template>
                <template #description>
                  <a-space direction="vertical">
                    {{basic.description}}
                    <UserAvatar :organization-user-id="basic.created_by?.organizationUserId" :name="basic.created_by?.nickname" :photo="basic.created_by?.photo" v-if="basic.created_by"></UserAvatar>
                  </a-space>
                </template>
                <template #avatar>
                  <a-avatar :size="90" :image-url="basic.photo"></a-avatar>
                </template>
              </a-list-item-meta>
            </a-list-item>
          </a-list>
        </template>
      </a-collapse-item>
      <a-collapse-item :header="$t('util.member')" key="member">
        <a-row>
          <a-space>
            <span>{{$t("util.role")}}</span>
            <a-select v-model="roleId" style="min-width: 100px">
              <a-option :label="$t('util.all')" value="all"></a-option>
              <a-option v-for="item in roleList" :label="item.name" :value="item.id"></a-option>
            </a-select>
            <a-input-search :placeholder="$t('placeholder.typeUserName')" v-model="keyword" @search="listUser(1)"></a-input-search>
            <a-button type="primary" v-if="checkPermission(permission,Permission_Types.Team.ADMIN)" @click="onAddMember">{{$t("util.add")}}</a-button>
          </a-space>
        </a-row>
        <a-space wrap style="margin-top: 20px" size="large">
          <CardItem style="background-color: white" v-for="item in userList" :name="item.organizationUser.nickname" :photo="item.user.photo" :description="item.organizationUser.job" @click="showUserProfile(item.organizationUser.id)" :action="checkPermission(permission,Permission_Types.Team.ADMIN)?action(item):undefined"></CardItem>
        </a-space>
        <a-pagination :page-size="20" :total="pagination.total" style="margin-top: 10px" @change="onPageChange"></a-pagination>
      </a-collapse-item>
      <a-collapse-item :header="$t('util.role')" key="role" v-if="checkPermission(permission,Permission_Types.Team.ADMIN)">
        <a-button @click="onAddRole" type="primary" style="margin-bottom: 10px">{{$t("util.add")}}</a-button>
        <a-table :columns="columns" :data="roleList" :pagination="false">
          <template #description="{record}">
            {{record.description}}
          </template>
          <template #permission="{record}">
            <a-space wrap>
              <a-tag v-for="item in record.permissions.map(item=>item.name)">{{item}}</a-tag>
            </a-space>
          </template>
          <template #global="{record}">
            <icon-check v-if="record.global" style="color: green"></icon-check>
            <icon-close v-else style="color: red"></icon-close>
          </template>
          <template #operation="{record}">
            <template v-if="!record.global">
              <a-space wrap>
                <a-button type="primary" size="small" @click="onEditRole(record)">{{$t("util.manage")}}</a-button>
                <a-button status="danger" size="small" @click="onDeleteRole(record)">{{$t("util.delete")}}</a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-collapse-item>
    </a-collapse>
  </div>
</template>

<script setup lang="ts">
import {getCurrentInstance, markRaw, onBeforeMount, reactive, ref} from "vue";
import {apiTeam} from "../../../common/request/request";
import {ICommon_Route_Res_Organization_User_Item} from "../../../../../../common/routes/response";
import {ICommon_Model_Team} from "../../../../../../common/model/team";
import {checkPermission, Permission_Base, Permission_Types} from "../../../../../../common/permission/permission";
import {getCurrentNavigator} from "../../../../teamOS/common/component/navigator/navigator";
import Upload from "../../../common/component/upload.vue";
import UserAvatar from "../../../common/component/userAvatar.vue";
import {Message} from "@arco-design/web-vue";
import {Dialog} from "../../../common/component/dialog/dialog";
import CardItem from "../../../common/component/cardItem.vue";
import {EClient_EVENTBUS_TYPE, eventBus} from "../../../common/event/event";
import EditTeamMemberRole from "../setting/user&team/editTeamMemberRole.vue";
import EditTeamRole from "../setting/role/team/editTeamRole.vue";
import {ECommon_IM_Message_EntityType} from "../../../../../../common/model/im_unread_message";
import {useI18n} from "vue-i18n";
import {DCSType} from "../../../../../../common/types";

const props=defineProps<{
  teamId:string
}>()
const roleId=ref("all")
const appContext=getCurrentInstance().appContext
const root=ref(null)
const permission=ref(0)
const keyword=ref("")
const userList=ref<DCSType<ICommon_Route_Res_Organization_User_Item[]>>([])
const basic=ref<DCSType<ICommon_Model_Team>>({} as any)
type RoleItem={
  id:string,
  name:string,
  reserved:number,
  description:string,
  global:boolean,
  permissions:Permission_Base[]
}
const {t}=useI18n()
const columns=[
  {
    title:t("util.name"),
    dataIndex:"name"
  },
  {
    title:t("util.description"),
    slotName:"description"
  },
  {
    title:t("util.permission"),
    slotName:"permission"
  },
  {
    title:t("util.global"),
    slotName: "global"
  },
  {
    title:t("util.operation"),
    slotName: "operation"
  }
]
const pagination=reactive({
  total:0,
  current:1,
  pageSize:20
})
const action=(item:ICommon_Route_Res_Organization_User_Item)=>{
  return [
    {
      name:t("util.role"),
      func:async ()=>{
        let ret=await Dialog.open(root.value,appContext,t("util.add"),markRaw(EditTeamMemberRole),{
          type:"edit",
          teamId:props.teamId,
          item:item
        })
        if(ret) {
          listUser(1)
        }
      }
    },
    {
      name:t("util.remove"),
      func:async ()=>{
        let ret=await Dialog.confirm(root.value,appContext,t("tip.removeMember"))
        if(ret) {
          let res=await apiTeam.removeMember({
            teamId:props.teamId,
            organizationUserId:item.organizationUser.id
          })
          if(res?.code==0) {
            Message.success(t("tip.deleteSuccess"))
            listUser(1)
          } else {
            Message.error(res.msg)
          }
        }
      }
    }
  ]
}
const navigator=getCurrentNavigator()
const roleList=ref<RoleItem[]>([])
const onAddRole=async ()=>{
  let ret=await Dialog.open(root.value,appContext,t("controller.app.project.setting.projectSettingRole.addRole"),markRaw(EditTeamRole),{
    type:"add",
    ...(props.teamId && {
      teamId:props.teamId
    })
  })
  if(ret) {
    listRole();
  }
}
const onEditRole=async (item:RoleItem) =>{
  let ret=await Dialog.open(root.value,appContext,t("controller.app.project.setting.projectSettingRole.addRole"),markRaw(EditTeamRole),{
    type:"edit",
    item:{
      name:item.name,
      id:item.id,
      description:item.description,
      permissions:item.permissions
    }
  })
  if(ret) {
    listRole()
  }
}
const onDeleteRole=async (item:RoleItem)=>{
  let ret=await Dialog.confirm(root.value,appContext,t("tip.deleteRole"))
  if(ret) {
    let res=await apiTeam.removeRole({
      roleId:item.id
    })
    if(res?.code==0) {
      Message.success(t("tip.deleteSuccess"))
      listRole()
    } else {
      Message.error(res.msg);
    }
  }
}
const uploadUriId=ref("")
const onUpload=(id:string)=> {
  uploadUriId.value=id
}
const getPermission=async ()=>{
  let res=await apiTeam.getPermission({
    teamId:props.teamId
  })
  if(res?.code==0) {
    permission.value=res.data.value;
  }
}
const basicInfo=async ()=>{
  let res=await apiTeam.info({
    teamId:props.teamId
  })
  if(res?.code==0) {
    basic.value=res.data
    navigator.getPath()[navigator.getIndex().value]=res.data.name
  }
}
const listUser=async (page:number)=>{
  let res=await apiTeam.listUser({
    teamId:props.teamId,
    keyword:keyword.value,
    page:page-1,
    size:pagination.pageSize,
    ...(roleId.value!="all" && {
      roleId:roleId.value
    })
  })
  if(res?.code==0) {
    userList.value=res.data.data
    pagination.total=res.data.count;
    pagination.current=page
  }
}
const listRole=async ()=>{
  let ret=await apiTeam.roles({
    ...(props.teamId && {
      teamId:props.teamId
    })
  })
  if(ret?.code==0) {
    let value=ret.data;
    let arr:RoleItem[]=[]
    arr.push({
      name:value.admin.name,
      id:value.admin.id,
      reserved:value.admin.reserved,
      description:value.admin.description,
      permissions:[{
        name:Permission_Types.Team.ADMIN.name,
        description:Permission_Types.Team.ADMIN.description,
        value:Permission_Types.Team.ADMIN.value
      }],
      global:true
    })
    for(let obj of value.users) {
      arr.push({
        name:obj.name,
        id:obj.id,
        reserved:obj.reserved,
        description:obj.description,
        permissions:obj.permissions as Permission_Base[],
        global:!!obj.global
      })
    }
    roleList.value=arr;
  }
}
onBeforeMount(async ()=>{
  await Promise.all([
      getPermission(),
      basicInfo(),
      listUser(1),
      listRole()
  ])
})
const onPageChange=(page:number)=>{
  listUser(page)
}
const onSave=async ()=>{
  let res=await apiTeam.update({
    teamId:props.teamId,
    name:basic.value.name,
    description:basic.value.description,
    ...(uploadUriId.value && {
      photo:uploadUriId.value
    })
  })
  if(res?.code==0) {
    Message.success(t("tip.updateSuccess"))
    basic.value=res.data
    navigator.setCurrentPath(res.data.name)
  } else {
    Message.error(res.msg)
  }
}
const onDelete=async ()=>{
  let ret=await Dialog.confirm(root.value,appContext,t("tip.deleteTeam"))
  if(ret) {
    let res=await apiTeam.remove({
      teamId:props.teamId
    })
    if(res?.code==0){
      Message.success(t("tip.deleteSuccess"))
      navigator.replaceRoot("team",null,"team");
    } else {
      Message.error(res.msg)
    }
  }
}
const showUserProfile=(organizationUserId:string)=>{
  eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_PEOPLE_PROFILE,organizationUserId);
}
const onAddMember=async ()=>{
  let ret=await Dialog.open(root.value,appContext,t("util.add"),markRaw(EditTeamMemberRole),{
    type:"add",
    teamId:props.teamId
  })
  if(ret) {
    listUser(1);
  }
}

const onMessage=()=>{
  eventBus.emit(EClient_EVENTBUS_TYPE.OPEN_IM_CHAT,props.teamId,ECommon_IM_Message_EntityType.TEAM)
}

const onQuit=async ()=>{
	let ret=await Dialog.confirm(root.value,appContext,t("tip.quitTeam"))
	if(ret) {
		let res=await apiTeam.quit({
			teamId:props.teamId
		})
		if(res?.code==0){
			Message.success(t("tip.quitSuccess"))
			navigator.replaceRoot("team",null,"team");
		} else {
			Message.error(res.msg)
		}
	}
}
</script>

<style scoped>

</style>