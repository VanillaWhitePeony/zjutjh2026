<!--实现功能：智能匹配推荐（基于标题相似度/分类/地点/时间的加权结果）-->
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import axios from 'axios'
import { url } from '@/config.js'

const props = defineProps({
  itemId: {
    type: [String, Number],
    default: null
  }
})

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 兼容 props 与路由参数两种取值方式
const currentItemId = props.itemId || route.params.itemId || route.query.itemId

const loading = ref(false)
const errorMessage = ref('')
const matches = ref([])

// 匹配度百分比
function scorePercent(score) {
  return Math.round((Number(score) || 0) * 100)
}

function goDetail(id) {
  router.push({ name: 'itemDetails', params: { itemId: id } })
}

async function fetchMatches() {
  if (!currentItemId) {
    errorMessage.value = '缺少物品 ID，无法进行智能匹配'
    return
  }
  loading.value = true
  errorMessage.value = ''
  try {
    const res = await axios.get(`${url}/items/${currentItemId}/matches`, {
      params: { limit: 10 },
      headers: { Authorization: 'Bearer ' + userStore.token }
    })
    if (res.data.code === 200) {
      matches.value = res.data.data || []
    } else {
      errorMessage.value = res.data.msg || '获取智能匹配结果失败'
    }
  } catch (err) {
    console.error('获取智能匹配异常:', err)
    errorMessage.value = '获取智能匹配结果失败'
  } finally {
    loading.value = false
  }
}

onMounted(fetchMatches)
</script>

<template>
  <div class="intelligentMatch">
    <button class="back" @click="router.back()">返回</button>

    <h1>智能匹配推荐</h1>

    <div v-if="loading" class="loading">匹配中……</div>

    <div v-else-if="errorMessage" class="error">
      <p>{{ errorMessage }}</p>
      <button @click="fetchMatches">重试</button>
    </div>

    <div v-else-if="matches.length === 0" class="empty">
      暂无匹配结果
    </div>

    <ul v-else class="match_list">
      <li
        v-for="m in matches"
        :key="m.itemId"
        class="match_item"
        @click="goDetail(m.itemId)"
      >
        <img class="cover" :src="m.coverImage || '/avatar.jpg'" alt="物品图片">

        <div class="info">
          <div class="title_row">
            <span class="title">{{ m.title }}</span>
            <span class="type_tag">{{ m.type === 'lost' ? '寻物启事' : '失物招领' }}</span>
          </div>

          <p class="meta">
            <span v-if="m.categoryName">{{ m.categoryName }}</span>
            <span v-if="m.location">地点：{{ m.location }}</span>
          </p>

          <p v-if="m.matchReason && m.matchReason.length" class="reason">
            匹配原因：{{ m.matchReason.join('、') }}
          </p>
        </div>

        <div class="score">
          <span class="score_value">{{ scorePercent(m.matchScore) }}%</span>
          <span class="score_label">匹配度</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
@import 'intellegentMatch.css';
</style>
