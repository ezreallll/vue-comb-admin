import md5 from 'md5'
import { Message } from 'element-ui'
import store from '@/store'


export const parmsSignature = () => {
    let time = new Date().valueOf() + ''
    return md5(time).substr(16, 16).toUpperCase()
}


export const isEmptyObj = (obj) => {
  let o = JSON.stringify(obj)
  if (o === '{}') {
    return true
  }
  return false
}


/**
 * 判断用户是否拥有操作权限
 * 根据传入的权限标识，查看是否存在用户权限标识集合
 * @param perms
 */
export function hasPermission (perms) {
    let hasPermission = false

    let permissions = store.state.user.perms
    for(let i=0, len=permissions.length; i<len; i++) {
        if(permissions[i] === perms) {
            hasPermission = true;
            break
        }
    }
    return hasPermission
}
