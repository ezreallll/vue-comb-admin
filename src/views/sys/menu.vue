<template>
    <div class="wrap" v-loading="loading">
        <!--工具栏-->
        <div class="toolbar" style="float:left;padding-top:10px;padding-left:15px;">
            <el-form :inline="true" :size="`small`">
                <el-form-item>
                    <el-input placeholder="名称"></el-input>
                </el-form-item>
                <el-form-item>
                    <perms-button icon="fa fa-search" :label="`查询`" perms="sys:menu" type="primary"/>
                </el-form-item>
                <el-form-item>
                    <perms-button icon="fa fa-plus" :label="`添加`" perms="sys:menu:edit" type="primary" @click="addMenu()"/>
                </el-form-item>
            </el-form>
        </div>
        <!--表格内容栏-->
        <el-table :data="menuList" stripe size="mini" style="width: 100%;"
                  rowKey="id" >
            <el-table-column
                    prop="id" header-align="center" align="center" width="100" label="ID">
            </el-table-column>
            <el-table-column
                    prop="name" header-align="center" align="center" width="80" label="名称">
            </el-table-column>
            <el-table-column header-align="center" align="center" label="图标">
                <template slot-scope="scope">
                    <i :class="scope.row.icon || ''"></i>
                </template>
            </el-table-column>
            <el-table-column prop="type" header-align="center" align="center" label="类型">
                <template slot-scope="scope">
                    <el-tag v-if="scope.row.type === 0" size="small">目录</el-tag>
                    <el-tag v-else-if="scope.row.type === 1" size="small" type="success">菜单</el-tag>
                    <el-tag v-else-if="scope.row.type === 2" size="small" type="info">按钮</el-tag>
                </template>
            </el-table-column>
            <el-table-column
                    prop="url" header-align="center" align="center" width="150"
                    :show-overflow-tooltip="true" label="菜单URL">
            </el-table-column>
            <el-table-column
                    prop="code" header-align="center" align="center" width="150"
                    :show-overflow-tooltip="true" label="权限认证">
            </el-table-column>
            <el-table-column
                    prop="order_" header-align="center" align="center" width="150"
                    :show-overflow-tooltip="true" label="排序">
            </el-table-column>
            <el-table-column fixed="right" header-align="center" align="center" width="185">
                <template slot-scope="scope">
                    <perms-button :icon="`el-icon-edit`" perms="sys:menu:edit" type="primary" @click="editMenu(scope.row)"/>
                    <perms-button :icon="`el-icon-delete`" perms="sys:menu:delete" type="danger" @click="deleteMenu(scope.row)"/>
                </template>
            </el-table-column>
        </el-table>
        <!--添加编辑弹窗-->
        <el-dialog :title="menuForm.id ? '添加':'编辑'" width="40%" :visible.sync="dialogVisible"
                   :close-on-click-modal="false">
            <el-form :model="menuForm" :rules="fieldRules" ref="menuForm" label-width="80px" :size="size"
                     style="text-align:left;">
                <el-form-item label="菜单类型" prop="type">
                    <el-radio-group v-model="menuForm.type">
                        <el-radio v-for="(type, index) in menuTypeList" :label="index" :key="index">{{ type }}
                        </el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item :label="menuTypeList[menuForm.type] + '名称'" prop="name">
                    <el-input type="text" v-model="menuForm.name" :placeholder="menuTypeList[menuForm.type] + '名称'"></el-input>
                </el-form-item>
                <el-form-item label="上级菜单" prop="parentName">
                    <pop-tree-input
                            :data="popTreeData" :props="popTreeProps"
                            :prop="menuForm.parentName==null||menuForm.parentName==''?'顶级菜单':menuForm.parentName"
                            :currentChangeHandle="handleTreeSelectChange">
                    </pop-tree-input>
                </el-form-item>
                <el-form-item label="授权标识" prop="perms">
                    <el-input v-model="menuForm.perms"
                              placeholder="如: sys:user:add, sys:user:edit, sys:user:delete"></el-input>
                </el-form-item>
                <el-form-item v-if="menuForm.type === 1" label="菜单路由" prop="url">
                    <el-row>
                        <el-col :span="22">
                            <el-input v-model="menuForm.url" placeholder="菜单路由"></el-input>
                        </el-col>
                        <el-col :span="2" class="icon-list__tips">
                            <el-tooltip placement="top" effect="light" style="padding: 10px;">
                                <div slot="content">
                                    <p>URL格式：</p>
                                    <p>如用户管理 : /sys/user </p>
                                </div>
                                <i class="el-icon-warning"></i>
                            </el-tooltip>
                        </el-col>
                    </el-row>
                </el-form-item>
                <el-form-item v-if="menuForm.type !== 2" label="排序编号" prop="orderNum">
                    <el-input-number v-model="menuForm.orderNum" controls-position="right" :min="0"
                                     label="排序编号"></el-input-number>
                </el-form-item>
                <el-form-item v-if="menuForm.type !== 2" label="菜单图标" prop="icon">
                    <el-row>
                        <el-col :span="22">
                            <el-input v-model="menuForm.icon" v-popover:iconListPopover :readonly="false"
                                      placeholder="菜单图标名称（如：fa fa-home fa-lg）" class="icon-list__input"></el-input>
                        </el-col>
                        <el-col :span="2" class="icon-list__tips">
                        </el-col>
                    </el-row>
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
    import PopTreeInput from '@/components/pop-tree-input'

    export default{
        components: {
            PermsButton,
            PopTreeInput
        },
        data(){
            return {
                loading: true,
                btn_loading:false,
                size:"small",
                permsButton: {
                    "add": "添加"
                },
                menuList: [],
                dialogVisible: false,
                menuTypeList: ["目录", "菜单", "按钮"],
                menuForm: {
                    id: 0,
                    type: 1,
                    name: "",
                    parentId: 0,
                    parentName:"",
                    url: "",
                    perms: "",
                    orderNum: 0,
                    icon: ""
                },
                fieldRules: {
                    name: [{required: true, message: "名称不能为空", trigger: "blur"}]
                },
                popTreeData: [{
                    id: 0,
                    name: "顶级菜单",
                    children: []
                }],
                popTreeProps: {
                    label: "name",
                    children: "children"
                }
            }
        },
        created() {
            this.getMenuList();
        },
        methods: {
            // 菜单树选中
            handleTreeSelectChange(data, node) {
                this.menuForm.parentId = data.id;
                this.menuForm.parentName = data.name;
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
                    this.popTreeData[0].children = this.menuList
                })
            },
            addMenu(){
                this.dialogVisible = true;
                this.menuForm = {
                    id: 0,
                    type: 1,
                    name: "",
                    parentId: 0,
                    parentName:"",
                    url: "",
                    perms: "",
                    orderNum: 0,
                    icon: ""
                }
            },
            editMenu(row){
                this.dialogVisible = true;
                this.menuForm = {
                    id: row.id,
                    type: row.type,
                    name: row.name,
                    parentId: row.parentId,
                    parentName:row.parentName,
                    url: row.url,
                    perms: row.code,
                    orderNum: row.order_,
                    icon:row.icon
                }

            },
            deleteMenu(row){
                this.$confirm("确认删除["+row.name+"]吗？", "提示", {
                    type: "warning"
                }).then(() => {
                    let parms = {
                        url: this.$api.menuDelete,
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
                            this.getMenuList();
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
                if(!this.menuForm.name){
                    this.btn_loading = false
                    return
                }
                let parms = {
                    url: this.$api.menuAddOrUpdate,
                    signature: this.$utils.parmsSignature(),
                    data: this.menuForm
                }
                console.log(this.menuForm)
                this.$http.post(parms).then(res => {
                    this.btn_loading = false
                    if(res.status == 1){
                        this.$message({
                            message: '操作成功',
                            type: 'success'
                        });
                        this.dialogVisible = false;
                        this.getMenuList();
                    }else {
                        this.$message({
                            message: res.msg,
                            type: 'warning'
                        });
                    }
                })
            }

        }

    }
</script>


<style scoped>

    .wrap {
        width: 100%;
        height: auto;
    }


</style>
