<script setup>
// 查看认领申请具体内容
// 接口：GET /claims/{claimId}
// 权限：申请人本人 / 该物品发布者 / lf_admin / sys_admin
// contactValue 按联系方式可见性规则返回（申请通过后申请人与发布者互相可见完整联系方式）
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { url } from '@/config.js'
import { useUserStore } from '@/store/user'

const props = defineProps({
  claimId: { type: [String, Number], default: '' }
})

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const currentClaimId = computed(() => props.claimId || route.params.claimId || route.query.claimId || '')

const claim = ref(null)
const loading = ref(false)
const errorMessage = ref('')

const statusMap = {
  pending: '待处理',
  approved: '已通过',
  rejected: '已驳回',
  cancelled: '已撤回'
}

async function fetchDetail() {
  if (!currentClaimId.value) {
    errorMessage.value = '缺少认领申请编号'
    return
  }
  loading.value = true
  errorMessage.value = ''
  try {
    const res = await axios.get(`${url}/claims/${currentClaimId.value}`)
    if (res.data.code === 200) {
      claim.value = res.data.data || null
    } else {
      errorMessage.value = res.data.msg || '加载失败'
    }
  } catch (err) {
    if (err.response?.status === 401) {
      alert('请先登录')
      router.push('/login')
      return
    }
    console.error('获取认领详情异常:', err)
    errorMessage.value = '加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.back()
}

onMounted(fetchDetail)
</script>

<template>
  <div class="claim-details">
    <button type="button" class="back" @click="goBack">返回</button>

    <p v-if="loading">加载中…</p>
    <p v-else-if="errorMessage" class="error">{{ errorMessage }}</p>

    <div v-else-if="claim" class="detail">
      <img
        v-if="claim.itemCoverImage"
        :src="claim.itemCoverImage"
        alt="物品封面"
        class="cover"
      >

      <h2>{{ claim.itemTitle }}</h2>
      <span class="status" :class="'status_' + claim.status">
        {{ statusMap[claim.status] || claim.status }}
      </span>

      <div class="section">
        <h3>认领理由</h3>
        <p>{{ claim.claimReason || '无' }}</p>
      </div>

      <div class="section">
        <h3>凭证图片</h3>
        <div v-if="claim.proofImages && claim.proofImages.length" class="proof">
          <img v-for="(img, i) in claim.proofImages" :key="i" :src="img" alt="凭证">
        </div>
        <p v-else>无</p>
      </div>

      <div class="section">
        <h3>联系方式</h3>
        <p>{{ claim.contactValue || '不可见' }}</p>
      </div>

      <div class="section">
        <h3>申请人</h3>
        <div class="applicant">
          <img v-if="claim.applicant?.avatar" :src="claim.applicant.avatar" alt="头像">
          <span>{{ claim.applicant?.nickname || '未知' }}</span>
        </div>
      </div>

      <div class="meta">
        <p>提交时间：{{ claim.createTime }}</p>
        <p v-if="claim.remark">审核备注：{{ claim.remark }}</p>
        <p v-if="claim.reviewerId">审核人：{{ claim.reviewerId }}</p>
        <p v-if="claim.reviewTime">审核时间：{{ claim.reviewTime }}</p>
      </div>
    </div>
  </div>
</template>

<style>
    @import url(ClaimDetails.css);
</style>