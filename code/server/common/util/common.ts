import { getMysqlInstance } from '../db/mysql';
import { ICommon_Version_Config, versionModel } from './../../../common/model/version';
import { generateQuerySql } from './sql';
export default class CommonUtil {
    static config:ICommon_Version_Config=null
    static pageTotal(rowCount:number, pageSize:number):number {
        if (rowCount == null) {
            return 0;
        } else {
            if (pageSize != 0 &&
                rowCount % pageSize == 0) {
                return Math.floor(rowCount / pageSize);
            }
            if (pageSize != 0 &&
                rowCount % pageSize != 0) {
                return Math.floor(rowCount / pageSize) + 1;
            }
        }
    }
    static async getGlobalConfig():Promise<ICommon_Version_Config> {
        if(this.config==null) {
            let mysql=getMysqlInstance()
            let ret=await mysql.executeOne(generateQuerySql(versionModel,[]))
            this.config=JSON.parse(ret.config)
        }
        return this.config
    }
}