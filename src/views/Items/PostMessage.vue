<script setup>
    import { computed, onMounted, ref } from 'vue';
    import { useRouter } from 'vue-router';
    import request from '@/Request/request';
    import { useUserStore } from '@/store/user';


    const props = defineProps({
        postId: {
            type: [String, Number],default:''
        }
    });
    const isEdit=computed(()=>!!props.postId);

    const pageLoading=ref(false);//页面加载状态
    const owerId=ref('');//物品所有者id
    const currentUserId=ref('');//当前登录用户id
    const isOwner=computed(()=>ownerId.value===currentUserId.value);//当前登录用户是否是物品所有者
    const form=ref({//表单
        type:'',/*这里原先计划的是选择lost还是found
        哎但我感觉这个能不能单独提出来（后面有时间可以优化一下）*/
        title:'',
        category:'',
        description:'',
        location:'',
        lostTime:'',
        images:[],//写成存放上传图片url的数组好了
        contactType:'',
        contactValue:''

    })

    const loading=ref(false);//提交的状态
    const uploading=ref(false);//image的上传状态
    const errorMessage=ref('');

    const router=useRouter();//router
    const userStore=useUserStore();

    const MAX_IMAGE_COUNT=5;
    const MAX_IMAGE_SIZE=5*1024*1024//接口规定的5mb

    onMounted(async()=>{
        // 已登录校验：未登录才跳登录，已登录直接进入发布页
        if(!userStore.isLoggedIn){
            router.push({ name:'Login', query:{ redirect:'/postMessage' } });
            return;
        }
        // 仅编辑场景需要回填物品信息（发布场景无需拉取用户信息）
        if(!isEdit.value) return;
        pageLoading.value=true;
        try{
            const postResponse=await request.get(`/api/items/${props.postId}`);
            const postData=postResponse.data;
            ownerId.value=postData.ownerId;
            if(!isOwner.value){
                alert('你没有权限编辑该物品信息');
                router.push('/home');
                return;
            }
            form.value={
                type:postData.type,
                title:postData.title,
                category:postData.category,
                description:postData.description,
                location:postData.location,
                lostTime:postData.lostTime,
                images:postData.images||[],
                contactType:postData.contactType,
                contactValue:postData.contactValue
            }
        }catch(error){
            alert('获取物品信息失败');
            router.push('/home');
        }finally{
            pageLoading.value=false;
        }
    })

    /*照片的处理 */
    async function handleFileChange(e) {
        const files=Array.from(e.target.files||[]);
        e.target.value='';
        if(!files.length) return;
        //最大张数
        if(form.value.images.length+files.length>MAX_IMAGE_COUNT){
            errorMessage.value='最多上传五张照片';
            alert('最多上传五张照片');
            return;
        }
        //每张5MB
        for(const file of files){
            if(file.size>MAX_IMAGE_SIZE){
                errorMessage.value='每张不能超过5MB';
                alert('每张不能超过5MB')
                return;
            }
        }

        uploading.value=true;
    }


    /*其他信息的录入*/
    async function handleSubmit() {
        if(isEdit.value&&isOwner.value){
            alert('你不是发布者，没有权限编辑该物品信息');
            return;
        }
        if(uploading.value){
            alert('稍等哦，图片上传中');
            return;
        }

        if(!form.value.type.trim()){
            errorMessage.value='你是捡到东西了呀？还是丢东西了呀？'
            alert('你是捡到东西了呀？还是丢东西了呀？')
            return
        }

        if(!form.value.title.trim()){
            alert('概括一下吧！')
            errorMessage.value='概括一下吧！'
            return
        }

        if(!form.value.categoryId.trim()){
            errorMessage.value='分类编号是什么呀？'
            alert('分类编号是什么呀？')
            return
            //嗯……其实这个categoryId具体啥意思我也不太清楚！
        }
    
        if(!form.value.location.trim()){
            errorMessage.value='在哪里捡到/遗失的呢？'
            alert('在哪里捡到/遗失的呢？')
            return
        }

        if(!form.value.lostTime.trim()){//添加时间校验（时间不能晚于当前时间）
            errorMassage='什么时候拾取/遗失的呢？'
            alert('什么时候拾取/遗失的呢？')
            return
        }
        if(new Date(form.value.lostTime).getTime()>Date.now()){
            errorMessage.value='拾取/遗失时间不能晚于当前时间';
            alert('拾取/遗失时间不能晚于当前时间');
            return;
        }

        if(!form.value.contactType.trim()){
            errorMessage.value='请给出联系方式哦';
            alert('请给出联系方式哦')
            return
        }

        if(!form.value.contactValue.trim()){
            errorMessage.value='请输入具体联系方式哦'
            alert('请输入具体联系方式哦')
            return
        }

        loading.value=true;
        errorMessage.value='';
        try{
            if(isEdit.value){
                await request.put(`/api/items/${props.postId}`,form.value);
                alert('编辑成功，等待管理员审核后公开展示哦');
                router.push('/home');
                return;
            }else{
                await request.post('/api/items',form.value);
                alert('提交成功，等待管理员审核后公开展示哦');
                router.push('/home');
            }
        }catch(error){
            if(error.response?.status===401){
                alert('请先登录');
                router.push('/login');
                return;
            }
            if(error.response?.status===403){
                alert('没有发布权限');
                return;
            }
            alert('啊哦……出了点小问题');
        }
    }
         function handleCancel() {
            router.push('/home');
        }

</script>

<template>
    <div class="publishPage">

        <!--把编辑已发布的信息功能合并到这个里面-->
        <h2>{{isEdit?'编辑失物信息':'发布失物信息'}}</h2>

    

    <div>
        <label>帖子类型</label>
        <select v-model="form.type">
            <option value="">请选择</option>
            <option value="lost">寻物启事：我丢了东西</option>
            <option value="found">失物招领：我捡到了东西</option>
        </select>
    </div>
    <div>
        <label>标题 </label>
        <input v-model="form.title" placeholder="例如：丢失一把黑色雨伞">
    </div>

    <div>
        <label>分类编号</label>
        <select v-model="form.category">
            <option value="">请选择分类</option>
            <option value="card">证件卡类</option>
            <option value="book">书籍文具</option>
            <option value="clothing">衣物饰品</option>
            <option value="digital">电子产品</option>
            <option value="wallet">钱包钥匙</option>
            <option value="other">其他</option>
        </select>
    </div>

    <div>
        <label>描述</label>
        <input v-model="form.description" placeholder="简要描述一下吧">
    </div>

    <div>
        <label>地址</label>
        <input v-model="form.location" placeholder="拾取/遗失地点">
    </div>

    <div>
        <label>时间</label>
        <input type="datetime-local" v-model="form.lostTime" placeholder="拾取/遗失时间">
    </div>

    <div>
    <label>图片：最多 5 张，每张不超过 5MB</label>
    <input
        type="file"
        accept="image/*"
        multiple
        :disabled="uploading || form.images.length >= 5"
        @change="handleFileChange"
    >

    <p v-if="uploading">图片上传中...</p>

    <div v-for="(url, index) in form.images" :key="url">
        <img
            :src="url"
            alt="已上传图片"
            style="width: 80px; height: 80px; object-fit: cover; margin-right: 8px"
        >
        <button type="button" @click="form.images.splice(index, 1)">删除</button>
    </div>
</div>

    <div>
        <label>联系方式类型</label>
        <select v-model="form.contactType">
            <option value="">请选择联系方式</option>
            <option value="phone">手机号</option>
            <option value="wechat">微信</option>
            <option value="qq">QQ</option>
            <option value="email">邮箱</option>
        </select>
    </div>

    <div>
        <label>联系方式</label>
        <input v-model="form.contactValue" placeholder="请留下具体联系方式">
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <button @click="handleSubmit" :disabled="loading">
        {{ loading?'发布中……':'点击发布' }}
    </button>

    <button v-if="isEdit" type="button " @click="handleCancel" :disabled="loading">
        {{取消}}
    </button>
    </div>
</template>

<style>
    @import url(PostMessage.css);
</style>