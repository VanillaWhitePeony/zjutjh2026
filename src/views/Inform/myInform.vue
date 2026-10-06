<script setup>
import { url } from '@/config.js'
import { useUserStore } from '@/store/user'
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'

const userStore = useUserStore()

const notifications = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const typeFilter = ref('')

const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

const typeOptions = [
  { label: '认领申请', value: 'claim_created' },
  { label: '认领通过', value: 'claim_approved' },
  { label: '认领驳回', value: 'claim_rejected' },
  { label: '物品审核通过', value: 'item_approved' },
  { label: '物品审核驳回', value: 'item_rejected' },
  { label: '新留言', value: 'comment_created' },
  { label: '系统通知', value: 'system' }
]

const typeMap = {
  claim_created: '认领申请',
  claim_approved: '认领通过',
  claim_rejected: '认领驳回',
  item_approved: '物品审核通过',
  item_rejected: '物品审核驳回',
  comment_created: '新留言',
  system: '系统通知'
}

async function getNotifications(page = 1) {
  loading.value = true
  try {
    const params = { page, pageSize: pageSize.value }
    if (typeFilter.value) params.type = typeFilter.value
    const res = await axios.get(`${url}/notifications`, {
      params,
      headers: { Authorization: `Bearer ${userStore.token}` }
    })
    if (res.data.code === 200) {
      const d = res.data.data || {}
      notifications.value = d.list || []
      total.value = Number(d.total) || 0
      currentPage.value = Number(d.page) || page
    } else {
      alert(res.data.msg || '获取通知失败')
    }
  } catch (err) {
    console.error('获取通知异常:', err)
    alert('获取通知失败')
  } finally {
    loading.value = false
  }
}

function changeType() {
  getNotifications(1)
}

function goToPage(page) {
  page = Number(page)
  if (page < 1 || page > totalPages.value || page === currentPage.value) return
  getNotifications(page)
}

onMounted(() => getNotifications(1))
</script>

<template>
  <div class="myInformPage">
    <h1>通知列表</h1>

    <div class="filter_bar">
      <span>类型筛选：</span>
      <select v-model="typeFilter" @change="changeType" class="type_select">
        <option value="">全部</option>
        <option v-for="t in typeOptions" :key="t.value" :value="t.value">{{ t.label }}</option>
      </select>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="notifications.length === 0" class="empty">暂无通知</div>
    <ul v-else class="notify_list">
      <li v-for="n in notifications" :key="n.notificationId" class="notify_item">
        <div class="notify_head">
          <span class="title">{{ n.title }}</span>
          <span class="type_tag">{{ typeMap[n.type] || n.type }}</span>
        </div>
        <p class="content">{{ n.content }}</p>
        <p class="time">{{ n.createTime }}</p>
      </li>
    </ul>

    <div v-if="totalPages > 1" class="page_change">
      <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" class="btn_page">上一页</button>
      <span class="page_info">{{ currentPage }} / {{ totalPages }}</span>
      <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" class="btn_page">下一页</button>
    </div>
  </div>
</template>

<style scoped>
@import 'myInform.css';
</style>