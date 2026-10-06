<script setup>
import { url } from '@/config.js';
import { useUserStore } from '@/store/user';
import axios from 'axios';
import { computed, onMounted, ref } from 'vue';

const userStore = useUserStore();

const favorites = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const totalPages = computed(() => Math.ceil(total.value / pageSize.value));

async function getFavorites(page = 1) {
    loading.value = true;
    try {
        const response = await axios.get(`${url}/favorites/mine`, {
            params: { page, pageSize: pageSize.value },
            headers: { Authorization: `Bearer ${userStore.token}` }
        });
        if (response.data.code === 200) {
            const d = response.data.data || {};
            favorites.value = d.list || [];
            total.value = Number(d.total) || 0;
            currentPage.value = Number(d.page) || page;
        } else {
            alert(response.data.msg || '获取收藏列表失败');
        }
    } catch (err) {
        console.error('获取收藏列表异常:', err);
        alert('获取收藏列表失败');
    } finally {
        loading.value = false;
    }
}

function goToPage(page) {
    page = Number(page);
    if (page < 1 || page > totalPages.value || page === currentPage.value) return;
    getFavorites(page);
}

onMounted(() => { getFavorites(1); });
</script>

<template>
    <div class="favorite_list_container">
        <h1>我的收藏</h1>
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else-if="favorites.length === 0" class="empty">还没有收藏任何物品～</div>
        <ul v-else class="favorite_list">
            <li v-for="f in favorites" :key="f.itemId" class="favorite_item">
                <img class="cover" :src="f.itemCoverImage || f.coverImage" alt="">
                <div class="info">
                    <p class="title">{{ f.itemTitle || f.title }}</p>
                    <p class="time">收藏于 {{ f.favoriteTime || f.createTime }}</p>
                </div>
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
@import 'favoriteList.css';
</style>