<template>
    <div class="login_container">
        <div class='login_box'>
        <div class="avatar_box">
            <img src="../assets/logo.png">
        </div>
        <el-form ref="resetloginref" class="login_form" label-width="0px" :model="login_form" :rules="login_rules">
            <!-- 输入框 -->
            <el-form-item prop="username">
                <el-input v-model="login_form.username" prefix-icon="iconfont icon-user"></el-input>
            </el-form-item>
            <el-form-item prop="password">
                <el-input v-model="login_form.password" prefix-icon="iconfont icon-lock_fill" type="password"></el-input>
            </el-form-item>
            <!-- 按钮 -->
            <el-form-item class="btns">
                <el-button type="primary" @click="login">登录</el-button>
                <el-button type="info" @click="resetlogin">重置</el-button>
            </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
export default {
    data(){
        return {
            login_form:{
                username:'admin',
                password:'123456',
            },
            login_rules:{
                username:[
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 3, max: 6, message: '长度在 3 到 5 个字符', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, max: 12, message: '长度在 6 到 12 个字符', trigger: 'blur' }
                ],
            }
    }
},
methods: {
    resetlogin(){
        //this组件的实例对象
        // console.log(this);
        this.$refs.resetloginref.resetFields();
    },
    login(){
        //预验证
        this.$refs.resetloginref.validate(async vali=>{
        if(!vali)return;
        // console.log(this);
        const {data:res}=await this.$http.post('login',this.login_form)
        // console.log(res);
        if(res.meta.status!==200) return this.$message.error('登陆失败');
        this.$message.success('登陆成功');
        //将登录成功后获得的token保存到sessionStorage用做通行证
        //除了登录页面 其他页面都需要用token验证
        //因为只有在该网站打开时才生效 所以不能保存到localstorage里面
        window.sessionStorage.setItem('token',res.data.token);
        this.$router.push('/home');
        })
    }

},
}
</script>

<style lang="less" scoped>

.login_container{
    position: relative;
    height: 100%;
    background-color: #2b4b6b;
    .login_form{
        margin-top: 100px;
        padding: 0 25px;
    }
}
.login_box{
    position: absolute;
    top:50%;
    left: 50%;
    transform: translate(-50%,-50%);
    width: 450px;
    height: 300px;
    border-radius: 5px;
    background: #fff;
}
.avatar_box{
    width: 130px;
    height: 130px;
    border:1px solid #eee;
    background-color: #fff;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10 #ddd;
    position: absolute;
    left: 50%;
    top: -50%;
    transform: translate(-50%,50%);
    img{
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
    }
}
.btns{
    float: right;
}
</style>