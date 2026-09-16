<script setup>
import { useUserStore } from '@/store/user'; //全局存储
import axios from 'axios'; //请求
import { ref } from 'vue'; //变量
import { useRouter,useRoute } from 'vue-router'; //router 

import { url } from '@/config.js';

const router=useRouter()//router
const route=useRoute()
const userStore=useUserStore()//全局存储

const username=ref('');
const password=ref('');
const loading=ref(false);

async function login(){            
    if(!username.value.trim() || !password.value.trim()){
        alert('对方不知道你发了什么，于是决定萌混过关Ciallo～(∠・ω< )⌒☆——人话就是，不要交空白的')
        return;
    }
    loading.value=true;
    try{
        const response=await axios.post(
            `${url}/auth/login`,
            {
                username:username.value,    
                password:password.value
            }
        );
        if(response.data.code){
            userStore.login(response.data.data)
            alert('欢迎光临全家！！！')
            router.push('/')
        }
        else{
            alert(response.data.msg)
        }
    }
    finally{
        loading.value=false;
    }
}
</script>

<template>  
    <div class="container">  
        <div class="login_container">
            <p class="login-title">登录</p>
            <div class="account">
                <input placeholder="请输入账号" type="text" v-model="username" class="account_input">
            </div>
            <div class="password">
                <input placeholder="请输入密码" type="password" v-model="password" class="password_input">
            </div>
            <div class="login_button">
                <button @click="login()" :disabled="loading" class="btn_login">
                    {{ loading ? '登录中...' : '确认登录' }}
                </button>
            </div>
            <nav>
                <ul>
                    <li class="return"><router-link to="/">首页</router-link></li>
                    <li class="return"><router-link to="/register">注册</router-link></li>
                    <li>请欣赏凌波丽的神颜！谢谢！</li>
                </ul>
            </nav>
        </div>
    </div>
</template>

<style scoped>
    @import 'login.css';
</style>