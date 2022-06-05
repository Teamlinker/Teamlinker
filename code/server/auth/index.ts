import Auth from "./app/app";

var application = new Auth()
application.start();
process.on('disconnect', function() {
    console.log('parent exited')
    process.exit();
});



