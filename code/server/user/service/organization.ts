import { ECommon_Organization_User_Role, organizationUserModel } from "../../../common/model/organization_user";
import { Entity } from "../../common/entity/entity";
import { EServer_Common_Event_Types } from "../../common/event/types";
import rpcCooperationApi from "../rpc/cooperation";
import { ICommon_Model_Organization, organizationModel } from './../../../common/model/organization';
import { organizationMapper, organizationUserMapper } from './../mapper/organization';
export class OrganizationService extends Entity<typeof organizationModel,typeof organizationMapper> {
    constructor(){
        super(organizationMapper)
    }

    static async list(userId:string) {
        let ret=await organizationMapper.list(userId)
        return ret;
    }

    override async create(): Promise<ICommon_Model_Organization> {
        let ret=await super.create()
        let service=new OrganizationUserService;
        service.assignItem({
            organization_id:ret.id,
            user_id:ret.user_id,
            role:ECommon_Organization_User_Role.ADMIN,
            nickname:"Admin"
        })
        await service.create()
        await rpcCooperationApi.initIssueTypeWorkflowAndSolution(ret.id);
        return ret;
    }

    override async delete(eventPulish?: EServer_Common_Event_Types.Types): Promise<void> {
        await super.delete()
        await organizationUserMapper.clearUser(this.getId());
        await rpcCooperationApi.clearProject(this.getId())
        await rpcCooperationApi.clearIssueType(this.getId())
        await rpcCooperationApi.clearWorkflow(this.getId())
        await rpcCooperationApi.clearField(this.getId())
    }

    static async init(adminIds:string[],userIds:string[]) {
        let ret=await organizationMapper.init(adminIds,userIds);
        return ret;
    }
}

export class OrganizationUserService extends Entity<typeof organizationUserModel,typeof organizationUserMapper> {
    constructor(){
        super(organizationUserMapper)
    }
    
    static async listUser(organizationId:string,page:number,size:number,keyword?:string) {
        let ret=await organizationUserMapper.listUser(organizationId,page,size,keyword)
        return ret;
    }

}