<script setup>
import { url } from '@/config.js'
import { useUserStore } from '@/store/user'
import axios from 'axios'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const userStore = useUserStore()

const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)

async function changePassword() {
    //空白输入
    if (!oldPassword.value.trim() || !newPassword.value.trim() || !confirmPassword.value.trim()) {
        alert('请不要空白输入，会死的')
        return
    }
    //两次密码不同
    if (newPassword.value !== confirmPassword.value) {
        alert('你设的新密码记住了吗你就改')
        return
    }
    //新旧密码一样
    if (oldPassword.value === newPassword.value) {
        alert('猪猡种都不会用和旧密码一样的新密码')
        return
    }
    loading.value = true
    try {
        const response = await axios.put(
            `${url}/auth/password`,
            {
                oldPassword: oldPassword.value,
                newPassword: newPassword.value
            },
            {
                headers: {
                    Authorization: `Bearer ${userStore.token}`
                }
            }
        )
        if (response.data.code) {
            alert('旧密码，旧密码当然是……')
            userStore.logout()
            router.push({ name: 'Login' })
        } 
        else {
            alert(response.data.msg || '修改失败')
        }
    }
    finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="container">
        <div class="change_container">
            <p align="center">回收旧密码</p>

            <div class="old">
                <span>旧密码:</span>
                <input type="password" v-model="oldPassword" class="input">
            </div>

            <div class="new">
                <span>新密码:</span>
                <input type="password" v-model="newPassword" class="input">
            </div>

            <div class="confirm">
                <span>确认新密码:</span>
                <input type="password" v-model="confirmPassword" class="input">
            </div>

            <div class="change_button">
                <button @click="changePassword()" :disabled="loading" class="btn_change">
                    {{ loading ? '提交中...' : '确认修改' }}
                </button>
            </div>

            <nav>
                <ul>
                    <li class="return"><router-link to="/">返回首页</router-link></li>
                </ul>
            </nav>
        </div>
    </div>
</template>

<style scoped>
@import 'ChangePassword.css';
</style>