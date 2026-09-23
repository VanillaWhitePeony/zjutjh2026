<script setup>
import { url } from '@/config.js';
import { useUserStore } from '@/store/user';
import axios from 'axios';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

const user = ref(null);
const loading = ref(false);

const props = defineProps({
    id: { type: String, required: true }
});

const roleMap = {
    student: '学生',
    teacher: '教师',
    sys_admin: '系统管理员'
};

async function getUserDetail() {
    loading.value = true;
    try {
        const response = await axios.get(`${url}/admin/users/${props.id}`);
        if (response.data.code === 200) {
            user.value = response.data.data;
        } else {
            alert(response.data.msg);
        }
    } finally {
        loading.value = false;
    }
}

function goBack() {
    router.push('/userDetailList');
}

// 删除功能如下：

// 是否是当前登录用户本人
const canDelete = computed(function(){
    const myId = userStore.userId;
    return String(myId) === String(props.id);
});

async function deleteUser() {
    if (!confirm(`确定要删除用户「${user.value.username}」吗？\n删除后该用户将无法登录。`)) {
        return;
    }

    try {
        const response = await axios.delete(`${url}/admin/users/${props.id}`);
        if (response.data.code === 200) {
            alert('一位鼠鼠离开了这个平台');
            router.push('/userDetailList');
        } else {
            alert(response.data.msg+'：删除失败');
        }
    } catch (err) {
        console.error('删除用户异常:', err);
        alert('删除失败，请稍后重试');
    }
}

// 重置密码
/*
async function resetPassword() {
    if (!confirm(`确定要重置用户「${user.value?.username}」的密码吗？\n新密码将通过脑电波让ta知道。`)) {
        return;
    }

    try {
        const response = await axios.post(
            `${url}/admin/users/${props.id}/reset-password`
        );

        const res = response.data;

        if (res.code === 200) {
            const channel = res.data.notifyChannel;
            if (channel === 'sms') {
                alert('密码已重置，新密码已通过短信发送给该用户。');
            } else if (channel === 'email') {
                alert('密码已重置，新密码已通过邮件发送给该用户。');
            } else {
                alert('密码已重置，新密码该用户应该知道了。');
            }
        } else {
            alert(res.msg + '：重置密码失败了，竟然不许');
        }
    } catch (err) {
        console.error('重置密码异常:', err);
        alert('重置密码失败，坏坏');
    }
}
*/

onMounted(getUserDetail);
</script>

<template>
    <!--
    <div style="padding: 40px; font-size: 24px; color: red;">
        白牡丹我喜欢你
    </div>
    -->
    <div class="userdetail_container">
        <button @click="goBack" class="btn">回家看看</button>

        <div v-if="loading" class="loading">努力加载中...</div>

        <div v-else-if="user" class="detail_card">
            <div class="header">
                <img
                    v-if="user.avatar"
                    :src="user.avatar"
                    class="avatar"
                    alt="avatar"
                />
                <span v-else class="avatar_text">这个家伙很懒，没有头像</span>

                <div class="header_info">
                    <h2>{{user.username}}</h2>
                    <span class="role_tag">
                        {{ roleMap[user.role] }}
                    </span>
                </div>
            </div>

            <ul class="info_list">
                <li>
                    <span class="label">用户 ID：</span>
                    <span class="value">{{ user.userId }}</span>
                </li>
                <li>
                    <span class="label">用户名：</span>
                    <span class="value">{{ user.username }}</span>
                </li>
                <li>
                    <span class="label">昵称：</span>
                    <span class="value">{{ user.nickname }}</span>
                </li>
                <li>
                    <span class="label">学号：</span>
                    <span class="value">{{ user.studentNo }}</span>
                </li>
                <li>
                    <span class="label">手机号：</span>
                    <span class="value">{{ user.phone }}</span>
                </li>
                <li>
                    <span class="label">邮箱：</span>
                    <span class="value">{{ user.email }}</span>
                </li>
                <li>
                    <span class="label">身份：</span>
                    <span class="value">{{ roleMap[user.role] }}</span>
                </li>
                <li>
                    <span class="label">注册时间：</span>
                    <span class="value">{{ user.createTime }}</span>
                </li>
                <li>
                    <span class="label">发布帖子数：</span>
                    <span class="value">{{ user.itemCount }}</span>
                </li>
                <li>
                    <span class="label">找到了多少个丢的东西：</span>
                    <span class="value">{{ user.claimCount }}</span>
                </li>
            </ul>
            <!--
            <div class="reset">
                <button
                    @click="resetPassword"
                    class="btn_reset"
                >
                    重置密码
                </button>
            </div>
            -->
            <div class="delete">
                <button
                    v-if="canDelete"
                    @click="deleteUser"
                    class="btn_delete"
                >
                    让他重新注册
                </button>
                <span v-else class="self_tip">
                    三军听令，自刎归天————竟然不许
                </span>
            </div>
        </div>

        <div v-else class="empty">这个家伙很懒，以至于他根本不存在</div>
    </div>
    
    
</template>

<style scoped>
    @import 'UserDetail.css';
</style>