import { DComponent } from "../decorate/component";
import { PermissionBase } from "./base";

@DComponent
export class PermissionAdmin extends PermissionBase<boolean> {
    translateToField(param: { [param: string]: any; userId?: string; isAdmin?: boolean; }): Promise<string> {
        throw new Error("Method not implemented.");
    }
    fieldName=""
    keys=["admin"];
    check(obj: boolean): boolean {
        return false
    }
    buildKey(param: { [param: string]: any; userId?: string; isAdmin?: boolean; }): string[] {
        return this.keys
    }
    async generatorValue(param: { [param: string]: any; userId?: string; isAdmin?: boolean; }, keys: string[]): Promise<boolean> {
        return false
    }
    
}