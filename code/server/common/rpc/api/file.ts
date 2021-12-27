
export default interface IServer_Common_RPC_File {
    getPath?(fileId:string):Promise<string>
    getPaths?(fileIds:string[]):Promise<string[]>
}
