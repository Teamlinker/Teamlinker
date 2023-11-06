import {Entity} from "../../common/entity/entity";
import {planModel} from "../../../common/model/plan";
import {planMapper, planTableMapper} from "../mapper/plan";
import {IServer_Common_Event_Types} from "../../common/event/types";
import {ECommon_Model_Plan_Table, planTableModel} from "../../../common/model/plan_table";
import {ICommon_Route_Res_Plan_Info_Item} from "../../../common/routes/response";
import {ProjectIssueService} from "./issue";
import {Err} from "../../../common/status/error";
import {WorkflowNodeService} from "./workflow";

export class PlanService extends Entity<typeof planModel,typeof planMapper> {
    constructor() {
        super(planMapper)
    }

    static async list(projectId:string,page:number,size:number,keyword?:string) {
        let ret=await planMapper.list(projectId,page,size,keyword)
        return ret;
    }

    override async delete(eventPublish?: keyof IServer_Common_Event_Types, ...param): Promise<void> {
        await super.delete(eventPublish, ...param);
        await planTableMapper.clearByPlanId(this.getId())
    }

    async info() {
        let ret=await planMapper.info(this.getId())
        return ret;
    }

    static async issuePlanList(projectIssueId:string) {
        let ret=await planMapper.issuePlanList(projectIssueId)
        return ret;
    }

    static async issuePlanEdit(projectIssueId:string,planList: string[]) {
        let objProjectIssue=await ProjectIssueService.getItemById(projectIssueId)
        if(!objProjectIssue) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        let originalList=await this.issuePlanList(projectIssueId)
        let needAddList:string[]=[],needDeleteList:string[]=[]
        for(let id of planList) {
            let index=originalList.findIndex(item=>item.id===id)
            if(index>-1) {
                originalList.splice(index,1)
            } else {
                if(!needAddList.includes(id)) {
                    needAddList.push(id)
                }
            }
        }
        needDeleteList=[...originalList.map(item=>item.id)]
        await Promise.all(needAddList.map(planId=>{
            return (async ()=>{
                let objPlan=await PlanService.getItemById(planId)
                if(!objPlan) {
                    return
                }
                let sort=await PlanTableService.getNewSort(null,planId)
                let obj=new PlanTableService()
                obj.assignItem({
                    plan_id:planId,
                    type:ECommon_Model_Plan_Table.ISSUE,
                    sort:sort,
                    project_id:objPlan.getItem().project_id,
                    ref_id:projectIssueId
                })
                await obj.create()
                let childIssueList=await objProjectIssue.childIssueList()
                if(childIssueList?.length>0) {
                    await Promise.all(childIssueList.map((item,index)=>{
                        let obj1=new PlanTableService()
                        obj1.assignItem({
                            plan_id:planId,
                            type:ECommon_Model_Plan_Table.ISSUE,
                            sort:index,
                            parent_id:obj.getId(),
                            project_id:objPlan.getItem().project_id,
                            ref_id:item.id
                        })
                        return obj1.create()
                    }))
                }
            })()
        }).concat(needDeleteList.map(planId=>{
            return (async ()=>{
                let arr=await PlanTableService.getItemsByExp({
                    plan_id:planId,
                    ref_id:projectIssueId
                })
                for(let obj of arr) {
                    await obj.delete()
                }
            })()
        })))
    }
}

export class PlanTableService extends Entity<typeof planTableModel,typeof planTableMapper> {
    constructor() {
        super(planTableMapper)
    }

    static async getNewSort(planItemId:string,planId:string) {
        let ret=await planTableMapper.getNewSort(planItemId,planId)
        return ret;
    }

    override async delete(eventPublish?: keyof IServer_Common_Event_Types, ...param): Promise<void> {
        let objPlan=await PlanService.getItemById(this.item.plan_id)
        let info=await objPlan.info()
        await super.delete(eventPublish, ...param);
        await planTableMapper.moveUp(this.item.parent_id,this.item.sort,this.item.plan_id)
        let item=this.findItem(this.getId(),info)
        if(item?.children?.length>0) {
            let arr=this.getChildrenIds(item.children)
            await planTableMapper.removeItems(arr)
        }
        await planTableMapper.clearDepend(this.getId())
    }

    findItem(id:string,data:ICommon_Route_Res_Plan_Info_Item[]):ICommon_Route_Res_Plan_Info_Item {
        for(let obj of data) {
            if(obj.id===id) {
                return obj
            }
            if(obj.children?.length>0) {
                let ret=this.findItem(id,obj.children)
                if(ret) {
                    return ret;
                }
            }
        }
    }

    getChildrenIds(data:ICommon_Route_Res_Plan_Info_Item[]) {
        let ret:string[]=[]
        for(let obj of data) {
            ret.push(obj.id)
            if(obj.children?.length>0) {
                ret=ret.concat(this.getChildrenIds(obj.children))
            }
        }
        return ret;
    }

    async hasParentIssue() {
        if(this.getItem().parent_id) {
            let objParent=await PlanTableService.getItemById(this.getItem().parent_id)
            if(objParent) {
                return  objParent.getItem().type===ECommon_Model_Plan_Table.ISSUE
            } else {
                return false
            }
        } else {
            return false;
        }
    }

    async hasChild() {
        let ret=await planTableMapper.hasChild(this.getId())
        return ret;
    }

    async issueInfo() {
        let objProjectIssue=await ProjectIssueService.getItemById(this.getItem().ref_id)
        if(!objProjectIssue) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        let objWorkflow=await WorkflowNodeService.getItemById(objProjectIssue.getItem().workflow_node_id)
        return {
            issue:objProjectIssue.getItem(),
            workflow:objWorkflow.getItem()
        }
    }

    static async moveUp(parentId:string,index:number,planId:string) {
        await planTableMapper.moveUp(parentId,index,planId)
    }

    static async moveDown(parentId:string,index:number,planId:string) {
        await planTableMapper.moveDown(parentId, index, planId)
    }

    static async addChildIssue(projectIssueId:string,projectIssueChildId:string) {
        let arr=await PlanTableService.getItemsByExp({
            ref_id:projectIssueId
        })
        if(arr.length>0) {
            await Promise.all(arr.map(item=>{
                return (async ()=>{
                    let sort=await PlanTableService.getNewSort(item.getId(),item.getItem().plan_id)
                    let obj=new PlanTableService()
                    obj.assignItem({
                        plan_id:item.getItem().plan_id,
                        type:ECommon_Model_Plan_Table.ISSUE,
                        sort:sort,
                        parent_id:item.getId(),
                        project_id:item.getItem().project_id,
                        ref_id:projectIssueChildId
                    })
                    await obj.create()
                })()
            }))
        }
    }

    static async removeIssue(projectIssueId:string) {
        let arr = await PlanTableService.getItemsByExp({
            ref_id: projectIssueId
        })
        await Promise.all(arr.map(item => {
            return item.delete()
        }))
    }

    async clearAllDepend() {
        await planTableMapper.clearDepend(this.getId())
    }
}