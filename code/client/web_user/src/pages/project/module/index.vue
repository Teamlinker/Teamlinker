<template>
  <div>
    <div class="cont">
      <div class="module-list">
        <a-input-search
          v-model:value="searchValue"
          style="margin-bottom: 8px; width: 300px"
          placeholder="Search"
        />
        <a-tree
          draggable
          block-node
          :expanded-keys="expandedKeys"
          :auto-expand-parent="autoExpandParent"
          :tree-data="treeData"
          @expand="onExpand"
          @select="selectTreeNode"
          @dragenter="onDragEnter"
          @drop="onDrop"
        >
          <template #title="{ key: treeKey, title }">
            <a-dropdown :trigger="['contextmenu']">
              <span v-if="title.indexOf(searchValue) > -1">
                {{ title.substr(0, title.indexOf(searchValue)) }}
                <span style="color: #f50">{{ searchValue }}</span>
                {{
                  title.substr(title.indexOf(searchValue) + searchValue.length)
                }}
              </span>
              <span v-else>{{ title }}</span>
              <template #overlay>
                <a-menu
                  @click="
                    ({ key: menuKey }) =>
                      onContextMenuClick(title, treeKey, menuKey)
                  "
                >
                  <a-menu-item key="1">编辑</a-menu-item>
                  <a-menu-item key="2">删除</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </template>
        </a-tree>
      </div>
      <div class="add-module">
        <a-button @click="addModule" type="primary">添加模块</a-button>
      </div>
    </div>
    <a-modal v-model:visible="visible" title="添加模块" @ok="handleOk">
      <a-form
        ref="formRef"
        :model="formState"
        :rules="rules"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-form-item label="模块名称" name="name">
          <a-input v-model:value="formState.name" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script lang="ts">
interface FormState {
  name: string
  projectId: string
}
import { DownOutlined } from '@ant-design/icons-vue'
import _ from 'lodash'
import { defineComponent, ref, UnwrapRef, reactive, watch } from 'vue'
import axios from '@/plugins/axios'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import type {
  AntTreeNodeDragEnterEvent,
  AntTreeNodeDropEvent,
  TreeProps
} from 'ant-design-vue/es/tree'
export default defineComponent({
  name: '添加标签',
  components: {
    DownOutlined
  },
  setup() {
    const treeData = ref<string[]>([])
    const router = useRouter()
    const visible = ref<boolean>(false)
    const searchValue = ref<string>('')
    const expandedKeys = ref<(string | number | undefined | null)[]>([])
    const backupsExpandedKeys = ref<(string | number | undefined | null)[]>([])
    const autoExpandParent = ref<boolean>(true)
    const formRef = ref()
    const projectId = ref<string>('')
    const parentModuleId = ref<string>('')
    const moduleId = ref<string>('')
    let formState: UnwrapRef<FormState> = reactive({
      name: '',
      projectId: ''
    })
    const rules = reactive({
      name: [
        {
          required: true,
          message: '请输入模块名称',
          trigger: 'blur'
        }
      ]
    })
    const addModule = () => {
      visible.value = true
      formState.name = ''
      moduleId.value = ''
    }
    //编辑和新建模块
    const handleOk = (e: MouseEvent) => {
      formRef.value.validate().then(() => {
        if (moduleId.value) {
          const params = {
            name: formState.name,
            moduleId: moduleId.value
          }
          axios.put('project/module/item', params).then(() => {
            message.success('编辑成功')
            visible.value = false
            initData()
          })
        } else {
          const params: any = {
            name: formState.name,
            projectId: projectId.value
          }
          if (parentModuleId.value) {
            params.parentModuleId = parentModuleId.value
          } else {
            params.parentModuleId = null
          }
          axios.post('project/module/item', params).then(() => {
            message.success('创建成功')
            visible.value = false
            initData()
          })
        }
      })
    }
    //树形数据转换
    const TreeMap = (list: []): any => {
      return list.map((v: any) => {
        return {
          children: v.data.length ? TreeMap(v.data) : [],
          title: v.name,
          key: v.id
        }
      })
    }
    //选中节点
    const selectTreeNode = (val: Array<string>) => {
      parentModuleId.value = val.length ? val[0] : ''
    }
    const getParentKey = (
      key: string | number,
      tree: any
    ): string | number | undefined => {
      let parentKey
      for (let i = 0; i < tree.length; i++) {
        const node = tree[i]
        if (node.children) {
          if (node.children.some((item: any) => item.key === key)) {
            parentKey = node.key
          } else if (getParentKey(key, node.children)) {
            parentKey = getParentKey(key, node.children)
          }
        }
      }
      return parentKey
    }
    // 获取节点中含有value的所有key集合
    const getkeyList = (value: string, tree: any, keyList: any) => {
      for (let i = 0; i < tree.length; i++) {
        const node = tree[i]
        if (node.title.indexOf(value) > -1) {
          keyList.push(node.key)
        }
        if (node.children) {
          getkeyList(value, node.children, keyList)
        }
      }
      return keyList
    }

    // 获取该节点的所有祖先节点
    const getAllParentKey = (key: any, tree: any) => {
      let parentKey: any
      if (key) {
        parentKey = getParentKey(key, tree)
        if (parentKey) {
          if (!backupsExpandedKeys.value.some((item) => item === parentKey)) {
            backupsExpandedKeys.value.push(parentKey)
          }
          getAllParentKey(parentKey, tree)
        }
      }
    }
    //监听搜索
    watch(searchValue, (value) => {
      if (value === '') {
        expandedKeys.value = []
      } else {
        expandedKeys.value = []
        backupsExpandedKeys.value = []
        const candidateKeysList = getkeyList(value, treeData.value, [])
        candidateKeysList.forEach((item: any) => {
          const key = getParentKey(item, treeData.value)
          if (key && !backupsExpandedKeys.value.some((item) => item === key))
            backupsExpandedKeys.value.push(key)
        })
        const { length } = backupsExpandedKeys.value
        for (let i = 0; i < length; i++) {
          getAllParentKey(backupsExpandedKeys.value[i], treeData.value)
        }
        expandedKeys.value = backupsExpandedKeys.value.slice()
      }
    })
    //展开
    const onExpand = (keys: string[]) => {
      expandedKeys.value = keys
      autoExpandParent.value = false
    }
    //右键菜单
    const onContextMenuClick = (
      title: string,
      treeKey: string,
      menuKey: string
    ) => {
      console.log(`treeKey: ${treeKey}, menuKey: ${menuKey}`)
      if (menuKey === '1') {
        visible.value = true
        formState.name = title
        moduleId.value = treeKey
      } else {
        const params = {
          moduleId: treeKey
        }
        axios
          .delete('/project/module/item', { params: params })
          .then((res: any) => {
            console.log(res, 'resss')
            message.success('删除成功')
            initData()
          })
      }
    }
    //拖拽
    const onDragEnter = (info: AntTreeNodeDragEnterEvent) => {
      expandedKeys.value = info.expandedKeys
    }
    const onDrop = (info: AntTreeNodeDropEvent) => {
      console.log(info)
      const dropKey = info.node.eventKey
      const dragKey = info.dragNode.eventKey
      let params = {
        parentModuleId: dropKey,
        moduleId: dragKey
      }
      axios.put('project/module/item', params).then(() => {
        // message.success("创建成功");
        visible.value = false
        initData()
      })
    }
    //加载模块
    let initData = () => {
      const id = router.currentRoute.value.query.projectId
      if (typeof id === 'string') {
        projectId.value = id
      }
      const params = {
        projectId: id
      }
      axios.get('project/module/list', { params: params }).then((res: any) => {
        console.log(res, 'resss')
        const data = TreeMap(res.data)
        console.log(data, 'treeData')
        treeData.value = data
      })
    }
    initData()
    return {
      treeData,
      visible,
      formRef,
      labelCol: {
        span: 4
      },
      wrapperCol: {
        span: 14
      },
      formState,
      rules,
      addModule,
      handleOk,
      parentModuleId,
      moduleId,
      selectTreeNode,
      expandedKeys,
      searchValue,
      autoExpandParent,
      onContextMenuClick,
      onExpand,
      onDragEnter,
      onDrop
    }
  }
})
</script>
<route lang="yaml">
meta:
  level: 1
  name: "模块"
  icon: "DashboardOutlined"
  layout: auth
</route>
<style scoped lang="scss">
.cont {
  display: flex;
  padding: 20px;
  .module-list {
    flex: 1;
  }
  .add-module {
    margin-left: 150px;
  }
}
</style>
