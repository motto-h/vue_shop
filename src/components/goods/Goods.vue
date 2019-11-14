<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <!-- 搜索框 -->
        <el-col :span="9">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <!-- 按钮 -->
        <el-col :span="3">
          <el-button type="primary" round @click="toAdd">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <el-table :data="goodsList" stripe border>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="95px" align="center"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="70px" align="center"></el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="170px" align="center">
            <template slot-scope="scope">
                {{scope.row.add_time | dateFormat}}
            </template>
        </el-table-column>
        <el-table-column label="操作" width="125px" align="center">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" circle size="medium"></el-button>
            <el-button type="danger" icon="el-icon-delete" circle size="medium" @click="removeGoods(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      >
      </el-pagination>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      goodsList: [],
      total: 0,
      queryInfo: {
        query: '',
        pagenum: 1, // 当前的页数，即页码
        pagesize: 5 // 每页显示的数据条数
      }
    }
  },
  created() {
      this.getGoodsList();
  },
  methods: {
    async getGoodsList() {
        const {data :res}=await this.$http.get('goods',{params: this.queryInfo});
        if(res.meta.status!==200)return this.$message.error('获取商品列表失败！');
        this.goodsList=res.data.goods;
        this.total=res.data.total;
        // console.log(this.goodsList);
    },
    handleSizeChange(newsize) {
      //每页信息条数
      this.queryInfo.pagesize = newsize
      this.getGoodsList()
    },
    handleCurrentChange(newpage) {
      //第几页
      this.queryInfo.pagenum = newpage
      this.getGoodsList()
    },//跳转到添加页面
    toAdd(){
        this.$router.push('/goods/add');
    },
    removeGoods(id){
        // console.log(id);
        this.$confirm('此操作将永久删除该商品', '是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
         const {data:res}=await this.$http.delete('goods/'+id);
        if(res.meta.status!==200)return this.$message.error('删除商品数据失败！')
          this.$message.success('删除商品数据成功')
          this.getGoodsList();
        })
        .catch(() => {
          return this.$message.info('已取消删除操作！')
        })
        
        
    }
  }
}
</script>
<style lang="less" scoped></style>
