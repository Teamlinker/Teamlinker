import {ECommon_Services} from '../../../../common/types';
import {cacheRedisType} from "../../types/cache";
import StringUtil from "../../../../common/util/string";
import {RedisStringKey} from './base';

export namespace REDIS_FILE {
    let FILE_PATH_KEY=`${ECommon_Services.File}:file:{0}:path`
    export function filePath(fileId:string)
    {
        let obj=new RedisStringKey(StringUtil.format(FILE_PATH_KEY,fileId),cacheRedisType<string>().String,3600)
        return obj
    }
}