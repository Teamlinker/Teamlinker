import {computed, reactive, onMounted} from 'vue'
import addEventListener from 'ant-design-vue/es/vc-util/Dom/addEventListener'
import classNames from 'ant-design-vue/es/_util/classNames';

const NoopFn = () => {}

/**
 * 列拖拽
 * 
 */
export default function(props, atable){
  const dragState = reactive({
    draging: false,
    startPosX: null,
    startIndex: null,
    startWidth: null,
    startNextWidth: null,
    distance: null,
    columnsWidth: [],
    syncWidth: false,
    toggleSortOrder: null
  })

  let canceListeners = []  

  const updateColumnsWidth = () => {
    if (dragState.draging  !== null && dragState.startIndex  !== null && dragState.distance !== null){
      if (dragState.startIndex < (dragState.columnsWidth.length - 1)){
        dragState.columnsWidth[dragState.startIndex] = dragState.startWidth + dragState.distance
      }
    }
  } 

  const handleCance = () => {
    dragState.draging = false
    dragState.startPosX = null
    dragState.startWidth = null
    dragState.startNextWidth = null
    dragState.startIndex = null
    dragState.distance = null
    canceListeners.forEach(r => r.remove())
    canceListeners = [] 
  }

  const handlMousedown = (index, event) => {
    if (event.currentTarget.style.cursor === 'col-resize'){
      //const {width} = event.target.getBoundingClientRect()
      dragState.draging = true
      dragState.startPosX = event.clientX,
      dragState.startWidth = dragState.columnsWidth[index]
      dragState.startNextWidth = dragState.columnsWidth[index + 1]
      dragState.startIndex = index
    }
    canceListeners[0] = addEventListener(document, 'mouseup', handleCance)
  }
  
  const handlMousemove = (event) => {
    //销毁
    if (!atable.value || !atable.value.$refs){
      return
    }
    event.preventDefault();
    event.stopPropagation();
    const {right, top, bottom} = event.currentTarget.getBoundingClientRect()
    const {clientX, clientY} = event
    event.currentTarget.style.cursor = (dragState.draging === true || (clientY > top && clientY < bottom && clientX < right && clientX > (right - 10))) ? 'col-resize' : ''
    //处理排序冲突问题
    if (event.currentTarget.style.cursor === 'col-resize'){
      atable.value.$refs.table.toggleSortOrder = NoopFn
    } else {
      atable.value.$refs.table.toggleSortOrder = dragState.toggleSortOrder
    }
    if (dragState.draging === true){
      dragState.distance = clientX - dragState.startPosX
      updateColumnsWidth()
    }
  }

  const createCustomHeaderCell = (customHeaderCell, index) => {
    return (col) => {
      let userColProps = typeof customHeaderCell === 'function' ? (customHeaderCell(col) || {}) : (customHeaderCell || {})
      return {
        ...userColProps,
          ...(dragState.syncWidth ? {} : {class: classNames('drag-column-th', userColProps.class || {})}),
        'data-column-index': index, 
        onmousemove: handlMousemove,
        onMousedown: handlMousedown.bind(null, index)
      }
    }
  }

  const supportDragColumns = computed(() => {
    return (props.columns || []).map((col, index) => {
      const useCustomHeaderCell = createCustomHeaderCell(col.customHeaderCell, index)
      let width;
      if (typeof dragState.columnsWidth[index] === 'number'){
        width = dragState.columnsWidth[index] / 1.5
      }
      
      return {
        ...col,
        customHeaderCell: useCustomHeaderCell,
        width:width
      }
    })
  })
  
  const xWidth = computed(() => {
    return supportDragColumns.value.reduce((m, item) => (m + (item.width || 0)), 0)
  })

  onMounted(() => {
    //同步所有列的宽度
    const tbel = atable.value
    const _ = []
    tbel.$el.querySelectorAll('.drag-column-th').forEach($th => {
      const index = $th.getAttribute('data-column-index')
      _[+(index)] = $th.getBoundingClientRect().width
    })
    dragState.columnsWidth = _
    dragState.syncWidth = true
    dragState.toggleSortOrder = atable.value.$refs.table.toggleSortOrder
  })
  

  return {
    supportDragColumns,
    xWidth
  }
}