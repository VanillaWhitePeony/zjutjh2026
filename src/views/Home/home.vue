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
function goHome(){
    router.push({name:'Home'})
}
function goClaim(){
    router.push({name:'claimPost'})
}
function goCategory(){
    router.push({name:'category'})
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
                        <span>{{userStore.username}}</span>
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


        

        

        <main class="main_content">
            <nav class="nav_menu">
                <button class="nav_item" @click="goHome">首页</button>
                <button class="nav_item" @click="goPost">发布帖子</button>
                <button class="nav_item" @click="goClaim">认领物品</button>
                <button class="nav_item" @click="goCategory">物品分类</button>
            </nav>

            <div class="content">
                <section class="announcement">
                    <h1>公告</h1>
                    <div class="announcement_list">
                        <div class="announcement_item">测试公告</div>
                        <div class="announcement_item">测试公告</div>
                        <div class="announcement_item">测试公告</div>
                    </div>
                </section>

                <section class="posts">
                    <div class="search_box">
                        <input type="text" placeholder="搜索关键词">
                        <button class="search_btn">搜索</button>
                    </div>
                    <div class="post_grid">
                        <div class="post_card">失物招领帖子</div>
                        <div class="post_card">失物招领帖子</div>
                        <div class="post_card">失物招领帖子</div>
                        <div class="post_card">失物招领帖子</div>
                        <div class="post_card">失物招领帖子</div>
                        <div class="post_card">失物招领帖子</div>
                    </div>
                </section>
            </div>
        </main>
  </div>
</template>

<style scoped>
@import "home.css"
</style>