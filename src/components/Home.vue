<template>
  <el-container class="home-container">
    <!-- 头部 -->
    <el-header>
      <div class="pic">
        <!-- <img src="../assets/a.png" alt="" /> -->
        <img src="../assets/heima.png" alt="" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="iscollapse ? '64px':'200px' ">
          <div class="toggle-button" @click="toggle">
              <i :class="iscollapse ? 'el-icon-d-arrow-right':'el-icon-d-arrow-left'"></i>
          </div>
        <el-menu background-color="#333744" text-color="#fff" router :default-active="activepath"
        active-text-color="#409BFF" unique-opened :collapse="iscollapse" :collapse-transition="false">
          <!-- 一级菜单 -->
          <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
            <template slot="title">
                <!-- id对应图标 -->
              <i :class="iconsObj[item.id]"></i>
              <span style="margin-left:10px;">{{ item.authName }}</span>
            </template>
            <!-- 二级菜单-->
            <el-menu-item :index="'/'+subitem.path" v-for="subitem in item.children" 
              :key="subitem.id" @click="Saveactivepath('/'+subitem.path)">
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{ subitem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 主体 -->
      <el-main> 
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      menuList: [],
      iconsObj: {
        '125': 'iconfont icon-user',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      iscollapse:false,
      activepath:''
    }
  },
  created() {
    //在创建阶段请求数据
    this.getMenuList()
    this.activepath=window.sessionStorage.getItem('active');
  },
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    async getMenuList() {
      //发送axios 请求侧边栏数据
      const { data: res } = await this.$http.get('menus')
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menuList = res.data
    },
    toggle(){
        this.iscollapse=!this.iscollapse;
    },
    Saveactivepath(path){
      window.sessionStorage.setItem('active',path);
      this.activepath=path;
    }
  }
}
</script>
<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  font-size: 14px;
  .pic {
    display: flex;
    align-items: center;
    img {
      width: 45px;
      height: 45px;
      border-radius: 50%;
    }
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #333744;
  .el-menu{
      border-right: 0;
  }
}
.el-main {
  background-color: #eaedf1;
}
.toggle-button{
    height: 24px;
    background-color: #4A5064;
    line-height: 24px;
    font-size: 17px;
    font-weight:normal;
    color: #fff;
    text-align: center;
    cursor: pointer;
}

</style>
