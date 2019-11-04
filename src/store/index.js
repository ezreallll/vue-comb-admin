import Vue from 'vue'
import vuex from 'vuex'

Vue.use(vuex);


import app from './modules/app'
import user from './modules/user'
import tab from './modules/tab'
import menu from './modules/menu'

const store = new vuex.Store({
    modules: {
        app : app,
        user: user,
        tab: tab,
        menu:menu
    }
})

export default store