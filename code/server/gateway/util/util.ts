import { CacheService } from './../cache/service';
export async function init() {
    let cacheService=new CacheService()
    cacheService.start()
}