import Cookies from 'js-cookie'

/**
 * 获取 auth
 * @param auth key
 * @return {*}
 */
export function getAuth(auth) {
    // return Cookies.get(auth || AuthKey)
    return Cookies.get(auth)
}

/**
 * 设置token
 * @param token key
 * @param value
 * @param option 可设置过期时间等
 * @return {*}
 */
export function setAuth(token, value, option = {}) {
    return Cookies.set(token, value, option)
}

/**
 * 删除token
 * @param token key
 * @return {*}
 */

export function removeAuth(token) {
    return Cookies.remove(token)
}