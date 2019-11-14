<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <div id="main" ref="mainBox" style="width:750px;height:400px;"></div>
    </el-card>
  </div>
</template>
<script>
//导入echarts
import echarts from 'echarts'
//导入lodash
import _ from 'lodash'
export default {
  data() {
    return {
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      },
    }
  },
  created() {},
  async mounted() {
    const main = this.$refs.mainBox
    // 基于准备好的dom，初始化echarts实例
    const myChart = echarts.init(main)
    const {data:res}=await this.$http.get('reports/type/1');
    // console.log(res.data)
    if (res.meta.status !== 200) {
      return this.$message.error('获取折线图数据失败')
    }
    // const result=Object.assign(this.options,res.data)
     const result = _.merge(res.data,this.options)
    // 使用获取的数据展示图表
    // myChart.setOption(res.data)
    // console.log(result)
    myChart.setOption(result)
  },
  methods: {}
}
</script>
<style lang="less" scoped></style>
