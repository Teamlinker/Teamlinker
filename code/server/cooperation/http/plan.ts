import {DComponent} from "../../common/decorate/component";
import {DHttpApi, DHttpController, DHttpReqParam, DHttpReqParamRequired, DHttpUser} from "../../common/http/http";
import planApi from "../../../common/routes/plan";
import {PlanService, PlanTableService} from "../service/plan";
import {Err} from "../../../common/status/error";
import {IUserSession} from "../../user/types/config";
import {ECommon_Model_Plan_Table} from "../../../common/model/plan_table";
import {ProjectIssueService} from "../service/issue";
import {ECommon_Model_Workflow_Node_Status} from "../../../common/model/workflow_node";

@DComponent
@DHttpController(planApi)
class PlanController {
    @DHttpApi(planApi.routes.listPlan)
    async listPlan(@DHttpReqParamRequired("projectId") projectId: string, @DHttpReqParamRequired("page") page: number, @DHttpReqParamRequired("size") size: number, @DHttpReqParam("keyword") keyword: string): Promise<typeof planApi.routes.listPlan.res> {
        let list=await PlanService.list(projectId,page,size,keyword)
        return list
    }

    @DHttpApi(planApi.routes.plan)
    async plan(@DHttpReqParamRequired("planId") planId: string): Promise<typeof planApi.routes.plan.res> {
        let obj=await PlanService.getItemById(planId)
        if(!obj) {
            throw Err.Project.Plan.planNotFound
        }
        return obj.getItem()
    }

    @DHttpApi(planApi.routes.createPlan)
    async createPlan(@DHttpReqParamRequired("projectId") projectId: string,@DHttpReqParamRequired("name") name: string,@DHttpReqParamRequired("startTime") startTime: number,@DHttpUser user:IUserSession): Promise<typeof planApi.routes.createPlan.res> {
        let obj=new PlanService()
        obj.assignItem({
            project_id:projectId,
            name,
            start_time:new Date(startTime),
            organization_id:user.organizationInfo.organizationId,
            organization_user_id:user.organizationInfo.organizationUserId
        })
        let ret=await obj.create()
        return ret;
    }

    @DHttpApi(planApi.routes.editPlan)
    async editPlan(@DHttpReqParamRequired("planId") planId: string,@DHttpReqParam("name") name: string,@DHttpReqParam("startTime") startTime: number): Promise<typeof planApi.routes.editPlan.res> {
        let obj=await PlanService.getItemById(planId)
        if(!obj) {
            throw Err.Project.Plan.planNotFound
        }
        obj.assignItem({
            name,
            ...(startTime && {
                start_time:new Date(startTime)
            })
        })
        let ret=await obj.update()
        return ret;
    }

    @DHttpApi(planApi.routes.removePlan)
    async removePlan(@DHttpReqParamRequired("planId") planId: string): Promise<typeof planApi.routes.removePlan.res> {
        let obj=await PlanService.getItemById(planId)
        if(!obj) {
            throw Err.Project.Plan.planNotFound
        }
        await obj.delete()
        return
    }

    @DHttpApi(planApi.routes.info)
    async info(@DHttpReqParamRequired("planId") planId: string): Promise<typeof planApi.routes.info.res> {
        let obj=await PlanService.getItemById(planId)
        if(!obj) {
            throw Err.Project.Plan.planNotFound
        }
        let ret=await obj.info()
        return {
            ...obj.getItem(),
            data:ret
        };
    }

    @DHttpApi(planApi.routes.createStage)
    async createStage(@DHttpReqParamRequired("planId") planId: string,@DHttpReqParam("name") name: string,@DHttpReqParam("parentId") parentId: string,@DHttpReqParam("dependId") dependId: string,@DHttpReqParam("delay") delay: number): Promise<typeof planApi.routes.createStage.res> {
        let [objPlan,objParentItem,objDependItem,newSort]=await Promise.all([
            (async ()=>{
                let obj=await PlanService.getItemById(planId)
                if(!obj) {
                    throw Err.Project.Plan.planNotFound
                }
                return obj;
            })(),
            parentId?(async ()=>{
                let objParent=await PlanTableService.getItemById(parentId)
                if(!objParent) {
                    throw Err.Project.Plan.planItemNotFound
                } else if(objParent.getItem().type!==ECommon_Model_Plan_Table.STAGE) {
                    throw Err.Project.Plan.planTypeNotMatched
                }
                return objParent.getItem()
            })():null,
            dependId?(async ()=>{
                let objDepend=await PlanTableService.getItemById(dependId)
                if(!objDepend) {
                    throw Err.Project.Plan.planItemNotFound
                } else if(objDepend.getItem().type===ECommon_Model_Plan_Table.MILESTONE) {
                    throw Err.Project.Plan.planTypeNotMatched
                }
                return objDepend.getItem()
            })():null,
            (async ()=>{
                let sort=await PlanTableService.getNewSort(parentId??null,planId)
                return sort
            })()
        ])
        if(objDependItem && objDependItem.parent_id!=parentId) {
            throw Err.Project.Plan.dependItemNotMatchedParentItem
        }
        let obj=new PlanTableService()
        obj.assignItem({
            plan_id:planId,
            type:ECommon_Model_Plan_Table.STAGE,
            sort:newSort,
            name,
            parent_id:parentId,
            delay,
            depend_id:dependId,
            project_id:objPlan.getItem().project_id,
        })
        await obj.create()
        let ret=await objPlan.info()
        return ret;
    }

    @DHttpApi(planApi.routes.editStage)
    async editStage(@DHttpReqParamRequired("planItemId") planItemId: string,@DHttpReqParamRequired("name") name: string,@DHttpReqParam("dependId") dependId: string,@DHttpReqParam("delay") delay: number): Promise<typeof planApi.routes.editStage.res> {
        let obj=await PlanTableService.getItemById(planItemId)
        if(!obj) {
            throw Err.Project.Plan.planItemNotFound
        }
        if(dependId) {
            let objDepend=await PlanTableService.getItemById(dependId)
            if(!objDepend) {
                throw Err.Project.Plan.planItemNotFound
            } else if(objDepend.getItem().type===ECommon_Model_Plan_Table.MILESTONE) {
                throw Err.Project.Plan.planTypeNotMatched
            } else if(objDepend.getItem().parent_id!=obj.getItem().parent_id) {
                throw Err.Project.Plan.dependItemNotMatchedParentItem
            }
        }
        obj.assignItem({
            name,
            depend_id:dependId,
            delay
        })
        await obj.update()
        let objPlan=await PlanService.getItemById(obj.getItem().plan_id)
        let ret=await objPlan.info()
        return ret;
    }

    @DHttpApi(planApi.routes.createMileStone)
    async createMileStone(@DHttpReqParamRequired("planId") planId: string,@DHttpReqParamRequired("name") name: string,@DHttpReqParam("parentId") parentId: string): Promise<typeof planApi.routes.createMileStone.res> {
        let [objPlan,objParentItem,newSort]=await Promise.all([
            (async ()=>{
                let obj=await PlanService.getItemById(planId)
                if(!obj) {
                    throw Err.Project.Plan.planNotFound
                }
                return obj;
            })(),
            parentId?(async ()=>{
                let objParent=await PlanTableService.getItemById(parentId)
                if(!objParent) {
                    throw Err.Project.Plan.planItemNotFound
                } else if(objParent.getItem().type!==ECommon_Model_Plan_Table.STAGE) {
                    throw Err.Project.Plan.planTypeNotMatched
                }
                return objParent.getItem()
            })():null,
            (async ()=>{
                let sort=await PlanTableService.getNewSort(parentId??null,planId)
                return sort
            })()
        ])
        let obj=new PlanTableService()
        obj.assignItem({
            plan_id:planId,
            type:ECommon_Model_Plan_Table.MILESTONE,
            sort:newSort,
            name,
            parent_id:parentId,
            project_id:objPlan.getItem().project_id,
        })
        await obj.create()
        let ret=await objPlan.info()
        return ret;
    }

    @DHttpApi(planApi.routes.editMileStone)
    async editMileStone(@DHttpReqParamRequired("planItemId") planItemId: string,@DHttpReqParam("name") name: string): Promise<typeof planApi.routes.editMileStone.res> {
        let obj=await PlanTableService.getItemById(planItemId)
        if(!obj) {
            throw Err.Project.Plan.planItemNotFound
        }
        obj.assignItem({
            name,
        })
        await obj.update()
        let objPlan=await PlanService.getItemById(obj.getItem().plan_id)
        let ret=await objPlan.info()
        return ret;
    }

    @DHttpApi(planApi.routes.addIssue)
    async addIssue(@DHttpReqParamRequired("planId") planId: string,@DHttpReqParam("parentId") parentId: string,@DHttpReqParamRequired("projectIssueId") projectIssueId: string,@DHttpReqParam("dependId") dependId: string,@DHttpReqParam("delay") delay: number): Promise<typeof planApi.routes.addIssue.res> {
        let [objPlan,objParentItem,objProjectIssue,objDependItem,newSort]=await Promise.all([
            (async ()=>{
                let obj=await PlanService.getItemById(planId)
                if(!obj) {
                    throw Err.Project.Plan.planNotFound
                }
                return obj;
            })(),
            parentId?(async ()=>{
                let objParent=await PlanTableService.getItemById(parentId)
                if(!objParent) {
                    throw Err.Project.Plan.planItemNotFound
                } else if(objParent.getItem().type!==ECommon_Model_Plan_Table.STAGE) {
                    throw Err.Project.Plan.planTypeNotMatched
                }
                return objParent.getItem()
            })():null,
            ProjectIssueService.getItemById(projectIssueId),
            dependId?(async ()=>{
                let objDepend=await PlanTableService.getItemById(dependId)
                if(!objDepend) {
                    throw Err.Project.Plan.planItemNotFound
                } else if(objDepend.getItem().type===ECommon_Model_Plan_Table.MILESTONE) {
                    throw Err.Project.Plan.planTypeNotMatched
                }
                return objDepend.getItem()
            })():null,
            (async ()=>{
                let sort=await PlanTableService.getNewSort(parentId??null,planId)
                return sort
            })()
        ])
        if(objDependItem && objDependItem.parent_id!=parentId) {
            throw Err.Project.Plan.dependItemNotMatchedParentItem
        }
        let obj=new PlanTableService()
        obj.assignItem({
            plan_id:planId,
            type:ECommon_Model_Plan_Table.ISSUE,
            sort:newSort,
            parent_id:parentId,
            project_id:objPlan.getItem().project_id,
            delay,
            depend_id:dependId,
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
        let ret=await objPlan.info()
        return ret;

    }

    @DHttpApi(planApi.routes.editIssue)
    async editIssue(@DHttpReqParamRequired("planItemId") planItemId: string,@DHttpReqParam("dependId") dependId: string,@DHttpReqParam("delay") delay: number,@DHttpReqParam("manDay") manDay: number): Promise<typeof planApi.routes.editIssue.res> {
        let [obj,objDepend]=await Promise.all([
            (async ()=>{
                let obj=await PlanTableService.getItemById(planItemId)
                if(!obj) {
                    throw Err.Project.Plan.planItemNotFound
                }
                if(obj.getItem().parent_id) {
                    let objParent=await PlanTableService.getItemById(obj.getItem().parent_id)
                    if(!objParent) {
                        throw Err.Project.Plan.planItemNotFound
                    }
                }
                return obj
            })(),
            dependId?(async ()=>{
                let obj=await PlanTableService.getItemById(dependId)
                if(!obj) {
                    throw Err.Project.Plan.planItemNotFound
                } else if(obj.getItem().type===ECommon_Model_Plan_Table.MILESTONE) {
                    throw Err.Project.Plan.planTypeNotMatched
                }
                return obj;
            }):null
        ])
        obj.assignItem({
            depend_id:dependId,
            delay
        })
        await obj.update()
        if(manDay) {
            let objIssue=await ProjectIssueService.getItemById(obj.getItem().ref_id)
            objIssue.assignItem({
                man_day:manDay
            })
            await objIssue.update()
        }
        let objPlan=await PlanService.getItemById(obj.getItem().plan_id)
        let ret=await objPlan.info()
        return ret;
    }

    @DHttpApi(planApi.routes.removeItem)
    async removeItem(@DHttpReqParamRequired("planItemId") planItemId: string): Promise<typeof planApi.routes.removeItem.res> {
        let obj=await PlanTableService.getItemById(planItemId)
        if(!obj) {
            throw Err.Project.Plan.planItemNotFound
        }
        let hasParentIssue=await obj.hasParentIssue()
        if(hasParentIssue) {
            throw Err.Project.Plan.operationForbidden
        }
        await obj.delete()
        let objPlan=await PlanService.getItemById(obj.getItem().plan_id)
        let ret=await objPlan.info()
        return ret;
    }

    @DHttpApi(planApi.routes.editProgress)
    async editProgress(@DHttpReqParamRequired("planItemId") planItemId: string,@DHttpReqParamRequired("progress") progress: number): Promise<typeof planApi.routes.editProgress.res> {
        let obj=await PlanTableService.getItemById(planItemId)
        if(!obj) {
            throw Err.Project.Plan.planItemNotFound
        } else if(obj.getItem().type!==ECommon_Model_Plan_Table.ISSUE) {
            throw Err.Project.Plan.planTypeNotMatched
        }
        let issueInfo=await obj.issueInfo()
        if(issueInfo.workflow.status!==ECommon_Model_Workflow_Node_Status.INPROGRESS) {
            throw Err.Project.Plan.operationForbidden
        }
        obj.assignItem({
            progress
        })
        await obj.update()
        let objPlan=await PlanService.getItemById(obj.getItem().plan_id)
        let ret=await objPlan.info()
        return ret;
    }

    @DHttpApi(planApi.routes.moveItem)
    async moveItem(@DHttpReqParamRequired("planItemId") planItemId: string,@DHttpReqParamRequired("targetId") targetId: string,@DHttpReqParamRequired("action") action: "in"|"top"|"bottom"): Promise<typeof planApi.routes.moveItem.res> {
        let obj=await PlanTableService.getItemById(planItemId)
        if(!obj) {
            throw Err.Project.Plan.planItemNotFound
        }
        let objTarget:PlanTableService
        if(targetId) {
            objTarget=await PlanTableService.getItemById(targetId)
            if(!objTarget) {
                throw Err.Project.Plan.planItemNotFound
            }
            if(action==="in" && objTarget.getItem().type!==ECommon_Model_Plan_Table.STAGE) {
                throw Err.Project.Plan.operationForbidden
            }
        }
        if(action==="in") {
            if(obj.getItem().parent_id!==objTarget.getItem().id) {
                await obj.clearAllDepend()
            }
            let sort=await PlanTableService.getNewSort(targetId??null,obj.getItem().plan_id)
            obj.assignItem({
                depend_id:null,
                parent_id:targetId??null,
                sort
            })
        } else if(action==="top") {
            if(obj.getItem().parent_id!==objTarget.getItem().parent_id) {
                await obj.clearAllDepend()
            }
            await PlanTableService.moveUp(obj.getItem().parent_id,obj.getItem().sort,obj.getItem().plan_id)
            await PlanTableService.moveDown(objTarget.getItem().parent_id,objTarget.getItem().sort,obj.getItem().plan_id)
            obj.assignItem({
                parent_id:objTarget.getItem().parent_id,
                sort:objTarget.getItem().sort,
                ...(obj.getItem().parent_id!=objTarget.getItem().parent_id && {
                    depend_id:null
                })
            })
        } else if(action==="bottom") {
            if(obj.getItem().parent_id!==objTarget.getItem().parent_id) {
                await obj.clearAllDepend()
            }
            await PlanTableService.moveUp(obj.getItem().parent_id,obj.getItem().sort,obj.getItem().plan_id)
            await objTarget.loadItem()
            await PlanTableService.moveDown(objTarget.getItem().parent_id,objTarget.getItem().sort+1,obj.getItem().plan_id)
            obj.assignItem({
                parent_id:objTarget.getItem().parent_id,
                sort:objTarget.getItem().sort+1,
                ...(obj.getItem().parent_id!=objTarget.getItem().parent_id && {
                    depend_id:null
                })
            })
        }
        await obj.update()
        let objPlan=await PlanService.getItemById(obj.getItem().plan_id)
        let ret=await objPlan.info()
        return ret;
    }

    @DHttpApi(planApi.routes.issuePlanList)
    async issuePlanList(@DHttpReqParamRequired("projectIssueId") projectIssueId: string): Promise<typeof planApi.routes.issuePlanList.res> {
        let objProjectIssue=await ProjectIssueService.getItemById(projectIssueId)
        if(!objProjectIssue) {
            throw Err.Project.ProjectIssue.projectIssueNotFound
        }
        let ret=await PlanService.issuePlanList(projectIssueId)
        return ret;
    }


    @DHttpApi(planApi.routes.issuePlanEdit)
    async issuePlanEdit(@DHttpReqParamRequired("projectIssueId") projectIssueId: string,@DHttpReqParamRequired("planList") planList: string[]): Promise<typeof planApi.routes.issuePlanEdit.res> {
        await PlanService.issuePlanEdit(projectIssueId,planList);
        let ret=await PlanService.issuePlanList(projectIssueId)
        return ret;
    }

}