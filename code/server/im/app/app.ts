import "../socket/socket"
import {handleImConnection} from "../socket/socket";

export async function initIM() {
    await handleImConnection()
}