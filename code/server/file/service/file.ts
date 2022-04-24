import * as fs from "fs-extra";
import { v4 as uuid } from "uuid";
import Application from "../../common/app/app";
import { Entity } from "../../common/entity/entity";
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
        let dirPath = path.join(Application.teamlinkerPath,(new Date).toLocaleDateString().replace(/\//g,""))
        let filePath=path.join(dirPath,uuid())+this.item.filename.substr(this.item.filename.lastIndexOf("."));
        let dbPath=filePath.substring(Application.teamlinkerPath.length);
        await fs.ensureDir(dirPath)
        fs.writeFile(filePath,data)
        this.item.path=dbPath
        await super.create()
        return this.item.id;
    }

    static async getPaths(ids:string[]){
        let arrId=[...ids]
        let ret=await fileMapper.getPaths(ids);
        let arrRetId=ret.map(item=>{
            return item.id
        })
        for(let i=0;i<arrId.length;i++) {
            if(arrId[i] && arrRetId.includes(arrId[i])) {
                let obj=ret[arrRetId.indexOf(arrId[i])]
                if(obj && obj.path) {
                    arrId[i]="/file"+obj.path
                }
            } else {
                arrId[i]=null
            }
        }
        return arrId;
    }
}