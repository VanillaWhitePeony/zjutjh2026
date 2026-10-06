<script setup>
import { useUserStore } from '@/store/user';
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { url } from '@/config.js';

const router = useRouter()
const userStore = useUserStore()

const posts = ref([])
const searchKeyword = ref('')

async function fetchPosts() {
  try {
    const res = await axios.get(`${url}/items`, { params: { page: 1, pageSize: 12 } })
    if (res.data.code === 200) {
      posts.value = (res.data.data && res.data.data.list) || []
    }
  } catch (err) {
    console.error('拉取首页帖子失败:', err)
  }
}

onMounted(fetchPosts)

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
function goAnnouncements(){
    router.push({ name:'announcements'})
}
function goFavorite(){
    router.push({ name:'favoriteList'})
}
function goInform(){
    router.push({ name:'myInform'})
}
function goSearch(){
    router.push({ name:'ItemList', query:{ keyword: searchKeyword.value } })
}
function goDetail(item){
    router.push({ name:'itemDetails', params:{ itemId: item.itemId } })
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
                <button class="nav_item" @click="goAnnouncements">查看公告</button>
                <button class="nav_item" @click="goFavorite">我的收藏</button>
                <button class="nav_item" @click="goInform">通知列表</button>
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
                        <input v-model="searchKeyword" type="text" placeholder="搜索关键词" @keyup.enter="goSearch">
                        <button class="search_btn" @click="goSearch">搜索</button>
                    </div>
                    <div class="post_grid">
                        <div
                            v-for="post in posts"
                            :key="post.itemId"
                            class="post_card"
                            @click="goDetail(post)"
                        >
                            <span class="post_title">{{ post.title }}</span>
                            <span class="post_meta">{{ post.type === 'lost' ? '寻物启事' : '失物招领' }}{{ post.location ? ' · ' + post.location : '' }}</span>
                        </div>
                        <div v-if="posts.length === 0" class="post_empty">暂无帖子</div>
                    </div>
                </section>
            </div>
        </main>
  </div>
</template>

<style scoped>
@import "home.css"
</style>