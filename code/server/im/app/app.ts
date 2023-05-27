import "../socket/socket"
import "../event/event"
import {handleImConnection} from "../socket/socket";

export async function initIM() {
    await handleImConnection()
}