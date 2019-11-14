import Vue from 'vue'
import App from './App.vue'
import router from './router'
//导入elementui元素
import './plugins/element.js'
//导入全局样式
import '../src/assets/css/global.css'
//导入字体图标
import '../src/assets/fonts/iconfont.css'
//引入axios
import axios from 'axios'
//导入树形列表插件
import TreeTable from 'vue-table-with-tree-grid'
//导入时间格式化插件
import moment from 'moment'
//导入进度条
import nprogress from 'nprogress'
import 'nprogress/nprogress.css'

//设置默认请求的url
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/';

//配置token令牌在axios的请求拦截器中Authorization
axios.interceptors.request.use(config => {
  // Do something before request is sent
  nprogress.start();//进度条开始
  config.headers.Authorization = window.sessionStorage.getItem('token');
  return config;
});
//响应拦截器
axios.interceptors.response.use(config => {
  nprogress.done();//进度条结束
  return config;
});



//导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// require styles 导入富文本编辑器样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

Vue.use(VueQuillEditor);

//在Vue的原型对象上设置axios
Vue.prototype.$http = axios;
Vue.config.productionTip = false;
Vue.component('tree-table', TreeTable)
Vue.filter('dateFormat', value => {
  return moment(value).format('YYYY-MM-DD :HH:mm:ss');
})


new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
