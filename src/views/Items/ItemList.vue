<!--实现功能：筛选+分页+搜索-->
<script setup>
    import {ref,reactive,computed,watch,onMounted} from 'vue'
    import { useRouter } from 'vue-router';
    import {useUserStore} from '@/store/user'
    import { request } from '@/Request/request';

    const router=useRouter();
    const userStore=useUserStore();

    const adminRoles=['lf_admin','sys_admin']//管理员角色名单，系统管理员+审核管理员
    const isAdmin=computed(()=>adminRoles.includes())//????不太对，要改
    const normalVisableStatus=['approved','claimed','closed']//普通账号能见状态
    const adminVisableStatus=['pending','rejected']//管理员能见

//拾取丢失类型选项
    const typeOptions=[
        {label:'寻物启事',value:'LOST'},
        {label:'失物招领',value:'FOUND'}
    ]

//物品类型选项
const categoryOptions = [
  { label: '证件卡类', value: 'CARD' },
  { label: '电子产品', value: 'DIGITAL' },
  { label: '钱包钥匙', value: 'WALLET' },
  { label: '书籍文具', value: 'BOOK' },
  { label: '衣物饰品', value: 'CLOTHING' },
  { label: '其他', value: 'OTHER' }
]

//状态选项
const allStatusOptions = [
  { label: '待审核', value: 'PENDING' },
  { label: '已通过', value: 'APPROVED' },
  { label: '已驳回', value: 'REJECTED' },
  { label: '已认领', value: 'CLAIMED' },
  { label: '已关闭', value: 'CLOSED' }
]

//按照用户状态返回物品状态
    const visibleStatusOptions =computed(()=>{
        if(isAdmin.value)  return allStatusOptions;
        return allStatusOptions.filter((o)=>NORMAL_VISIBLE_STATUSES.includes(o.value))//o???
    })

//查询条件
const query=reactive({
    type:'',
    keyword:'',
    category:'',
    page:'',
    pageSize:''
})


//日期范围查询用,单独拿出来
const dateRange=ref([]);

//
const list=ref([]);
const totalAmount=ref(0);
const loading=ref(false);//加载状态

//权限的核心逻辑！！！最后写！因为我现在还不是很会！

//ai建议加上的，防止空串被后端过滤掉
function buildQueryParams(){
    const params={
        keyword:query.keyword || undefined,
        type: query.type || undefined,
        category: query.category ||undefined,
        startDate: dateRange.value?.[0] || undefined,
        endDate: dateRange.value?.[1]  ||undefined,
        page: query.page,
        pageSize:query.pageSize
    }
}

async function fetchList() {
    loading.value=true;
    try{
        const res =await request.get('/api/items',{params:buildQueryParams()})
        list.value=res.data?.records??[]
        totalAmount.value=res.data?.totalAmount??0
    }catch(err){
        console.error(err)
        erMessage.error('加载失败')
        list.value=[]
        totalAmount.value=0
    }finally{
        loading.value=false
    }
}

function search() {//搜索从首页开始
  query.page = 1
  fetchList()
}

function research() {//重新搜索要把村的信息清空
  query.keyword  = ''
  query.type     = ''
  query.category = ''
  query.status   = ''
  query.page     = 1
  dateRange.value = []
  fetchList()
}

function changePageSize() {//改变最大条数时重新从第一页开始
  query.page = 1
  fetchList()
}

function goDetails(item) {//点击进入详情页
  router.push({ name: 'ItemDetails', params: { id: item.id } })
}

watch(//ai加的，下拉筛选变化时及时刷新
  () => [query.type, query.category, query.status, dateRange.value],
  () => {
    query.page = 1
    fetchList()
  }
)


</script>

<template>
    <div class="itemListPage">
        <!--分页-->
        <div class="paginate">
            <el-paginate
                v-model:current-page="query.page"
                v-model:page-size="query.pageSize"
                :total="totalAmount"
                layout="total,prev,pager,next,jumper"
                @current-change="fetchList"/>
        </div>

        <div class="max-mount-everypage">
            <span>每页</span>
            <el-input-number
                v-model="query.pageSize"
                :min="1"
                :max="50"
                step-strictly
                controls-position="right"
                size="small"
                @change="changePageSize"/>
        </div>
    </div>




</template>