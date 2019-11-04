<template>
    <div class="wrap">
        <el-form  :model="loginForm" :rules="fieldRules" ref="loginForm" label-position="left" label-width="0px" class="demo-ruleForm login-container">
            <el-form-item prop="account">
                <el-input type="text" v-model="loginForm.account" auto-complete="off" placeholder="账号"></el-input>
            </el-form-item>
            <el-form-item prop="password">
                <el-input type="password" v-model="loginForm.password" auto-complete="off" placeholder="密码"></el-input>
            </el-form-item>
            <!-- <el-checkbox v-model="checked" checked class="remember">记住密码</el-checkbox> -->
            <el-form-item style="width:100%;">
                <el-button type="primary" style="width:43%;" @click="reset">重 置</el-button>
                <el-button type="primary" style="width:43%;" @click="login" :loading="loading">登 录</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
    import md5 from 'md5'

    export default {
        name: 'Login',
        data() {
            return {
                loading: false,
                loginForm: {
                    account: 'admin',
                    password: 'admin',
                },
                fieldRules: {
                    account: [
                        { required: true, message: '请输入账号', trigger: 'blur' }
                    ],
                    password: [
                        { required: true, message: '请输入密码', trigger: 'blur' }
                    ]
                },
                checked: true
            }
        },
        methods: {
            login() {
                this.loading = true
                let parms = {
                    url: this.$api.login,
                    signature: this.$utils.parmsSignature(),
                    data: {
                        account: this.loginForm.account,
                        password: md5(this.loginForm.password)
                    }
                }
                this.$http.post(parms).then(res => {
                    this.loading = false
                    if (res.status == 1) {
                        sessionStorage.setItem('token', res['data'])
                        this.$store.commit('menuRouteLoaded', false) //要求重新加载导航菜单
                        this.$router.push({
                            name: 'main'
                        })
                    } else {
                        this.$message({
                            type: 'warning',
                            message: res.msg
                        })
                    }
                })
            },
            reset() {
                this.loginForm ={
                    account: '',
                    password: '',
                }
            }
        }
    }
</script>

<style  scoped>
    .login-container {
        -webkit-border-radius: 5px;
        border-radius: 5px;
        -moz-border-radius: 5px;
        background-clip: padding-box;
        margin:150px auto;
        width: 350px;
        padding: 35px 35px 15px 35px;
        background: #fff;
        border: 1px solid #eaeaea;
        box-shadow: 0 0 25px #cac6c6;
        text-align: center;
    }

    .wrap{
        position: absolute;
        width: 100%;
        height: 100%;
        background: bisque;
    }
</style>