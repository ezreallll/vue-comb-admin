import Vue from 'vue'
import Router from 'vue-router'
import Cookies from "js-cookie"
import store from '@/store'
import $http from '../utils/http' // 服务




Vue.use(Router)

/**
 * 所有路由跳转 使用 name
 */
const _import = require('./import-'+ process.env.NODE_ENV)



const router = new Router({
    routes: [
        {   path: '/login',
            name: 'login',
            component: _import('login')
        },
        {
            path: '/',
            name: 'main',
            component: _import('index'),
            children:[

            ]
        }

    ]
})

router.beforeEach((to, from, next) => {
    // 登录界面登录成功之后，会把用户信息保存在会话
    // 存在时间为会话生命周期，页面关闭即失效。
    let token = sessionStorage.getItem('token');
    if (to.path === '/login') {
        // 如果是访问登录界面，如果用户会话信息存在，代表已登录过，跳转到主页
        if(token) {
            next({ path: '/' })
        } else {
            next()
        }
    }else {
        if (!token) {
            // 如果访问非登录界面，且户会话信息不存在，代表未登录，则跳转到登录界面
            next({ path: '/login' })
        } else {
            // 加载动态菜单和路由
            addDynamicMenuAndRoutes()
            next();
        }
    }
})

function handleStaticComponent(router, dynamicRoutes) {
    router.options.routes[1].children = router.options.routes[1].children.concat(dynamicRoutes)
}

function addDynamicMenuAndRoutes() {
    // 判断是否已经添加过
    if(store.state.app.menuRouteLoaded) {
        console.log('menu已经加载完毕')
        return
    }
    // 获取菜单栏权限 ===========
    let parms = {
        url: "/sys/userInfo",
    }
    $http.post(parms).then(res => {
        // 添加动态路由
        store.commit("setUserName",res.data.name)
        store.commit("setMenuList",res.data.menuList)
        store.commit("setPerms",res.data.perms)
        let dynamicRoutes = addDynamicRoutes(res.data.menuList)
        handleStaticComponent(router, dynamicRoutes)
        router.addRoutes(router.options.routes)
        console.log("=== 路由已更新 ===")
        // 保存加载状态
        store.commit('menuRouteLoaded',true)
    })
    // 获取菜单栏权限 ===========
}

// 递归序列化 路由
function addDynamicRoutes (menus = [], routes = []) {
    let tempRoute = []
    menus.forEach((menu, index) => {
        if (menu.type == 0) { // 当menu类型为目录
            Array.prototype.push.apply(tempRoute,menu.children)
        } else if (menu.url && /\S/.test(menu.url)) {
            try {
                menu.url = menu.url.replace(/^\//, '')
                let route = {
                    path: menu.url.replace('/','-'),
                    name: menu.name,
                    component: _import( menu.url ),
                    meta: {
                        id: menu.id,
                        title: menu.name,
                        icon:menu.icon,
                        isDynamic: true,
                        isTab: true
                    }
                }
                routes.push(route)
            }catch(e) {
                console.log(e)
            }
        }
    })
    if(tempRoute.length >= 1) {
        addDynamicRoutes(tempRoute, routes)
    }else {
        sessionStorage.setItem('dynamicMenuRoutes', JSON.stringify(routes || '[]'))
    }
    return routes;
}

export default router