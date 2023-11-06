import * as https from 'https'
import {IncomingHttpHeaders} from "http"
import * as fs from "fs-extra";
import * as crypto from "crypto";

export const request=(urlOptions: string | https.RequestOptions | URL, data = ''):Promise<{
    statusCode:number,
    headers:IncomingHttpHeaders,
    body:string
}> => new Promise((resolve, reject) => {
    const req = https.request(urlOptions, res => {
        const chunks = []

        res.on('data', chunk => chunks.push(chunk))
        res.on('error', reject)
        res.on('end', () => {
            const { statusCode, headers } = res
            const validResponse = statusCode >= 200 && statusCode <= 299
            const body = chunks.join('')

            if (validResponse) resolve({ statusCode, headers, body })
            else reject(new Error(`Request failed. status: ${statusCode}, body: ${body}`))
        })
    })
    req.on('error', reject)
    req.write(data, 'binary')
    req.end()
})

export const download=(uri:string,dest:string):Promise<{
    md5:string,
    size:number
}>=>{
    return new Promise(async (resolve, reject)=>{
        await fs.ensureFile(dest)
        const file = fs.createWriteStream(dest);
        https.get(uri, (res)=>{
            if(res.statusCode !== 200){
                reject(res.statusCode);
                return;
            }
            const hash = crypto.createHash("md5");
            let size=0;
            res.on("data",chunk => {
                hash.update(chunk, "utf8");
                size+=chunk.length
            });
            file.on('finish', ()=>{
                file.close(err => {
                    const md5 = hash.digest("hex");
                    resolve({
                        md5,
                        size
                    })
                });
            }).on('error', (err)=>{
                fs.unlink(dest);
                reject(err.message);
            })

            res.pipe(file);
        });
    });
}
