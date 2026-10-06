<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { url } from '@/config.js'

const router = useRouter()

const list = ref([])
const loading = ref(false)
const errorMessage = ref('')
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const statusMap = {
  pending: '待处理',
  approved: '已通过',
  rejected: '已驳回',
  cancelled: '已撤回'
}

async function fetchList() {
  loading.value = true
  errorMessage.value = ''
  try {
    const res = await axios.get(`${url}/claims/received`, {
      params: { page: page.value, pageSize: pageSize.value }
    })
    if (res.data.code === 200) {
      const data = res.data.data || {}
      list.value = data.list || []
      total.value = Number(data.total) || 0
      page.value = Number(data.page) || 1
      pageSize.value = Number(data.pageSize) || 10
    } else {
      errorMessage.value = res.data.msg || '加载失败'
    }
  } catch (err) {
    if (err.response?.status === 401) {
      alert('请先登录')
      router.push('/login')
      return
    }
    console.error('获取收到的认领申请异常:', err)
    errorMessage.value = '加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

function goPage(p) {
  p = Number(p)
  if (p < 1 || p === page.value) return
  page.value = p
  fetchList()
}

function goDetail(claim) {
  router.push({ path: '/claimDetails', query: { claimId: claim.claimId } })
}

onMounted(fetchList)
</script>

<template>
  <div class="claim-check">
    <h2>收到的认领申请</h2>

    <p v-if="loading">加载中…</p>
    <p v-else-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-else-if="list.length === 0">暂时没有收到认领申请</p>

    <ul v-else class="claim-list">
      <li v-for="claim in list" :key="claim.claimId" class="claim-item">
        <img
          v-if="claim.itemCoverImage"
          :src="claim.itemCoverImage"
          alt="物品封面"
          class="cover"
        >
        <div class="info">
          <div class="row">
            <span class="title">{{ claim.itemTitle }}</span>
            <span class="status" :class="'status_' + claim.status">
              {{ statusMap[claim.status] || claim.status }}
            </span>
          </div>
          <div class="reason">{{ claim.claimReason }}</div>
          <div class="meta">申请人：{{ claim.applicant?.nickname || '未知' }} · {{ claim.createTime }}</div>
        </div>
        <button type="button" @click="goDetail(claim)">详情</button>
      </li>
    </ul>

    <div v-if="total > pageSize" class="pagination">
      <button :disabled="page === 1" @click="goPage(page - 1)">上一页</button>
      <span>{{ page }} / {{ Math.ceil(total / pageSize) }}</span>
      <button :disabled="page >= Math.ceil(total / pageSize)" @click="goPage(page + 1)">下一页</button>
    </div>
  </div>
</template>

<style>
    @import url(ClaimCheck.css);
</style>