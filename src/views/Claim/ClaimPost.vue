<script setup>
// 发布申请认领
// 接口：POST /claims   body: { itemId, claimReason, proofImages, contactValue }
// 凭证图片需先通过 POST /files/upload 上传（最多 3 张）
// 错误码：
//   3005 不能认领自己发布的物品
//   3006 同一物品不可重复提交待处理申请
//   3013 同一用户对同一物品24小时内最多提交3次（含已撤回/已驳回）
//   3002 物品必须处于 approved 状态
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { url } from '@/config.js'
import { useUserStore } from '@/store/user'

const props = defineProps({
  itemId: { type: [String, Number], default: '' }
})

const emit = defineEmits(['submitted'])

const route = useRoute()
const userStore = useUserStore()
// 优先取 prop，其次取路由参数/查询参数
const currentItemId = computed(() => props.itemId || route.params.itemId || route.query.itemId || '')

const form = ref({
  itemId: '',
  claimReason: '',
  proofImages: [],
  contactValue: ''
})
// 预填路由带来的 itemId（从物品详情点击“申请认领”进入时）
form.value.itemId = currentItemId.value || ''

const loading = ref(false)
const uploading = ref(false)
const errorMessage = ref('')

const MAX_IMAGES = 3
const MAX_IMAGE_SIZE = 5 * 1024 * 1024

// 上传凭证图片，返回图片地址
async function uploadImage(file) {
  const data = new FormData()
  data.append('file', file)
  const res = await axios.post(`${url}/files/upload`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  if (res.data.code !== 200) {
    throw new Error(res.data.msg || '图片上传失败')
  }
  const value = res.data.data
  // 兼容返回字符串 url 或 { url } 对象
  if (typeof value === 'string') return value
  return value?.url || value?.urls?.[0] || ''
}

async function handleFileChange(e) {
  const files = Array.from(e.target.files || [])
  e.target.value = ''
  if (!files.length) return

  if (form.value.proofImages.length + files.length > MAX_IMAGES) {
    errorMessage.value = `凭证图片最多上传 ${MAX_IMAGES} 张`
    return
  }
  for (const file of files) {
    if (file.size > MAX_IMAGE_SIZE) {
      errorMessage.value = '单张图片不能超过 5MB'
      return
    }
  }

  uploading.value = true
  errorMessage.value = ''
  try {
    for (const file of files) {
      const imgUrl = await uploadImage(file)
      if (imgUrl) form.value.proofImages.push(imgUrl)
    }
  } catch (err) {
    console.error('图片上传异常:', err)
    errorMessage.value = err?.message || '图片上传失败'
  } finally {
    uploading.value = false
  }
}

function removeImage(index) {
  form.value.proofImages.splice(index, 1)
}

async function submit() {
  const rawItemId = String(form.value.itemId).trim()
  if (!rawItemId) {
    errorMessage.value = '请输入物品 ID'
    return
  }
  const itemId = Number(rawItemId)
  if (!Number.isInteger(itemId) || itemId <= 0) {
    errorMessage.value = '物品 ID 必须为正整数'
    return
  }
  const reason = form.value.claimReason.trim()
  if (!reason) {
    errorMessage.value = '请填写认领理由'
    return
  }
  if (reason.length < 10) {
    errorMessage.value = '认领理由至少 10 字'
    return
  }
  if (reason.length > 500) {
    errorMessage.value = '认领理由不能超过 500 字'
    return
  }
  if (uploading.value) {
    errorMessage.value = '图片上传中，请稍候'
    return
  }

  loading.value = true
  errorMessage.value = ''
  try {
    const body = {
      itemId: Number(itemId),
      claimReason: reason
    }
    if (form.value.proofImages.length) body.proofImages = form.value.proofImages
    const contactValue = form.value.contactValue.trim()
    if (contactValue) body.contactValue = contactValue

    const res = await axios.post(`${url}/claims`, body, {
      headers: { Authorization: `Bearer ${userStore.token}` }
    })
    if (res.data.code === 200) {
      alert('认领申请提交成功，等待处理')
      emit('submitted', res.data.data)
      form.value.claimReason = ''
      form.value.proofImages = []
      form.value.contactValue = ''
    } else if (res.data.code === 3005) {
      alert('不能认领自己发布的物品')
    } else if (res.data.code === 3006) {
      alert('同一物品不可重复提交待处理申请')
    } else if (res.data.code === 3013) {
      alert('同一物品24小时内最多提交3次申请，请稍后再试')
    } else if (res.data.code === 3002) {
      alert('该物品当前不可认领')
    } else {
      alert(res.data.msg || '提交失败')
    }
  } catch (err) {
    console.error('提交认领异常:', err)
    alert('网络异常，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="claim-post">
    <h2>申请认领</h2>

    <div>
      <label>物品 ID</label>
      <input v-model="form.itemId" type="number" placeholder="例如：20001">
    </div>

    <div>
      <label>认领理由</label>
      <textarea
        v-model="form.claimReason"
        placeholder="例如：这是我丢失的伞，伞柄刻有我的名字缩写 WX"
        rows="3"
        maxlength="500"
      ></textarea>
    </div>

    <div>
      <label>凭证图片（最多 3 张，需先上传）</label>
      <input
        type="file"
        accept="image/*"
        multiple
        :disabled="uploading || form.proofImages.length >= MAX_IMAGES"
        @change="handleFileChange"
      >
      <p v-if="uploading">图片上传中…</p>
      <div v-for="(img, index) in form.proofImages" :key="img" class="proof-item">
        <img :src="img" alt="凭证图片">
        <button type="button" @click="removeImage(index)">删除</button>
      </div>
    </div>

    <div>
      <label>联系方式（选填，不填则使用账号绑定的手机号）</label>
      <input v-model="form.contactValue" type="text" placeholder="例如：13800138000">
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <button @click="submit" :disabled="loading || uploading">
      {{ loading ? '提交中…' : '提交认领申请' }}
    </button>
  </div>
</template>

<style>
    @import url(ClaimPost.css);
</style>