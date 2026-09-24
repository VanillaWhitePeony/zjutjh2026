<script setup>
    import{ ref,onMounted }from 'vue';
    import{ useRouter }from 'vue-router';
    import request from '@/Request/request';
    import {useUserStore} from '@/store/user';
    import { userInfo } from '';//怎么找不到了……明明记得之前看到写过这个的
    import{ form }from '@/views/Items/PostMessage.vue'
    const route=useRouter()
    const itemId=number(route.params.itemId)//??????

    const loading=ref(false)
    const item=ref<ItemDetail |null>(null)

    const isAdmin=adminRoles==='sys_admin'||'lf_admin';

    const status = {
        pending:'审核中',
        rejected:'已驳回',
        closed:'已关闭',
        approved:'已通过',
        claimed:'已发布'
    }


    const contactType={
        weichat:'微信',
        phone:'手机号',
        qq:'QQ',
        email:'邮箱'
    }




    async function fetchDetails() {
        loading.value=true;
        try{
            item.value=await request.get(`/api/items/${itemId}`)
        }finally{
            loading.value=false;
        }
    }
    
onMounted(fetchDetails)

</script>


<template>
    <div class="ItemDetails">
        <div v-if="loading">在努力中了……</div>
        <div v-else-if="errorMessage">
            <p>{{ errorMessage }}</p>
            <button @click="fetchDetail">再给一次机会吧！</button>
        </div>

        <div v-else-if="item">
            <div v-if="isAdmin" class="adminStatus">
                当前状态：{{items.status}}
            </div>
        </div>

        <h1>{{form.title}}</h1>

        <div>
            <span>{{ form.type==='lost'?'寻物':'招领' }}</span>
            <span>浏览{{ form.viewCount }}</span>
        </div>

        <div>
            <p>类别：{{ form.category||'-' }}</p>
            
        </div>

        <div>
            {{ form.type==='lost'?'丢失时间':'拾取时间' }}:
            {{ formatTime(form.time) }}
        </div>

         <div>
            {{ form.type==='lost'?'丢失地点':'拾取地点' }}:
            {{ form.location||'-' }}
        </div>

        <div>
            <p>描述：</p>
            <p>{{ form.description || '暂无描述' }}</p>
        </div>


        <div>
            <p>联系方式（{{ form.contactType }}）：</p>
            <p>{{ form.contactValue || '-' }}</p>
        </div>

        <div>
            <p>发布者：{{ item.publisher?.nickname}}</p>
        </div>
    </div>
</template>