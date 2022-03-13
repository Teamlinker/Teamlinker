<template>
  <div>
    <el-dialog title="添加过渡" :visible="actionVisible">
      <el-form :model="line" :rules="rules" ref="dataForm" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="line.name"></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="line.description"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-check" @click="saveLine"
            >保存</el-button
          >
          <el-button type="primary" icon="el-icon-check" @click="cancelSaveLine"
            >取消</el-button
          >
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
export default {
  props: {
    actionVisible: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      line: {
          name:undefined,
          description:undefined
      },
      rules: {
        name: [{ required: true, message: '名称必填', trigger: 'blur' }]
      }
    }
  },
  methods: {
    saveLine() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.$emit('addAction', this.line)
        }
      })
    },
    cancelSaveLine(){
      this.$emit('cancelSaveLine')
    },
    clearActionForm(){
      this.$refs.dataForm.clearValidate()
      this.line = {}
    }
  }
}
</script>