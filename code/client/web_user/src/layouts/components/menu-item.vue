<template>
  <template v-if="!!menuInfo.meta.level">
    <a-sub-menu v-if="menuInfo.children?.length" :key="menuInfo.name" v-bind="$attrs">
      <template #title>
        <span>
          <!-- <icon-font :icon="menuInfo.meta.icon" /> -->
          <IconFonts :icon="menuInfo.meta.icon" />
          <span>{{ menuInfo.meta.name }}</span>
        </span>
      </template>
      <template v-for="item in menuInfo.children" :key="item.name">
        <template v-if="!item.children">
          <a-menu-item :key="item.name">
            <IconFonts :icon="item.meta.icon" />
            <span>{{ item.meta.name }}</span>
          </a-menu-item>
        </template>
        <template v-else>
          <menu-item :key="item.name" :menu-info="item" />
        </template>
      </template>
    </a-sub-menu>
    <template v-else>
      <a-menu-item :key="menuInfo.name">
        <IconFonts :icon="menuInfo.meta.icon" />
        <span>{{ menuInfo.meta.name }}</span>
      </a-menu-item>
    </template>
  </template>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Menu } from 'ant-design-vue'
import { RouterLink } from 'vue-router'
import { Icon } from './ICON.ts'

import IconFonts from '@/components/IconFont'

export default defineComponent({
    name: 'MenuItem',
    components: {
        iconFont:Icon,
        IconFonts,
        RouterLink,
        'a-sub-menu': Menu.SubMenu,
        'a-menu-item': Menu.Item
    },
    props: {
        menuInfo: {
            type: Object,
            default: () => ({})
        }
    }
})
</script>