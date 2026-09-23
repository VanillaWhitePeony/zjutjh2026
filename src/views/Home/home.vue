<script setup>
import { useUserStore } from '@/store/user';
import { useRouter } from 'vue-router';

const router = useRouter()
const userStore = useUserStore()

function goLogin() {
  router.push({ name: 'Login' })
}
function goLogout() {
  userStore.logout()
  router.push('/')
}
function goAccount() {
  router.push({ name: 'Account' })
}
function goPost(){
    router.push({name:'PostMessage'})
}
function goPrivilege(){
    router.push({ name:'userDetailList'})
}
function goStats(){
    router.push({ name:'stats'})
}
</script>

<template>
    <div class="home">
        <header class="navbar">
            <div class="nav_inner">
                <div class="logo">
                    <span class="logo_text">"失物"招领平台</span>
                </div>

        <!-- 登录 -->
                <div class="nav_actions">
                    <div class="login" v-if="userStore.isLoggedIn">
                        <span class="login_text">欢迎光临全家，</span>
                        <span>{{userStore.user.nickname}}</span>
                        <button class="btn_account" @click="goAccount">看看你的账户</button>
                    </div>
                    <div class="btn">
                        <button
                            v-if="!userStore.isLoggedIn"
                            class="btn_text"
                            @click="goLogin"
                        >登录</button>

                        <button
                            v-else
                            class="btn_text"
                            @click="goLogout"
                        >登出</button>
                    </div>
                </div>
            </div>
        </header>


        <div class="post">
            <botton @click="goPost">
                发布帖子
            </botton>
        </div>

        <div class="admin_privilege" v-if="userStore.isLoggedIn && userStore.user.role==='admin'">
            <div class="btn">
                <button class="btn_text"
                    @click="goPrivilege"
                >
                    偷看用户信息
                </button>
                <button class="btn_text"
                    @click="goStats"
                >
                    查看神秘统计数据
                </button>
            </div>
        </div>

        <main class="main_content">
            <!-- 在这里添加你的功能模块 -->
        </main>
  </div>
</template>

<style scoped>
@import "home.css"
</style>