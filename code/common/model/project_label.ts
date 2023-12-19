import {BaseModel} from "./base"

export interface ICommon_Model_Project_Label {
    id: string,
    name: string,
    project_id: string
}

export const Table_Project_Label = "project_label"

class ProjectLabelModel extends BaseModel {
    table = Table_Project_Label
    model = <ICommon_Model_Project_Label>{}
}

export let projectLabelModel = new ProjectLabelModel