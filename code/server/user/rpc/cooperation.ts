import { ECommon_Services } from "../../../common/types";
import IServer_Common_RPC_Cooperation from "../../common/rpc/api/cooperation";
import { DRPCSend } from "../../common/rpc/rpc";
class RpcCooperationApi implements IServer_Common_RPC_Cooperation {
    @DRPCSend(ECommon_Services.Cooperation)
    async clearProject(organizationId:string) {
        return null;
    }
    @DRPCSend(ECommon_Services.Cooperation)
    async clearField(organizationId:string){
        return null;
    }
    @DRPCSend(ECommon_Services.Cooperation)
    async clearWorkflow(organizationId:string) {
        return null;
    }
    @DRPCSend(ECommon_Services.Cooperation)
    async clearIssueType(organizationId:string) {
        return null;
    }
    @DRPCSend(ECommon_Services.Cooperation)
    async initIssueTypeWorkflowAndSolution(organizationId: string,projectId?:string) {
        return null;
    }
    
}
export default new RpcCooperationApi;