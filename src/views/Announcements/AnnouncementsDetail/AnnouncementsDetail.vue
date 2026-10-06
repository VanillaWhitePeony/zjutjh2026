<script setup>
import { url } from '@/config.js';
import { useUserStore } from '@/store/user';
import axios from 'axios';
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { isAdminRole } from '@/utils/role.js';

const userStore = useUserStore();
const router = useRouter();

// 是否为管理员（统一角色判断）
const isAdmin = computed(() => isAdminRole(userStore.user?.role));

const announcement = ref(null);
const loading = ref(false);

const props = defineProps({
    id: { type: String, required: true }
});//获取id

const statusMap = {
    published: '已发布',
    draft: '草稿',
    offline: '已下架'
};

async function getAnnouncementDetail() {
    loading.value = true;
    try {
        const response = await axios.get(`${url}/announcements/${props.id}`);
        if (response.data.code === 200) {
            announcement.value = response.data.data;
        } else {
            alert(response.data.msg);
        }
    } catch (err) {
        console.error('获取异常:', err);
        alert('有问题');
    } finally {
        loading.value = false;
    }
}

function goBack() {
    router.push('/announcements');
}

//删除公告
async function deleteAnnouncement() {
    if (!confirm(`确定要删除这条公告「${announcement.value.title}」吗？\n删除后鼠族圣经不会删掉你的名字，但是鼠族笑话就没了`)) {
        return;
    }

    try {
        const response = await axios.delete(`${url}/announcements/${props.id}`);
        if (response.data.code === 200) {
            alert('一条悲伤的鼠族笑话离开了这个世界');
            router.push('/announcements');
        } else {
            alert( '鼠族笑话被米莉拉强力拦截保留了：' + response.data.msg );
        }
    } catch (err) {
        console.error('删除公告异常:', err);
        alert('我睡昏过去了，稍后再试');
    }
}

//上架
async function publishAnnouncement() {
    if (!confirm(`确定要展示这条「${announcement.value.title}」鼠族笑话吗？\n上架后大家就都能看到了。`)) {
        return;
    }
    await changePublishStatus('publish');
}

//下架
async function offlineAnnouncement() {
    if (!confirm(`确定要独吞「${announcement.value.title}」这条鼠族笑话吗吗？\n独吞后不再对外展示。`)) {
        return;
    }
    await changePublishStatus('offline');
}

//上架/下架
async function changePublishStatus(action) {
    try {
        const response = await axios.patch(
            `${url}/announcements/${props.id}/publish`,
            { action: action }
        );
        if (response.data.code === 200) {
            alert(action === 'publish' ? '希望没有鼠鼠夜里攻击你的膝盖' : '绮罗是绝世豪猫，一定要养一只哦（这条下架成功了）');
            getAnnouncementDetail();
        } else {
            alert('长太息以掩涕兮'+response.data.msg);
        }
    } catch (err) {
        console.error('操作异常:', err);
        alert('亲爱的请重试');
    }
}
function goEdit(){
    router.push(`/announcements/${props.id}/edit`);
}
onMounted(getAnnouncementDetail);
</script>

<template>
    <div class="announcementdetail_container">
        <button @click="goBack" class="btn">回去看香草白牡丹发电</button>

        <div v-if="loading" class="loading">少女祈祷中...</div>

        <div v-else-if="announcement" class="detail_card">
            <div class="header">
                <span v-if="announcement.isTop" class="top_tag">本条已置顶</span>
                <h2>{{ announcement.title }}</h2>
            </div>

            <ul class="info_list">
                <li>
                    <span class="label">公告 ID：</span>
                    <span class="value">{{ announcement.announcementId }}</span>
                </li>
                <li>
                    <span class="label">标题：</span>
                    <span class="value">{{ announcement.title }}</span>
                </li>
                <li>
                    <span class="label">内容：</span>
                    <span class="value">{{ announcement.content }}</span>
                </li>
                <li>
                    <span class="label">状态：</span>
                    <span class="value">{{ statusMap[announcement.status] }}</span>
                </li>
                <li>
                    <span class="label">发布时间：</span>
                    <span class="value">{{ announcement.publishAt }}</span>
                </li>
                <li>
                    <span class="label">发布者 ID：</span>
                    <span class="value">{{ announcement.publisherId }}</span>
                </li>
                <li>
                    <span class="label">创建时间：</span>
                    <span class="value">{{ announcement.createTime }}</span>
                </li>
            </ul>
            <div v-if="isAdmin" class="admin">
                <button
                    @click="goEdit"
                    class="btn"
                >
                    编辑
                </button>
                <button
                    v-if="announcement.status === 'published'"
                    @click="offlineAnnouncement"
                    class="btn_offline"
                >
                    下架
                </button>
                <button
                    v-else
                    @click="publishAnnouncement"
                    class="btn_publish"
                >
                    上架
                </button>
                <button
                    @click="deleteAnnouncement"
                    class="btn_delete"
                >
                    删除
                </button>
            </div>
        </div>
        

        <div v-else class="empty">这条公告消失了，它将在现实中的某个角落里继续存在</div>
        
    </div>
</template>

<style scoped>
    @import 'AnnouncementsDetail.css';
</style>