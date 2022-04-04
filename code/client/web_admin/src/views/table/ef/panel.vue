<template>
  <div v-if="easyFlowVisible" style="height: calc(100vh)">
    <el-row>
      <!--顶部工具菜单-->
      <el-col :span="24">
        <div class="ef-tooltar">
          <div class="workflow-title">{{ title }}</div>
          <div class="workflow-description">{{ description }}</div>
        </div>
      </el-col>
    </el-row>
    <div style="display: flex; height: calc(100% - 47px)">
      <div style="width: 230px; border-right: 1px solid #dce3e8">
        <node-menu @addNode="addNode" ref="nodeMenu"></node-menu>
      </div>
      <div id="efContainer" ref="efContainer" class="container" v-flowDrag>
        <template v-for="node in data.nodeList">
          <flow-node
            :id="node.id"
            :key="node.id"
            :node="node"
            :activeElement="activeElement"
            @changeNodeSite="changeNodeSite"
            @nodeRightMenu="nodeRightMenu"
            @clickNode="clickNode"
            @mouseoverNode="mouseoverNode"
            @mouseoutNode="mouseoutNode"
          >
          </flow-node>
        </template>
        <!-- 给画布一个默认的宽度和高度 -->
        <div style="position: absolute; top: 2000px; left: 2000px">&nbsp;</div>
      </div>
      <!-- 右侧表单 -->
      <div
        style="width: 300px; border-left: 1px solid #dce3e8; background-color: #fbfbfb"
      >
        <flow-node-form
          ref="nodeForm"
          @editAction="editAction"
          @repaintEverything="repaintEverything"
          @deleteElement="deleteElement"
        ></flow-node-form>
      </div>
    </div>
    <flow-help v-if="flowHelpVisible" ref="flowHelp"></flow-help>
    <add-action
      ref="addActonForm"
      :actionVisible="actionVisible"
      @addAction="addAction"
      @cancelSaveLine="cancelSaveLine"
    ></add-action>
  </div>
</template>

<script>
import draggable from "vuedraggable";
import { jsPlumb } from "jsplumb";
import { easyFlowMixin } from "./mixins";
import flowNode from "./node";
import nodeMenu from "./node_menu";
import FlowNodeForm from "./node_form";
import AddAction from "./action.vue";
import lodash from "lodash";
import {
  addNode,
  editNode,
  deleteNode,
  workflowDetail,
  addAction,
  editAction,
} from "@/api/workflow";
export default {
  data() {
    return {
      title: "",
      description: "",
      // jsPlumb 实例
      jsPlumb: null,
      // 控制画布销毁
      easyFlowVisible: true,
      // 是否加载完毕标志位
      loadEasyFlowFinish: false,
      flowHelpVisible: false,
      // 数据
      data: { name: "1" },
      // 激活的元素、可能是节点、可能是连线
      activeElement: {
        // 可选值 node 、line
        type: undefined,
        // 节点ID
        nodeId: undefined,
        // 连线ID
        sourceId: undefined,
        targetId: undefined,
      },
      zoom: 0.5,
      actionVisible: false,
    };
  },
  // 一些基础配置移动该文件中
  mixins: [easyFlowMixin],
  components: {
    draggable,
    flowNode,
    nodeMenu,
    FlowNodeForm,
    AddAction,
  },
  directives: {
    flowDrag: {
      bind(el, binding, vnode, oldNode) {
        if (!binding) {
          return;
        }
        el.onmousedown = (e) => {
          if (e.button == 2) {
            // 右键不管
            return;
          }
          //  鼠标按下，计算当前原始距离可视区的高度
          let disX = e.clientX;
          let disY = e.clientY;
          el.style.cursor = "move";

          document.onmousemove = function (e) {
            // 移动时禁止默认事件
            e.preventDefault();
            const left = e.clientX - disX;
            disX = e.clientX;
            el.scrollLeft += -left;

            const top = e.clientY - disY;
            disY = e.clientY;
            el.scrollTop += -top;
          };

          document.onmouseup = function (e) {
            el.style.cursor = "auto";
            document.onmousemove = null;
            document.onmouseup = null;
          };
        };
      },
    },
  },
  created() {
    this.workflowId = this.$route.query.workflowId;
  },
  mounted() {
    this.jsPlumb = jsPlumb.getInstance();
    this.$nextTick(() => {
      // 默认加载流程A的数据、在这里可以根据具体的业务返回符合流程数据格式的数据即可
      workflowDetail({
        workflowId: this.workflowId,
      }).then((res) => {
        const data = res.data.data;
        this.title = res.data.name;
        this.description = res.data.description;
        const nodes = data.nodes.map((item) => {
          return {
            ...item,
            left: item.x + "px",
            top: item.y + "px",
            ico: "el-icon-time",
          };
        });
        const lines = data.actions.map((item) => {
          return {
            ...item,
            from: item.source_node_id,
            to: item.dest_node_id,
            label: item.name,
            description: item.description,
          };
        });
        const workflowInfo = {
          name: data.name,
          nodeList: nodes,
          lineList: lines,
        };
        this.dataReload(workflowInfo);
      });
      document.addEventListener("click", (e) => {
        if (e.target.id === "efContainer") {
          for (let i = 0; i < this.data.nodeList.length; i++) {
            const nodeId = this.data.nodeList[i].id;
            this.hideEndPoint(nodeId);
          }
        }
      });
    });
  },
  methods: {
    jsPlumbInit() {
      this.jsPlumb.ready(() => {
        // 导入默认配置
        this.jsPlumb.importDefaults(this.jsplumbSetting);
        // 会使整个jsPlumb立即重绘。
        this.jsPlumb.setSuspendDrawing(false, true);
        // 初始化节点
        this.loadEasyFlow();
        // 单点击了连接线, https://www.cnblogs.com/ysx215/p/7615677.html
        this.jsPlumb.bind("click", (conn, originalEvent) => {
          this.activeElement.type = "line";
          this.activeElement.sourceId = conn.sourceId;
          this.activeElement.targetId = conn.targetId;
          let id = "";
          let description = "";
          this.data.lineList.forEach(function (line) {
            if (line.from == conn.sourceId && line.to == conn.targetId) {
              id = line.id;
              description = line.description;
            }
          });
          this.$refs.nodeForm.lineInit({
            id: id,
            description: description,
            from: conn.sourceId,
            to: conn.targetId,
            label: conn.getLabel(),
          });
        });

        for (let i = 0; i < this.data.nodeList.length; i++) {
          let node = this.data.nodeList[i]; // 设置源点，可以拖出线连接其他节点
          if (!node.viewOnly) {
            this.jsPlumb.draggable(node.id, {
              containment: "parent",
              stop: function (el) {
                // 拖拽节点结束后的对调
                console.log("拖拽结束: ", el);
              },
            });
          }
        }

        // 连线
        this.jsPlumb.bind("connection", (evt) => {
          if (this.loadEasyFlowFinish) {
            this.actionSourceId = evt.sourceId;
            this.actionTargetId = evt.targetId;
            this.data.lineList.push({
              from: this.actionSourceId,
              to: this.actionTargetId,
            });

            this.actionVisible = true;
            for (let i = 0; i < this.data.nodeList.length; i++) {
              const nodeId = this.data.nodeList[i].id;
              this.hideEndPoint(nodeId);
            }
          }
        });
        this.jsPlumb.bind("beforeDrag", (evt) => {
          for (let i = 0; i < this.data.nodeList.length; i++) {
            let node = this.data.nodeList[i]; // 设置源点，可以拖出线连接其他节点
            let nodeId = node.id;
            this.jsPlumb.addEndpoint(
              nodeId,
              { anchors: "TopCenter" },
              this.sourceEndPoint
            );
            this.jsPlumb.addEndpoint(
              nodeId,
              { anchors: "RightMiddle" },
              this.sourceEndPoint
            );
            this.jsPlumb.addEndpoint(
              nodeId,
              { anchors: "BottomCenter" },
              this.sourceEndPoint
            );
            this.jsPlumb.addEndpoint(
              nodeId,
              { anchors: "LeftMiddle" },
              this.sourceEndPoint
            );
            // let anchorNumber = 4
            // let differenceValue = 1 / (anchorNumber + 1)
            // let x = 0
            // for (let i = 0; i < anchorNumber; i++) {
            //   this.jsPlumb.addEndpoint(
            //     node.id,
            //     {
            //       anchor: [(x += differenceValue), 0, 0, -1] // type: 'target', // num: -1
            //     },
            //     this.sourceEndPoint
            //   )
            // } // this.jsPlumb.makeSource( //   node.id, //   lodash.merge(this.jsplumbSourceOptions, {}) // ) // // // 设置目标点，其他源点拖出的线可以连接该节点 // this.jsPlumb.makeTarget(node.id, this.jsplumbTargetOptions)
            if (!node.viewOnly) {
              this.jsPlumb.draggable(node.id, {
                containment: "parent",
                stop: function (el) {
                  // 拖拽节点结束后的对调
                  console.log("拖拽结束: ", el);
                },
              });
            }
          }
        });
        this.jsPlumb.bind("connectionAborted", (evt) => {
          for (let i = 0; i < this.data.nodeList.length; i++) {
            const nodeId = this.data.nodeList[i].id;
            if (nodeId !== this.activeElement.nodeId) {
              this.hideEndPoint(nodeId);
            }
          }
        });
        // 删除连线回调
        this.jsPlumb.bind("connectionDetached", (evt) => {
          this.deleteLine(evt.sourceId, evt.targetId);
        });

        // 改变线的连接节点
        this.jsPlumb.bind("connectionMoved", (evt) => {
          this.changeLine(evt.originalSourceId, evt.originalTargetId);
        });

        // 连线右击
        this.jsPlumb.bind("contextmenu", (evt) => {
          console.log("contextmenu", evt);
        });

        // 连线
        this.jsPlumb.bind("beforeDrop", (evt) => {
          let from = evt.sourceId;
          let to = evt.targetId;
          if (from === to) {
            this.$message.error("节点不支持连接自己");
            return false;
          }
          if (this.hasLine(from, to)) {
            this.$message.error("该关系已存在,不允许重复创建");
            return false;
          }
          // if (this.hashOppositeLine(from, to)) {
          //     this.$message.error('不支持两个节点之间连线回环');
          //     return false
          // }
          // this.$message.success('连接成功')
          return true;
        });

        // beforeDetach
        this.jsPlumb.bind("beforeDetach", (evt) => {
          console.log("beforeDetach", evt);
        });
        this.jsPlumb.setContainer(this.$refs.efContainer);
      });
    },
    cancelSaveLine() {
      this.actionVisible = false;
      var connections = this.jsPlumb.getAllConnections();
      for (let i in connections) {
        if (
          connections[i].sourceId === this.actionSourceId &&
          connections[i].targetId === this.actionTargetId
        ) {
          // 删除相匹配的线
          this.jsPlumb.deleteConnection(connections[i]); // deleteConnection(@) 删除链接线  @线对象
          this.deleteLine(this.actionSourceId, this.actionTargetId);
          break;
        }
      }
    },
    //隐藏端点
    hideEndPoint(nodeId) {
      this.jsPlumb.hide(nodeId, true);
      this.jsPlumb.show(nodeId); // 显示节点的所有连线
    },
    addAction(line) {
      const { name, description } = line;
      addAction({
        name: name,
        description: description,
        workflowId: this.workflowId,
        sourceNodeId: this.actionSourceId,
        destNodeId: this.actionTargetId,
      }).then((res) => {
        this.actionVisible = false;
        const data = res.data;
        const { source_node_id, dest_node_id, id, name, description } = data;
        this.setLineLabel({
          id: id,
          from: source_node_id,
          to: dest_node_id,
          label: name,
          description: description,
        });
        this.$refs.addActonForm.clearActionForm();
      });
    },
    // 加载流程图
    loadEasyFlow() {
      // 初始化连线
      for (var i = 0; i < this.data.lineList.length; i++) {
        let line = this.data.lineList[i];
        var connParam = {
          source: line.from,
          target: line.to,
          label: line.label ? line.label : "",
          connector: line.connector ? line.connector : "",
          anchors: line.anchors ? line.anchors : "",
          paintStyle: line.paintStyle ? line.paintStyle : undefined,
        };
        this.jsPlumb.connect(connParam, this.jsplumbConnectOptions);
      }
      this.$nextTick(function () {
        this.loadEasyFlowFinish = true;
      });
    },
    // 设置连线条件
    setLineLabel(line) {
      console.log(line, "line");
      const { from, to, label, id, description } = line;
      var conn = this.jsPlumb.getConnections({
        source: from,
        target: to,
      })[0];
      conn.setLabel({
        label: label,
      });
      this.data.lineList.forEach(function (line) {
        if (line.from == from && line.to == to) {
          line.id = id;
          line.label = label;
          line.description = description;
        }
      });
      if (!label || label === "") {
        conn.removeClass("flowLabel");
        conn.addClass("emptyFlowLabel");
      } else {
        conn.addClass("flowLabel");
      }
    },
    editAction(line) {
      const params = {
        ...line,
        workflowActionId: line.id,
        name: line.label,
      };
      editAction(params).then(() => {
        this.data.lineList.forEach((item) => {
          if (item.from == line.from && item.to == line.to) {
            item.label = line.label;
            item.description = line.description;
            this.setLineLabel(item);
          }
        });
      });
    },
    // 删除激活的元素
    deleteElement() {
      if (this.activeElement.type === "node") {
        this.deleteNode(this.activeElement.nodeId, this.activeElement.nodeName);
      } else if (this.activeElement.type === "line") {
        this.$confirm("确定删除所点击的线吗?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(() => {
            var conn = this.jsPlumb.getConnections({
              source: this.activeElement.sourceId,
              target: this.activeElement.targetId,
            })[0];
            this.jsPlumb.deleteConnection(conn);
          })
          .catch(() => {});
      }
    },
    // 删除线
    deleteLine(from, to) {
      this.data.lineList = this.data.lineList.filter(function (line) {
        if (line.from == from && line.to == to) {
          return false;
        }
        return true;
      });
    },
    // 改变连线
    changeLine(oldFrom, oldTo) {
      this.deleteLine(oldFrom, oldTo);
    },
    // 改变节点的位置
    changeNodeSite(data) {
      const params = {
        workflowNodeId: data.nodeId,
        x: data.left.substring(0, data.left.length - 2),
        y: data.top.substring(0, data.top.length - 2),
      };
      editNode(params).then(() => {
        for (var i = 0; i < this.data.nodeList.length; i++) {
          let node = this.data.nodeList[i];
          if (node.id === data.nodeId) {
            node.left = data.left;
            node.top = data.top;
          }
        }
      });
    },
    /**
     * 拖拽结束后添加新的节点
     * @param evt
     * @param nodeMenu 被添加的节点对象
     * @param mousePosition 鼠标拖拽结束的坐标
     */
    addNode(evt, nodeMenu, mousePosition) {
      var screenX = evt.originalEvent.clientX,
        screenY = evt.originalEvent.clientY;
      let efContainer = this.$refs.efContainer;
      var containerRect = efContainer.getBoundingClientRect();
      var left = screenX,
        top = screenY;
      // 计算是否拖入到容器中
      if (
        left < containerRect.x ||
        left > containerRect.width + containerRect.x ||
        top < containerRect.y ||
        containerRect.y > containerRect.y + containerRect.height
      ) {
        this.$message.error("请把节点拖入到画布中");
        return;
      }
      left = left - containerRect.x + efContainer.scrollLeft;
      top = top - containerRect.y + efContainer.scrollTop;
      // 居中
      left -= 85;
      top -= 16;
      // 动态生成名字
      var origName = nodeMenu.name;
      var nodeName = origName;
      var index = 1;
      while (index < 10000) {
        var repeat = false;
        for (var i = 0; i < this.data.nodeList.length; i++) {
          let node = this.data.nodeList[i];
          if (node.name === nodeName) {
            nodeName = origName + index;
            repeat = true;
          }
        }
        if (repeat) {
          index++;
          continue;
        }
        break;
      }
      var node = {
        workflowId: this.workflowId,
        name: nodeName,
        x: left,
        y: top,
        status: 1,
      };
      addNode(node).then((res) => {
        const nodeInfo = Object.assign({}, node, res.data);
        nodeInfo.left = nodeInfo.x + "px";
        nodeInfo.top = nodeInfo.y + "px";
        nodeInfo.ico = nodeMenu.ico;
        const nodeId = nodeInfo.id;
        this.data.nodeList.push(nodeInfo);
        this.$refs.nodeForm.nodeInit(this.data, nodeId);
        this.$nextTick(() => {
          this.jsPlumb.draggable(nodeId, {
            containment: "parent",
            stop: function (el) {
              // 拖拽节点结束后的对调
              console.log("拖拽结束: ", el);
            },
          });
        });
      });
    },
    /**
     * 删除节点
     * @param nodeId 被删除节点的ID
     */
    deleteNode(nodeId, nodeName) {
      this.$confirm("确定要删除节点" + nodeName + "?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        closeOnClickModal: false,
      })
        .then(() => {
          deleteNode({
            workflowNodeId: nodeId,
          });
          this.data.nodeList = this.data.nodeList.filter(function (node) {
            if (node.id === nodeId) {
              // 伪删除，将节点隐藏，否则会导致位置错位
              // node.show = false
              return false;
            }
            return true;
          });
          this.$nextTick(function () {
            this.jsPlumb.removeAllEndpoints(nodeId);
          });
        })
        .catch(() => {});
      return true;
    },
    nodeAddPoint(nodeId) {
      const point1 = this.jsPlumb.addEndpoint(
        nodeId,
        { anchors: "TopCenter" },
        this.sourceEndPoint
      );
      const point2 = this.jsPlumb.addEndpoint(
        nodeId,
        { anchors: "RightMiddle" },
        this.sourceEndPoint
      );
      const point3 = this.jsPlumb.addEndpoint(
        nodeId,
        { anchors: "BottomCenter" },
        this.sourceEndPoint
      );
      const point4 = this.jsPlumb.addEndpoint(
        nodeId,
        { anchors: "LeftMiddle" },
        this.sourceEndPoint
      );
    },
    mouseoverNode(nodeId) {
      this.nodeAddPoint(nodeId);
      for (let i = 0; i < this.data.nodeList.length; i++) {
        const nodeId2 = this.data.nodeList[i].id;
        if (nodeId2 !== nodeId) {
          this.hideEndPoint(nodeId2);
        }
      }
    },
    mouseoutNode(nodeId) {},
    clickNode(nodeId, nodeName) {
      this.nodeAddPoint(nodeId);
      for (let i = 0; i < this.data.nodeList.length; i++) {
        const nodeId2 = this.data.nodeList[i].id;
        if (nodeId2 !== nodeId) {
          this.hideEndPoint(nodeId2);
        }
      }
      this.activeElement.type = "node";
      this.activeElement.nodeId = nodeId;
      this.activeElement.nodeName = nodeName;
      this.$refs.nodeForm.nodeInit(this.data, nodeId);
    },
    // 是否具有该线
    hasLine(from, to) {
      for (var i = 0; i < this.data.lineList.length; i++) {
        var line = this.data.lineList[i];
        if (line.from === from && line.to === to) {
          return true;
        }
      }
      return false;
    },
    // 是否含有相反的线
    hashOppositeLine(from, to) {
      return this.hasLine(to, from);
    },
    nodeRightMenu(nodeId, evt) {
      this.menu.show = true;
      this.menu.curNodeId = nodeId;
      this.menu.left = evt.x + "px";
      this.menu.top = evt.y + "px";
    },
    repaintEverything(node) {
      const params = {
        workflowNodeId: node.id,
        name: node.name,
        description: node.description,
        status: node.status,
      };
      editNode(params).then(() => {
        this.jsPlumb.repaint();
      });
    },
    // 流程数据信息
    dataInfo() {
      this.flowInfoVisible = true;
      this.$nextTick(function () {
        this.$refs.flowInfo.init();
      });
    },
    // 加载流程图
    dataReload(data) {
      this.easyFlowVisible = false;
      this.data.nodeList = [];
      this.data.lineList = [];
      this.$nextTick(() => {
        data = lodash.cloneDeep(data);
        this.easyFlowVisible = true;
        this.data = data;
        this.$nextTick(() => {
          this.jsPlumb = jsPlumb.getInstance();
          this.$nextTick(() => {
            this.jsPlumbInit();
          });
        });
      });
    },
    zoomAdd() {
      if (this.zoom >= 1) {
        return;
      }
      this.zoom = this.zoom + 0.1;
      this.$refs.efContainer.style.transform = `scale(${this.zoom})`;
      this.jsPlumb.setZoom(this.zoom);
    },
    zoomSub() {
      if (this.zoom <= 0) {
        return;
      }
      this.zoom = this.zoom - 0.1;
      this.$refs.efContainer.style.transform = `scale(${this.zoom})`;
      this.jsPlumb.setZoom(this.zoom);
    },
  },
};
</script>
