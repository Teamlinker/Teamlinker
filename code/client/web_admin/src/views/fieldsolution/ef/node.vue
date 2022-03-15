<template>
    <div
            ref="node"
            :style="nodeContainerStyle"
            @click="clickNode"
            :class="nodeContainerClass"
    >
        <!-- 节点名称 -->
        <div class="ef-node-text" :show-overflow-tooltip="true">
            {{node.name}}
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            node: Object,
            activeElement: Object
        },
        data() {
            return {}
        },
        computed: {
            nodeContainerClass() {
                return {
                    'ef-node-container': true,
                    'ef-node-active': this.activeElement.type == 'node' ? this.activeElement.nodeId === this.node.id : false
                }
            },
            // 节点容器样式
            nodeContainerStyle() {
                return {
                    top: this.node.top,
                    left: this.node.left
                }
            },
            nodeIcoClass() {
                var nodeIcoClass = {}
                nodeIcoClass[this.node.ico] = true
                // 添加该class可以推拽连线出来，viewOnly 可以控制节点是否运行编辑
                nodeIcoClass['flow-node-drag'] = this.node.viewOnly ? false : true
                return nodeIcoClass
            }
        },
        methods: {
            // 点击节点
            clickNode() {
                this.$emit('clickNode', this.node.id,this.node.name)
            },
            // 鼠标移动到节点
            mouseoverNode() {
                this.$emit('mouseoverNode', this.node.id)
            },
             // 鼠标移出节点
            mouseoutNode() {
                // alert(1)
                this.$emit('mouseoutNode', this.node.id)
            },
            // 鼠标移动后抬起
            changeNodeSite() {
                // 避免抖动
                if (this.node.left == this.$refs.node.style.left && this.node.top == this.$refs.node.style.top) {
                    return;
                }
                this.$emit('changeNodeSite', {
                    nodeId: this.node.id,
                    left: this.$refs.node.style.left,
                    top: this.$refs.node.style.top,
                })
            }
        }
    }
</script>
