<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 提示区 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"> </el-alert>
      <!-- 步骤条区 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!--tab区域  -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
        <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeLeave" @tab-click="tabClick">
          <el-tab-pane label="基本信息" name="0">
            <!-- 基本信息页面-->
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number" min="0"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number" min="0"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number" min="0"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader v-model="addForm.goods_cat" :options="CateList" :props="cateProps" @change="handleChanged" clearable>
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <!-- 动态参数-商品参数页面-->
          <el-tab-pane label="商品参数" name="1">
            <!-- 复选框组 -->
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals" size="small">
                <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <!-- 静态属性-商品属性页面-->
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <!--商品图片页面-->
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              class="upload-demo"
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="handleSuccess"
              list-type="picture"
              :headers="headersObj"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addForm.goods_introduce"> </quill-editor>
            <el-button size="small" type="primary" class="addbtn" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 预览图片对话框 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="30%">
      <img :src="previewPath" class="previewImg" />
    </el-dialog>
  </div>
</template>
<script>
//官方推荐将lodash导入为_
import _ from 'lodash'

export default {
  data() {
    return {
      activeIndex: '0',
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [], //商品分类id数组
        pics: [], //保存图片信息
        goods_introduce: '', //商品的详情介绍
        attrs:[]
      },
      addFormRules: {
        goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        goods_price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
        goods_weight: [{ required: true, message: '请输入商品重量', trigger: 'blur' }],
        goods_number: [{ required: true, message: '请输入商品数量', trigger: 'blur' }],
        goods_cat: [{ required: true, message: '请选择商品分类', trigger: 'blur' }]
      },
      cateProps: {
        expandTrigger: 'hover', //触发时机 hover
        value: 'cat_id', //选择项的id值 唯一标识
        label: 'cat_name', // 用户看到的字段
        children: 'children' // 父子关联的字段
      },
      CateList: [],
      manyTableData: [],
      onlyTableData: [],
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      previewPath: '',
      previewVisible: false,
      headersObj: { Authorization: window.sessionStorage.getItem('token') }
    }
  },
  created() {
    this.getCateLIst()
  },
  computed: {
    //获取第三级分类的id
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  },
  methods: {
    //获取分类列表
    async getCateLIst() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类列表失败！')
      this.CateList = res.data
      //   console.log(this.CateList);
    }, //必须选到三级分类
    handleChanged() {
      console.log(this.addForm.goods_cat)
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
        return
      }
    }, //在基本信息页面 必须选择了商品分类才可以发生跳转
    beforeLeave(activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类！')
        return false
      }
    }, //tab栏切换
    async tabClick() {
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: 'many' }
        })
        if (res.meta.status !== 200) return this.$message.error('获取动态参数列表失败！')

        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })

        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: 'only' }
        })
        if (res.meta.status !== 200) return this.$message.error('获取静态属性列表失败！')
        this.onlyTableData = res.data
      }
    }, //点击时 处理图片预览file形参function(file)
    handlePreview(file) {
      //当用户点击图片进行预览时执行，处理图片预览
      //形参file就是用户预览的那个文件
      // console.log(file)
      this.previewPath = file.response.data.url
      //显示预览图片对话框
      this.previewVisible = true
    }, //处理图片移除function(file, fileList)
    handleRemove(file) {
      // console.log(file);
      //获取将要删除的图片临时路径
      const filePath = file.response.data.tmp_path
      //找到该图片在pics数组中的索引值
      const index = this.addForm.pics.findIndex(item => item.pic === filePath)
      //移除该图片路径splice（）
      this.addForm.pics.splice(index, 1)
      console.log(this.addForm)
    }, //图片上传成功后调用的函数function(response, file, fileList)
    handleSuccess(response) {
      //拼接得到一个图片信息对象
      const picInfo = { pic: response.data.tmp_path }
      //将图片信息对象push到pics数组中
      this.addForm.pics.push(picInfo)
      // console.log(this.addForm);
    }, //添加商品操作
    add() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写必填的表单信息！')
        //将addForm进行深拷贝，避免goods_cat数组转换字符串之后导致级联选择器报错
        //安装lodash依赖
        const form = _.cloneDeep(this.addForm)
        //将goods_cat从数组转换为"1,2,3"字符串形式
        form.goods_cat = form.goods_cat.join(',');
        //根据借口文档准备传入的数据 都放在attrs数组中
        //动态参数
        this.manyTableData.forEach(item=>{
          const newInfo={attr_id:item.attr_id,attr_value:item.attr_vals.join(' ')}
          this.addForm.attrs.push(newInfo);
        });
        //静态属性
        this.onlyTableData.forEach(item=>{
          const newInfo={attr_id:item.attr_id,attr_value:item.attr_vals}
          this.addForm.attrs.push(newInfo);
        });
        form.attrs=this.addForm.attrs;
        console.log(form);
        
        const {data:res}=await this.$http.post('goods',form);
        if(res.meta.status!==201)return this.$message.error('提交添加商品失败！');
        this.$message.success('添加商品成功！');
        console.log(res);
        

     })
    }
  }
}
</script>
<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.previewImg {
  width: 100%;
}
.addbtn {
  margin-top: 10px;
}
</style>
