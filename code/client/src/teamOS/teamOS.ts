import {desktop} from "./desktop/desktop";
import {iconManager} from "./icon/iconManager";
import {windowManager} from "./window/windowManager";

export function getDesktopInstance() {
    return {
        desktop: desktop,
        iconManager:iconManager,
        windowManager:windowManager
    }
}