import { ECommon_Services } from '../../../../common/types';
import { cacheRedisType } from "../../types/cache";
import StringUtil from "../../util/string";
import { IServer_Common_Nacos_Instance } from './../../types/nacos';
import { RedisStringKey } from './base';
export namespace REDIS_GATEWAY {
    let INSTANCE_KEY=`${ECommon_Services.GateWay}:instance:{0}`
    let INSTANCES_KEY=`${ECommon_Services.GateWay}:instance:*`
    export function instances(key:string)
    {
        let obj=new RedisStringKey(StringUtil.format(INSTANCE_KEY,key),cacheRedisType<IServer_Common_Nacos_Instance[]>().Object)
        return obj
    }
    export function allInstances() {
        let obj=new RedisStringKey(INSTANCES_KEY,cacheRedisType<IServer_Common_Nacos_Instance[]>().Object);
        return obj;
    }
    export namespace Permission {
        let commentCacheKey="permission:projectIssueComment:{0}"
        let projectIssueCacheKey="permission:projectIssue:{0}"
        let labelCacheKey="permission:label:{0}"
        let moduleCacheKey="permission:module:{0}"
        let releaseCacheKey="permission:release:{0}"
        export function projectIdFromProjectIssueComment(commentId:string) {
            let obj=new RedisStringKey(StringUtil.format(commentCacheKey,commentId),cacheRedisType<string>().String,1000*10);
            return obj;
        }
        export function projectIdFromProjectIssue(projectIssueId:string) {
            let obj=new RedisStringKey(StringUtil.format(projectIssueCacheKey,projectIssueId),cacheRedisType<string>().String,1000*10);
            return obj;
        }
        export function projectIdFromLabel(labelId:string) {
            let obj=new RedisStringKey(StringUtil.format(labelCacheKey,labelId),cacheRedisType<string>().String,1000*10);
            return obj;
        }
        export function projectIdFromProjectModule(moduleId:string) {
            let obj=new RedisStringKey(StringUtil.format(moduleCacheKey,moduleId),cacheRedisType<string>().String,1000*10);
            return obj;
        }
        export function projectIdFromProjectRelease(releaseId:string) {
            let obj=new RedisStringKey(StringUtil.format(releaseCacheKey,releaseId),cacheRedisType<string>().String,1000*10);
            return obj;
        }
    }
}