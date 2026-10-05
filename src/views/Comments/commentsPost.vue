<script setup>
import { url } from '@/config.js';
import { useUserStore } from '@/store/user';
import axios from 'axios';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const userStore = useUserStore();

const props = defineProps({
    itemId: { type: [String, Number], default: '' }
});
const emit = defineEmits(['posted']);

const itemId = computed(() => props.itemId || route.params.itemId || route.query.itemId || '');

const content = ref('');
const submitting = ref(false);

async function submit() {
    const text = content.value.trim();
    if (!text) {
        alert('留言内容不能为空');
        return;
    }
    if (text.length > 500) {
        alert('留言不能超过 500 字');
        return;
    }
    submitting.value = true;
    try {
        const response = await axios.post(
            `${url}/items/${itemId.value}/comments`,
            { content: text },
            { headers: { Authorization: `Bearer ${userStore.token}` } }
        );
        if (response.data.code === 200) {
            alert('留言成功');
            content.value = '';
            emit('posted');
        } else {
            alert(response.data.msg || '留言失败');
        }
    } catch (err) {
        console.error('留言异常:', err);
        alert('留言失败');
    } finally {
        submitting.value = false;
    }
}
</script>

<template>
    <div class="comment_post_container">
        <textarea
            v-model="content"
            class="input_textarea"
            placeholder="写点留言（1-500 字）"
            maxlength="500"
        ></textarea>
        <div class="form_actions">
            <span class="counter">{{ content.length }} / 500</span>
            <button @click="submit" :disabled="submitting" class="btn">
                {{ submitting ? '发布中...' : '发布留言' }}
            </button>
        </div>
    </div>
</template>

<style scoped>
@import 'commentsPost.css';
</style>