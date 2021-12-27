import * as fs from "fs-extra";
import Application from "../../common/app/app";
import { getMysqlInstance } from '../../common/db/mysql';
import getJobInstance from "../../common/job/job";
import CommonUtil from "../../common/util/common";
import { generateDeleteSql } from "../../common/util/sql";
import "../event/file";
import "../http/file";
import "../rpc/file";
import { ECommon_Model_File_Type, fileModel, ICommon_Model_File, Table_File } from './../../../common/model/file';
import path = require("path");
export default class File extends Application {
    override async config() {
        let job=getJobInstance();
        job.create("remove-files",{
            minute:30
        },async (fireDate:Date)=>{
            let mysql=getMysqlInstance()
            let ret=await mysql.execute<ICommon_Model_File>(`select * from ${Table_File} where type=${ECommon_Model_File_Type.LOCAL} and ref<=0 and created_time<(date_sub(current_timestamp(),INTERVAL 30 MINUTE))`)
            let config=await CommonUtil.getGlobalConfig()
            for(let obj of ret) {
                await fs.remove(path.join(config.fileBasePath,obj.path))
                await mysql.execute(generateDeleteSql(fileModel,{
                    id:obj.id
                }))
            }
        })
    }
}
