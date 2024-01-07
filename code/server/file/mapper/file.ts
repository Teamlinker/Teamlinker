import {Err} from '../../../common/status/error';
import {getMysqlInstance} from '../../common/db/mysql';
import {Mapper} from '../../common/entity/mapper';
import {generateQuerySql, generateUpdateSql} from '../../common/util/sql';
import {fileModel} from './../../../common/model/file';

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
        } else if(ids.length==0) {
            return []
        }
        var mysql=getMysqlInstance()
        let ret=await mysql.execute(generateQuerySql(fileModel,[],{
            id:{
                exp:"in",
                value:ids
            }
        },"and",{
            field:"id",
            type:"field",
            value:ids
        }))
        return ret;
    }

    async updateMember(userId:string,updatedUserId:string) {
        if(!userId || !updatedUserId) {
            return
        }
        var mysql=getMysqlInstance()
        await mysql.execute(generateUpdateSql(fileModel,{
            created_by_pure:updatedUserId
        },{
            created_by_pure:userId
        }))
    }
}

export let fileMapper=new FileMapper()