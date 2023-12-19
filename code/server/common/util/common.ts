import * as crypto from "crypto";

export interface ICommon_FormData {
    isFile:boolean,
    name:string,
    fileName:string,
    data:Buffer|string,
    md5:string,
    size:number
}
export default class CommonUtil {
    static pageTotal(rowCount:number, pageSize:number):number {
        if (rowCount == null) {
            return 0;
        } else {
            if (pageSize != 0 &&
                rowCount % pageSize == 0) {
                return Math.floor(rowCount / pageSize);
            }
            if (pageSize != 0 &&
                rowCount % pageSize != 0) {
                return Math.floor(rowCount / pageSize) + 1;
            }
        }
    }
    
    static bufferSplit(buffer, separator) {
        let result = [];
        let index = 0;
      
        while ((index = buffer.indexOf(separator)) != -1) {
          result.push(buffer.slice(0, index));
          buffer = buffer.slice(index + separator.length);
        }
        result.push(buffer);
      
        return result;
    }

    static parseFormData(str: Buffer, boundary: string): ICommon_FormData[] {
        if (!str) {
            return null;
        }
        let ret: ICommon_FormData[] = [];
        let result = this.bufferSplit(str, boundary)
        result.pop()
        result.shift()
        result = result.map(item => item.slice(2, item.length - 2))
        result.forEach(item => {
            let obj=<ICommon_FormData>{}
            let [info, data] = this.bufferSplit(item, '\r\n\r\n')
            info = info.toString()
            if (info.indexOf('\r\n') >= 0) {
                let infoResult = info.split('\r\n')[0].split('; ')
                let name = infoResult[1].split('=')[1]
                name = name.substring(1, name.length - 1)
                let filename = infoResult[2].split('=')[1]
                filename = filename.substring(1, filename.length - 1)
                obj.isFile=true;
                obj.data=data;
                obj.fileName=filename
                obj.name=name;
                obj.size=data.length;
                obj.md5=crypto.createHash("md5").update(data).digest("hex")
            } else {
                let name = info.split('; ')[1].split('=')[1]
                name = name.substring(1, name.length - 1)
                const value = data.toString()
                obj.name=name;
                obj.data=value
            }
            ret.push(obj)
        })
        return ret;
    }
    static versionDiff(obj1,obj2) {
        var verArr=obj1.split(".");
        var verLocalArr=obj2.split(".");
        var bNew=false;
        for(var i=0;i<3;i++)
        {
            if(parseInt(verArr[i])>parseInt(verLocalArr[i]))
            {
                bNew=true;
                break;
            }
            else if(parseInt(verArr[i])<parseInt(verLocalArr[i]))
            {
                break;
            }
        }
        if(bNew)
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    static async sleep(ms:number) {
        return new Promise((resolve)=>{
            setTimeout(resolve,ms)
        })
    }

    static generateRandomNumbers(len:number) {
        let result="";
        for(let i=0;i<6;i++){
            let intValue=Math.floor(Math.random()*10);
            result=result+intValue;
        }
        return result
    }

    static md5(password:string) {
        let md5 = crypto.createHash('md5');
        return md5.update(password).digest('hex');
    }
}