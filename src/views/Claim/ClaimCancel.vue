<script setup>
import { computed, ref } from 'vue'
import axios from 'axios'
import { url } from '@/config.js'

const props = defineProps({
  claimId: { type: [String, Number], required: true },
  status: { type: String, default: '' }
})

const emit = defineEmits(['cancelled'])

const cancelling = ref(false)

// 仅 pending 状态的申请可撤回
const canCancel = computed(() => props.status === 'pending')

async function cancel() {
  if (!canCancel.value) return
  if (!confirm('确定撤回这条认领申请吗？')) return

  cancelling.value = true
  try {
    const res = await axios.post(`${url}/claims/${props.claimId}/cancel`)
    if (res.data.code === 200) {
      alert('撤回成功')
      emit('cancelled', props.claimId)
    } else if (res.data.code === 3004) {
      alert('无权撤回该认领申请')
    } else {
      alert(res.data.msg || '撤回失败')
    }
  } catch (err) {
    console.error('撤回认领异常:', err)
    alert('网络异常，请稍后重试')
  } finally {
    cancelling.value = false
  }
}
</script>

<template>
  <button
    v-if="canCancel"
    type="button"
    class="cancel-btn"
    :disabled="cancelling"
    @click="cancel"
  >
    {{ cancelling ? '撤回中…' : '撤回申请' }}
  </button>
</template>

<style>
    @import url(ClaimCancel.css);
</style>