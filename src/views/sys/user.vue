<template>
    <div class="wrap" v-loading="loading">
        <!--工具栏-->
        <div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
            <el-form :inline="true" :size="`small`">
                <el-form-item>
                    <el-input placeholder="名称"></el-input>
                </el-form-item>
                <el-form-item>
                    <perms-button icon="fa fa-search" :label="`查询`" perms="sys:user" type="primary"/>
                </el-form-item>
                <el-form-item>
                    <perms-button icon="fa fa-plus" :label="`添加`" perms="sys:user:edit" type="primary" @click="handleAdd"/>
                </el-form-item>
            </el-form>
        </div>
        <!--表格内容栏-->
        <el-table :data="userList" stripe size="mini" style="width: 100%;"
                  rowKey="id" >
            <el-table-column
                    prop="id" header-align="center" align="center" width="100" label="ID">
            </el-table-column>
            <el-table-column
                    prop="account" header-align="center" align="center"  label="账号">
            </el-table-column>
            <el-table-column
                    prop="user_name" header-align="center" align="center"  label="姓名">
            </el-table-column>
            <el-table-column
                    prop="role_id" header-align="center" align="center"  label="身份">
                <template scope="scope">
                    <span>{{roleFormat(scope.row.role_id)}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="status" header-align="center" align="center" label="状态">
                <template slot-scope="scope">
                    <el-tag v-if="scope.row.status === 1" size="small" type="success">正常</el-tag>
                    <el-tag v-else-if="scope.row.status === 2" size="small" type="info">禁用</el-tag>
                </template>
            </el-table-column>

            <el-table-column  header-align="center" align="center" width="185">
                <template slot-scope="scope">
                    <perms-button :icon="`el-icon-edit`" perms="sys:user:edit" type="primary" @click="handleEdit(scope.row)"/>
                    <perms-button :icon="`el-icon-delete`" perms="sys:user:delete" type="danger" @click="handleDelete(scope.row)"/>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination layout="total, prev, pager, next, jumper" @current-change="refreshPageRequest"
                       :current-page="pageInfo.currentPage" :page-size="pageInfo.pageSize" :total="pageInfo.totalSize" style="float:right;">
        </el-pagination>

        <!--添加编辑弹窗-->
        <el-dialog :title="dataForm.id ? '编辑':'编辑'" width="40%" :visible.sync="dialogVisible"
                   :close-on-click-modal="false">
            <el-form :model="dataForm" :rules="fieldRules" ref="dataForm" label-width="80px" :size="size"
                     style="text-align:left;">

                <el-form-item label="账号" prop="account">
                    <el-input v-model="dataForm.account"></el-input>
                </el-form-item>
                <el-form-item label="姓名" prop="user_name">
                    <el-input v-model="dataForm.user_name"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-row>
                        <el-col :span="22">
                            <el-input v-model="dataForm.password"></el-input>
                        </el-col>
                        <el-col :span="2" class="icon-list__tips">
                            <el-tooltip placement="top" effect="light" style="padding: 10px;">
                                <div slot="content">
                                    <p>
                                        添加：默认为123456</br>
                                        编辑：不填为不修改
                                    </p>
                                </div>
                                <i class="el-icon-warning"></i>
                            </el-tooltip>
                        </el-col>
                    </el-row>
                </el-form-item>
                <el-form-item label="选择角色" class="dialog">
                    <el-select v-model="dataForm.role_id" placeholder="请选择">
                        <el-option
                                v-for="item in roleList"
                                :key="item.role_id"
                                :label="item.role_name"
                                :value="item.role_id"
                        ></el-option>
                    </el-select>
                    <span style="color: darkcyan;font-size: 13px">{{roleList[dataForm.role_id - 1] == undefined ? '': roleList[dataForm.role_id - 1].role_desc}}</span>
                </el-form-item>
                <el-form-item label="用户状态" class="dialog">
                    <el-select v-model="dataForm.status" placeholder="请选择">
                        <el-option
                                v-for="item in userStatus"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                        ></el-option>
                    </el-select>
                </el-form-item>

            </el-form>

            <span slot="footer" class="dialog-footer">
             <el-button :size="size" @click="dialogVisible = false">取消</el-button>
             <el-button :size="size" type="primary" @click="submitForm()" :loading="btn_loading"  >确定</el-button>
            </span>
        </el-dialog>
    </div>

</template>

<script>

    import PermsButton from '@/components/perms-button'
    import md5 from 'md5'

    export default{
        components: {
            PermsButton
        },
        data(){
            return {
                size:"small",
                loading:false,
                btn_loading:false,
                dialogVisible:false,
                pageInfo:{
                    currentPage:1,
                    pageSize:5,
                    totalSize:0
                },
                userList:[],
                roleList:[],
                dataForm:{
                    id:0,
                    account:"",
                    user_name:"",
                    password:"",
                    role_id:"",
                    status:1
                },
                fieldRules: {
                    account: [{required: true, message: "账号不能为空", trigger: "blur"}]
                },
                userStatus:[
                    {value: 1, label: '正常'},
                    {value: 2, label: '禁用'}
                ]
            }
        },
        created() {
            this.getUserList();
            this.getRoleList();
        },
        methods: {
            handleDelete(row){
                this.$confirm("确认删除["+row.account+"]吗？", "提示", {
                    type: "warning"
                }).then(() => {
                    let parms = {
                        url: this.$api.userDelete,
                        signature: this.$utils.parmsSignature(),
                        data:{
                            id:row.id
                        }
                    }
                    this.$http.post(parms).then(res => {
                        if(res.status == 1){
                            this.$message({
                                message: '删除成功',
                                type: 'success'
                            });
                            this.getUserList();
                        }else {
                            this.$message({
                                message: res.msg,
                                type: 'warning'
                            });
                        }
                    })
                });
            },
            submitForm(){
                this.btn_loading = true
                if(!this.dataForm.account){
                    this.btn_loading = false
                    return
                }
                if(this.dataForm.password){
                    this.dataForm.password = md5(this.dataForm.password)
                }else if(!this.dataForm.id){ //添加
                    this.dataForm.password = md5('123456')
                }
                let parms = {
                    url: this.$api.useraddOrUpdate,
                    signature: this.$utils.parmsSignature(),
                    data: this.dataForm
                }
                this.$http.post(parms).then(res => {
                    this.btn_loading = false
                    if(res.status == 1){
                        this.$message({
                            message: '操作成功',
                            type: 'success'
                        });
                        this.dialogVisible = false;
                        this.getUserList();
                    }else {
                        this.$message({
                            message: res.msg,
                            type: 'warning'
                        });
                    }
                })
            },
            handleAdd(){
                this.dialogVisible = true;
                this.dataForm={
                    id:0,
                    account:"",
                    user_name:"",
                    password:"",
                    role_id:"",
                    status:1
                }
            },
            handleEdit(row){
                this.dialogVisible = true;
                this.dataForm.id = row.id;
                this.dataForm.account = row.account;
                this.dataForm.user_name = row.user_name;
                this.dataForm.password = "";
                this.dataForm.role_id = row.role_id == 0?"":row.role_id;
                this.dataForm.status = row.status;
            },
            getUserList(){
                this.loading = true
                let parms = {
                    url: this.$api.userList,
                    signature: this.$utils.parmsSignature(),
                    data: {
                        page:this.pageInfo.currentPage,
                        size:this.pageInfo.pageSize
                    }
                }
                this.$http.post(parms).then(res => {
                    this.loading = false
                    this.pageInfo.pageSize=res.data.page_size
                    this.pageInfo.totalSize=res.data.total_count
                    this.userList=res.data.list
                })
            },
            getRoleList(){
                let parms = {
                    url: this.$api.roleList,
                    signature: this.$utils.parmsSignature(),
                    data: {
                    }
                }
                this.$http.post(parms).then(res => {
                    for(let i=0;i<res.data.length;i++){
                        res.data[i].role_id = res.data[i].id
                    }
                    this.roleList = res.data
                })
            },
            roleFormat(val) {
                for(let i=0;i<this.roleList.length;i++){
                    if(val == this.roleList[i].id){
                        return this.roleList[i].role_name;
                    }
                }
                return "-";
            },
            refreshPageRequest: function (pageNum) {
                this.pageInfo.currentPage = pageNum
                this.getUserList()
            }
        },
        filters: {

        }

    }
</script>


<style scoped>


</style>
