import {ICommon_Route_Res_Project_CreateModule_Data} from "../../../common/routes/response";
import {Err} from "../../../common/status/error";
import {getMysqlInstance} from "../../common/db/mysql";
import {Mapper} from "../../common/entity/mapper";
import {generateQuerySql} from '../../common/util/sql';
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

    async getChildren(moduleId:string,projectId:string) {
        if(!moduleId) {
            throw Err.Common.paramError
        }
        let mysql=getMysqlInstance()
        let arrModuleProject = await mysql.execute(generateQuerySql(projectModuleModel,[],{
            project_id:projectId,
            parent_module_id:moduleId
        }))
        return arrModuleProject
    }
}
export let moduleMapper=new ModuleMapper

class ModuleIssueMapper extends Mapper<typeof projectModuleIssueModel> {
    constructor() {
        super(projectModuleIssueModel)
    }

}
export let moduleIssueMapper=new ModuleIssueMapper
