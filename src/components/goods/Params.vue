<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告区域 :closable="false"(是否展示“X”号) show-icon(显示图标) -->
      <el-alert title="注意：只允许为第三级分类设置相关参数" type="warning" :closable="false" show-icon> </el-alert>

      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader v-model="selectedKeys" :options="CateList" :props="cateProps" @change="handleChanged" clearable>
          </el-cascader>
        </el-col>
        <el-col>
          <el-tabs v-model="activeName" @tab-click="tabClick">
            <el-tab-pane label="动态参数" name="many">
              <el-button type="primary" :disabled="isbtn" size="medium" round @click="addDialogVisible = true"
                >添加参数</el-button
              >
              <!-- 动态参数表格 -->
              <el-table :data="manyTableData" border stripe>
                <!-- 展开行 -->
                <el-table-column type="expand">
                  <template slot-scope="scope">
                    <el-tag
                      :key="index"
                      v-for="(item, index) in scope.row.attr_vals"
                      closable
                      @close="handleClose(index, scope.row)"
                    >
                      {{ item }}
                    </el-tag>
                    <el-input
                      class="input-new-tag"
                      v-if="scope.row.inputVisible"
                      v-model="scope.row.inputValue"
                      ref="saveTagInput"
                      size="small"
                      @keyup.enter.native="handleInputConfirm(scope.row)"
                      @blur="handleInputConfirm(scope.row)"
                    >
                    </el-input>
                    <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                  </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index" header-align="center"></el-table-column>
                <el-table-column label="参数名称" prop="attr_name" header-align="center"></el-table-column>
                <el-table-column label="操作" width="200px" align="center">
                  <template slot-scope="scope">
                    <el-button
                      type="primary"
                      icon="el-icon-edit"
                      circle
                      size="medium"
                      @click="geteditParams(scope.row.attr_id)"
                    ></el-button>
                    <el-button
                      type="danger"
                      icon="el-icon-delete"
                      circle
                      size="medium"
                      @click="delParams(scope.row.attr_id)"
                    ></el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
            <!-- *********************** -->
            <el-tab-pane label="静态属性" name="only">
              <el-button type="primary" :disabled="isbtn" size="medium" round @click="addDialogVisible = true"
                >添加属性</el-button
              >
              <!-- 静态参数表格 -->
              <el-table :data="onlyTableData" border stripe>
                <!-- 展开行 -->
                <el-table-column type="expand">
                  <template slot-scope="scope">
                    <el-tag
                      :key="index"
                      v-for="(item, index) in scope.row.attr_vals"
                      closable
                      @close="handleClose(index, scope.row)"
                    >
                      {{ item }}
                    </el-tag>
                    <el-input
                      class="input-new-tag"
                      v-if="scope.row.inputVisible"
                      v-model="scope.row.inputValue"
                      ref="saveTagInput"
                      size="small"
                      @keyup.enter.native="handleInputConfirm(scope.row)"
                      @blur="handleInputConfirm(scope.row)"
                    >
                    </el-input>
                    <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>                   
                  </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index" header-align="center"></el-table-column>
                <el-table-column label="参数名称" prop="attr_name" header-align="center"></el-table-column>
                <el-table-column label="操作" width="200px" align="center">
                  <template slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" circle size="medium"
                               @click="geteditParams(scope.row.attr_id)"></el-button>
                    <el-button type="danger" icon="el-icon-delete" circle size="medium"
                               @click="delParams(scope.row.attr_id)"></el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </el-card>
    <!-- 添加参数/属性的对话框 -->
    <el-dialog :title="'添加' + titleText" :visible.sync="addDialogVisible" width="40" center @close="addDialogClosed">
      <!-- 添加表单 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数/属性对话框 -->
    <el-dialog :title="'删除' + titleText" :visible.sync="editDialogVisible" width="40" center @close="editDialogClosed">
      <!-- 修改表单 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      CateList: [],
      selectedKeys: [],
      activeName: 'many',
      cateProps: {
        expandTrigger: 'hover', //触发时机 hover
        value: 'cat_id', //选择项的id值 唯一标识
        label: 'cat_name', // 用户看到的字段
        children: 'children' // 父子关联的字段
      },
      manyTableData: [],
      onlyTableData: [],
      addDialogVisible: false,
      editDialogVisible: false,
      addForm: {
        attr_name: ''
      },
      addFormRules: {
        attr_name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
      },
      editForm: {
        attr_name: ''
      },
      editFormRules: {
        attr_name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getCateLIst()
  },
  computed: {
    //控制添加按钮的显示隐藏
    isbtn() {
      if (this.selectedKeys.length !== 3) return true
      return false
    },
    //获取选中的三级分类id
    cateId() {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[this.selectedKeys.length - 1]
      }
      return null
    },
    titleText() {
      if (this.activeName === 'many') {
        return '参数'
      } else {
        return '属性'
      }
    }
  },
  methods: {
    //获取分类列表
    async getCateLIst() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类列表失败！')
      this.CateList = res.data
    }, //级联选择框改变 获取对应的参数和属性
    handleChanged() {
      this.getParamsData()
    }, //点击tab栏切换响应的数据展示
    tabClick() {
      // console.log(this.activeName)
      this.getParamsData()
    }, //获取属性和参数
    async getParamsData() {
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = [];
        this.manyTableData=[];
        this.onlyTableData =[];
        return
      }
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
      if (res.meta.status !== 200) return;
      //将attr_vals字符串转化为数组类型
      res.data.forEach(el => {
        el.attr_vals = el.attr_vals ? el.attr_vals.split(' ') : []
        //添加每一行单独的属性 避免相互关联
        el.inputVisible = false
        el.inputValue = ''
      })

      if (this.activeName === 'many') {
        //获取的是动态参数
        this.manyTableData = res.data
      } else if (this.activeName === 'only') {
        //获取的是静态属性
        this.onlyTableData = res.data
      }
    }, //添加动态参数、静态属性操作
    async addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        //校验通过，发送请求完成添加参数或者属性
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) return this.$message.error('添加参数失败')
        this.$message.success('添加参数成功')
        this.addDialogVisible = false
        this.getParamsData()
      })
    }, //添加参数后关闭 重置对话框
    addDialogClosed() {
      this.addForm = {}
    }, //获取修改参数信息
    async geteditParams(id) {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${id}`, {
        params: { attr_sel: this.activeName }
      })
      if (res.meta.status !== 200) return this.$message.error('获取参数失败！')
      this.editForm = res.data
      this.editDialogVisible = true
    }, //执行修改参数操作
    editParams() {
      // categories/:id/attributes/:attrId
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 200) return this.$message.error('修改参数失败！')
        this.$message.success('修改' + this.titleText + '成功！')
        this.getParamsData()
        this.editDialogVisible = false
      })
    },
    //删除参数
    delParams(id) {
      // categories/:id/attributes/:attrid
      this.$confirm('此操作将永久删除改参数/属性', '是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`)
          if (res.meta.status !== 200) return this.$message.error('删除参数数据失败')
          this.$message.success('删除' + this.titleText + '数据成功')
          this.editDialogVisible = false
          this.getParamsData()
        })
        .catch(() => {
          this.editDialogVisible = false
          return this.$message.info('已取消删除操作！')
        })
    }, //关闭修改 重置对话框
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    //删除tag标签
    handleClose(index, row) {
      //删除对应索引的参数可选项
      row.attr_vals.splice(index, 1)
      //调用函数，完成保存可选项的操作
      this.saveAttrInput(row)
    }, //点击打开新添加tag的输入框
    showInput(row) {
      row.inputVisible = true
      //$nextTick()在页面上元素被重新渲染之后，调用回调函数的代码
      this.$nextTick(_ => {
        //让文本框自动获得焦点
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },//处理tag标签添加操作
    handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 如果用户输入了真实合法的数据，需要保存起来
      row.attr_vals.push(row.inputValue.trim());
      row.inputValue = ''
      row.inputVisible = false
      this.saveAttrInput(row)
    }, //保存新增tag标签
    async saveAttrInput(row) {
      const {data:res}=await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,{
        attr_name:row.attr_name,
        attr_sel:row.attr_sel,
        attr_vals:row.attr_vals.join(' ')
      });
      if(res.meta.status!==200)return this.$message.error('创建失败！');
      //  this.$message.success('创建成功！');
    }
  }
}
</script>
<style lang="less" scoped>
.cat_opt {
  margin: 10px 0;
}
.el-tabs {
  margin: 10px 0;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 150px;
}
</style>
