
export interface ICommon_Route_Res_Project_CreateModule_Data {
    id:string,
    name:string,
    data:ICommon_Route_Res_Project_CreateModule_Data[]
}

export type ICommon_Route_Res_Project_Member = {
    id:string,
    photo:string,
    name:string
    type:"user"|"team",
    role:{
        id:string,
        name:string
    }
}