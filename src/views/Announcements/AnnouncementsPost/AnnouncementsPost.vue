<script setup>
import { url } from '@/config.js';
import { useUserStore } from '@/store/user';
import axios from 'axios';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const userStore = useUserStore();

const title = ref('');
const content = ref('');
const isTop = ref(false);
const publishAt = ref('');//为空表示立即发布

const submitting = ref(false);

async function submit(){
    if(!title.value.trim()){
        alert('路易十六摸不着头脑');
        return;
    }
    
    if(!content.value.trim()){
        alert('内容好空，像你对我的爱');
        return;
    }

    const data = {
        title: title.value.trim(),
        content: content.value.trim(),
        isTop: isTop.value
    };

    //datetime-local 给的是本地时间字符串，转成带时区的 ISO 再发给后端
    if(publishAt.value){
        const d = new Date(publishAt.value);//转为Date型
        if(Number.isNaN(d.getTime())){//判断这个日期是不是“非法日期”
            alert('鼠鼠嘲笑了你的时间观念');
            return;
        }
        data.publishAt = d.toISOString();//转成 ISO 标准时间字符串
    }

    submitting.value = true;
    try{
        const response = await axios.post(`${url}/announcements`, data);
        if(response.data.code === 200){
            alert('鼠鼠笑话被发上去了，你被写在了鼠族圣经上');
            router.push('/announcements');
        }
        else{
            alert(response.data.msg);
        }
    }
    catch(err){
        console.error('发布异常:', err);
        alert('鼠鼠拦截了你的笑话发送');
    }
    finally{
        submitting.value = false;
    }
}

function goBack(){
    router.push('/announcements');
}
</script>

<template>
    <div v-if="!(userStore.user.role === 'admin')" class="error">
        <span>不是管理员喵，你是凑企鹅</span>
    </div>
    <div v-else class="announcement_post_container">
        <nav class="navbar">
            <button @click="goBack" class="btn">返回公告栏</button>
        </nav>

        <h1>写小作文</h1>

        <div class="form_box">
            <div class="form_item">
                <label>标题</label>
                <input
                    v-model="title"
                    type="text"
                    class="input_text"
                    placeholder="请输入鼠鼠笑话标题"
                />
            </div>

            <div class="form_item">
                <label>内容</label>
                <textarea
                    v-model="content"
                    class="input_textarea"
                    placeholder="请输入鼠鼠笑话内容"
                ></textarea>
            </div>

            <div class="form_item">
                <label class="checkbox_label">
                    <input v-model="isTop" type="checkbox" />
                    占领高地（置顶）
                </label>
            </div>

            <div class="form_item">
                <label>发布时间（留空表示立即发布）</label>
                <input
                    v-model="publishAt"
                    type="datetime-local"
                    class="input_text"
                />
            </div>

            <div class="form_actions">
                <button
                    @click="submit"
                    :disabled="submitting"
                    class="btn"
                >
                    {{ submitting ? '发布中...' : '发布' }}
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
    @import 'AnnouncementsPost.css';
</style>