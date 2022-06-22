<template>
  <div>
    <div class="tit">
      <div class="org-tit">My organization</div>
      <div class="org-create">
        <a-button type="primary" @click="create">create</a-button>
      </div>
    </div>
    <div class="list">
      <div
        v-for="(item, index) in orgList"
        :key="index"
        class="item"
        @click="getDetail(item)"
      >
        <div class="cont">
          <div class="title">{{ item.name }}</div>
          
        </div>
        <!-- <div class="edit"><a>编辑</a></div> -->
      </div>
    </div>
    <a-modal
      v-model:visible="visible"
      :confirm-loading="confirmLoading"
      title="create organization"
      @ok="handleOk"
    >
      <a-form
        ref="formRef"
        :model="formState"
        :rules="rules"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-form-item label="name" name="name">
          <a-input v-model:value="formState.name" />
        </a-form-item>
        <a-form-item label="description" name="description">
          <a-input v-model:value="formState.description" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script lang="ts">
import { defineComponent, reactive, toRefs, ref, UnwrapRef } from 'vue'
import axios from '@/plugins/axios'
import { useStore } from '@/store'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
interface FormState {
  name: string
  description: string
}
export default defineComponent({
  setup() {
    const orgList = ref([])
    const visible = ref<boolean>(false)
    const confirmLoading = ref<boolean>(false)
    const formRef = ref()
    const getOrgList = () => {
      axios.get('organization/list').then((res: any) => {
        const data = res.data
        let orgId = ''
        console.log(data,'data')
        if (data.create[0]) {
          orgId = data.create[0].id
        } else {
          orgId = data.join[0] ? data.join[0].id : ''
        }
        sessionStorage.setItem('orgId', orgId)
        const createOrg = data.create.map((item: any) => {
          return {
            ...item,
            type: 'create'
          }
        })
        const joinOrg = data.join.map((item: any) => {
          return {
            ...item,
            type: 'join'
          }
        })
        orgList.value = createOrg.concat(joinOrg)
      })
    }
    getOrgList()
    const router = useRouter()
    const getDetail = (item: any) => {
      router.push('/')
    }
    const create = () => {
      visible.value = true
    }
    let formState: UnwrapRef<FormState> = reactive({
      name: '',
      description: ''
    })
    const rules = reactive({
      name: [
        {
          required: true,
          message: '请输入组织名称',
          trigger: 'blur'
        }
      ]
    })
    const handleOk = (e: MouseEvent) => {
      console.log(e)
      formRef.value.validate().then(() => {
        confirmLoading.value = true
        axios
          .post('organization/item', {
            name: formState.name,
            description: formState.description
          })
          .then(() => {
            message.success('创建成功')
            visible.value = false
          })
          .finally(() => {
            confirmLoading.value = false
          })
      })
    }
    return {
      orgList,
      getDetail,
      labelCol: {
        span: 4
      },
      wrapperCol: {
        span: 14
      },
      create,
      formState,
      rules,
      handleOk,
      visible,
      confirmLoading,
      formRef
    }
  }
})
</script>
<route lang="yaml">
  meta:
    level: 1
    name: '组织列表'
    layout: org
</route>
<style lang="scss" scoped>
.tit {
  padding: 20px 30px;
  display: flex;
  .org-tit {
    flex: 1;
  }
}
.list{
  display:flex;
}
.item {
  width: 20%;
  padding: 20px 30px;
  cursor: pointer;
  .cont {
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #d9d9d9;
  }
  .edit{
    margin-top:10px;
    text-align:right;
    cursor:point
  }
}
</style>