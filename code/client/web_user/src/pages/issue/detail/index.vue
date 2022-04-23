<template>
  <div>
    <div class="title">
      <span>{{ baseInfo.issueType.name }}</span
      ><span>{{ baseInfo.name }}</span>
    </div>
    <div class="left">
      <div style="margin-bottom: 20px">Description</div>
      <div v-if="!isDescInput" @click="addDesc">
        {{ descriptionInfo ? descriptionInfo : 'Add a description' }}
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
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, reactive, toRefs } from 'vue'
import { useRoute } from 'vue-router'
import axios from '@/plugins/axios'
export default defineComponent({
  setup() {
    const state: any = reactive({
      baseInfo: { issueType: {}, name: '' },
      descriptionInfo: '',
      descValue: '',
      isDescInput: false
    })
    const route = useRoute()
    const query = route.query
    const getBaseInfo = () => {
      axios.get('/issue/item/basic', { params: query }).then((res: any) => {
        state.baseInfo = res.data
      })
    }
    const getDescInfo = () => {
      axios
        .get('/issue/item/description', { params: query })
        .then((res: any) => {
          state.descriptionInfo = res.data
        })
    }
    getBaseInfo()
    getDescInfo()
    const addDesc = () => {
      state.isDescInput = true
      state.descValue = state.descriptionInfo
    }
    const cancel = () => {
      state.isDescInput = false
    }
    const save = () => {
      const params = {
        projectIssueId: query.projectIssueId,
        description: state.descValue
      }
      axios.put('/issue/item/description', params).then(() => {
        state.isDescInput = false
        getDescInfo()
      })
    }
    return {
      addDesc,
      cancel,
      save,
      ...toRefs(state)
    }
  }
})
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
}
</style>