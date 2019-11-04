export default {
    state: {
        perms: [],  // 用户权限标识集合
        userName:''
    },
    getters: {

    },
    mutations: {
        setPerms(state, perms){  // 用户权限标识集合
            state.perms = perms;
        },
        setUserName(state,name){
            state.userName = name
        }
    },
    actions: {
    }
}