<template>
  <div class="register-page">
    <div class="content">
      <a-form
        :model="formState"
        name="basic"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }"
        autocomplete="off"
        @finish="onFinish"
        @finishFailed="onFinishFailed"
      >
        <a-form-item
          label="Username"
          name="username"
          :rules="[{ required: true, message: 'Please input your username!' }]"
        >
          <a-input v-model:value="formState.username" />
        </a-form-item>

        <a-form-item
          label="Password"
          name="password"
          :rules="[{ required: true, message: 'Please input your password!' }]"
        >
          <a-input-password v-model:value="formState.password" />
        </a-form-item>
        <a-form-item :wrapper-col="{ offset: 8, span: 16 }">
          <a-button type="primary" html-type="submit">Register</a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, reactive } from 'vue'
import { message } from 'ant-design-vue'
import axios from '@/plugins/axios'
import { useRouter } from 'vue-router'
interface FormState {
  username: string
  password: string
}
export default defineComponent({
  setup() {
    const formState = reactive<FormState>({
      username: '',
      password: ''
    })
    const router = useRouter()
    const onFinish = (values: any) => {
      console.log('Success:', values)
      axios.post('user/register', values).then(() => {
        message.success('注册成功！')
        setTimeout(() => {
          router.replace('/organization/list')
        }, 1000)
      })
    }

    const onFinishFailed = (errorInfo: any) => {
      console.log('Failed:', errorInfo)
    }
    return {
      formState,
      onFinish,
      onFinishFailed
    }
  }
})
</script>
<route lang="yaml">
  meta:
    level: 0
    name: '注册页'
    layout: layouts
</route>

<style lang="scss" scoped>
.register-page {
  position: relative;
  flex-direction: row;
  width: 100vw;
  min-height: 100vh;
  color: #fff;
  background: rgb(0, 61, 75) url('../img/bg.png') no-repeat;
  background-size: cover;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>