<template>
  <div class="flex login-page">
    <div class="flexC top">
      <div class="flexC content">
        <div class="flexL header">
          <div class="flexR img">
            <img src="~@/assets/img/logo.png" alt="">
          </div>
        </div>
        <a-form
          name="custom-validation"
          ref="formRef"
          :model="formState"
          :rules="rules"
          @finish="handleFinish"
          @finishFailed="handleFinishFailed"
          class="loginForm"
        >
          <a-form-item has-feedback name="username">
            <a-input
              v-model:value="formState.username"
              autocomplete="off"
              placeholder="账号"
            >
                <template #prefix>
                    <UserOutlined :style="{'color':'#fff'}" />
                </template>
            </a-input>
          </a-form-item>
          <a-form-item has-feedback name="password">
            <a-input
              v-model:value="formState.password"
              placeholder="密码"
              type="password"
              autocomplete="off"
            >
                <template #prefix><LockOutlined :style="{'color':'#fff'}" /></template>
            </a-input>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" html-type="submit" block>登录</a-button>
            <!-- <a-button style="margin-left: 10px" @click="resetForm"
              >重置</a-button
            > -->
          </a-form-item>
          <a-form-item>
            <div class="moreLogin">
              <span class="pointer" @click="onRegister">立即注册</span>
            </div>
          </a-form-item>
        </a-form>
        
      </div>
    </div>
  </div>
</template>
<script>
import { reactive, ref } from "vue";
import { useStore } from "@/store";
import { useRoute, useRouter } from "vue-router";
import { message } from 'ant-design-vue'
import { UserOutlined, LockOutlined } from "@ant-design/icons-vue";
import axios from "@/plugins/axios"
export default {
  name: "login",
  components: {
    UserOutlined,
    LockOutlined,
    // copyright
  },
  setup() {
    const store = useStore()
    const route = useRoute()
    const router = useRouter()
    const formRef = ref();
    const formState = reactive({
      username: "",
      password: "",
    });
    let validateUserName = async (rule, value) => {
      if (value === "") {
        return Promise.reject("请输入账号");
      } else {
        return Promise.resolve();
      }
    };
    let validatePass = async (rule, value) => {
      if (value === "") {
        return Promise.reject("请输入密码");
      } else {
        return Promise.resolve();
      }
    };

    const rules = {
      username: [{ required: true, validator: validateUserName, trigger: "change" }],
      password: [{ validator: validatePass, trigger: "change" }],
    };
   //获取平台
   const getGateway = async ()=>{
     return new Promise(resolve => {
      axios.get('gateway/deploy').then(res=>{
       resolve(res)
     })
    })
    }
    //获取组织
    const getOrg = async ()=>{
      return new Promise(resolve => {
      axios.get('organization/list').then(res=>{
       resolve(res)
     })
    })
    }
    const handleFinish =  async (values) => {
        const res = await getGateway()
        const type = res.data.type
        await store.dispatch('user/login', values)
        message.success('登录成功！')
        if(type===1){
          // const toPath = decodeURIComponent(route.query.redirect || '/')
          router.replace('/organization/list')
          
        }else{
          const res2 = await getOrg()
          const data = res2.data
          let orgId =''
          if(data.create[0]){
            orgId = data.create[0]
          }else{
            orgId = data.join[0]? data.join[0].id : ''
          }
          sessionStorage.setItem('orgId',orgId)
          router.replace('/')
        }
       
    };
    const handleFinishFailed = (errors) => {
      console.log(errors);
    };
    const resetForm = () => {
      formRef.value.resetFields();
    };
    const onRegister = () => {
      alert('跳转到注册页')
    }
    return {
      formState,
      formRef,
      rules,
      handleFinishFailed,
      handleFinish,
      resetForm,
      onRegister
    };
  },
};
</script>

<style lang="scss" scoped>
.login-page {
  position: relative;
  flex-direction: row;
  width: 100vw;
  min-height: 100vh;
  color: #fff;
  background: rgb(0, 61, 75) url("../img/bg.png") no-repeat;
  background-size: cover;
  .moreLogin{
    text-align: right;
    .pointer {
        cursor: pointer;
        user-select: none;
        color: #509eff;
    }
    .pointer:hover {
        color: #509eff;
    }
  }
  .top {
    flex-grow: 1;
    justify-content: center;
    align-items: center;
    margin-bottom: 10px;
    .content {
      padding: 20px;
      width: 380px;
      justify-content: center;
      border-radius: 8px;
      background-color: rgba(255, 255, 255, 0.06);
      .header {
        margin-bottom: 10px;
        .name {
          p:first-child {
            font-size: 1.5rem;
          }
          p:last-child {
            font-weight: 400;
            font-size: 0.8rem;
          }
        }
        .img {
          // width: 50px;
          margin-right: 20px;
        }
      }
      
      .loginForm {
        margin-top: 10px;
        width: 100%;
        ::v-deep(){
          height: inherit;
          line-height: inherit;
          background-color: rgba(255, 255, 255, 0);
          border-color: rgba(255, 255, 255, 0);
          color: #fff;
          font-size: 15px;
          height:32px;
          line-height: 32px;
        }
      }
    }
  }
  // 小于768
  @media (max-width: 768px) {
    .top {
      padding: 30px 0 0 0;
      .content {
        width: 90%;
        max-width: 380px;
      }
    }
  }
  // 大于992
  @media (min-width: 992px) {
    .top {
      padding: 96px 0px;
      .content {
        width: 380px;
      }
    }
  }
}
</style>

<route lang="yaml">
  meta:
    level: 0
    name: '登录页'
    layout: layouts
</route>