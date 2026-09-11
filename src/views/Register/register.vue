<script setup>
import { url } from '@/config.js';
import axios from 'axios';
import { ref } from 'vue';
import { useRouter } from 'vue-router'; //登录登出更改测试

const router=useRouter()//登录登出更改测试

const username=ref('');
const password=ref('');
const nickname=ref('');
const studentNo=ref('');
const phone=ref('');
const email=ref('');
const loading=ref(false);


async function register(){                
    if(!username.value.trim() || !password.value.trim() || !studentNo.value.trim() || !nickname.value.trim()|| !phone.value.trim() || !email.value.trim()){
        alert('不能为空！')
        return;
    }
    loading.value=true;
    try{
        const response=await axios.post(
            `${url}/auth/register`,
            {
                username:username.value,
                nickname:nickname.value,
                password:password.value,
                studentNo:studentNo.value,
                phone:phone.value,
                email:email.value
            }
        );
        if(response.data.code){
            alert('恭喜你报名了希望工程，我要收过路肺了！！！')
            router.push('/login')
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
        <div class="register_container">
            <p align="center"><del>白牡丹，我好喜欢你，我好喜欢你🤤</del></p>
            <p align="center">看什么看，好好注册</p>
            <div class="account">
                <span>账号:</span><input type="text" v-model="username" class="account_input">
            </div>
            <div class="nickname">
                <span>名字:</span><input type="text" v-model="nickname" class="account_input">
            </div>
            <div class="studentNo">
                <span>学号:</span><input type="text" v-model="studentNo" class="account_input">
            </div>
            <div class="phone">
                <span>电话:</span><input type="text" v-model="phone" class="account_input">
            </div>
            <div class="email">
                <span>邮箱:</span><input type="text" v-model="email" class="account_input">
            </div>
            <div class="password">
                <span>密码:</span><input type="password" v-model="password" class="password_input">
            </div>
            <div class="register_button">
                <button @click="register()":disabled="loading" class="btn_register">
                    {{ loading ? '注册中...' : '注册' }}
                </button>
            </div>
            <nav>
                <ul>
                <li class="return"><router-link to="/">首页</router-link></li>
                </ul>
            </nav>
        </div>
    </div>
</template>

<style scoped>
    @import 'register.css';
</style>