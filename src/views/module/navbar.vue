<template>
    <div class="menu-bar-container">

        <!-- 导航菜单 -->
        <el-menu ref="navmenu"
                 background-color="#545c64"
                 text-color="#fff"
                 active-text-color="#46A0FC">
            <!-- 导航菜单树组件，动态加载菜单 -->
            <menu-tree v-for="(item,index) in menuList" :key="index" :menu="item"></menu-tree>
        </el-menu>
    </div>

</template>

<script>
    import MenuTree from "@/components/menu-tree.vue"

    export default{
        components:{
            MenuTree
        },
        data(){
            return {
                "arg": this.$route.query.arg,
            }
        },
        computed: {
            menuList () {
                return JSON.parse(window.sessionStorage.getItem('menuList'))
            },
            mainTabs: {
                get () { return this.$store.state.tab.mainTabs },
                set (val) { this.$store.commit('updateMainTabs', val) }
            },
            mainTabsActiveName: {
                get () { return this.$store.state.tab.mainTabsActiveName },
                set (val) { this.$store.commit('updateMainTabsActiveName', val) }
            }
        },
        created() {

        },
        methods: {
            // 路由操作处理
            handleRoute (route) {
                // tab标签页选中, 如果不存在则先添加
                var tab = this.mainTabs.filter(item => item.name === route.name)[0]
                if (!tab) {
                    tab = {
                        name: route.name,
                        title: route.name,
                        icon: route.meta.icon
                    }
                    this.mainTabs = this.mainTabs.concat(tab)
                }
                this.mainTabsActiveName = tab.name
                // 切换标签页时同步更新高亮菜单
                if(this.$refs.navmenu != null) {
                    this.$refs.navmenu.activeIndex = '' + route.meta.id
                    this.$refs.navmenu.initOpenedMenu()
                }
            }
        },
        watch: {
            $route: 'handleRoute'
        }

    }
</script>


<style  scoped>

</style>
