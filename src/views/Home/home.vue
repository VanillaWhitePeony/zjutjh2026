<script setup>
import { useUserStore } from '@/store/user';
import { useRouter } from 'vue-router';
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { url } from '@/config.js';
import { isAdminRole, isLfAdminRole } from '@/utils/role.js';

const router = useRouter()
const userStore = useUserStore()

// 是否为管理员（统一角色判断）
const isAdmin = computed(() => isAdminRole(userStore.user?.role))
// 是否为失物招领管理员（仅保留审核相关导航）
const isLfAdmin = computed(() => isLfAdminRole(userStore.user?.role))

const posts = ref([])
const searchKeyword = ref('')
const announcements = ref([])

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

async function fetchAnnouncements() {
  try {
    const res = await axios.get(`${url}/announcements`, { params: { page: 1, pageSize: 5 } })
    if (res.data.code === 200) {
      announcements.value = (res.data.data && res.data.data.list) || []
    }
  } catch (err) {
    console.error('拉取首页公告失败:', err)
  }
}

onMounted(() => {
  fetchPosts()
  fetchAnnouncements()
})

function goAnnouncementDetail(id) {
  router.push(`/announcements/${id}`)
}

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
// 管理员导航
function goUserList(){
    router.push({ name:'userDetailList'})
}
function goStats(){
    router.push({ name:'stats'})
}
function goAuditItem(){
    router.push({ name:'auditItem'})
}
function goAuditClaim(){
    router.push({ name:'auditClaim'})
}
</script>

<template>
    <div class="home">
        <header class="navbar">
            <div class="nav_inner">
                <div class="logo">
                    <span class="logo_text">失物招领平台 首页</span>
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
                <template v-if="isLfAdmin">
                    <button class="nav_item" @click="goHome">首页</button>
                    <button class="nav_item" @click="goAuditItem">审核发布列表</button>
                    <button class="nav_item" @click="goAuditClaim">审核认领列表</button>
                </template>
                <template v-else-if="isAdmin">
                    <button class="nav_item" @click="goHome">首页</button>
                    <button class="nav_item" @click="goUserList">用户列表</button>
                    <button class="nav_item" @click="goStats">统计总览</button>
                    <button class="nav_item" @click="goAuditItem">审核发布列表</button>
                    <button class="nav_item" @click="goAuditClaim">审核认领列表</button>
                    <button class="nav_item" @click="goAnnouncements">公告列表</button>
                </template>
                <template v-else>
                    <button class="nav_item" @click="goHome">首页</button>
                    <button class="nav_item" @click="goPost">发布帖子</button>
                    <button class="nav_item" @click="goClaim">认领物品</button>
                    <button class="nav_item" @click="goCategory">物品分类</button>
                    <button class="nav_item" @click="goAnnouncements">查看公告</button>
                    <button class="nav_item" @click="goFavorite">我的收藏</button>
                    <button class="nav_item" @click="goInform">通知列表</button>
                </template>
            </nav>

            <div class="content">
                <section class="announcement">
                    <h1>公告</h1>
                    <div class="announcement_list">
                        <div
                            v-for="a in announcements"
                            :key="a.announcementId"
                            class="announcement_item"
                            @click="goAnnouncementDetail(a.announcementId)"
                        >
                            <span v-if="a.isTop" class="announcement_top">置顶</span>
                            <span class="announcement_title">{{ a.title }}</span>
                            <span v-if="a.content" class="announcement_content">{{ a.content }}</span>
                        </div>
                        <div v-if="announcements.length === 0" class="announcement_empty">暂无公告</div>
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
                            <img class="post_cover" :src="post.coverImage || '/avatar.jpg'" alt="">
                            <div class="post_body">
                                <span class="post_title">{{ post.title }}</span>
                                <span class="post_meta">{{ post.type === 'lost' ? '寻物启事' : '失物招领' }}{{ post.location ? ' · ' + post.location : '' }}</span>
                            </div>
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