<script setup>
import { url } from '@/config.js';
import { useUserStore } from '@/store/user';
import axios from 'axios';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { isAdminRole } from '@/utils/role.js';

const router=useRouter();
const userStore = useUserStore()

// 是否为管理员（统一角色判断）
const isAdmin = computed(() => isAdminRole(userStore.user?.role));

const items=ref([]);
const loading=ref(false);
const currentPage=ref(1);
const pageSize=ref(10);
const total=ref(0);

const keyword=ref('');
const typeFilter=ref('');

const totalPages=computed(
    function(){
        return Math.ceil(total.value/pageSize.value);
    }
)

const typeMap={
    lost:'通缉某物',
    found:'某物被缉拿'
};

const statusMap={
    pending:'Go Work',
    approved:'Pass!!!',
    rejected:'不可能，绝对不可能！！！'
};

async function getItems(page=1){
    loading.value=true;
    try{
        const response=await axios.get(
            `${url}/admin/audit/items`,
            {
                params:{
                    page:page,
                    pageSize:pageSize.value,
                    type:typeFilter.value||undefined,
                    keyword:keyword.value||undefined
                }
            }
        );
        if(response.data.code===200){
            items.value=response.data.data.list;
            total.value=Number(response.data.data.total);
            currentPage.value=Number(response.data.data.page);
            pageSize.value=Number(response.data.data.pageSize);
        }
        else{
            alert(response.data.msg);
        }
    }
    catch(err){
        console.error('获取异常:',err);
        alert('有问题');
    }
    finally{
        loading.value=false;
    }
}

//切换页面
function goToPage(page){
    page=Number(page);
    if(page<1||page>totalPages.value)return;
    if(page===currentPage.value)return;
    getItems(page);
}

function goHome(){
    router.push({ name:'Home' });
}

onMounted(() => {
    getItems(1);
})



const displayPages=function(){
    const total=totalPages.value;
    const current=Math.max(1, Math.min(Number(currentPage.value), total));

    const around=2;

    const pages=[];
    if(total<=1)return[];

    pages.push(1);

    let start=Math.max(2,current-around);
    let end=Math.min(total-1,current+around);
    if(start>2){
        pages.push('...');
    }
    for(let i=start;i<=end;i++){
        pages.push(i);
    }
    if(end<total-1){
        pages.push('...');
    }

    if(total>1){
        pages.push(total);
    }
    return pages;
}

async function auditItem(itemId, action, remark){
    try{
        const body={ action:action };
        if(action==='reject'){
            body.remark=remark;
        }
        const response=await axios.patch(
            `${url}/admin/audit/items/${itemId}`,
            body
        );
        if(response.data.code===200){
            alert(action==='approve' ? '可怜的物品啊，阿门' : '哦，幸运的物品逃过一劫');
            getItems(currentPage.value);
        }
        else if(response.data.code===3002){
            alert('老大这条被神鹤过了');
            getItems(currentPage.value);
        }
        else{
            alert(response.data.msg);
        }
    }
    catch(err){
        console.error('神鹤异常:',err);
        alert('有问题');
    }
}

function approveItem(item){
    if(item.status!=='pending')return;
    if(!confirm(`确定让《${item.title}》对过失物品的指责发表吗————可能会让无辜物品名誉被侵犯捏`))return;
    auditItem(item.itemId,'approve');
}

function rejectItem(item){
    if(item.status!=='pending')return;
    const remark=prompt(`哦，伟大的管理员啊，《${item.title}》犯了什么罪啊`);
    if(remark===null)return;
    if(!remark.trim()){
        alert('请苍天，辨忠奸，老大你怎么能无理由打回我，管理员坏坏');
        return;
    }
    auditItem(item.itemId,'reject',remark.trim());
}
</script>

<template>
    <div v-if="!isAdmin" class="error">
        <span>不是管理员喵，你是凑企鹅</span>
    </div>
    <div v-else class="audit_item_list_container">
        <nav class="navbar">
            <button @click="goHome" class="btn">常回家看看</button>
        </nav>

        <h1>老大别玩了，该工作了喵</h1>

        <div v-if="loading" class="loading">加载中...</div>

        <!--待审核信息表格-->
        <div v-else class="audit_item">
            <table class="item_table">
                <thead>
                    <tr>
                        <th>封面</th>
                        <th>标题</th>
                        <th>类型</th>
                        <th>分类</th>
                        <th>地点</th>
                        <th>发生时间</th>
                        <th>发布人</th>
                        <th>状态</th>
                        <th>提交时间</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr 
                        v-for="item in items" 
                        :key="item.itemId" 
                        class="item_row"
                    >
                        <td>
                            <img
                                v-if="item.coverImage"
                                :src="item.coverImage"
                                class="cover"
                                alt="cover"
                            />
                            <span v-else class="cover_placeholder">略</span>
                        </td>
                        <td>
                            {{ item.title }}
                        </td>
                        <td>
                            <span class="type_tag" :class="'type_'+item.type">
                                {{ typeMap[item.type]}}
                            </span>
                        </td>
                        <td>
                            {{ item.categoryName }}
                        </td>
                        <td>
                            {{ item.location }}
                        </td>
                        <td>
                            {{ item.lostTime }}
                        </td>
                        <td>
                            <div class="publisher">
                                <img
                                    v-if="item.publisher && item.publisher.avatar"
                                    :src="item.publisher.avatar"
                                    class="avatar"
                                    alt="avatar"
                                />
                                <span v-else class="avatar_placeholder">略</span>
                                <span class="publisher_name">
                                    {{item.publisher.nickname}}
                                </span>
                            </div>
                        </td>
                        <td>
                            <span class="status_tag">
                                {{ statusMap[item.status]}}
                            </span>
                        </td>
                        <td>
                            {{ item.createTime }}
                        </td>
                        <td>
                            <button 
                                @click="approveItem(item)" 
                                class="btn_approve"
                                :disabled="item.status!=='pending'"
                            >通过</button>
                            <button 
                                @click="rejectItem(item)" 
                                class="btn_reject"
                                :disabled="item.status!=='pending'"
                            >拒绝</button>
                        </td>
                    </tr>
                    <tr v-if="items.length===0">
                        <td colspan="10" class="empty">没有找到符合条件的待审核信息</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <!--雷霆分页选自大作业-->
        <div v-if="totalPages>1" class="page_change">
            <button 
                @click="goToPage(currentPage-1)" 
                :disabled="currentPage===1"
                class="btn_page">
                上一页
            </button>

            <div v-for="p in displayPages" :key="p" class="page_display">
                <span v-if="p==='...'">…</span>
                <button 
                    v-else @click="goToPage(p)" 
                    class="btn_page_display">
                    {{ p }}
                </button>
            </div>

            <button 
                @click="goToPage(currentPage+1)" 
                :disabled="currentPage===totalPages"
                class="btn_page">
                下一页
            </button>

        </div>
    </div>
</template>

<style scoped>
    @import 'AuditItem.css';
</style>