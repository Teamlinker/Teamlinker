import {RectNode, RectNodeModel} from "@logicflow/core";
import {NodeTextTheme} from "@logicflow/core/types/constant/DefaultTheme";
import {
    ECommon_Model_Workflow_Node_Status,
    ICommon_Model_Workflow_Node
} from "../../../../../../common/model/workflow_node";

class UserTaskModel extends RectNodeModel {
    override getNodeStyle(): { [p: string]: any; width?: number; height?: number; radius?: number; fill?: string; stroke?: string; strokeWidth?: number } {
        const style=super.getNodeStyle();
        style.strokeWidth=0
        let props=this.getProperties() as ICommon_Model_Workflow_Node
        if(props.status==ECommon_Model_Workflow_Node_Status.NOTSTART) {
            style.fill="rgb(215,218,224)"
        } else if(props.status==ECommon_Model_Workflow_Node_Status.INPROGRESS) {
            style.fill="rgb(4,57,192)"
        } else if(props.status==ECommon_Model_Workflow_Node_Status.DONE) {
            style.fill="rgb(15,119,72)"
        }
        if(props.is_all_coming) {
            style.strokeWidth=4
            style.stroke="pink"
        }
        return style
    }

    override getTextStyle(): NodeTextTheme {
        const style=super.getTextStyle();
        let props=this.getProperties() as ICommon_Model_Workflow_Node
        if(props.status==ECommon_Model_Workflow_Node_Status.NOTSTART) {
            style.fill="black"
            style.stroke="black"
        } else if(props.status==ECommon_Model_Workflow_Node_Status.INPROGRESS) {
            style.fill="white"
            style.stroke="white"
        } else if(props.status==ECommon_Model_Workflow_Node_Status.DONE) {
            style.fill="white"
            style.stroke="white"
        }
        style.fontSize=13
        style.strokeWidth=0.8
        return style;
    }

    override initNodeData(data: any) {
        super.initNodeData(data);
        this.width=100
        this.height=40
        this.radius=5
        const circleOnlyAsTarget = {
            message: "",
            validate: (sourceNode, targetNode, sourceAnchor, targetAnchor) => {
                if(targetNode.getProperties().is_all_coming) {
                    return false
                }
                return true
            }
        };
        this.sourceRules.push(circleOnlyAsTarget);
    }
}

class UserTaskView extends RectNode {

}

export const flowNode= {
    type: "node",
    view: UserTaskView,
    model: UserTaskModel
};