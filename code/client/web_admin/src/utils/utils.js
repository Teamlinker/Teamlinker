/*
 * @Descripttion: 
 * @version: 
 * @Author: gqwu
 * @Date: 2021-11-30 09:42:30
 * @LastEditors: gqwu
 * @LastEditTime: 2021-11-30 09:42:31
 */
  export function fromTime(timer) {
    var jsonDate = new Date(timer).toJSON()
    return new Date(new Date(jsonDate) + 8 * 3600 * 1000)
      .toISOString()
      .replace(/T/g, ' ')
      .replace(/\.[\d]{3}Z/, '')
  }