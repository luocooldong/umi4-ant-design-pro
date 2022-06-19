const groupHostName = process.env.UMI_ENV === 'production' ? 'group.jxedt.com' : 'group.58v5.cn'
const TokenKey = (location.hostname.includes(groupHostName) || location.host === 'localhost:9000')  ? 'saasGroupCookieId' : 'saasCookieId';

/**
 * 获取cookie信息
 *
 * @param key Cookie名称
 */
export function getCookie(key = TokenKey) {
  let arr = document.cookie.split('; '); //以；分割符
  for (let i = 0, len = arr.length; i < len; i++) {
    let arr2 = arr[i].split('=');
    if (arr2[0] === key) {
      return arr2[1];
    }
  }
  return '';
}
