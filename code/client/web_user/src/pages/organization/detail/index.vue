<template>
  <div>
    <div class="detail">
      <div class="name" @click="goIndex">
        组织名称：{{orgDetail.name}}
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent,ref} from 'vue'
import axios from '@/plugins/axios'
import {useRoute,useRouter} from 'vue-router'
export default defineComponent({
  setup() {
    const orgDetail= ref([])
    const route = useRoute()
    const id = route.query.id
    const type = route.query.type
    const params = {
        organizationId:id
    }
    const getOrgDetail = () => {
      axios.get('organization/item',{ params: params }).then((res: any) => {
         orgDetail.value = res.data
      })
    }
    const router = useRouter()
    const goIndex = ()=>{
      router.push('/')
    }
    getOrgDetail()
    return {
      orgDetail,
      goIndex
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
.detail{
    padding:20px 30px;
}
</style>