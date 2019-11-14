<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加分类按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showaddcate">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 分类表格  -->
      <!-- 分类表格:data(设置数据源) :columns(设置表格中列配置信息) :selection-type(是否有复选框)
          :expand-type(是否展开数据) show-index(是否设置索引列) index-text(设置索引列头)
          border(是否添加纵向边框) :show-row-hover(是否鼠标悬停高亮) -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        show-row-hover
        stripe
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color:lightgreen;"></i>
          <i class="el-icon-error" v-else style="color:red;"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button size="small" type="primary" icon="el-icon-edit" circle @click="editCate(scope.row.cat_id)"></el-button>
          <el-button size="small" type="danger" icon="el-icon-delete" circle @click="delCate(scope.row.cat_id)"></el-button>
        </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 8, 10, 12]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加分类弹出框 -->
    <!--  :options="parentCateList"     // :options关联的数据源  类似于table中:data
          :props="cascaderProps"        // :props配置对象
          v-model="selectedKeys"        //data中定义的数组
          @change="parentCateChanged"   //change事件  级联选择框数据发生变化会触发这个对应的函数 -->
    <el-dialog title="添加分类" :visible.sync="addcateVisible" width="50%" @close="addCateDialogClosed">
      <el-form :rules="addcateRules" ref="addcateRef" :model="addcateForm" label-width="80px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addcateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类" prop="cat_pid">
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="selectProps"
            @change="parentCateChanged"
            clearable>
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addcateVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑分类弹出框 -->
    <el-dialog title="修改分类" :visible.sync="editcateVisible" width="50%" @close="editCateDialogClosed">
      <el-form :rules="addcateRules" ref="editcateRef" :model="addcateForm" label-width="80px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addcateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类" prop="cat_pid" > 
          <el-cascader disabled clearable>      
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editcateVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      cateList: [],
      total: 0,
      addcateVisible: false,
      editcateVisible:false,
      editID:'',
      selectedKeys: [], //绑定用户选择的分类值
      selectProps: {
        expandTrigger: 'hover', //触发时机 hover
        value: 'cat_id', //选择项的id值 唯一标识
        label: 'cat_name', // 用户看到的字段
        children: 'children', // 父子关联的字段
        checkStrictly: true // 不严格遵循父子结构
      },
      parentCateList: [],
      //为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name',
          headerAlign: 'center'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isok',
          align: 'center',
          headerAlign: 'center'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order',
          align: 'center',
          headerAlign: 'center'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt',
          align: 'center',
          headerAlign: 'center'
        }
      ],
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      addcateForm: {
        cat_pid: 0,
        cat_name: '',
        cat_level: 0
      },
      addcateRules: {
        cat_name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getCateLIst()
  },
  methods: {
    async getCateLIst() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error('获取商品列表失败！')
      //将数据列表赋值给cateList
      // console.log(res)
      // console.log(res.data)
      this.cateList = res.data.result
      //保存总数据条数
      this.total = res.data.total
    },//弹出添加分类对话框
    showaddcate() {
      this.addcateVisible = true
      this.getParentCateList()
    },//获取父级分类的列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      // console.log(res);
      if (res.meta.status != 200) return this.$message.error('获取父级列表失败！')
      this.parentCateList = res.data
    },//获取改变后的父级参数id,level
    parentCateChanged() {
      // console.log(this.selectedKeys)
      //如果用户选择了父级分类
      if (this.selectedKeys.length > 0) {
        //则将数组中的最后一项设置为父级分类
        this.addcateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addcateForm.cat_level = this.selectedKeys.length
        return
      } else {
        this.addcateForm.cat_pid = 0
        this.addcateForm.cat_level = 0
        return
      }
    },//确认添加分类
    addCate() {
      // console.log(this.addcateForm);
      this.$refs.addcateRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addcateForm)
        // console.log(res);
        if (res.meta.status !== 201) return this.$message.error('添加分类失败！')
        this.$message.success('添加分类成功！')
        this.getCateLIst()
        this.addcateVisible = false
      })
    },//关闭添加弹出框重置表单
    addCateDialogClosed() {
      //当关闭添加分类对话框时，重置表单
      this.$refs.addcateRef.resetFields();
      this.selectedKeys = [];
      this.addcateForm = {};
    },//关闭修改弹出框重置表单
    editCateDialogClosed(){
      this.$refs.editcateRef.resetFields()
      this.selectedKeys = [];
      this.addcateForm = {};
    },
    //获取新的页面数据条数
    handleSizeChange(newsize){
      this.queryInfo.pagesize=newsize;
      this.getCateLIst();
    },//获取新页面数据
    handleCurrentChange(newpage){
      this.queryInfo.pagenum=newpage;
      this.getCateLIst();
    },//删除分类
    delCate(id){
      // console.log(id);      
      this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const{data:res}=await this.$http.delete('categories/'+id);
        if(res.meta.status!==200)return this.$message.error('删除分类失败');
          this.$message.success('删除分类成功！')
          this.getCateLIst();
        })
        .catch(() => {
          this.$message.info('已取消删除操作')
        })
    },//修改分类
    async editCate(id){
      this.editID=id;
      const {data:res}=await this.$http.get('categories/'+id);
      console.log(res);
      this.addcateForm=res.data;
      this.editcateVisible=true;
    },//提交修改内容
    updateCate(){
      this.$refs.editcateRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.put('categories/'+this.editID,{cat_name:this.addcateForm.cat_name})
        // console.log(res);
        if (res.meta.status !== 200) return this.$message.error('更新分类失败！');
        this.$message.success('更新分类成功！')
        this.getCateLIst();
        this.editcateVisible = false;
    });
  }
}
}
</script>
<style lang="less" scoped>
.el-button {
  margin-bottom: 10px;
}
.el-icon-success,
.el-icon-error {
  font-size: 16px;
}
 
</style>
