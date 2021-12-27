import * as fs from "fs-extra";
import { v4 as uuid } from "uuid";
import { Entity } from "../../common/entity/entity";
import CommonUtil from "../../common/util/common";
import { fileModel } from './../../../common/model/file';
import { fileMapper } from './../mapper/file';
import path = require("path");
export default class File extends Entity<typeof fileModel,typeof fileMapper> {
    constructor(){
        super(fileMapper)
    }
    static async getItemByMd5(md5:string){
        let obj = await fileMapper.getItemByMd5(md5);
        if(obj) {
            let file = new File;
            file.setItem(obj);
            return file;
        } else {
            return null;
        }
    }
    async upload(data:Buffer){
        let config = await CommonUtil.getGlobalConfig();
        let dirPath = path.join(config.fileBasePath,(new Date).toLocaleDateString().replace(/\//g,""))
        let filePath=path.join(dirPath,uuid())+this.item.filename.substr(this.item.filename.lastIndexOf("."));
        let dbPath=filePath.substr(config.fileBasePath.length);
        await fs.ensureDir(dirPath)
        fs.writeFile(filePath,data)
        this.item.path=dbPath
        await super.create()
        return this.item.id;
    }

    static async getPaths(ids:string[]){
        let ret=await fileMapper.getPaths(ids);
        return ret.map(item=>{
            if(item && item.path) {
                return "/file"+item.path
            } else {
                return ""
            }
        })
    }
}