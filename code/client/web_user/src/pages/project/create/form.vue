<template>
  <div class="pro-from">
    <a-form
      ref="formRef"
      :model="formState"
      :rules="rules"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
    >
      <a-form-item label="关键词" v-if="projectId">
        {{ formState.keyword }}
      </a-form-item>
      <a-form-item label="创建者" v-if="projectId">
        {{ formState.userName }}
      </a-form-item>
      <a-form-item label="名称" name="name">
        <a-textarea v-model:value="formState.name" />
      </a-form-item>
      <a-form-item label="描述" name="description">
        <a-textarea v-model:value="formState.description" />
      </a-form-item>
      <a-form-item label="图片" name="photo">
        <a-upload
          v-model:file-list="fileList"
          list-type="picture-card"
          :customRequest="customRequest"
          :remove="removeImg"
        >
          <div v-if="fileList.length < 8">
            <plus-outlined />
            <div class="ant-upload-text">Upload</div>
          </div>
        </a-upload>
      </a-form-item>
      <a-form-item :wrapper-col="{ span: 14, offset: 4 }">
        <a-button type="primary" @click="onSubmit">创建</a-button>
        <a-button style="margin-left: 10px" @click="resetForm">重置</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  reactive,
  ref,
  toRaw,
  UnwrapRef,
  Ref,
  onActivated
} from 'vue'
import axios from '@/plugins/axios'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { PlusOutlined } from '@ant-design/icons-vue'
interface FormState {
  projectId?: string
  keyword: string
  name: string
  photo?: string
  description?: string
  userName?: string
}

export default defineComponent({
  components: {
    PlusOutlined
  },
  setup() {
    const router = useRouter()
    const formRef = ref()
    let formState: UnwrapRef<FormState> = reactive({
      projectId: '',
      keyword: '',
      name: '',
      photo: '',
      description: ''
    })
    const projectId: Ref = ref('')
    const rules = reactive({
      keyword: [
        {
          required: true,
          message: '请输入项目关键字',
          trigger: 'blur'
        }
      ],
      name: [
        {
          required: true,
          message: '请输入项目名称',
          trigger: 'blur'
        }
      ]
    })
    let fileList: Ref = ref([])
    //上传图片
    const customRequest = (data: { file: string | Blob }) => {
      const formData = new FormData()
      formData.append('file', data.file)
      axios.post('/file/upload', formData).then((res: any) => {
        const photoId: string = res.data
        const params: Object = {
          params: {
            fileId: photoId
          }
        }
        axios.get('/file/item', params).then((res: any) => {
          fileList.value = [
            {
              uid: photoId,
              url: 'http://175.27.166.37:13000' + res.data
            }
          ]
          formState.photo = photoId
        })
      })
    }
    const removeImg = () => {
      fileList.value = []
      formState.photo = ''
    }
    const onSubmit = () => {
      formRef.value
        .validate()
        .then(() => {
          const params = toRaw(formState)
          let httpUrl: string = ''
          if (!params.photo) {
            delete params.photo
          }
          if (projectId.value) {
            params.projectId = projectId.value
            httpUrl = '/project/edit'
            axios.put(httpUrl, params).then(() => {
              message.success('编辑成功')
              router.push('/project/list')
            })
          } else {
            delete params.projectId
            httpUrl = '/project/create'
            axios.post(httpUrl, params).then(() => {
              message.success('创建成功')
              router.replace('/project/list')
            })
          }
        })
        .catch((error: any) => {
          console.log('error', error)
        })
    }

    const resetForm = () => {
      formRef.value.resetFields()
    }

    const initData = () => {
      const id = router.currentRoute.value.query.projectId
      if (id) {
        projectId.value = id
        const params = {
          projectId: id
        }
        axios.get('/project/basic', { params: params }).then((res: any) => {
          formState.keyword = res.data.keyword
          formState.name = res.data.name
          formState.description = res.data.description || ''
          formState.userName = res.data.created_by.username || ''
          if (res.data.photo) {
            fileList.value = [
              {
                uid: '1',
                url: 'http://175.27.166.37:13000' + res.data.photo
              }
            ]
          }
        })
      }
    }

    //keep-alive生命周期触发
    onActivated(() => {
      fileList.value = []
      formRef.value.resetFields()
      initData()
    })
    return {
      projectId,
      formRef,
      labelCol: {
        span: 4
      },
      wrapperCol: {
        span: 14
      },
      formState,
      rules,
      onSubmit,
      resetForm,
      fileList,
      customRequest,
      removeImg
    }
  }
})
</script>
<route lang="yaml">
  meta:
    level: 1
    name: '创建项目'
    layout: auth
</route>
<style scoped lang="scss">
.pro-from {
  margin-top: 50px;
}
</style>