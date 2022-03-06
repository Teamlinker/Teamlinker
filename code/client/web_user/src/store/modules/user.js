import { login, logout,getProfile } from "@/api/user";
import { getAuth, setAuth, removeAuth } from "@/utils/auth";
import router, { resetRouter } from "@/router";
// import axios from "axios";
import axios from "@/plugins/axios";
// import { resolve } from "path";

const state = {
  userInfo: null,
  token: getAuth(),
  rules: [], // 权限id集合
  profile:{}
};

const getters = {
  userInfo: (state) => state.userInfo,
};

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token;
  },
  SET_USERINFO: (state, userInfo) => {
    state.userInfo = userInfo;
  },
  SET_RULES: (state, rules) => {
    state.rules = rules;
  },
  SET_PROFILE:(state,profile)=>{
    state.profile = profile;
    console.log( state.profile)
  }
};
const actions = {
  // 登录
  async login({ commit }, userInfo) {
    try {
      const response = await login(userInfo);
      const { data } = response;
      commit("SET_USERINFO", data);
      sessionStorage.setItem("userInfo", JSON.stringify(data));
      return Promise.resolve(data);
    } catch (e) {
      return Promise.reject(e);
    }
  },

  // 获取用户信息
  getInfo({ commit, state }) {
    return new Promise((resolve) => {
      const userInfo = state.userInfo;
      const { rules } = userInfo;
      commit("SET_RULES", rules);
      resolve(userInfo);
    });
  },
  

   // 获取用户信息
  async getProfile({ commit, state }) {
    const response = await getProfile({});
    const { data } = response;
    commit("SET_PROFILE",data);
    return Promise.resolve(data);
  },

  // 退出登录
  // eslint-disable-next-line no-unused-vars
  async logout() {
    try {
        const response = await logout();
        sessionStorage.removeItem("token"); 
        sessionStorage.removeItem("userInfo");
        router.replace("/login");
      return Promise.resolve(response);
    } catch (e) {
      return Promise.reject(e);
    }
  },

  // 清除 token
  resetToken({ commit }) {
    return new Promise((resolve) => {
      commit("SET_TOKEN", "");
      commit("SET_RULES", []);
      commit("SET_USERINFO", {});
      sessionStorage.removeItem("userInfo");
      removeAuth("TOKEN");
      // 重置路由
      resetRouter();
      resolve();
    });
  },

  // 动态修改权限
  changeRoles({ commit, dispatch }, role) {
    return new Promise(async (resolve) => {
      const token = role + "-token";
      commit("SET_TOKEN", token);
      setAuth("", token);
      const { rules } = await dispatch("getInfo");
      // 重置路由
      resetRouter();
      const accessRoutes = await dispatch("permission/generateRoutes", rules, {
        root: true,
      });
      router.addRoute(accessRoutes);
      // dispatch('page/delAllViews', null, { root: true })
      resolve();
    });
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
