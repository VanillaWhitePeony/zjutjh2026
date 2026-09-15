<script setup>
    import { ref } from 'vue';
    import { useRouter } from 'vue-router';
    import axios from 'axios';


    const form=ref({//表单
        type:'',/*这里原先计划的是选择lost还是found
        哎但我感觉这个能不能单独提出来（后面有时间可以优化一下）*/
        title:'',
        categoryId:'',
        description:'',
        location:'',
        lostTime:'',
        images:[],
        contactType:'',
        contactValue:''

    })

    const loading=ref(false);//提交的状态
    const uploading=ref(false);//image的状态
    const errorMassage=ref('');

    const router=useRouter();//router

    const MAX_IMAGE_COUNT=5;
    const MAX_IMAGE_SIZE=5*1024*1024//接口规定的5mb

    /*图片的上传*/
    async function uploadOneImage(file) {
        const fd = new FormData();
        fd.append('file',file)
        const {data}=await axios.post('/file/upload',fd)
        const url=data?.url||data?.data?.url||data?.data
        if(typeof url !=='string'||!url){
            throw new Error("上传接口没有返回图片URL");
            
        }
        return url;
    }
    
    
    async function handleFileChange(event) {
    const files = Array.from(event.target.files || [])
    event.target.value = '' // 允许重复选择同一个文件

    if (!files.length) return

    errorMessage.value = ''

    if (form.value.images.length + files.length > MAX_IMAGE_COUNT) {
    errorMessage.value = `最多上传 ${MAX_IMAGE_COUNT} 张图片`
    return
    }

    for (const file of files) {
        if (!file.type.startsWith('image/')) {
            errorMessage.value = '只能上传图片文件'
        return
        }

    if (file.size > MAX_IMAGE_SIZE) {
      errorMessage.value = `图片 ${file.name} 超过 5MB`
      return
    }
  }

  uploading.value = true

    try {
        for (const file of files) {
        const url = await uploadOneImage(file)
        form.value.images.push(url)
        }
    } catch (error) {
        errorMessage.value = getErrorMessage(error, '图片上传失败')
    } finally {
        uploading.value = false
    }
}

    function removeImage(index) {
        form.value.images.splice(index, 1)
    }

    /*其他信息的录入*/
    async function handleSubmit() {
        if(!form.value.type.trim()){
            errorMessage='你是捡到东西了呀？还是丢东西了呀？'
            alert('你是捡到东西了呀？还是丢东西了呀？')
            return
        }

        if(!form.value.title.trim()){
            alert('概括一下吧！')
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

         try {
    const payload = {
      type: form.value.type,
      title: form.value.title.trim(),
      categoryId: form.value.categoryId,
      description: form.value.description.trim(),
      location: form.value.location.trim(),

      // 如果后端要求 ISO 时间，可以改成：
      // lostTime: new Date(form.value.lostTime).toISOString()
      lostTime: form.value.lostTime,

      // 注意：images 是 URL 数组，不是文件
      images: form.value.images,

      contactType: form.value.contactType,
      contactValue: form.value.contactValue.trim()

      // 不要传 status: 'approved'
      // 发布后 status 应由后端设置为 pending
      // 如果后端明确要求你传 status: 'pending'，再按接口文档加
    }

    await axios.post('/items', payload)

    alert('提交成功，等待管理员审核通过后公开展示')
    router.push('/home') // 或者跳转到“我的发布”页面，例如 /my-items
  } catch (error) {
    if (error.response?.status === 401) {
      errorMessage.value = '请先登录'
      router.push('/login')
      return
    }

    if (error.response?.status === 403) {
      errorMessage.value = '没有发布权限，请确认已登录或联系管理员'
      return
    }

    errorMessage.value = getErrorMessage(error, '提交失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

</script>

<template>
    <div class="publishPage">
        <h2>发布失物信息</h2>

    <div>
        <label>帖子类型</label>
        <input v-model="form.type" placeholder="lost/found">
    </div>
<!--这里是我的设想，可以大家看完之后决定用不用-->
<!--
    <div>
        <label>帖子类型</label>
        <select v-model="form.type">
            <option value="">请选择</option>
            <option value="lost">寻物启事：我丢了东西</option>
            <option value="found">失物招领：我捡到了东西</option>
        </select>
    </div>
    -->
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
        <label>图片:最多5张</label>
        <input 
            type="file";
            accept="image/*";
            mutiple:disable="uploading||form.images.length >=MAX_IMAGE_COUNT"
            @change="handleFileChange"
        />

        <p v-if="uploading">图片上传中……请耐心等待哦</p>

        <div v-for="(url,index) in from.images" key="url">
            <img:src="url" alt="已上传图片",style="width: 80px; height: 80px; object-fit: cover; margin-right: 8px"
            />
            <button @click="removeImage">删除</button>
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

    <p v-if="errorMassage" class="error">{{ errorMassage }}</p>

    <botton @click="handleSubmit" :disable="loading">
        {{ loading?'发布中……':'点击发布' }}
    </botton>
    </div>
</template>

<style>
    @import url(PostMessage.css);
</style>