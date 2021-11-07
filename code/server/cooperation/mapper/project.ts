import { projectModel } from '../../../common/model/project';
import { Mapper } from "../../common/entity/mapper";
;
class ProjectMapper extends Mapper<typeof projectModel>{
    constructor(){
        super(projectModel)
    }
}
export let projectMapper=new ProjectMapper