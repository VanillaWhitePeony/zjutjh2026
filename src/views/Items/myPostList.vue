<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import request from '@/Request/request';
import PostDelete from '@/views/Items/PostDelete.vue';

const router = useRouter();


const posts = ref([]);
const loading = ref(false);
const errorMessage = ref('');
const currentUserId = ref('');
const isAdmin = ref(false);

const decoratedPosts = computed(() =>
  posts.value.map((p) => ({
    ...p,
    statusInfo: STATUS_MAP[p.status] || { text: p.status || '未知', color: '#999' },
  }))
);

async function fetchMyPosts() {
  loading.value = true;
  errorMessage.value = '';
  try {
    const userRes = await request.get('/api/user/current');
    currentUserId.value = userRes.data.id;
    isAdmin.value = !!userRes.data.isAdmin;

    const res = await request.get('/items/mine');
    const list = Array.isArray(res.data) ? res.data : (res.data.list || []);
    list.sort((a, b) => {
      const ta = new Date(a.createTime || 0).getTime();
      const tb = new Date(b.createTime || 0).getTime();
      return tb - ta; // 降序
    });

    posts.value = list;
  } catch (error) {
    const status = error.response?.status;
    if (status === 401) {
      alert('请先登录');
      router.push('/login');
      return;
    }
    errorMessage.value = '加载失败，请稍后重试';
  } finally {
    loading.value = false;
  }
}

function goDetail(post) {
  router.push(`/post/${post.id}`);
}

function goEdit(post) {
  router.push(`/publish?postId=${post.id}`);
}


async function refresh() {
  await fetchMyPosts();
}

onMounted(fetchMyPosts);
</script>

<template>
  <div class="myPostsPage">
    <h2>我发布的</h2>

    <!-- 加载中 -->
    <p v-if="loading">加载中…</p>

    <!-- 错误提示 -->
    <p v-else-if="errorMessage" class="error">{{ errorMessage }}</p>

    <!-- 空状态 -->
    <p v-else-if="posts.length === 0">你还没有发布过任何信息</p>

    <!-- 列表 -->
    <ul v-else class="post-list">
      <li v-for="post in decoratedPosts" :key="post.id" class="post-item">
        <div class="post-main">
          <img
            v-if="post.images && post.images.length"
            :src="post.images[0]"
            alt="缩略图"
            class="thumb"
          >

          <!-- 文字信息 -->
          <div class="post-info">
            <!-- 标题 + 状态标签 -->
            <div class="title-row">
              <span class="title">{{ post.title }}</span>
              <span
                class="status"
                :style="{ background: post.statusInfo.color }"
              >
                {{ post.statusInfo.text }}
              </span>
            </div>

            <!-- 类型 / 分类 / 地点 -->
            <div class="meta">
              <span>{{ post.type === 'lost' ? '寻物启事' : '失物招领' }}</span>
              <span v-if="post.category">分类：{{ post.category }}</span>
              <span v-if="post.location">地点：{{ post.location }}</span>
            </div>

            <!-- 发布时间 -->
            <div class="time">
              发布于 {{ post.createTime }}
            </div>
          </div>
        </div>

        <div class="post-actions">
          <!-- 查看详情 -->
          <button type="button" @click="goDetail(post)">查看</button>

          <!-- 编辑 -->
          <button type="button" @click="goEdit(post)">编辑</button>

          <PostDelete
            :post-id="post.id"
            :owner-id="post.ownerId || currentUserId"
            :current-user-id="currentUserId"
            :is-admin="isAdmin"
          />
        </div>
      </li>
    </ul>
  </div>
</template>