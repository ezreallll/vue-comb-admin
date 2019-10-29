<template>

    <div class="wrap" :loading="loading">
        <div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
            <el-form :inline="true" :size="`small`">
                <el-form-item>
                    <el-input placeholder="名称"></el-input>
                </el-form-item>
                <el-form-item>
                    <perms-button icon="fa fa-search" :label="`查询`" perms="sys:menu" type="primary"/>
                </el-form-item>
                <el-form-item>
                    <perms-button icon="fa fa-plus" :label="`添加`" perms="sys:menu:edit" type="primary" @click="handleAdd"/>
                </el-form-item>
            </el-form>
        </div>
        <!--表格内容栏-->
        <el-table :data="roleList" stripe size="mini" style="width: 100%;"  height="250"
                  rowKey="id"  highlight-current-row @current-change="handleCurrentChange">
            <el-table-column
                    prop="id" header-align="center" align="center" width="100" label="ID">
            </el-table-column>
            <el-table-column
                    prop="role_name" header-align="center" align="center"  label="角色">
            </el-table-column>
            <el-table-column
                    prop="role_desc" header-align="center" align="center"  label="描述">
            </el-table-column>

            <el-table-column  header-align="center" align="center" width="185">
                <template slot-scope="scope">
                    <perms-button :icon="`el-icon-edit`" perms="sys:menu:edit" type="primary" @click="handleEdit(scope.row)"/>
                    <perms-button :icon="`el-icon-delete`" perms="sys:menu:delete" type="danger" @click="handleDelete(scope.row)"/>
                </template>
            </el-table-column>
        </el-table>
        <!--添加编辑弹窗-->
        <el-dialog :title="dataForm.id ? '编辑':'编辑'" width="40%" :visible.sync="dialogVisible"
                   :close-on-click-modal="false">
            <el-form :model="dataForm" :rules="fieldRules" ref="dataForm" label-width="80px" :size="`small`"
                     style="text-align:left;">
                <el-form-item label="角色" prop="role_name">
                    <el-input v-model="dataForm.role_name"></el-input>
                </el-form-item>
                <el-form-item label="描述" prop="role_desc">
                    <el-input v-model="dataForm.role_desc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
             <el-button :size="`small`" @click="dialogVisible = false">取消</el-button>
             <el-button :size="`small`" type="primary" @click="submitForm()" :loading="btn_loading" >确定</el-button>
        </span>
        </el-dialog>
        <!--角色菜单管理树-->
        <div class="menu-container" :v-if="true">
            <div class="menu-header">
                <span><B>角色菜单授权</B></span>
                <el-checkbox class="check_all" v-model="checkAll" @change="handleCheckAll" :disabled="this.currentRole == ''"><b>全选</b></el-checkbox>
                <perms-button class="menu_save" :label="`保存`"  perms="sys:menu:edit" type="primary" @click="handleMenuSave()"/>
            </div>
            <el-tree :data="menuList" size="mini" show-checkbox node-key="id" :props="defaultProps"
                     style="width: 100%;pading-top:20px;" ref="menuTree" :render-content="renderContent"
                     element-loading-text="拼命加载中" :check-strictly="true"
                     @check-change="handleMenuCheckChange">
            </el-tree>

        </div>
    </div>


</template>

<script>

    import PermsButton from '@/components/perms-button'


    export default{
        components: {
            PermsButton
        },
        data(){
            return {
                loading:false,
                checkAll:false,
                btn_loading:false,
                dialogVisible:false,
                currentRole:'',
                roleList: [],
                menuList:[],
                dataForm:{
                    role_name:"",
                    role_desc:""
                },
                fieldRules:{
                    role_name: [{required: true, message: "角色不能为空", trigger: "blur"}]
                },
                defaultProps:{
                    label: "name",
                    children: "children"
                }
            }
        },
        created() {
            this.getRoleListWithMenu();
            this.getMenuList();
        },
        methods: {
            handleMenuSave(){
                let roleMenu={
                    role_id:this.currentRole,
                    menus:this.$refs.menuTree.getCheckedKeys(false, true)
                }
                this.loading = true
                let parms = {
                    url: this.$api.saveRoleMenuPerms,
                    signature: this.$utils.parmsSignature(),
                    data: roleMenu
                }
                this.$http.post(parms).then(res => {
                    this.loading = false
                    if(res.status == 1){
                        this.$message({
                            message: '保存成功',
                            type: 'success'
                        });
                        this.getRoleListWithMenu();
                    }else {
                        this.$message({
                            message: res.msg,
                            type: 'warning'
                        });
                    }
                })

            },
            // 选择角色
            handleCurrentChange(role){
                this.currentRole = role.id
                this.checkAll = false
                //设置权限树选中
                let keys =[]
                $.each(role.roles,function (index,item) {
                    keys.push(item.menu_id)
                })
                this.$refs.menuTree.setCheckedKeys(keys)
            },
            // 树节点选择监听
            handleMenuCheckChange(data, check, subCheck) {
                if(check) {
                    // 节点选中时同步选中父节点
                    let parentId = data.parentId
                    this.$refs.menuTree.setChecked(parentId, true, false)
                } else {
                    // 节点取消选中时同步取消选中子节点
                    if(data.children != null) {
                        data.children.forEach(element => {
                            this.$refs.menuTree.setChecked(element.id, false, false)
                        });
                    }
                }
            },
            // 全选操作
            handleCheckAll() {
                if(this.checkAll) {
                    let allMenus = []
                    this.checkAllMenu(this.menuList, allMenus)
                    this.$refs.menuTree.setCheckedNodes(allMenus)
                } else {
                    this.$refs.menuTree.setCheckedNodes([])
                }
            },
            // 递归全选
            checkAllMenu(menuList, allMenus) {
                menuList.forEach(menu => {
                    allMenus.push(menu)
                    if(menu.children) {
                        this.checkAllMenu(menu.children, allMenus)
                    }
                });
            },
            getMenuList(){
                this.loading = true
                let parms = {
                    url: this.$api.menuList,
                    signature: this.$utils.parmsSignature(),
                    data: {}
                }
                this.$http.post(parms).then(res => {
                    this.loading=false,
                    this.menuList = res.data
                })
            },
            handleDelete(row){
                this.$confirm("确认删除["+row.account+"]吗？", "提示", {
                    type: "warning"
                }).then(() => {
                    let parms = {
                        url: this.$api.roleDelete,
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
                if(!this.dataForm.role_name){
                    this.btn_loading = false
                    return
                }
                let parms = {
                    url: this.$api.roleAddOrUpdate,
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
                        this.getRoleListWithMenu();
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
                    role_name:"",
                    role_desc:""
                }
            },
            handleEdit(row){
                this.dialogVisible = true;
                this.dataForm.id = row.id;
                this.dataForm.role_name = row.role_name;
                this.dataForm.role_desc = row.role_desc;
            },
            getRoleListWithMenu(){
                let parms = {
                    url: this.$api.roleMenuList,
                    signature: this.$utils.parmsSignature(),
                    data: {}
                }
                this.$http.post(parms).then(res => {
                    if(res.status == 1){
                       this.roleList = res.data
                    }else {
                        this.$message({
                            message: res.msg,
                            type: 'warning'
                        });
                    }
                })
            },
            renderContent(h, { node, data, store }) {
                return (
                        <div class="column-container">
                        <span style="text-algin:center;margin-right:80px;">{data.name}</span>
                <span style="text-algin:center;margin-right:80px;">
                        <el-tag type={data.type === 0?'':data.type === 1?'success':'info'} >
                                 {data.type === 0?'目录':data.type === 1?'菜单':'按钮'}
                        </el-tag>
                </span>
                <span style="text-algin:center;margin-right:80px;"> <i class={data.icon}></i></span>
                <span style="text-algin:center;margin-right:80px;">{data.parentName?data.parentName:'顶级菜单'}</span>
                <span style="text-algin:center;margin-right:80px;">{data.url?data.url:'\t'}</span>
                </div>);
            }
        }
    }
</script>


<style scoped>

    .menu-header{
        padding-top: 20px;
        padding-bottom: 20px;
    }

    .check_all{
        margin-left: 50px;
    }
    .menu_save{
        margin-left: 50px;
    }

</style>
