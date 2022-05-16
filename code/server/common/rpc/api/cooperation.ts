export default interface IServer_Common_RPC_Cooperation {
    clearProject?(organizationId:string)
    clearField?(organizationId:string)
    clearWorkflow?(organizationId:string)
    clearIssueType?(organizationId:string)
    initIssueTypeWorkflowAndSolution?(organizationId:string,projectId?:string)
    initProject?(userId:string,projectRoleUserId:string,organizationId:string):Promise<string>
    initField?()
}
