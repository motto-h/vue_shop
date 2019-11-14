import Vue from 'vue'
import VueRouter from 'vue-router'


//路由懒加载（项目打包）减小体积 返回一个promise对象 异步回调函数resolve
const Login = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Login.vue')
const Home = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Home.vue')
const Welcome = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Welcome.vue')
const Users = () => import(/* webpackChunkName: "user" */ '../components/user/Users.vue')
const Rights = () => import(/* webpackChunkName: "power" */ '../components/power/Rights.vue')
const Roles = () => import(/* webpackChunkName: "power" */ '../components/power/Roles.vue')
const Categories = () => import(/* webpackChunkName: "goods" */ '../components/goods/Categories.vue')
const Params = () => import(/* webpackChunkName: "goods" */ '../components/goods/Params.vue')
const Goods = () => import(/* webpackChunkName: "goods" */ '../components/goods/Goods.vue')
const Add = () => import(/* webpackChunkName: "goods" */ '../components/goods/Add.vue')
const Orders = () => import(/* webpackChunkName: "Orders" */ '../components/Orders.vue')
const Reports = () => import(/* webpackChunkName: "Reports" */ '../components/Reports.vue')

//模块化开发 写法
// import Login from '../components/Login.vue'
// import Home from '../components/Home.vue'
// import Welcome from '../components/Welcome.vue'
// import Users from '../components/user/Users.vue'
// import Rights from '../components/power/Rights.vue'
// import Roles from '../components/power/Roles.vue'
// import Categories from '../components/goods/Categories.vue'
// import Params from '../components/goods/Params.vue'
// import Goods from '../components/goods/Goods.vue'
// import Add from '../components/goods/Add.vue'
// import Orders from '../components/Orders.vue'
// import Reports from '../components/Reports.vue'

Vue.use(VueRouter)

const routes = [
  {path:'/',redirect:'/login'},
  {path:'/login',component:Login},
  {path:'/home',component:Home,
    redirect:'/welcome',
    children:[
      {path:'/welcome',component:Welcome},
      {path:'/users',component:Users},
      {path:'/rights',component:Rights},
      {path:'/roles',component:Roles},
      {path:'/categories',component:Categories},
      {path:'/params',component:Params},
      {path:'/goods',component:Goods},
      {path:'/goods/add',component:Add},
      {path:'/orders',component:Orders},
      {path:'/reports',component:Reports},
  ]},
  
]

const router = new VueRouter({
  routes
})
//设置全局路由导航守卫
//获取token来判断是否有权访问其他页面
router.beforeEach((to,from,next)=>{
  //to将要访问的路径
  //from代表从那个路径跳转来的
  //next是一个函数代表放行 next('/login')强制跳转
  if(to.path === '/login') return next();
  const tkstr=window.sessionStorage.getItem('token');
  if(!tkstr) return next('/login');
  next();
})

export default router;
