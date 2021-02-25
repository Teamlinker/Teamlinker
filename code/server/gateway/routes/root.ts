import * as Router from "koa-router"
import check from "./check"
import user from "./api/user"
import { getRouteApi } from "../../common/decorator/http";
let root=new Router();
let arr=[user];
(async function()
{
    for(let obj of arr)
    {
        const [category,inter]=getRouteApi(obj);
        let route=await check(category,inter)
        root.use(`/api/${category}`,route.routes(),route.allowedMethods());
    }
})()
export=root;