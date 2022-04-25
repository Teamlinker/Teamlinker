var fs=require("fs-extra")
var shell=require("shelljs")
var path=require("path")
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
!(async function(){
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
    await shellAsync("npm run gateway && npm run user && npm run cooperation && npm run file")
    await shellAsync("pkg ./gateway/dist/server/gateway/index.js -o ./dist/teamlinker -c ./package.json -t node16-linux,node16-win,node16-macos")
    fs.copySync(path.resolve(__dirname,"./teamlinker.config.json"),path.resolve(__dirname,"./dist/teamlinker.config.json"))
    fs.removeSync(path.resolve(__dirname,"../docker/teamlinker"))
    fs.copySync(path.join(pathDist,"teamlinker-linux"),path.resolve(__dirname,"../docker/teamlinker"))
    shell.cd("../docker")
    await shellAsync("docker build -t teamlinker:1.0 .")
    console.log("finish")
})()
