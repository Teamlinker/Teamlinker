/**
 * 使用表格列伸缩列
 * @param columns
 */
// import { getCurrentInstance } from 'vue'
const useDragCol = (columnsProp) => {
  // headerCell: 用来存储当前更改宽度的Table Cell,避免快速移动鼠标的问题
  let dragging = false
  const handleMouseDown = (event: MouseEvent, column: columnsProp<T>) => {
    const headerCell = column.title[0].el.closest('th')
    if (column.children && column.children.length > 0) return
    dragging = true
    document.onselectstart = function () {
      return false
    }
    document.ondragstart = function () {
      return false
    }
    if (event.offsetX > headerCell.offsetWidth - 10) {
      headerCell.oldX = event.x
      headerCell.oldWidth = headerCell.offsetWidth
    }
    const handleMouseMove = (event: MouseEvent) => {
      headerCell.style.cursor = 'default'
      if (headerCell.oldWidth + (event.x - headerCell.oldX) > 0) {
        headerCell.width = headerCell.oldWidth + (event.x - headerCell.oldX)
      }
      headerCell.style.width = headerCell.width
      headerCell.style.cursor = 'col-resize'
    }
    const handleMouseUp = () => {
      if(dragging){
        dragging = false;
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.onselectstart = null
        document.ondragstart = null
      }
    }
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }
  columnsProp.forEach((item) => {
    item.customHeaderCell = (columns) => ({
      onmousedown: (event) => {handleMouseDown(event,columns)},
      onmouseout: () => {
        document.body.style.cursor = ''
      }
    })
  })
}
export default useDragCol