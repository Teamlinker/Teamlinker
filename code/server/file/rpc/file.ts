import IServer_Common_RPC_File from "../../common/rpc/api/file";
import { DRPCRecieve } from "../../common/rpc/rpc";
import FileService from "../service/file";
class RpcFileApi implements IServer_Common_RPC_File {
    @DRPCRecieve
    async getPath(fileId: string): Promise<string> {
        if(!fileId) {
            return ""
        }
        let obj=await FileService.getItemById(fileId)
        if(!obj) {
            return ""
        }
        return "/file"+obj.getItem().path
    }
    @DRPCRecieve
    async getPaths(fileIds: string[]): Promise<string[]> {
        if(!fileIds || fileIds.length==0) {
            return []
        }
        let obj=await FileService.getPaths(fileIds)
        return obj;
    }
}
export default new RpcFileApi;