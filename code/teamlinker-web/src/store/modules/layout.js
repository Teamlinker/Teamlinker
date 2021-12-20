const state = {
    breadcrumb: [
        {
            name: '首页',
            level: 1,
            path: '/'
        }
    ],
    showCompletely:true
}

const mutations = {
    changeBreadcrumb: function (state, payload) {
        state.breadcrumb = payload
    },
    changeCompletely: function (state) {
        state.showCompletely = !state.showCompletely
    }
}
const actions = {
    changeCompletely(context, state) {
        context.commit('changeCompletely', state)
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}