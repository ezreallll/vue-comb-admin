import axios from 'axios'
import router from '@/router/index'
import {isEmptyObj} from './utils'
import {Message} from 'element-ui'

const url = process.env.APT_URL

const http = axios.create({
  baseURL: url,
  timeout: 60 * 1000,
  responseType: 'json'
})

http.interceptors.response.use(
  res => {
    if (res.status === 200) {
      return res.data
    }
  },
  err => {
    if (err.response.status == 404) {
      router.push({
        name: '404'
      })
    } else if(err.response.status == 401){
        Message({
            type: 'error',
            message:"认证异常"
        })
    }else if(err.response.status == 403){
        Message({
            type: 'error',
            message:"权限异常"
        })
    }else {
      router.push({
        name: '500'
      })
    }
    Message({
          type: 'error',
          message: err.msg.statusText
    })
  }
)

export default {
  get (params) {
    let data = '{}'
    let url = params['url']
    if (params['data'] && !isEmptyObj(params['data'])) {
      data = JSON.stringify(params['data'])
    }
    let header = {
      'X-Client': 'ADMIN',
      'Content-Type': 'application/json',
      'X-Token': params['token'] == undefined ? '' : params['token'],
      'X-Signature': params['signature']
    }
    return http({
      url: url,
      method: 'get',
      params: JSON.parse(data),
      headers: header
    })
  },
  post (params) {
    let data = '{}'
    let url = params['url']
    if (params['data'] && !isEmptyObj(params['data'])) {
      data = JSON.stringify(params['data'])
    }
    let header = {
      'X-Client': 'ADMIN',
      'Content-Type': 'application/json',
      'X-Token': sessionStorage.getItem('token'),
      'X-Signature': params['signature']
    }
    return http({
      url: url,
      method: 'post',
      headers: header,
      data: JSON.parse(data)
    })
  },
  edit (params) {
    let data = '{}'
    let url = params['url']
    if (params['data'] && !isEmptyObj(params['data'])) {
      data = JSON.stringify(params['data'])
    }
    let header = {
      'X-Client': 'ADMIN',
      'Content-Type': 'text/plain',
      'X-Token': params['token'] == undefined ? '' : params['token'],
      'X-Signature': params['signature']
    }
    return http({
      url: url,
      method: 'post',
      headers: header,
      data: JSON.parse(data)
    })
  },
  put (params) {
    let data = '{}'
    let url = params['url']
    if (params['data'] && !isEmptyObj(params['data'])) {
      data = JSON.stringify(params['data'])
    }
    let header = {
      'X-Client': 'ADMIN',
      'Content-Type': 'application/json',
      'X-Token': params['token'] == undefined ? '' : params['token'],
      'X-Signature': params['signature']
    }
    return http({
      url: url,
      method: 'put',
      headers: header,
      data: JSON.parse(data)
    })
  },
  del (params) {
    let data = '{}'
    let url = params['url']
    if (params['data'] && !isEmptyObj(params['data'])) {
      data = JSON.stringify(params['data'])
    }
    let header = {
      'X-Client': 'ADMIN',
      'Content-Type': 'application/json',
      'X-Token': params['token'] == undefined ? '' : params['token'],
      'X-Signature': params['signature']
    }
    return http({
      url: url,
      method: 'delete',
      params: JSON.parse(data),
      headers: header
    })
  },
  img (params) {
    let data = null
    let url = params['url']
    if (params['data'] || !isEmptyObj(params['data'])) {
      data = params['data']
    } else {
      return Promise.reject('请上传图片')
    }
    let header = {
      'X-Client': 'ADMIN',
      'Content-Type': 'multipart/form-data',
      'X-Token': params['token'] == undefined ? '' : params['token'],
      'X-Signature': params['signature']
    }
    return http({
      url: url,
      method: 'post',
      headers: header,
      data: data
    })
  },
  file(params) {
        let data = null
        let url = params['url']
        if (params['data'] || !isEmptyObj(params['data'])) {
            data = params['data']
        } else {
            return Promise.reject('请上传图片')
        }
        let header = {
            'X-Client': 'ADMIN',
            'Content-Type': 'multipart/form-data',
            'X-Token': params['token'] == undefined ? '' : params['token'],
            'X-Signature': params['signature']
        }
        return http({
            url: url,
            method: 'post',
            headers: header,
            data: data,
            timeout: 300 * 1000,
            onUploadProgress:params.onUploadProgress
        })
    },
  down (params) {
    let data = '{}'
    let url = params['url']
    if (params['data'] && !isEmptyObj(params['data'])) {
      data = JSON.stringify(params['data'])
    }
    if (!params.download) {
      params.download = ''
    }
    let header = {
      'X-Client': 'ADMIN',
      'Content-Type': 'application/json',
      'X-Token': params['token'] == undefined ? '' : params['token'],
      'X-Signature': params['signature']
    }
    http({
      url: url,
      method: 'post',
      headers: header,
      responseType: 'blob',
      data: JSON.parse(data)
    }).then(res => {
      let time = new Date()
      let Y = time.getFullYear()
      let M = (time.getMonth() + 1 < 10 ? '0' + (time.getMonth() + 1) : time.getMonth() + 1)
      let D = time.getDate() < 10 ? '0' + time.getDate() : time.getDate()
      let s = `${Y}${M}${D}`
      let url = window.URL.createObjectURL(new Blob([res]))
      let link = document.createElement('a')
      link.style.display = 'none'
      link.href = url
      link.setAttribute('download', `${params.download}${s}.xlsx`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      if(params.final!=null){
        params.final();
      }
    })
  }
}
