var fs=require("fs-extra")
var shell=require("shelljs")
var path=require("path")
const { isConstructorDeclaration } = require("typescript")
let shellAsync=function (command) {
    return new Promise(function(resolve, reject){
        let child = shell.exec(command, {async: true, silent: true});
        child.stdout.on('data', (data) => {
            console.log(` ${data}`);
        });
        child.stderr.on('data', (data) => {
            console.log(` ${data}`);
        });
        child.on('close', (code) => {
            resolve(true);
        });
    })
}
var pathDist=path.resolve(__dirname,"./dist")
if(!fs.pathExistsSync(pathDist)) {
    fs.mkdirpSync(pathDist)
} else {
    fs.emptyDirSync(pathDist)
}
var pathClientDist=path.resolve(__dirname,"../client/dist")
if(!fs.pathExistsSync(pathClientDist)) {
    fs.mkdirpSync(pathClientDist)
} else {
    fs.emptyDirSync(pathClientDist)
}
var pathClientAdminDist=path.resolve(__dirname,"../client/web_admin/dist")
fs.copySync(pathClientAdminDist,pathClientDist)
fs.moveSync(path.join(pathClientDist,"index.html"),path.join(pathClientDist,"admin.html"))
var pathClientUserDist=path.resolve(__dirname,"../client/web_user/dist")
fs.copySync(pathClientUserDist,pathClientDist)
console.log("finish")