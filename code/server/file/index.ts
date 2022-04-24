import File from "./app/app";

var application = new File()
application.start();
process.on('disconnect', function() {
    console.log('parent exited')
    process.exit();
});