<script setup>
    import { computed } from 'vue';
    import { useRouter,useRoute } from 'vue-router';
    import PostMessage from './PostMessage.vue';

    const route=useRoute();
    const postId=route.params.postId;
    const router=useRouter();

</script>

<template>
    <div class="PostEdit">
        <h2>编辑物品信息</h2>
        <PostMessage :postId="postId" />
    </div>
    </template>

<style>
    @import url(PostMessage.css);
</style>