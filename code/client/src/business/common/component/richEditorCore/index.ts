import TLEditor from "./src/index.vue"

import {App} from "vue";

export { TLEditor };
export * from "./src/types"
const  root= {
    install(app:App,options:any) {
        app.component("TLEditor", TLEditor);
    },
};

export default root;