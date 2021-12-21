import { Table } from 'ant-design-vue'
import { defineComponent,ref } from "vue";
import omit from 'omit.js';
import { getOptionProps} from 'ant-design-vue/es/_util/props-util'

// import useDragCol from './useDragCol'
import useDragColumn from './useDragColumn'
const ResizableTable = defineComponent({
    name:'ResizableTable',
    props:Table.props,
    setup(props){
        // 传参是否需要拖动表头
        const table = ref(null)
        const dragColumn = useDragColumn(props, table)
        return {
            ...dragColumn,
            table
        }
        
    },
    render(){
        const allProps =  { ...getOptionProps(this), ...this.$attrs};
        const scroll = {...(this.scroll || {})};
        
        // if (this.xWidth > 0){
        //     scroll.x = this.xWidth
        // }
        const tableProps = {
            ...(omit(allProps, ['columns','scroll'])),
            columns: this.supportDragColumns,
            scroll
        }
        return (
            <>
                <a-table {...tableProps} v-slots={this.$slots} ref="table"></a-table>
            </>
        )
    }
})

export default ResizableTable