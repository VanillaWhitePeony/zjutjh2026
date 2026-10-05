<script setup>
// 物品状态变更唯一入口（发布者与管理员共用）
// 接口：PATCH /items/{itemId}/status   body: { status, remark }
// 服务端按调用者角色动态校验目标状态：
//   发布者本人：closed（已找回/已归还）、approved（重新开启）；pending/rejected 不可操作
//   lf_admin / sys_admin：可审核 approved/rejected 及下方合法流转表中的全部状态
// 合法流转：pending→approved/rejected；approved→closed；closed→approved；
//           claimed 不可变更（仅可删除）；rejected 不可变更
// 错误码：1003 角色无权提交该目标状态；3002 状态流转非法
import { computed, ref, watch } from 'vue'
import axios from 'axios'
import { url } from '@/config.js'
import { useUserStore } from '@/store/user'

const props = defineProps({
  itemId: { type: [String, Number], required: true },
  currentStatus: { type: String, default: '' },
  ownerId: { type: [String, Number], default: '' },
  isAdmin: { type: Boolean, default: false }
})

const emit = defineEmits(['changed'])

const userStore = useUserStore()

const currentUserId = computed(() => userStore.user?.userId ?? userStore.user?.id ?? '')
const isOwner = computed(() => {
  const uid = String(currentUserId.value)
  const oid = String(props.ownerId)
  return !!uid && !!oid && uid === oid
})
// 只有发布者本人或管理员可以操作状态
const canOperate = computed(() => props.isAdmin || isOwner.value)

// 合法流转表（当前状态 -> 允许提交的目标状态）
const FLOW = {
  pending: ['approved', 'rejected'],
  approved: ['closed'],
  closed: ['approved'],
  claimed: [],
  rejected: []
}

const statusLabels = {
  pending: '待审核',
  approved: '已通过',
  rejected: '已驳回',
  claimed: '已认领',
  closed: '已关闭'
}

// 当前角色可提交的目标状态
const availableTargets = computed(() => {
  const flow = FLOW[props.currentStatus] || []
  if (props.isAdmin) return flow
  // 发布者本人：pending/rejected/claimed 不可操作，仅 approved<->closed
  if (['pending', 'rejected', 'claimed'].includes(props.currentStatus)) return []
  return flow
})

const targetStatus = ref('')
const remark = ref('')
const loading = ref(false)
const errorMessage = ref('')

// 目标状态的展示文案（approved 有「审核通过 / 重新开启」两种语义）
function targetLabel(status) {
  if (status === 'approved') {
    return props.currentStatus === 'pending' ? '通过审核' : '重新开启'
  }
  if (status === 'rejected') return '驳回'
  if (status === 'closed') return '标记完成 / 已找回'
  return status
}

watch(
  () => props.currentStatus,
  () => {
    targetStatus.value = ''
    remark.value = ''
    errorMessage.value = ''
  }
)

async function submit() {
  if (!targetStatus.value) {
    errorMessage.value = '请选择目标状态'
    return
  }
  loading.value = true
  errorMessage.value = ''
  try {
    const res = await axios.patch(`${url}/items/${props.itemId}/status`, {
      status: targetStatus.value,
      remark: remark.value.trim() || undefined
    })
    if (res.data.code === 200) {
      alert('状态变更成功')
      emit('changed', targetStatus.value)
      targetStatus.value = ''
      remark.value = ''
    } else if (res.data.code === 1003) {
      alert('你没有权限提交该目标状态')
    } else if (res.data.code === 3002) {
      alert('当前状态不允许该变更')
    } else {
      alert(res.data.msg || '状态变更失败')
    }
  } catch (err) {
    console.error('状态变更异常:', err)
    alert('网络异常，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div v-if="canOperate" class="status-change">
    <span class="current">
      当前状态：{{ statusLabels[currentStatus] || currentStatus || '未知' }}
    </span>

    <div v-if="availableTargets.length">
      <label>变更为</label>
      <select v-model="targetStatus">
        <option value="" disabled>请选择</option>
        <option v-for="s in availableTargets" :key="s" :value="s">
          {{ targetLabel(s) }}
        </option>
      </select>

      <label>备注</label>
      <input v-model="remark" type="text" placeholder="例如：物品已找回，关闭本条信息">

      <button @click="submit" :disabled="loading">
        {{ loading ? '提交中…' : '提交变更' }}
      </button>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>

    <p v-else class="hint">当前状态不可变更</p>
  </div>
</template>

<style>
    
</style>