<script setup>
import { url } from '@/config.js';
import { useUserStore } from '@/store/user';
import axios from 'axios';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const userStore = useUserStore();

const props = defineProps({
    itemId: { type: [String, Number], default: '' },
    isFavorited: { type: Boolean, default: false }
});
const emit = defineEmits(['change']);

const itemId = computed(() => props.itemId || route.params.itemId || route.query.itemId || '');

const favorited = ref(props.isFavorited);
const loading = ref(false);

async function toggle() {
    if (!userStore.isLoggedIn) {
        alert('请先登录');
        return;
    }
    loading.value = true;
    const headers = { Authorization: `Bearer ${userStore.token}` };
    try {
        let response;
        if (favorited.value) {
            response = await axios.delete(`${url}/items/${itemId.value}/favorite`, { headers });
        } else {
            response = await axios.post(`${url}/items/${itemId.value}/favorite`, {}, { headers });
        }
        if (response.data.code === 200) {
            favorited.value = !favorited.value;
            emit('change', favorited.value);
        } else {
            alert(response.data.msg || '操作失败');
        }
    } catch (err) {
        console.error('收藏操作异常:', err);
        alert('操作失败');
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <button
        class="favorite_btn"
        :class="{ active: favorited }"
        :disabled="loading"
        @click="toggle"
    >
        {{ favorited ? '已收藏' : '收藏' }}
    </button>
</template>

<style scoped>
.favorite_btn {
    border: none;
    border-radius: 8px;
    padding: 8px 16px;
    font-size: 14px;
    font-family: inherit;
    cursor: pointer;
    background: #1677ff;
    color: #fff;
    transition: 0.2s ease;
}
.favorite_btn.active {
    background: #ff4d4f;
}
.favorite_btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
</style>