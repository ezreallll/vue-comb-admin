<template>

    <div class="wrap">
        <h3 class="nav">
            权限管理系统
        </h3>
        {{userName}}
        <button @click="logout">登出</button>
    </div>

</template>

<script>

    export default{
        components: {},
        data(){
            return {
                "arg": this.$route.query.arg,
            }
        },
        computed:{
            userName(){
                return this.$store.state.user.userName
            }
        },
        methods: {
            logout(){
                let parms = {
                    url: this.$api.logout,
                    token:'',
                    signature: this.$utils.parmsSignature()
                }
                this.$http.post(parms).then(res => {
                })
                sessionStorage.clear()
                this.$router.push({
                    name: '/login'
                })
            }
        }

    }
</script>


<style  scoped>

    .wrap{
        width:100%;
        height: 60px;
        background: cornflowerblue;
    }

</style>
