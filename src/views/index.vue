<template>
    <div>
        <head-bar></head-bar>
        <el-row class="content">
            <el-col :span="4" class="left">
                <nav-bar></nav-bar>
            </el-col>
            <el-col :span="20" class="right">
                <main-content></main-content>
            </el-col>
        </el-row>
    </div>

</template>

<script>
    import HeadBar from "./module/headbar.vue"
    import NavBar from "./module/navbar.vue"
    import MainContent from "./module/mainContent.vue"
    export default {
        components:{
            HeadBar,
            NavBar,
            MainContent
        }
    };
</script>


<style  scoped>

</style>
