import Cooperation from "./app/app";
import "./http/project";
var application = new Cooperation()
application.start();
process.on('disconnect', function() {
    console.log('parent exited')
    process.exit();
});



