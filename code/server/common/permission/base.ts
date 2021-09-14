export interface IServer_Common_Permission_Base<T=any> {
    key?:string;
    create?(...argv:any):Promise<T>
    check(obj:T):boolean
    clear?():void
}