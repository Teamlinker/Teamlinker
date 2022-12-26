import {ICommon_Route_Res_Project_CreateModule_Data} from "../../../common/routes/response";
import {Err} from "../../../common/status/error";
import {getMysqlInstance} from "../../common/db/mysql";
import {Mapper} from "../../common/entity/mapper";
import {generateDeleteSql, generateQuerySql} from '../../common/util/sql';
import {projectModuleModel} from './../../../common/model/project_module';
import {projectModuleIssueModel} from "../../../common/model/project_module_issue";

class ModuleMapper extends Mapper<typeof projectModuleModel> {
    constructor() {
        super(projectModuleModel)
    }
    async listModule(projectId:string):Promise<ICommon_Route_Res_Project_CreateModule_Data[]> {
        if(!projectId) {
            throw Err.Common.paramError
        }
        let mysql=getMysqlInstance()
        let arrModuleProject = await mysql.execute(generateQuerySql(projectModuleModel,[],{
            project_id:projectId
        }))
        let objTemp={}
        arrModuleProject.forEach((item)=>{
            objTemp[item.id]=item.name
            return item.id
        })
        function _get(parentId:string){
            let data=[];
            for(let obj of arrModuleProject){
                if(obj.parent_module_id==parentId){
                    data.push({
                        id:obj.id,
                        name:objTemp[obj.id],
                        data:[]
                    })
                }
            }
            if(data.length>0){
                for(let obj of data){
                    obj.data=_get(obj.id)
                }
            }
            return data;
        }
        let data=_get(null);
        return data;
    }
    async deleteChildren(moduleId:string,projectId:string){
        if(!moduleId) {
            throw Err.Common.paramError
        }
        let mysql=getMysqlInstance()
        let arrModuleProject = await mysql.execute(generateQuerySql(projectModuleModel,[],{
            project_id:projectId
        }))
        let addNeedRemove=[]
        async function _delete(parentId:string){
            let data=[];
            for(let obj of arrModuleProject){
                if(obj.parent_module_id==parentId){
                    data.push(obj.id)
                }
            }
            if(data.length>0) {
                addNeedRemove=addNeedRemove.concat(data);
                await mysql.execute(generateDeleteSql(projectModuleModel,{
                    id:{
                        exp:"in",
                        value:data
                    }
                }))
                for(let obj of data){
                    await _delete(obj)
                }
            }
        }
        await _delete(moduleId);
        if(addNeedRemove.length>0) {
            await mysql.execute(generateDeleteSql(projectModuleIssueModel,{
                project_module_id:{
                    exp:"in",
                    value:addNeedRemove
                }
            }))
        }
    }
    async deleteByProjectId(projectId:string) {
        if(!projectId) {
            throw Err.Project.Module.moduleNotFound
        }
        let mysql=getMysqlInstance()
        let arrModuleProject = await mysql.execute(generateQuerySql(projectModuleModel,[],{
            project_id:projectId
        }))
        if(arrModuleProject.length>0) {
            await mysql.execute(generateDeleteSql(projectModuleModel,{
                project_id:projectId
            }))
            await mysql.execute((generateDeleteSql(projectModuleIssueModel,{
                project_module_id:{
                    exp:"in",
                    value:arrModuleProject.map(item=>item.id)
                }
            })))
        }

    }

    async deleteByProjectIds(projectIds:string[]) {
        if(!projectIds) {
            throw Err.Project.Module.moduleNotFound
        }
        if(projectIds.length==0) {
            return;
        }
        let mysql=getMysqlInstance()
        let arrModuleProject = await mysql.execute(generateQuerySql(projectModuleModel,[],{
            project_id:{
                exp:"in",
                value:projectIds
            }
        }))
        if(arrModuleProject.length>0) {
            await mysql.execute(generateDeleteSql(projectModuleModel,{
                project_id:{
                    exp:"in",
                    value:projectIds
                }
            }))
            await mysql.execute((generateDeleteSql(projectModuleIssueModel,{
                project_module_id:{
                    exp:"in",
                    value:arrModuleProject.map(item=>item.id)
                }
            })))
        }

    }
}
export let moduleMapper=new ModuleMapper