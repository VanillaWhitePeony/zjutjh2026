<script setup>
import { url } from '@/config.js';
import axios from 'axios';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '@/store/user';

const route = useRoute();
const userStore = useUserStore();

const props = defineProps({
    itemId: { type: [String, Number], default: '' }
});

const itemId = computed(() => props.itemId || route.params.itemId || route.query.itemId || '');

const comments = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);

const totalPages = computed(() => Math.ceil(total.value / pageSize.value));

async function getComments(page = 1) {
    loading.value = true;
    try {
        const response = await axios.get(`${url}/items/${itemId.value}/comments`, {
            params: { page, pageSize: pageSize.value }
        });
        if (response.data.code === 200) {
            const d = response.data.data || {};
            comments.value = d.list || [];
            total.value = Number(d.total) || 0;
            currentPage.value = Number(d.page) || page;
        } else {
            alert(response.data.msg || '获取留言失败');
        }
    } catch (err) {
        console.error('获取留言异常:', err);
        alert('获取留言失败');
    } finally {
        loading.value = false;
    }
}

function goToPage(page) {
    page = Number(page);
    if (page < 1 || page > totalPages.value || page === currentPage.value) return;
    getComments(page);
}

const currentUserId = computed(() => userStore.user?.userId);

function isOwn(c) {
    return !!currentUserId.value && c.author?.userId === currentUserId.value;
}

// 供父组件在发布留言后乐观插入新留言
function addComment(c) {
    if (c.commentId == null) c.commentId = 'local-' + Date.now();
    comments.value.unshift(c);
    total.value += 1;
}

async function deleteComment(c) {
    try {
        const res = await axios.delete(`${url}/items/${itemId.value}/comments/${c.commentId}`, {
            headers: { Authorization: `Bearer ${userStore.token}` }
        });
        if (res.data.code === 200) {
            comments.value = comments.value.filter(x => x.commentId !== c.commentId);
            total.value = Math.max(0, total.value - 1);
        } else {
            alert(res.data.msg || '删除失败');
        }
    } catch (err) {
        console.error('删除留言异常:', err);
        alert('删除失败');
    }
}

defineExpose({ addComment });

onMounted(() => { getComments(1); });
</script>

<template>
    <div class="comment_list_container">
        <h2>留言</h2>
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else-if="comments.length === 0" class="empty">还没有留言～</div>
        <ul v-else class="comment_list">
            <li v-for="c in comments" :key="c.commentId" class="comment_item">
                <div class="comment_head">
                    <span class="author">{{ c.author?.nickname || c.nickname || '匿名' }}</span>
                    <span class="head_right">
                        <button v-if="isOwn(c)" class="comment_delete" @click="deleteComment(c)">删除</button>
                        <span class="time">{{ c.createTime }}</span>
                    </span>
                </div>
                <p class="content">{{ c.content }}</p>
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
@import 'commentList.css';
</style>