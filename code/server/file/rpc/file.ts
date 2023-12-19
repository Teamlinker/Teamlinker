import FileService from "../service/file";
import {Err} from "../../../common/status/error";

class RpcFileApi  {
    
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
    
    async getPaths(fileIds: string[]): Promise<string[]> {
        if(!fileIds || fileIds.length==0) {
            return []
        }
        let obj=await FileService.getPaths(fileIds)
        return obj;
    }

    async file(fileId:string) {
        let obj=await FileService.getItemById(fileId)
        if(!obj) {
            throw Err.File.fileNotFound
        }
        return {
            ...obj.getItem(),
            path:"/file"+obj.getItem().path
        }
    }

    async clearMember(userId:string) {
        await FileService.clearMember(userId)
    }
}
export default new RpcFileApi;