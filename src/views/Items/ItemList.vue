<!--实现功能：筛选+分页+搜索-->
<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'
import axios from 'axios'
import { url } from '@/config.js'
import { isAdminRole } from '@/utils/role.js'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 是否为管理员（统一角色判断）
const isAdmin = computed(() => isAdminRole(userStore.user?.role))

// 普通账号能看到的状态；pending / rejected 仅管理员可筛
const normalVisibleStatus = ['approved', 'claimed', 'closed']

// 状态选项（值统一用接口枚举的小写）
const allStatusOptions = [
  { label: '待审核', value: 'pending' },
  { label: '已通过', value: 'approved' },
  { label: '已驳回', value: 'rejected' },
  { label: '已认领', value: 'claimed' },
  { label: '已关闭', value: 'closed' }
]

// 拾取/丢失类型选项
const typeOptions = [
  { label: '寻物启事', value: 'lost' },
  { label: '失物招领', value: 'found' }
]

// 按照用户身份返回可见的状态选项
const visibleStatusOptions = computed(() => {
  if (isAdmin.value) return allStatusOptions
  return allStatusOptions.filter((o) => normalVisibleStatus.includes(o.value))
})

const statusMap = {
  pending: '待审核',
  approved: '已通过',
  rejected: '已驳回',
  claimed: '已认领',
  closed: '已关闭'
}

// 查询条件
const query = reactive({
  type: '',
  keyword: '',
  location: '',
  status: '',
  page: 1,
  pageSize: 12
})

const list = ref([])
const total = ref(0)
const loading = ref(false)

// 已加载的全部物品（用于前端筛选，兼容 mock 不支持查询参数的情况）
const allItems = ref([])

const totalPages = computed(() => Math.ceil(total.value / query.pageSize))

// 组装查询参数（仍按接口要求传递；空串不传）
function buildQueryParams() {
  const params = {
    page: query.page,
    pageSize: query.pageSize
  }
  if (query.keyword) params.keyword = query.keyword
  if (query.type) params.type = query.type
  if (query.location) params.location = query.location
  if (query.status) params.status = query.status
  return params
}

// 是否处于筛选状态
function hasFilter() {
  return !!(query.keyword || query.type || query.location || query.status)
}

// 前端筛选：mock 会忽略查询参数，这里保证筛选/搜索真实生效
function applyFilter(source) {
  const kw = query.keyword.trim().toLowerCase()
  const loc = query.location.trim().toLowerCase()
  return source.filter((it) => {
    if (query.type && it.type !== query.type) return false
    if (query.status && it.status !== query.status) return false
    if (loc && !(it.location || '').toLowerCase().includes(loc)) return false
    if (kw) {
      const text = `${it.title || ''} ${it.description || ''} ${it.categoryName || ''}`.toLowerCase()
      if (!text.includes(kw)) return false
    }
    return true
  })
}

// 前端分页
function renderLocal() {
  const filtered = applyFilter(allItems.value)
  total.value = filtered.length
  const start = (query.page - 1) * query.pageSize
  list.value = filtered.slice(start, start + query.pageSize)
}

async function fetchList() {
  loading.value = true
  try {
    const res = await axios.get(`${url}/items`, { params: buildQueryParams() })
    if (res.data.code === 200) {
      const d = res.data.data || {}
      const serverList = d.list || []
      if (hasFilter()) {
        // 有筛选时在前端对全量数据过滤，保证结果正确
        allItems.value = serverList
        query.page = 1
        renderLocal()
      } else {
        list.value = serverList
        total.value = Number(d.total) || 0
        query.page = Number(d.page) || query.page
      }
    } else {
      alert(res.data.msg || '加载失败')
    }
  } catch (err) {
    console.error(err)
    alert('加载失败')
    list.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function search() {
  query.page = 1
  fetchList()
}

function reset() {
  query.keyword = ''
  query.type = ''
  query.location = ''
  query.status = ''
  query.page = 1
  fetchList()
}

function goToPage(page) {
  page = Number(page)
  if (page < 1 || page > totalPages.value || page === query.page) return
  query.page = page
  if (hasFilter()) renderLocal()
  else fetchList()
}

function changePageSize() {
  query.page = 1
  if (hasFilter()) renderLocal()
  else fetchList()
}

function goDetails(item) {
  router.push({ name: 'itemDetails', params: { itemId: item.itemId } })
}

// 下拉筛选变化时（类型/状态/地点）及时刷新；keyword 由搜索按钮触发
watch(
  () => [query.type, query.status, query.location],
  () => {
    query.page = 1
    fetchList()
  }
)

onMounted(() => {
  // 从首页搜索带过来的关键词 / 分类页带过来的类型
  if (route.query.keyword) query.keyword = route.query.keyword
  if (route.query.type) query.type = route.query.type
  fetchList()
})
</script>

<template>
  <div class="itemListPage">
    <!-- 搜索 + 筛选 -->
    <div class="filter_bar">
      <div class="search_row">
        <input
          v-model="query.keyword"
          class="search_input"
          placeholder="搜索标题 / 描述"
          maxlength="50"
          @keyup.enter="search"
        >
        <button class="btn" @click="search">搜索</button>
        <button class="btn_ghost" @click="reset">重置</button>
      </div>
      <div class="filter_row">
        <select v-model="query.type" class="select">
          <option value="">全部类型</option>
          <option v-for="t in typeOptions" :key="t.value" :value="t.value">{{ t.label }}</option>
        </select>
        <select v-model="query.status" class="select">
          <option value="">全部状态</option>
          <option v-for="s in visibleStatusOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
        </select>
        <input
          v-model="query.location"
          class="search_input"
          placeholder="地点筛选"
          @keyup.enter="search"
        >
      </div>
    </div>

    <!-- 列表 -->
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="list.length === 0" class="empty">没有找到相关物品</div>
    <ul v-else class="item_list">
      <li v-for="item in list" :key="item.itemId" class="item_card" @click="goDetails(item)">
        <img
          class="cover"
          :src="item.coverImage || (item.images && item.images[0]) || '/avatar.jpg'"
          alt=""
        >
        <div class="info">
          <div class="title_row">
            <span class="title">{{ item.title }}</span>
            <span class="status_tag">{{ statusMap[item.status] || item.status }}</span>
          </div>
          <p class="meta">
            <span>{{ item.type === 'lost' ? '寻物启事' : '失物招领' }}</span>
            <span v-if="item.location">{{ item.location }}</span>
          </p>
          <p class="time">{{ item.createTime }}</p>
        </div>
      </li>
    </ul>

    <!-- 分页 -->
    <div class="paginate">
      <span class="page_size">
        每页
        <select v-model="query.pageSize" @change="changePageSize">
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
        </select>
      </span>
      <div v-if="totalPages > 1" class="page_btns">
        <button class="btn_page" :disabled="query.page === 1" @click="goToPage(query.page - 1)">上一页</button>
        <span class="page_info">{{ query.page }} / {{ totalPages }}</span>
        <button class="btn_page" :disabled="query.page === totalPages" @click="goToPage(query.page + 1)">下一页</button>
      </div>
      <span class="total_text">共 {{ total }} 条</span>
    </div>
  </div>
</template>

<style scoped>
@import 'ItemList.css';
</style>