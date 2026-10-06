<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { url } from '@/config.js'
import { useUserStore } from '@/store/user'
import { isAdminRole } from '@/utils/role.js'
import favorite from '@/views/Favorite/favorite.vue'
import commentList from '@/views/Comments/commentList.vue'
import commentsPost from '@/views/Comments/commentsPost.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const itemId = route.params.itemId || route.query.itemId

const loading = ref(false)
const errorMessage = ref('')
const item = ref(null)

// 是否为管理员（统一角色判断）
const isAdmin = computed(() => isAdminRole(userStore.user?.role))

const statusMap = {
  pending: '审核中',
  rejected: '已驳回',
  closed: '已关闭',
  approved: '已通过',
  claimed: '已认领'
}

const contactTypeMap = {
  wechat: '微信',
  phone: '手机号',
  qq: 'QQ',
  email: '邮箱'
}

// 留言发布成功后：把新留言追加到列表顶部
const commentListRef = ref(null)
function onCommentPosted(comment) {
  commentListRef.value?.addComment(comment)
}

function goClaim() {
  router.push({ name: 'claimPost', params: { itemId: item.value.itemId } })
}

function goMatch() {
  router.push({ name: 'intellegentMatch', params: { itemId: item.value.itemId } })
}

async function fetchDetail() {
  loading.value = true
  errorMessage.value = ''
  try {
    const res = await axios.get(`${url}/items/${itemId}`)
    if (res.data.code === 200) {
      item.value = res.data.data
    } else {
      errorMessage.value = res.data.msg || '获取详情失败'
    }
  } catch (err) {
    console.error('获取详情异常:', err)
    errorMessage.value = '获取详情失败'
  } finally {
    loading.value = false
  }
}

onMounted(fetchDetail)
</script>

<template>
  <div class="ItemDetails">
    <button class="back" @click="router.back()">返回</button>

    <div v-if="loading">加载中……</div>

    <div v-else-if="errorMessage" class="error">
      <p>{{ errorMessage }}</p>
      <button @click="fetchDetail">重试</button>
    </div>

    <div v-else-if="item">
      <div v-if="isAdmin" class="adminStatus">当前状态：{{ statusMap[item.status] || item.status }}</div>

      <h1>{{ item.title }}</h1>

      <div class="meta_row">
        <span class="type_tag">{{ item.type === 'lost' ? '寻物启事' : '失物招领' }}</span>
        <span class="status_tag">{{ statusMap[item.status] || item.status }}</span>
        <span v-if="item.category" class="status_tag">{{ item.category.name }}</span>
      </div>

      <div v-if="item.images && item.images.length" class="img_row">
        <img v-for="img in item.images" :key="img" :src="img" alt="物品图片">
      </div>

      <p>地点：{{ item.location || '-' }}</p>
      <p>{{ item.type === 'lost' ? '丢失时间' : '拾获时间' }}：{{ item.lostTime || '-' }}</p>
      <p>发布时间：{{ item.createTime || '-' }}</p>
      <p>描述：{{ item.description || '暂无描述' }}</p>
      <p>联系方式（{{ contactTypeMap[item.contactType] || item.contactType }}）：{{ item.contactValue || '-' }}</p>
      <p>发布者：{{ item.publisher?.nickname || '匿名' }}</p>

      <!-- 申请认领 / 收藏 -->
      <div class="action_bar">
        <button class="btn_claim" @click="goClaim">申请认领</button>
        <button class="btn_match" @click="goMatch">智能匹配</button>
        <favorite
          :item-id="item.itemId"
          :is-favorited="!!item.isFavorited"
          @change="item.isFavorited = $event"
        />
      </div>

      <!-- 留言 -->
      <section class="comment_section">
        <commentsPost :item-id="item.itemId" @posted="onCommentPosted" />
        <commentList ref="commentListRef" :item-id="item.itemId" />
      </section>
    </div>
  </div>
</template>

<style scoped>
@import 'ItemDetails.css';
</style>