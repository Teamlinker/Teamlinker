import {_GettersTree, defineStore, DefineStoreOptions, StateTree, Store} from "pinia";
import {inject, provide} from "vue";

export function useStore<Id extends string, S extends StateTree = {}, G extends _GettersTree<S> = {}, A = {}>(id: Id, options: Omit<DefineStoreOptions<Id, S, G, A>, 'id'>): Store<Id, S, G, A> {
    let value=inject("store:"+id,null)
    if(!value) {
        let store=defineStore(id,options);
        let instance=store()
        provide("store:"+id,instance)
        return instance;
    } else {
        return value
    }
}


