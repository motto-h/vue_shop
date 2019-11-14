<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" size="medium" @click="drawer = true">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="roleList" stripe border :row-key="id">
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', 'vcenter', index1 === 0 ? 'bdtop' : '']"
              v-for="(item1, index1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="handleClose(scope.row, item1.id)">{{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级 -->
              <el-col :span="19">
                <!-- 通过for循环嵌套渲染二级权限  -->
                <el-row
                  :class="[index2 === 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item2, index2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag closable type="success" @close="handleClose(scope.row, item2.id)">{{ item2.authName }}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 三级权限 -->
                    <el-tag closable type="warning" v-for="item3 in item2.children" 
                            :key="item3.id" @close="handleClose(scope.row, item3.id)">           
                        {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="170px" align="center">
          <template slot-scope="scope">
            <el-button-group>
              <!-- 编辑按钮 -->
              <el-button size="mini" type="primary" icon="el-icon-edit" @click="editRole(scope.row.id)"></el-button>
              <!-- 删除按钮 -->
              <el-button size="mini" type="danger" icon="el-icon-delete" @click="delRole(scope.row.id)"></el-button>
              <!-- 分配权限按钮 -->
              <el-tooltip class="item" effect="dark" content="分配权限" placement="top" :enterable="false">
                <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)"></el-button>
              </el-tooltip>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色抽屉 -->
    <el-dialog title="添加角色" :visible.sync="drawer">
      <el-form label-width="100px" :rules="addroleRules" ref="addroleRef" :model="addRole">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRole.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRole.roleDesc"></el-input>
        </el-form-item>
        <el-button @click="beforeClose">取消</el-button>
        <el-button type="primary" @click="addRoles">提交</el-button>
      </el-form>
    </el-dialog>
    <!-- 编辑角色抽屉 -->
    <el-dialog title="编辑角色" :visible.sync="flag" direction="ltr">
      <div>
        <el-form :model="addRole" ref="editRef" :rules="editroleRules" label-width="100px">
          <el-form-item label="角色名称">
            <el-input v-model="addRole.roleName" prop="roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述">
            <el-input v-model="addRole.roleDesc" prop="roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <div>
          <el-button @click="beforeClose">取 消</el-button>
          <el-button type="primary" @click="updateRole" :loading="loading">
            {{ loading ? '提交中 ...' : '确 定' }}
          </el-button>
        </div>
      </div>
    </el-dialog>
   <!-- 分配权限对话框 -->
<el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClose">
    <!-- 树形组件
    show-checkbox:显示复选框
    node-key:设置选中节点对应的值
    default-expand-all:是否默认展开所有节点
    :default-checked-keys 设置默认选中项的数组
    ref:设置引用 -->
    <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" 
            default-expand-all :default-checked-keys="defKeys" ref="treeRef">
    </el-tree>
    <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
    </span>
</el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      roleList: [],
      flag: false,
      drawer: false,
      loading: false,
      dialogVisible: false,
      setRightDialogVisible: false,
      rightsList: [],
      //树形控件的属性绑定对象
      treeProps: {
        label: 'authName',//通过label设置树形节点文本展示authName
        children: 'children'//设置通过children属性展示子节点信息
      },
      defKeys: [],//设置树形控件中默认选中的内容
      roleId:'',//保存正在操作的角色id
      addRole: {
        roleName: '',
        roleDesc: ''
      },
      addroleRules: {
        roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
        roleDesc: [{ required: true, message: '请输入角色描述', trigger: 'blur' }]
      },
      editroleRules: {
        roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
        roleDesc: [{ required: true, message: '请输入角色描述', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getRoleList()
  },
  methods: {
    async getRoleList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
      this.roleList = res.data
      //   console.log(res.data)
    }, //删除权限操作
    handleClose(role, id) {
      this.$confirm('请问是否要删除该权限', '删除提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${id}`)
          if (res.meta.status !== 200) return this.$message.error('删除权限失败！')
          this.$message.success('删除权限成功！')
          role.children = res.data
          // this.getRoleList();
        })
        .catch(() => {
          this.$message.info('已取消删除')
        })
    }, //关闭前确认操作
    beforeClose() {
      this.$confirm('确认关闭？')
        .then(() => {
          this.drawer = false
          this.flag = false
          this.$message.success('已取消操作！')
        })
        .catch(err => err)
    }, //添加角色操作
    addRoles() {
      this.$refs.addroleRef.validate(async valid => {
        if (!valid) return this.$message.error('角色信息填写错误！')
        const { data: res } = await this.$http.post('roles', this.addRole)
        if (res.meta.status !== 201) return this.$message.error('添加角色失败！')
        this.$message.success('角色添加成功！')
        this.drawer = false
        this.getRoleList()
      })
    }, //删除角色
    delRole(id) {
      this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const { data: res } = await this.$http.delete('roles/' + id)
          if (res.meta.status !== 200) return this.$message.error('删除角色失败！')
          this.$message.success('删除角色成功!')
          this.getRoleList()
        })
        .catch(() => {
          this.$message.info('已取消删除')
        })
    }, //编辑角色操作
    async editRole(id) {
      this.flag = true
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('获取角色信息失败！')
      this.addRole = res.data
    },//更新编辑后的角色信息
    updateRole() {
      // console.log(this.addRole.roleId);
      this.$refs.editRef.validate(async valid => {
        if (!valid) return this.$message.error('角色信息填写错误！')
        const { data: res } = await this.$http.put('roles/' + this.addRole.roleId, {
          roleName: this.addRole.roleName,
          roleDesc: this.addRole.roleDesc
        })
        if (res.meta.status !== 200) return this.$message.error('编辑角色失败！')
        this.$message.success('编辑角色成功！')
        this.flag = false
        this.getRoleList()
      })
    },//分配权限操作
    async showSetRightDialog(role) {
    //将role.id保存起来以供保存权限时使用
    // console.log(role);
    // console.log(role.id);
      this.roleId = role.id;  
      //获取所有权限的数据
      const { data: res } = await this.$http.get('rights/tree')
      //如果返回状态为异常状态则报错并返回
      if (res.meta.status !== 200) return this.$message.error('获取权限树失败')
      //如果返回状态正常，将请求的数据保存在data中
      this.rightsList = res.data
      //调用getLeafKeys进行递归，将三级权限添加到数组中
      this.getLeafKeys(role, this.defKeys)
      //当点击分配权限按钮时，展示对应的对话框
      this.setRightDialogVisible = true
      console.log(this.defKeys)
  },//获取已选中三级权限的id
  getLeafKeys(node, arr) {
      //该函数会获取到当前角色的所有三级权限id并添加到defKeys中
      //如果当前节点不包含children属性，则表示node为三级权限
      if (!node.children) {
        return arr.push(node.id)
      }
      //递归调用
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },//当用户关闭树形权限对话框的时候，清除掉所有选中状态
  setRightDialogClose(){
      this.defKeys = [];
  },//确认添加权限
  async allotRights() {
      //当用户在树形权限对话框中点击确定，将用户选择的
      //权限发送请求进行更新

      //获取所有选中及半选的内容 elementui 提供的方法
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),//选中id
        ...this.$refs.treeRef.getHalfCheckedKeys()//半选中id
      ]
      //将数组转换为 , 拼接的字符串
      const idStr = keys.join(',')
      //发送请求完成更新
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids:idStr }
      )
      if (res.meta.status !== 200)
        return this.$message.error('分配权限失败')

      this.$message.success("分配权限成功")
      this.getRoleList();
      //关闭对话框
      this.setRightDialogVisible = false;
    }
  }
}
</script>
<style lang="less" scoped>
.el-tag {
  margin: 10px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
