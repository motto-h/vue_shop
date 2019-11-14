<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-row :gutter="20">
        <!-- 搜索框 -->
        <el-col :span="9">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getuserList">
            <el-button slot="append" icon="el-icon-search" @click="getuserList"></el-button>
          </el-input>
        </el-col>
        <!-- 按钮 -->
        <el-col :span="3">
          <el-button type="primary" round @click="dialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <el-table :data="userList" stripe border>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="姓名" :resizabl="false"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <!-- {{scope.row}} -->
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150px" align="center">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" circle size="small" @click="editUser(scope.row.id)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" circle size="small" @click="removeUser(scope.row.id)"></el-button>
            <!-- 角色分配按钮 -->
            <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-star-off" circle size="small" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 4, 6, 8]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="dialogVisible" width="50%" center @close="addDialogClosed">
      <el-form label-width="70px" :rules="adduserRules" ref="addFormRef" :model="addForm">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser('addFormRef')">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户信息" :visible.sync="editdialogVisible" width="30%" center @close="editDialogClosed">
      <!-- 内容区 -->
      <el-form label-width="70px" :rules="eidtuserRules" ref="editFormRef" :model="editForm">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserForm('editFormRef')">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改角色对话框 -->
    <el-dialog title="分配角色" :visible.sync="setrolesVisible" width="50%" @close="setRoleDialogClosed">
      <p>当前的用户：{{ userInfo.username }}</p>
      <p>当前的角色：{{ userInfo.role_name }}</p>
      <p><!-- 控制显示分配角色对话框 -->
        分配新角色：
        <el-select v-model="setRolesId" placeholder="请选择">
          <el-option v-for="item in rolesList" 
          :key="item.id"       
          :label="item.roleName" 
          :value="item.id"> 
          </el-option>
        </el-select>
      </p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setrolesVisible = false">取 消</el-button>
        <el-button type="primary" @click="setUserRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    //验证邮箱
    var checkemail = (rule, value, callback) => {
      const regEmail = /^\w+@\w+(\.\w+)+$/
      if (regEmail.test(value)) {
        //验证合法
        return callback()
      }
      callback(new Error('邮箱格式错误'))
    }
    //验证手机号
    var checkmobile = (rule, value, callback) => {
      const regMobile = /^1[34578]\d{9}$/
      //验证合法
      if (regMobile.test(value)) {
        return callback()
      }
      callback(new Error('电话号码格式错误'))
    }
    return {
      editdialogVisible: false,// 是否显示编辑用户弹出框
      dialogVisible: false,//是否显示添加用户弹出窗
      setrolesVisible: false,//控制显示分配角色对话框
      setRolesId:'',//保存用户选中的角色id
      userInfo: {},//保存正在操作的那个用户信息
      userList: [],//保存所有的用户信息
      rolesList: [],//保存所有的角色信息
      total: 0,
      queryInfo: {
        query: '',
        pagenum: 1, // 当前的页数，即页码
        pagesize: 2 // 每页显示的数据条数
      },
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      editForm: {
        username: '',
        email: '',
        mobile: ''
      },
      adduserRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 6, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 12, message: '长度在 6 到 12 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkemail, message: '邮箱格式不正确，请重新输入', trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkmobile, message: '手机号码不正确，请重新输入', trigger: 'blur' }
        ]
      },
      eidtuserRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkemail, message: '邮箱格式不正确，请重新输入', trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkmobile, message: '手机号码不正确，请重新输入', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getuserList()
  },
  methods: {
    //获取用户列表
    async getuserList() {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取用户列表失败！')
      //   this.$message.success('用户列表获取成功！')
      this.userList = res.data.users
      this.total = res.data.total
      //   console.log(res)
    },
    handleSizeChange(newsize) {
      //每页信息条数
      this.queryInfo.pagesize = newsize
      this.getuserList()
    },
    handleCurrentChange(newpage) {
      //第几页
      this.queryInfo.pagenum = newpage
      this.getuserList()
    }, //更改用户状态按钮
    async userStateChanged(row) {
      //向服务器请求数据
      const { data: res } = await this.$http.put(`users/${row.id}/state/${row.mg_state}`)
      if (res.meta.status !== 200) {
        //如果失败了恢复按钮选中状态
        row.mg_state != row.mg_state
        return this.$message.error('更改用户状态失败！')
      }
      this.$message.success('更改用户状态成功！')
    }, //重置添加表单
    addDialogClosed() {
      // console.log(this)
      this.$refs.addFormRef.resetFields()
    }, //添加用户
    addUser(addFormRef) {
      //表单预校验
      this.$refs.addFormRef.validate(async valid => {
        //如果信息验证失败
        if (!valid) return this.$message.error('请填写完整用户信息')
        //信息验证成功 向服务器请求数据
        const { data: res } = await this.$http.post('users', this.addForm)
        console.log(res)
        //根据返回信息判断是否添加成功
        if (res.meta.status !== 201) return this.$message.error('添加用户失败')
        this.$message.success('添加用户成功')
        //关闭对话框
        this.dialogVisible = false
        //重新获取用户信息
        this.getuserList()
      })
    }, //查询修改用户信息
    async editUser(id) {
      const { data: res } = await this.$http.get('users/' + id)
      console.log('查询修改用户信息:', res)
      if (res.meta.status !== 200) return this.$message.error('查询用户信息失败')
      //将查询到的用户信息赋值给editForm 双向绑定显示到页面
      this.editForm = res.data
      this.editdialogVisible = true
    }, //修改框关闭后重置
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    }, //更新修改后的用户信息
    async editUserForm(editFormRef) {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return this.$message.error('填写用户信息错误')
        const { data: res } = await this.$http.put('users/' + this.editForm.id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
          //对应接口文档提供的字段
        })
        if (res.meta.status !== 200) return this.$message.error('修改用户信息失败！')
        this.$message.success('修改用户信息成功！')
        this.editdialogVisible = false
        this.getuserList()
      })
    }, //删除用户
    removeUser(id) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const { data: res } = await this.$http.delete('users/' + id)
          if (res.meta.status !== 200) this.$message.error('删除用户失败！')
          this.$message.success('删除用户成功！')
          this.getuserList()
        })
        .catch(() => {
          this.$message.info('已取消删除操作')
        })
    },//获取角色列表信息
    async setRole(userInfo) {
      this.userInfo = userInfo
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) this.$message.error('获取角色列表失败！')
      this.rolesList = res.data
      this.setrolesVisible = true
    },//更新用户角色
    async setUserRole(){
      if(!this.setRolesId)return this.$message.error('请选择用户角色！');
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`,{rid:this.setRolesId});
      if (res.meta.status !== 200) this.$message.error('更新用户角色失败！');
      this.$message.success('更新角色成功！');
      this.getuserList();
      this.setrolesVisible = false;
    },
     setRoleDialogClosed(){
      //当关闭对话框的时候，重置下拉框中的内容
      this.selectedRoleId = ''
      this.userInfo = {}
    }
  }
}
</script>

<style lang="less" scoped>
.el-card {
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.15) !important;
}
</style>
