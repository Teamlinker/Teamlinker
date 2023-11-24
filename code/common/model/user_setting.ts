import {BaseModel} from "./base"

export interface ICommon_Model_User_Setting {
    id:string,
    user_id:string,
    wallpaper:string,
    meeting_background_img:string
}
export const Table_User_Setting="user_setting"

class UserSettingModel extends BaseModel {
    table=Table_User_Setting
    model=<ICommon_Model_User_Setting>{}
}

export  let userSettingModel=new UserSettingModel