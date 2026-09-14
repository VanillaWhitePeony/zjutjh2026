<script setup>
    import { ref } from 'vue';
    import { useRouter } from 'vue-router';
    import axios from 'axios';
import { title } from 'process';

    const form=ref({//表单
        type:'',/*这里原先计划的是选择lost还是found
        哎但我感觉这个能不能单独提出来（后面有时间可以优化一下）*/
        title:'',
        categoryId:'',
        description:'',
        location:'',
        lostTime:'',
        images:'',
        contactType:'',
        contactValue:''

    })

    const loading=ref(false);//提交的状态
    const errorMassage=ref('');

    const router=useRouter();//router

    async function handleSubmit() {
        if(!form.value.type.trim()){
            errorMassage='你是捡到东西了呀？还是丢东西了呀？'
            return
        }

        if(!form.value.title.trim()){
            errorMassage='概括一下吧！'
            return
        }

        if(!form.value.categoryId.trim()){
            errorMassage='分类编号是什么呀？'
            return
            //嗯……其实这个categoryId具体啥意思我也不太清楚！
        }
    
        if(!form.value.location.trim()){
            errorMassage='在哪里捡到/遗失的呢？'
            return
        }

        if(!form.value.lostTime.trim()){
            errorMassage='什么时候拾取/遗失的呢？'
            return
        }

        if(!form.value.contactType.trim()){
            errorMassage='请给出联系方式哦';
            return
        }

        if(!form.value.contactValue.trim()){
            errorMassage='请输入具体联系方式哦'
            return
        }

        loading.value=true;
        errorMassage.value='';

        try{
            await axios.post('/items',form.value)//路径
            alert('发布成功啦！')
            router.push('/home')
         }catch(error){
            errorMassage.value='啊哦……出了点小问题……'
         };
}
</script>

<template>
    <div class="publishPage">
        <h2>发布失物信息</h2>

    <div>
        <label>帖子类型</label>
        <input v-model="form.type" placeholder="lost/found">
    </div>

    <div>
        <label>标题 </label>
        <input v-model="form.title" placeholder="例如：丢失一把黑色雨伞">
    </div>

    <div>
        <label>分类编号</label>
        <input v-model="form.categoryId" placeholder="这里是不是要规定不同的分类标准啊">
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
        <input v-model="form.lostTime" placeholder="拾取/遗失时间">
    </div>

    <div>
        <label>图片</label>
        <input v-model="form.images" placeholder="在此上传图片">
        /*要改的我后面改…… */
    </div>

    <div>
        <label>联系方式类型</label>
        <input v-model="form.contactType" placeholder="例如:phone/wechat/qq/email">
    </div>

    <div>
        <label>联系方式</label>
        <input v-model="form.contactValue" placeholder="请留下具体联系方式">
    </div>

    <p v-if="errorMassage" class="error">{{ errorMassage }}</p>

    <botton @click="handleSubmit" :disable="loading">
        {{ loading?'发布中……':'点击发布' }}
    </botton>
    </div>
</template>

<style>
    @import url(PostMessage.css);
</style>