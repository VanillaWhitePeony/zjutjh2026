<script setup>
import { url } from '@/config.js';
import { useUserStore } from '@/store/user';
import axios from 'axios';
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { isAdminRole } from '@/utils/role.js';

const router = useRouter();
const userStore = useUserStore()

// 是否为管理员（统一角色判断）
const isAdmin = computed(() => isAdminRole(userStore.user?.role));

const data = ref({});
const loading = ref(false);
const categoryLoading=ref(false);
const categoryData = ref({})
const rateLoading=ref(false);
const rateData = ref({})
const trendLoading=ref(false);
const trendData = ref([]);
const trendChartRef = ref(null);
let trendChart = null;

async function getTrendData() {
    trendLoading.value = true;
    try{
        const response = await axios.get(`${url}/admin/stats/trend`);
        if(response.data.code === 200){
            trendData.value = response.data.data;
        } else {
            alert (response.data.msg);
        }   
    } finally {
        trendLoading.value =false;
        await nextTick();
        renderTrendChart();
    }   
}

function renderTrendChart() {
    if(! trendChartRef.value){
        return;
    }
    if(! trendChart){
        trendChart = echarts.init(trendChartRef.value);
    }
    const dates = [];
    const lostCounts = [];
    const foundCounts = [];
    for(let i = 0; i < trendData.value.length; i++){
        dates.push(trendData.value[i].date);
        lostCounts.push(trendData.value[i].lostCount);
        foundCounts.push(trendData.value[i].foundCount);
    }
    trendChart.setOption({
        title: { text: '每日新增铸币 / 失物招领趋势' },
        tooltip: { trigger: 'axis' },
        legend: { data: ['新增在逃物品', '新增缉拿物品'] },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: dates
        },
        yAxis: { type: 'value' },
        series: [
            {
                name: '新增在逃物品',
                type: 'line',
                smooth: true,
                data: lostCounts
            },
            {
                name: '新增缉拿物品',
                type: 'line',
                smooth: true,
                data: foundCounts
            }
        ]
    });
}

function handleResize() {
    if(trendChart){
        trendChart.resize();
    }
}

async function getRateData() {
    rateLoading.value = true;
    try{
        const response = await axios.get(`${url}/admin/stats/claim-rate`);
        if(response.data.code === 200){
            rateData.value = response.data.data;
        } else {
            alert (response.data.msg);
        }   
    } finally {
        rateLoading.value =false;
        getTrendData();
    }   
}

async function getCategoryData() {
    categoryLoading.value = true;
    try{
        const response = await axios.get(`${url}/admin/stats/category`);
        if(response.data.code === 200){
            categoryData.value = response.data.data;
        } else {
            alert (response.data.msg);
        }   
    } finally {
        categoryLoading.value =false;
        getRateData();
    }
}

async function getData() {
    loading.value = true;
    try{
        const response = await axios.get(`${url}/admin/stats/overview`);
        if(response.data.code === 200){
            data.value = response.data.data;
        } else {
            alert (response.data.msg);
        }   
    } finally {
        loading.value =false;
        getCategoryData();
    }
}
function goBack() {
    router.push('/');
}

onMounted(getData);
onMounted(function(){
    window.addEventListener('resize', handleResize);
});

onBeforeUnmount(function(){
    window.removeEventListener('resize', handleResize);
    if(trendChart){
        trendChart.dispose();
        trendChart = null;
    }
});

</script>

<template>
    <div v-if="!isAdmin" class="error">
        <span>不是管理员喵，你是凑企鹅</span>
    </div>
    <div v-else class="stats_container">
        <button @click="goBack" class="btn">回家看看</button>

        <div v-if="loading" class="loading">努力加载中...</div>

        <div v-else class="detail_card">

            <ul class="data_list">
                <li>
                    <span class="label">全部帖子数：</span>
                    <span class="value">{{ data.totalItems }}</span>
                </li>
                <li>
                    <span class="label">丢失物品数：</span>
                    <span class="value">{{ data.lostCount }}</span>
                </li>
                <li>
                    <span class="label">认领的物品数：</span>
                    <span class="value">{{ data.foundCount }}</span>
                </li>
                <li>
                    <span class="label">待审核数：</span>
                    <span class="value">{{ data.pendingAudit }}</span>
                </li>
                <li>
                    <span class="label">申请认领数：</span>
                    <span class="value">{{ data.claimedCount }}</span>
                </li>
                <li>
                    <span class="label">已关闭的数量：</span>
                    <span class="value">{{ data.closedCount }}</span>
                </li>
                <li>
                    <span class="label">伟大的站点有多少用户：</span>
                    <span class="value">{{ data.userCount }}</span>
                </li>
                <li>
                    <span class="label">日活：</span>
                    <span class="value">{{ data.todayNewItems }}</span>
                </li>
            </ul>
        </div>

        <div v-if="categoryLoading" class="category_loading">物品分类赶来中</div>
        <div v-else class="category_data">
            <table class="category_table">
                <thead>
                    <tr>
                        <th>种类名</th>
                        <th>数量</th>
                    </tr>
                </thead>
                <tbody>
                    <tr 
                        v-for="item in categoryData" 
                        :key="item.categoryId" 
                        class="category_row"
                    >
                        <td>
                            {{ item.categoryName }}
                        </td>
                        <td>
                            {{ item.count }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    <div v-if="rateLoading" class="rate_loading">少女祈祷中…</div>
    <div v-else class="rate_data">
        <ul class="rate_data_list">
                <li>
                    <span class="label">在逃物品数：</span>
                    <span class="value">{{ rateData.totalClaims }}</span>
                </li>
                <li>
                    <span class="label">已抓捕的物品数：</span>
                    <span class="value">{{ rateData.approvedClaims }}</span>
                </li>
                <li>
                    <span class="label">拒绝释放的物品数：</span>
                    <span class="value">{{ rateData.rejectedClaims }}</span>
                </li>
                <li>
                    <span class="label">取消的物品通缉：</span>
                    <span class="value">{{ rateData.cancelledClaims }}</span>
                </li>
                <li>
                    <span class="label">炼化成功率：</span>
                    <span class="value">{{ rateData.claimRate }}</span>
                </li>
            </ul>
    </div>
    <div v-if="trendLoading" class="trend_loading">少女祈祷中…</div>
    <div v-else class="trend_data">
        <div ref="trendChartRef" class="trend_chart" style="width: 100%; height: 360px;"></div>
    </div>
</template>

<style scoped>
    @import 'stats.css';
</style>