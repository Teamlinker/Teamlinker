import { Err } from '../../../common/status/error';
import { getMysqlInstance } from '../../common/db/mysql';
import { Mapper } from '../../common/entity/mapper';
import { generateQuerySql } from '../../common/util/sql';
import { fileModel } from './../../../common/model/file';
class FileMapper extends Mapper<typeof fileModel> {
    constructor(){
        super(fileModel)
    }
    async getItemByMd5(md5:string) {
        if(!md5) {
            throw  Err.File.md5NotExists
        }
        var mysql=getMysqlInstance();
        let ret=await mysql.executeOne(generateQuerySql(fileModel,[],{md5:md5}))
        return ret
    }

    async getPaths(ids:string[]) {
        if(!ids) {
            throw Err.File.fileNotFound
        }
        var mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(fileModel,[],{
            id:{
                exp:"in",
                value:ids
            }
        }))
        return ret;
    }
}

export let fileMapper=new FileMapper()