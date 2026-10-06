<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import request from '@/Request/request';

const props = defineProps({
  postId: { type: [String, Number], required: true },
  ownerId: { type: [String, Number], default: '' },
  currentUserId: { type: [String, Number], default: '' },
  isAdmin: { type: Boolean, default: false },
  redirectHome: { type: Boolean, default: true },
  redirectTo: { type: String, default: '/home' },
});


const router = useRouter();
const showDeleteConfirm = ref(false);//确认弹窗
const deleted = ref(false);//是否删除成功

const canDelete = computed(() => {
  return props.isAdmin || props.currentUserId === props.ownerId;
});
if (!canDelete.value) {
    errorMessage.value = '你不可以哦！';
    showConfirm.value = false;
    return;
  }

  try {
    await request.delete(`/api/items/${props.postId}`);

    deleted.value = true;
    showConfirm.value = false;

    if (props.redirectHome) {
      router.push(props.redirectTo);
    }
  } catch (error) {
        errorMessage.value = '删除失败，请稍后重试';
  }finally{
    deleting.value=false;
  }
</script>

<template>
    <div v-if="canDelete">
        <button @click="showDeleteConfirm = true">删除帖子</button>
    </div>

  <div v-if="showDeleteConfirm" class="confirm">
    <p>你确定要删除吗？</p>
    <button @click="deletePost">确认删除</button>
    <button @click="showDeleteConfirm = false">取消</button>
  </div>
  <div v-else-if="deleted">
    <p>删除成功！</p>
  </div>
  <div v-else>
    <p>你无权这样做哦！</p>
  </div>
  </template>