<script setup>
//以下用于实现分页获取用户列表
import { url } from '@/config.js';
import axios from 'axios';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router=useRouter();

const users=ref([]);
const loading=ref(false);
const currentPage=ref(1);
const pageSize=ref(10);
const total=ref(0);

const keyword=ref('');//用户名/学号关键字
const roleFilter=ref('');//角色筛选

const totalPages=computed(
    function(){
        return Math.ceil(total.value/pageSize.value);
    }
)

const roleMap={
    student:'学生',
    teacher:'教师',
    sys_admin:'系统管理员'
};

async function getUsers(page=1){
    loading.value=true;
    try{
        const response=await axios.get(
            `${url}/admin/users`,
            {
                params:{
                    page:page,
                    pageSize:pageSize.value,
                    role:roleFilter.value||undefined,
                    keyword:keyword.value||undefined
                }
            }
        );
        if(response.data.code===200){
            users.value=response.data.data.list;
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
    getUsers(page);
}

function goHome(){
    router.push({ name:'Home' });
}

onMounted(() => {
    getUsers(1);
})



const displayPages=computed(function(){
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
})
</script>

<template>
    <div class="user_detail_list_container">
        <nav class="navbar">
            <button @click="goHome" class="btn">常回家看看</button>
        </nav>

        <h1>全校丢东西和捡东西之人（以及能查看这个页面之人）</h1>

        <div v-if="loading" class="loading">加载中...</div>

        <!--用户表格-->
        <div v-else class="user_detail">
            <table class="user_table">
                <thead>
                    <tr>
                        <th>头像</th>
                        <th>用户名</th>
                        <th>昵称</th>
                        <th>学号</th>
                        <th>手机号</th>
                        <th>邮箱</th>
                        <th>角色</th>
                        <th>注册时间</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in users" :key="item.userId" class="user_row">
                        <td>
                            <img
                                v-if="item.avatar"
                                :src="item.avatar"
                                class="avatar"
                                alt="avatar"
                            />
                            <span v-else class="avatar_placeholder">无</span>
                        </td>
                        <td>
                            {{ item.username }}
                        </td>
                        <td>
                            {{ item.nickname }}
                        </td>
                        <td>
                            {{ item.studentNo }}
                        </td>
                        <td>
                            {{ item.phone }}
                        </td>
                        <td>
                            {{ item.email }}
                        </td>
                        <td>
                            <span class="role_tag" :class="'role_'+item.role">
                                {{ roleMap[item.role]}}
                            </span>
                        </td>
                        <td>
                            {{ item.createTime }}
                        </td>
                    </tr>
                    <tr v-if="users.length===0">
                        <td colspan="8" class="empty">没有找到符合条件的用户</td>
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
    @import 'UserDetailList.css';
</style>