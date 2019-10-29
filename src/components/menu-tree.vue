<template>
    <el-submenu v-if="menu.children && menu.children.length >= 1" :index="'' + menu.id">
        <template slot="title">
            <i :class="menu.icon" ></i>
            <span slot="title">{{menu.name}}</span>
        </template>
        <menu-tree v-for="(item,index) in menu.children" :key="index" :menu="item"></menu-tree>
    </el-submenu>
    <el-menu-item v-else :index="'' + menu.id" @click="goToRoute(menu)">
        <span slot="title">{{menu.name}}</span>
    </el-menu-item>
</template>
<script>

    export default{
        name:"menu-tree",
        props: {
            menu: {
                type: Object,
                required: true
            }
        },
        computed: {
            dyRoute () {
                return JSON.parse(window.sessionStorage.getItem('dynamicMenuRoutes'))
            }
        },
        methods: {
            goToRoute (menu) {
                let route = this.dyRoute.filter(item => item.meta.id === menu.id)
                this.$router.push(route[0].path)
            }
        }

    }
</script>


<style  scoped>


</style>
