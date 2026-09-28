<script setup>
//以下用于实现分页获取待审核失物认领信息列表
import { url } from '@/config.js';
import { useUserStore } from '@/store/user';
import axios from 'axios';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router=useRouter();
const userStore = useUserStore()

const items=ref([]);
const loading=ref(false);
const currentPage=ref(1);
const pageSize=ref(10);
const total=ref(0);

const keyword=ref('');

const totalPages=computed(
    function(){
        return Math.ceil(total.value/pageSize.value);
    }
)

const statusMap={
    pending:'Go Work',
    approved:'Pass!!!',
    rejected:'不可能，绝对不可能！！！'
};

async function getItems(page=1){
    loading.value=true;
    try{
        const response=await axios.get(
            `${url}/admin/audit/claims`,
            {
                params:{
                    page:page,
                    pageSize:pageSize.value,
                    keyword:keyword.value||undefined
                }
            }
        );
        if(response.data.code===200){
            items.value=response.data.data.list||[];
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
    const totalPage=totalPages.value;
    const current=Math.max(1, Math.min(Number(currentPage.value), totalPage));

    const around=2;

    const pages=[];
    if(totalPage<=1)return[];

    pages.push(1);

    let start=Math.max(2,current-around);
    let end=Math.min(totalPage-1,current+around);
    if(start>2){
        pages.push('...');
    }
    for(let i=start;i<=end;i++){
        pages.push(i);
    }
    if(end<totalPage-1){
        pages.push('...');
    }

    if(totalPage>1){
        pages.push(totalPage);
    }
    return pages;
}

async function auditClaim(claimId, action, remark){
    try{
        const body={ action:action };
        if(action==='reject'){
            body.remark=remark;
        }
        const response=await axios.patch(
            `${url}/admin/audit/claims/${claimId}`,
            body
        );
        if(response.data.code===200){
            alert(action==='approve' ? '物品认罪了' : '出于这样那样的原因，该条成功被驳回');
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

function approveItem(claim){
    if(claim.status!=='pending')return;
    if(!confirm(`确定让《${claim.itemTitle}》的认领申请通过吗`))return;
    auditClaim(claim.claimId,'approve');
}

function rejectItem(claim){
    if(claim.status!=='pending')return;
    const remark=prompt(`哦，伟大的管理员啊，《${claim.itemTitle}》为什么竟然不许`);
    if(remark===null)return;
    if(!remark.trim()){
        alert('QAQ，不要不给理由打回我，QwQ');
        return;
    }
    auditClaim(claim.claimId,'reject',remark.trim());
}
</script>

<template>
    <div v-if="! (userStore.user.role==='admin')" class="error">
        <span>不是管理员喵，你是凑企鹅</span>
    </div>
    <div v-else class="audit_item_list_container">
        <nav class="navbar">
            <button @click="goHome" class="btn">常回家看看</button>
        </nav>

        <h1>老大别玩了，该工作了喵</h1>

        <div v-if="loading" class="loading">加载中...</div>

        <!--待审核认领信息表格-->
        <div v-else class="audit_item">
            <table class="item_table">
                <thead>
                    <tr>
                        <th>物品封面</th>
                        <th>物品标题</th>
                        <th>认领理由</th>
                        <th>证明图片</th>
                        <th>联系方式</th>
                        <th>申请人</th>
                        <th>状态</th>
                        <th>提交时间</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr 
                        v-for="claim in items" 
                        :key="claim.claimId" 
                        class="item_row"
                    >
                        <td>
                            <img
                                v-if="claim.itemCoverImage"
                                :src="claim.itemCoverImage"
                                class="cover"
                                alt="cover"
                            />
                            <span v-else class="cover_placeholder">略</span>
                        </td>
                        <td>
                            {{ claim.itemTitle }}
                        </td>
                        <td class="claim_reason">
                            {{ claim.claimReason }}
                        </td>
                        <td>
                            <div class="proof_list">
                                <template v-if="claim.proofImages && claim.proofImages.length">
                                    <img
                                        v-for="(proof,index) in claim.proofImages"
                                        :key="index"
                                        :src="proof"
                                        class="proof_image"
                                        alt="proof"
                                    />
                                </template>
                                <span v-else class="cover_placeholder">略</span>
                            </div>
                        </td>
                        <td>
                            {{ claim.contactValue }}
                        </td>
                        <td>
                            <div class="publisher">
                                <img
                                    v-if="claim.applicant && claim.applicant.avatar"
                                    :src="claim.applicant.avatar"
                                    class="avatar"
                                    alt="avatar"
                                />
                                <span v-else class="avatar_placeholder">略</span>
                                <span class="publisher_name">
                                    {{ claim.applicant ? claim.applicant.nickname : '未知' }}
                                </span>
                            </div>
                        </td>
                        <td>
                            <span class="status_tag" :class="'status_'+claim.status">
                                {{ statusMap[claim.status]}}
                            </span>
                        </td>
                        <td>
                            {{ claim.createTime }}
                        </td>
                        <td>
                            <button 
                                @click="approveItem(claim)" 
                                class="btn_approve"
                                :disabled="claim.status!=='pending'"
                            >通过</button>
                            <button 
                                @click="rejectItem(claim)" 
                                class="btn_reject"
                                :disabled="claim.status!=='pending'"
                            >拒绝</button>
                        </td>
                    </tr>
                    <tr v-if="items.length===0">
                        <td colspan="9" class="empty">没有找到符合条件的待审核认领信息</td>
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
    @import 'AuditClaim.css';
</style>