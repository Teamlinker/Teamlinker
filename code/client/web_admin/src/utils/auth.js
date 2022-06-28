/*
 * @Descripttion:
 * @version:
 * @Author: gqwu
 * @Date: 2021-10-09 12:19:05
 * @LastEditors: gqwu
 * @LastEditTime: 2021-11-21 17:16:38
 */
import Cookies from 'js-cookie'

const TokenKey = 'vue_admin_template_token'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  const tokenT = 'Bearer ' + token
  console.log('auth.js',tokenT)
  return Cookies.set(TokenKey, tokenT)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
