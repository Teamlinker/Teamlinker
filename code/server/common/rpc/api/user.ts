export interface IAAA {
    name:string,
    age:number
}
export default interface IServer_Common_RPC_User {
    a?(obj:IAAA):Promise<IAAA>
}