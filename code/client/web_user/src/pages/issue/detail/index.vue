<template>
  <div>
    <div class="title">
      <span>{{ baseInfo.issueType.name }}</span
      ><span>{{ baseInfo.name }}</span>
    </div>
    <div style="display: flex">
      <div class="left">
        <div style="margin-bottom: 20px;font-weight:bold;">Description</div>
        <div v-if="!isDescInput" @click="addDesc('isDescInput')" class="add-desc">
          {{ descriptionInfo ? descriptionInfo : "Add a description" }}
        </div>
        <div v-if="isDescInput">
          <a-textarea v-model:value="descValue" :rows="4" />
          <div class="desc-btn">
            <a-button type="primary" style="margin-right: 20px" @click="save"
              >save</a-button
            >
            <a-button @click="cancel">cancel</a-button>
          </div>
        </div>
        <div style="font-weight:bold;">comments</div>
        <div class="comment-list">
          <div class="comment-item" v-for="item in commentList" :key="item.id">
            <div>{{item.content}}</div>
            <div class="comment-operate">
              <span @click="editComment(item)">Edit</span>
             <a-popconfirm
               title="Are you sure delete this comment?"
               ok-text="Yes"
               cancel-text="No"
               @confirm="deleteComment(item)"
              >
             <a href="#">Delete</a>
            </a-popconfirm>
            </div>
          </div>
        </div>
        <div  @click="addDesc('isCommentInput')" class="add-comment">
           Add a  comment
        </div>
        <div v-if="isCommentInput">
          <a-textarea v-model:value="commentValue" :rows="4" />
          <div class="desc-btn">
            <a-button type="primary" style="margin-right: 20px" @click="saveComment"
              >save</a-button
            >
            <a-button @click="cancelComment">cancel</a-button>
          </div>
        </div>
      </div>
      <div class="right">
        <div class="details">
          <div style="font-weight: 600">Details</div>
          <div style="position: relative">
            <a class="ant-dropdown-link" @click="selectActions">
              {{ workflowNode.name }}
              <down-outlined />
            </a>
            <div v-show="showDown" class="down-area">
              <!-- <a-select @change="showModal" style="width: 100px">
                <a-select-option
                  :value="item.id"
                  v-for="item in actionsOptions"
                  :key="item.id"
                  >{{ item.name }}</a-select-option
                >
              </a-select> -->
              <div
                class="down-item"
                v-for="(item, index) in actionsOptions"
                :key="index"
                @click="showModal(item.id)"
              >
                {{ item.name }}
              </div>
            </div>
          </div>
          <a-row class="item">
            <a-col :span="6" class="item_left">assigner</a-col>
            <a-col :span="18">
              <a-select
                v-model:value="assigner_id"
                placeholder="please select assigner"
                @change="handleAssignerChange"
              >
                <a-select-option
                  :value="item.id"
                  v-for="item in memberList"
                  :key="item.id"
                  >{{ item.name }}</a-select-option
                >
              </a-select>
            </a-col>
          </a-row>
          <a-row class="item">
            <a-col :span="6" class="item_left">reporter</a-col>
            <a-col :span="18">
              <a-select
                v-model:value="reporter_id"
                placeholder="please select reporter"
                @change="handleReporterChange"
              >
                <a-select-option
                  :value="item.id"
                  v-for="item in memberList"
                  :key="item.id"
                  >{{ item.name }}</a-select-option
                >
              </a-select>
            </a-col>
          </a-row>

          <a-row class="item">
            <a-col :span="6" class="item_left">priority</a-col>
            <a-col :span="18">
              <a-select
                v-model:value="priority"
                placeholder="please select priority"
                @change="handlePriorityChange"
              >
                <a-select-option
                  :value="item.value"
                  v-for="item in priorityOptions"
                  :key="item.value"
                  >{{ item.label }}</a-select-option
                >
              </a-select>
            </a-col>
          </a-row>
          <a-row class="item">
            <a-col :span="6" class="item_left">create time</a-col>
            <a-col :span="18">{{ baseInfo.created_time }}</a-col>
          </a-row>
          <a-row class="item">
            <a-col :span="6" class="item_left">update time</a-col>
            <a-col :span="18">{{ baseInfo.modified_time }}</a-col>
          </a-row>
        </div>
      </div>
    </div>

    <a-modal v-model:visible="visible" @ok="handleOk">
      <create-field
        ref="issueRef"
        :workflowActionId="workflowActionId"
        :projectIssueId="projectIssueId"
      ></create-field>
    </a-modal>
  </div>
</template>
<script lang="ts">
import { defineComponent, reactive, toRefs, ref, provide } from "vue";
import { useRoute } from "vue-router";
import axios from "@/plugins/axios";
import { notification } from "ant-design-vue";
import CreateField from "./createField.vue";
import { validateSearch } from "ant-design-vue/lib/vc-mentions/src/util";
import { SmileOutlined, DownOutlined } from "@ant-design/icons-vue";
import { message } from 'ant-design-vue'
export default defineComponent({
  components: {
    CreateField,
    DownOutlined,
  },
  setup() {
    const state: any = reactive({
      baseInfo: { issueType: {}, name: "" },
      descriptionInfo: "",
      isCommentInput:"",
      commentList:[],
      commentValue:'',
      commentId:'',
      saveCommentType:'',
      isCommentInput:false,
      descValue: "",
      isDescInput: false,
      memberList: [],
      assigner_id: "",
      reporter_id: "",
      priority: "",
      priorityOptions: [
        {
          value: 0,
          label: "高",
        },
        {
          value: 1,
          label: "中",
        },
        {
          value: 2,
          label: "低",
        },
      ],
      actionsOptions: [],
      workflowNode: {},
      visible: false,
      projectIssueId: "",
      workflowActionId: "",
      showDown: false,
    });
    const issueRef = ref(null);
    const route = useRoute();
    const query = route.query;
    state.projectIssueId = route.query.projectIssueId;
    const getMemberList = () => {
      const params = {
        projectId: route.query.projectId,
      };
      const memberParams = Object.assign({}, params, { page: 0, size: 10 });
      axios
        .get("/project/member/list", { params: memberParams })
        .then((res: any) => {
          state.memberList = res.data.data;
        });
    };
    const getCommentList = ()=>{
      const params = {
        projectIssueId:state.projectIssueId
      }
      axios.get("/issue/item/comment/list",{params:params}).then((res:any)=>{
        state.commentList = res.data
      })
    }
    const getBaseInfo = () => {
      axios.get("/issue/item/basic", { params: query }).then((res: any) => {
        state.baseInfo = res.data;
        state.assigner_id =
          res.data && res.data.assigner_id && res.data.assigner_id.id;
        state.reporter_id =
          res.data && res.data.reporter_id && res.data.reporter_id.id;
        state.priority = res.data && res.data.priority;
        state.workflowNode = res.data && res.data.workflowNode;
      });
    };
    const getDescInfo = () => {
      axios
        .get("/issue/item/description", { params: query })
        .then((res: any) => {
          state.descriptionInfo = res.data;
        });
    };
    getBaseInfo();
    getDescInfo();
    getMemberList();
    getCommentList();
    const addDesc = (type) => {
      state[type] = true;
      if(type==='isCommentInput')
      state.saveCommentType = 'add'
      state.commentValue = ''
      state.descValue = state.descriptionInfo;
    };
    const cancel = () => {
      state.isDescInput = false;
    };
    const save = () => {
      const params = {
        projectIssueId: query.projectIssueId,
        description: state.descValue,
      };
      axios.put("/issue/item/description", params).then(() => {
        state.isDescInput = false;
        getDescInfo();
      });
    };
    const cancelComment = () => {
      state.isCommentInput = false;
    };
    const saveComment = ()=>{
       if(!state.commentValue){
         message.warn('请输入评论内容')
         return false
       }
       const params = {
        projectIssueId: query.projectIssueId,
        content: state.commentValue,
      };
      if(state.saveCommentType==='add'){
        axios.post("/issue/item/comment", params).then(() => {
        state.isCommentInput = false;
        getCommentList();
      });
      }else{
        params.commentId = state.commentId
        axios.put("/issue/item/comment", params).then(() => {
        state.isCommentInput = false;
        getCommentList();
      });
      }
      
    }
    const editComment = (item)=>{
      state.isCommentInput = true
      state.commentValue = item.content
      state.commentId = item.id
      state.saveCommentType = 'edit'
    }
    const deleteComment = (item)=>{
      const params = {
        commentId:item.id
      }
       axios.delete("/issue/item/comment", {params:params}).then((res: any) => {
        if (res.code == "0") {
          message.success('操作成功')
          getCommentList()
        }
      });
    }
    const openNotificationWithIcon = (type: string) => {
      notification[type]({
        message: "success",
        description: "update success",
      });
    };
    const updateBaseInfo = (query) => {
      axios.put("/issue/item/basicfield", query).then((res: any) => {
        if (res.code == "0") {
          openNotificationWithIcon("success");
        }
      });
    };
    const handleAssignerChange = (val) => {
      let params = {
        projectIssueId: route.query.projectIssueId,
        name: state.baseInfo.name,
        priority: state.priority,
        assignerId: val,
        reporterId: state.reporter_id,
      };
      updateBaseInfo(params);
    };
    const handleReporterChange = (val) => {
      let params = {
        projectIssueId: route.query.projectIssueId,
        name: state.baseInfo.name,
        priority: state.priority,
        assignerId: state.assigner_id,
        reporterId: val,
      };
      updateBaseInfo(params);
    };
    const handlePriorityChange = (val) => {
      let params = {
        projectIssueId: route.query.projectIssueId,
        name: state.baseInfo.name,
        priority: val,
        assignerId: state.assigner_id,
        reporterId: state.reporter_id,
      };
      updateBaseInfo(params);
    };
    const getActions = () => {
      axios
        .get("/issue/item/actions", {
          params: { projectIssueId: route.query.projectIssueId },
        })
        .then((res: any) => {
          if (res.code == "0") {
            state.actionsOptions = res.data;
          }
        });
    };
    getActions();
    const showModal = (val) => {
      state.workflowActionId = val;
      state.visible = true;
    };
    const selectActions = () => {
      state.showDown = !state.showDown;
    };
    const handleOk = () => {
      issueRef.value.onSubmit();
    };
    return {
      addDesc,
      cancel,
      save,
      cancelComment,
      saveComment,
      editComment,
      deleteComment,
      ...toRefs(state),
      handleAssignerChange,
      handleReporterChange,
      handlePriorityChange,
      showModal,
      issueRef,
      selectActions,
      handleOk
    };
  },
});
</script>
<route lang="yaml">
  meta:
    level: 1
    type: 'proside'
    name: '事务详情'
    layout: auth
</route>
<style lang="scss" scoped>
.title {
  color: #000;
  font-size: 16px;
  font-weight: 500;
  margin-left: 40px;
  margin-top: 20px;
  margin-bottom: 30px;
  span {
    margin-right: 21px;
  }
}
.left {
  width: 50%;
  padding-left: 40px;
  .desc-btn {
    margin-top: 20px;
  }
  .add-desc{
    cursor:pointer;
  }
  .add-comment{
    cursor:pointer;
  }
  .comment-list{
    .comment-item{
      margin-bottom:20px;
      .comment-operate{
        span{
          margin-right:20px;
          cursor:pointer;
        }
      }
    }
  }
}
.right {
  width: 50%;
  .details {
    .item {
      margin: 10px 0;
      .item_left {
        // text-align: right;
        // margin-right: 5px;
      }
    }
    .down-area {
      position: absolute;
      z-index: 999;
      background-color: #fff;
      border: 1px solid #f1f1f1;
    }
    .down-item {
      width: 200px;
      padding: 5px 0;
    }
    .down-item:hover {
      background-color: #f1f1f1;
    }
  }
}
</style>