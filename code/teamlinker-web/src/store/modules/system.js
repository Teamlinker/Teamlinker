// import { adminMenus} from '@/api/menu'
const state = {
    adminMenus:[]
}

const getters = {
    adminMenus: (state) => state.adminMenus
}
const mutations = {
    SET_Menus: (state, adminMenus) => {
        state.adminMenus = adminMenus
    },
}
const actions = {
    adminMenus({ commit }, token) {
        return new Promise((resolve, reject) => {
            commit('SET_Menus', setting.adminMenus)
            resolve()
        })
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}