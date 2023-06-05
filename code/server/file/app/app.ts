import * as fs from "fs-extra";
import Application from "../../common/app/app";
import {getMysqlInstance} from '../../common/db/mysql';
import getJobInstance from "../../common/job/job";
import {generateDeleteSql} from "../../common/util/sql";
import "../event/file";
import "../http/file";
import {ECommon_Model_File_Type, fileModel, ICommon_Model_File, Table_File} from './../../../common/model/file';
import {REDIS_FILE} from "../../common/cache/keys/file";
import path = require("path");

export async function config()
{
    let job = getJobInstance();
    job.create("remove-files", {
        minute: 54
    }, async (fireDate: Date) => {
        let mysql = getMysqlInstance()
        let ret = await mysql.execute<ICommon_Model_File>(`select * from ${Table_File} where type=${ECommon_Model_File_Type.LOCAL} and ref<=0 and created_time<(date_sub(current_timestamp(),INTERVAL 30 MINUTE))`)
        for (let obj of ret) {
            fs.remove(path.join(Application.uploadPath, obj.path))
            mysql.execute(generateDeleteSql(fileModel, {
                id: obj.id
            }))
            let objCache=REDIS_FILE.filePath(obj.id)
            objCache.del()
        }
        let items=await fs.readdir(Application.uploadPath);
        for(let item of items) {
            if(item!="." && item!="..") {
                let stat=await fs.stat(path.join(Application.uploadPath,item))
                if(stat.isDirectory()) {
                    let subItems=await fs.readdir(path.join(Application.uploadPath,item))
                    if(subItems.length==0 || (subItems.length==2 && subItems.includes(".") && subItems.includes(".."))) {
                        fs.rmdir(path.join(Application.uploadPath,item))
                    }
                }
            }
        }
    })
}
