// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import './assets/css/reset.css'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import * as $utils from './utils/utils'
import $http from './utils/http' // 服务
import * as $api from './utils/api'




Vue.config.productionTip = false
Vue.prototype.$http = $http
Vue.prototype.$utils = $utils
Vue.prototype.$api = $api
Vue.use(ElementUI)


/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
