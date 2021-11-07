
export interface ICommon_Route_Res_Project_CreateModule_Data {
    id:string,
    name:string,
    data:ICommon_Route_Res_Project_CreateModule_Data[]
}

export enum ECommon_Route_Res_Project_Member_Type {
    User,
    Team
}

export type ICommon_Route_Res_Project_Member = {
    id:string,
    photo:string,
    name:string
    type:ECommon_Route_Res_Project_Member_Type,
    role:{
        id:string,
        name:string
    }
}

export type ICommon_RouteRes_Project_ListTag = {
    totalPage:number,
    page:number,
    data:{
        id:string,
        name:string
    }[]
}