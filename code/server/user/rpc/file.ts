import { ECommon_Services } from '../../../common/types';
import {IServer_Common_RPC_File} from "../../common/rpc/api/file";
import { DRPCSend } from "../../common/rpc/rpc";
class RpcFileApi implements IServer_Common_RPC_File {
    @DRPCSend(ECommon_Services.File)
    async getPath(fileId: string): Promise<string> {
        return null;
    }
    @DRPCSend(ECommon_Services.File)
    async getPaths(fileIds: string[]): Promise<string[]> {
        return null;
    }
}
export default new RpcFileApi