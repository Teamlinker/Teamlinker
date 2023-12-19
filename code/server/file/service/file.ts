import * as fs from "fs-extra";
import Application from "../../common/app/app";
import {Entity} from "../../common/entity/entity";
import {ECommon_Model_File_Type, fileModel} from './../../../common/model/file';
import {fileMapper} from './../mapper/file';
import {IServer_Common_Http_Req_File} from "../../common/types/http";
import {emitServiceEvent} from "../../common/event/event";
import rpcUserApi from "../../user/rpc/user"
import {download} from "../../common/request/request";
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

    static async ensureDir(md5:string,fileName:string) {
        let arr=(new Date).toLocaleDateString().split("/").reverse()
        if(arr[2].length==1) {
            arr[2]="0"+arr[2]
        }
        let dirPath = path.join(Application.uploadPath,arr[0]+arr[2]+arr[1])
        let filePath=path.join(dirPath,md5)+fileName.substring(fileName.lastIndexOf("."));
        let dbPath=filePath.substring(Application.uploadPath.length);
        await fs.ensureDir(dirPath)
        return {
            filePath,
            dbPath
        }
    }

    async upload(file:IServer_Common_Http_Req_File,meta?:string){
        let {dbPath,filePath}=await File.ensureDir(file.md5,file.fileName)
        fs.writeFile(filePath,file.data)
        this.item.path=dbPath.replaceAll(path.sep,"/")
        await super.create()
        if(meta) {
            emitServiceEvent("fileUpload",meta,this.item.id)
        }
        return this.item.id;
    }

    static async download(uri:string,userId:string):Promise<File> {
        let url=new URL(uri)
        let pathName=url.pathname
        let fileName=pathName.substring(pathName.lastIndexOf("/")+1)
        let tempPath=path.join(Application.uploadTempPath,fileName,String(Date.now()))
        let {md5,size}=await download(uri,tempPath)
        let {filePath,dbPath}=await this.ensureDir(md5,fileName)
        await fs.move(tempPath,filePath)
        let file = new File;
        file.assignItem({
            created_by_pure:userId,
            size,
            md5,
            path:dbPath,
            type:ECommon_Model_File_Type.LOCAL
        })
        await file.create()
        return file
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

    static async clearMember(userId:string) {
        let deletedUser=await rpcUserApi.getDeletedUser()
        await fileMapper.updateMember(userId,deletedUser.id)
    }
}