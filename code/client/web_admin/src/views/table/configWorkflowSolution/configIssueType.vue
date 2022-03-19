<template>
  <div>
    <div class="name">
      {{ this.workflowSolutionName }}
    </div>
    <div class="operate">
      <el-button type="primary" size="mini" @click="handleAdd()">
        Bind Issue Types solution
      </el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="序号" width="95">
        <template slot-scope="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="名称">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="描述">
        <template slot-scope="scope">
          {{ scope.row.description }}
        </template>
      </el-table-column>
      <el-table-column label="创建时间">
        <template slot-scope="scope">
          {{ scope.row.created_time }}
        </template>
      </el-table-column>
      <el-table-column label="更新时间">
        <template slot-scope="scope">
          {{ scope.row.modify_time }}
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="200"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row }">
          <el-button type="text" size="mini" @click="handleRemove(row)"> 删除 </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog title="绑定事务类型方案" :visible.sync="visible">
      <el-form
        ref="dataForm"
        :model="dataForm"
        :rules="rules"
        label-position="left"
        label-width="120px"
      >
        <el-form-item label="事务类型方案" prop="issueTypeSolutionId">
          <el-select v-model="dataForm.issueTypeSolutionId" placeholder="请选择">
            <el-option
              v-for="item in issueTypeSolutionList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="visible = false">取 消</el-button>
        <el-button type="primary" @click="submit">下一步</el-button>
      </span>
    </el-dialog>
     <el-dialog title="绑定事务类型方案" :visible.sync="assignVisible">
      <el-form
        ref="dataForm2"
        :model="dataForm2"
        :rules="rules2"
        label-position="left"
        label-width="100px"
      >
        <el-form-item label="事务类型" prop="issueTypeId">
          <el-select v-model="dataForm2.issueTypeId" placeholder="请选择">
            <el-option
              v-for="item in issueTypeList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="工作流" prop="workflowId">
          <el-select v-model="dataForm2.workflowId" placeholder="请选择">
            <el-option
              v-for="item in workflowList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="assignVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitAssign">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import {
  solutionInfo,
  solutionListWorkflow,
  solutionBind,
  solutionUnBind,
  solutionAssign
  
} from "@/api/workflow";
import {
  getIssueSolutionList
} from "@/api/issueType";
export default {
  data() {
    return {
      list: [],
      listLoading: false,
      visible: false,
      dataForm: {},
      visible: false,
      issueTypeSolutionList: [],
      issueTypeList:[],
      workflowList:[],
      rules: {
        issueTypeSolutionId: [{ required: true, message: "事务类型方案必选", trigger: "change" }],
      },
      rules2: {
        issueTypeId: [{ required: true, message: "事务类型必选", trigger: "change" }],
        workflowId: [{ required: true, message: "工作流必选", trigger: "change" }],
      },
      temp: {},
      dataForm2:{},
      assignVisible:false
    };
  },
  methods: {
    getSolutionInfo(){
      this.listLoading = true
      solutionInfo({workflowSolutionId: this.workflowSolutionId}).then(res=>{
        this.listLoading = false
        this.list = res.data.data
      })
    },
    //获取工作流列表
    getWorkflowList() {
      solutionListWorkflow({
        workflowSolutionId: this.workflowSolutionId,
      }).then((res) => {
        var data = res.data;
        this.workflowLIst = data;
      });
    },
    handleAdd() {
      this.visible = true;
    },
    handleRemove(row) {
      this.temp.issueTypeSolutionId = row.id;
      this.$confirm("确定删除, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.removeData();
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    removeData() {
      solutionUnBind({
        workflowSolutionId: this.workflowSolutionId,
        issueTypeSolutionId: this.temp.issueTypeSolutionId,
      }).then(() => {
        this.doSuccess();
      });
    },
    doSuccess() {
      this.getList();
      this.$notify({
        title: "Success",
        message: "操作成功",
        type: "success",
        duration: 2000,
      });
    },
    //获取事务类型列表
    getIssueTypeList() {
      getIssueSolutionList({}).then((res) => {
        this.issueTypeSolutionList = res.data;
      });
    },
    submit() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          const issueTypeSolutionId = this.dataForm.issueTypeSolutionId
          const params = {
            workflowSolutionId: this.workflowSolutionId,
            issueTypeSolutionId: issueTypeSolutionId,
          };
          solutionBind(params).then(() => {
            this.visible = false;
            this.assignVisible = true
            this.dataForm.issueTypeSolutionId = undefined;
            this.issueTypeList = this.issueTypeSolutionList.filter(item=>item.id===issueTypeSolutionId)[0].issueTypeList
          });
        }
      });
    },
    submitAssign(){
        this.$refs["dataForm2"].validate((valid)=>{
            if(valid){
                solutionAssign({}).then(()=>{

                })
            }
        })
    }
  },
  created() {
    this.workflowSolutionId = this.$route.query.workflowSolutionId;
    this.workflowSolutionName = this.$route.query.name;
    this.getWorkflowList();
    this.getSolutionInfo()
    this.getIssueTypeList()
  },
};
</script>
<style scoped>
.operate {
  margin-bottom: 20px;
  margin-right: 20px;
  float: right;
}
.name {
  margin: 20px;
}
</style>
