import User from "./app/app";

var application = new User()
application.start();
process.on('disconnect', function() {
    console.log('parent exited')
    process.exit();
});



