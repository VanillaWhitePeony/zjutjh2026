<script setup>
import { url } from '@/config.js';
import { useUserStore } from '@/store/user';
import axios from 'axios';
import { defineProps, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

const announcement = ref(null);
const loading = ref(false);
const submitting = ref(false);

const title = ref('');
const content = ref('');
const isTop = ref(false);
const publishAt = ref('');

const props = defineProps({
    id: { type: String, required: true }
});//获取id

async function getAnnouncementDetail() {
    loading.value = true;
    try {
        const response = await axios.get(`${url}/announcements/${props.id}`);
        if (response.data.code === 200) {
            announcement.value = response.data.data;
            title.value = response.data.data.title;
            content.value = response.data.data.content;
            isTop.value = response.data.data.isTop;
        } else {
            alert(response.data.msg);
        }
    } catch (err) {
        console.error('获取异常:', err);
        alert('啊我死了');
    } finally {
        loading.value = false;
    }
}

async function submit() {
    if (!title.value.trim()) {
        alert('米莉拉野史标题不能为空');
        return;
    }
    if (!content.value.trim()) {
        alert('米莉拉野史内容不能为空');
        return;
    }

    const data = {
        title: title.value.trim(),
        content: content.value.trim(),
        isTop: isTop.value
    };

    if (announcement.value.status === 'published') {
        // 已发布发布时间改成当前
        data.publishAt = new Date().toISOString();
    } else if (publishAt.value) {
        // 未发布改时间
        data.publishAt = new Date(publishAt.value).toISOString();
    } else {
        // 未发布不改时间
        data.publishAt = announcement.value.publishAt;
    }

    submitting.value = true;
    try {
        const response = await axios.put(`${url}/announcements/${props.id}`, data);
        if (response.data.code === 200) {
            alert('这次的米莉拉野史一定会比鼠鼠笑话有意思');
            router.push(`/announcements/${props.id}`);
        } else {
            alert('米莉拉黑了你的电脑不让你发米莉拉野史：'+response.data.msg);
        }
    } catch (err) {
        console.error('修改异常:', err);
        alert('绮罗：我真求你了，不要发了\n以至于发生未知错误');
    } finally {
        submitting.value = false;
    }
}

function goBack() {
    router.push(`/announcements/${props.id}`);
}

onMounted(getAnnouncementDetail);
</script>

<template>
    <div v-if="! (userStore.user.role==='admin')" class="error">
        <span>不是管理员喵，你是凑企鹅</span>
    </div>
    <div v-else class="announcement_edit_container">
        <button @click="goBack" class="btn">不想改了</button>

        <div v-if="loading" class="loading">少女祈祷中...</div>

        <div v-else-if="announcement" class="edit_card">

            <div class="form_item">
                <label>米莉拉野史标题</label>
                <input
                    v-model="title"
                    type="text"
                    class="input_text"
                    placeholder="请输入米莉拉野史标题"
                />
            </div>

            <div class="form_item">
                <label>米莉拉野史内容</label>
                <textarea
                    v-model="content"
                    class="input_textarea"
                    placeholder="请输入米莉拉野史内容"
                ></textarea>
            </div>

            <div class="form_item">
                <label class="checkbox_label">
                    <input v-model="isTop" type="checkbox" />
                    置顶
                </label>
            </div>

            <!--
            <div v-if="announcement.status === 'published'" class="form_item">
                <label>发布时间：</label>
                <span class="value">自动同步当前时间</span>
            </div>
            --->
            <div class="form_item">
                <label>发布时间（留空表示不改）：</label>
                <input
                    v-model="publishAt"
                    type="datetime-local"
                    class="input_text"
                />
                <span class="value">原发布时间：{{ announcement.publishAt }}</span>
            </div>

            <div class="form_actions">
                <button
                    @click="submit"
                    :disabled="submitting"
                    class="btn"
                >
                    {{ submitting ? '保存中...' : '保存' }}
                </button>
            </div>
        </div>

        <div v-else class="empty">存在的人用着不存在的管理员账号更改不存在的公告～～～</div>
    </div>
</template>

<style scoped>
    @import 'AnnouncementsEdit.css';
</style>