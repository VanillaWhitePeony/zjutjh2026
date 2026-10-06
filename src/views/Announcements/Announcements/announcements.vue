<script setup>
//以下用于实现分页获取公告列表
import { url } from '@/config.js';
import { useUserStore } from '@/store/user';
import axios from 'axios';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { isAdminRole } from '@/utils/role.js';

const router = useRouter();
const userStore = useUserStore();

// 是否为管理员（统一角色判断）
const isAdmin = computed(() => isAdminRole(userStore.user?.role));

const announcements = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const statusFilter = ref('');

const totalPages = computed(
    function(){
        return Math.ceil(total.value / pageSize.value);
    }
);

const statusMap = {
    published: '已发布',
    draft: '草稿',
    offline: '已下架'
};

async function getAnnouncements(page = 1){
    loading.value = true;
    try{
        const params = {
            page: page,
            pageSize: pageSize.value
        };
        
        if(isAdmin.value && statusFilter.value){
            params.status = statusFilter.value;
        }

        const response = await axios.get(
            `${url}/announcements`,
            {
                params: params
            }
        );

        if(response.data.code === 200){
            announcements.value = response.data.data.list;
            total.value = Number(response.data.data.total);
            currentPage.value = Number(response.data.data.page);
            pageSize.value = Number(response.data.data.pageSize);
        }

        else{
            alert(response.data.msg);
        }
    }
    catch(err){
        console.error('获取异常:', err);
        alert('有问题');
    }
    finally{
        loading.value = false;
    }
}

//切换状态筛选
function changeStatus(){
    getAnnouncements(1);
}

//切换页面
function goToPage(page){
    page = Number(page);
    if(page < 1 || page > totalPages.value)return;
    if(page === currentPage.value)return;
    getAnnouncements(page);
}

function goHome(){
    router.push({ name: 'Home' });
}

const displayPages = computed(
    function(){
        const totalPage = totalPages.value;
        const current = Math.max(1, Math.min(Number(currentPage.value), totalPage));

        const around = 2;

        const pages = [];
        if(totalPage <= 1)return [];

        pages.push(1);

        let start = Math.max(2, current - around);
        let end = Math.min(totalPage - 1, current + around);
        if(start > 2){
            pages.push('...');
        }
        for(let i = start;i <= end;i++){
            pages.push(i);
        }
        if(end < totalPage - 1){
            pages.push('...');
        }

        if(totalPage > 1){
            pages.push(totalPage);
        }
        return pages;
    }
);

onMounted(() => {
    getAnnouncements(1);
});

function goPost(){
    router.push({ name: 'AnnouncementsPost' });
}

function goToDetail(id){
    router.push(`/announcements/${id}`);
}
</script>

<template>
    <div class="announcement_container">
        <nav class="navbar">
            <button @click="goHome" class="btn">不想看就别看（）</button>
            <button v-if="isAdmin" @click="goPost" class="btn">写小作文</button>
        </nav>

        <h1>全体目光向我看齐，我宣布个事，我香草白牡丹</h1>

        <div v-if="isAdmin" class="filter_bar">
            <span>状态筛选：</span>
            <select v-model="statusFilter" @change="changeStatus" class="status_select">
                <option value="">全部</option>
                <option value="published">已发布</option>
                <option value="draft">草稿</option>
                <option value="offline">已下架</option>
            </select>
        </div>

        <div v-if="loading" class="loading">加载中...</div>

        <!--公告表格-->
        <div v-else class="announcement_detail">
            <table class="announcement_table">
                <thead>
                    <tr>
                        <th>超绝标题</th>
                        <th>雷霆内容</th>
                        <th>当前状态</th>
                        <th>名扬全站之日</th>
                        <th>工作完成之时</th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="item in announcements"
                        :key="item.announcementId"
                        class="announcement_row"
                    >
                        <td>
                            <span v-if="item.isTop" class="top_tag">格调，啊不是，强调</span>
                            {{ item.title }}
                        </td>
                        <td class="content_cell">
                            {{ item.content }}
                        </td>
                        <td>
                            <span class="status_tag">
                                {{ statusMap[item.status] }}
                            </span>
                        </td>
                        <td>
                            {{ item.publishAt }}
                        </td>
                        <td>
                            {{ item.createTime }}
                        </td>
                        <td>
                            <button @click="goToDetail(item.announcementId)" class="btn">查看</button>
                        </td>
                    </tr>
                    <tr v-if="announcements.length === 0">
                        <td colspan="6" class="empty">0个公告，嘻嘻</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!--雷霆分页选自大作业-->
        <div v-if="totalPages > 1" class="page_change">
            <button
                @click="goToPage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="btn_page">
                上一页
            </button>

            <div v-for="p in displayPages" :key="p" class="page_display">
                <span v-if="p === '...'">…</span>
                <button
                    v-else @click="goToPage(p)"
                    class="btn_page_display">
                    {{ p }}
                </button>
            </div>

            <button
                @click="goToPage(currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="btn_page">
                下一页
            </button>
        </div>
    </div>
</template>

<style scoped>
    @import 'announcements.css';
</style>