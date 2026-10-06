<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

function goType(type) {
    router.push({ name: 'ItemList', query: { type } });
}
function goAll() {
    router.push({ name: 'ItemList' });
}
</script>

<template>
    <div class="categoryPage">
        <h1>物品分类</h1>
        <div class="category_grid">
            <button class="category_card" @click="goType('lost')">寻物启事</button>
            <button class="category_card" @click="goType('found')">失物招领</button>
            <button class="category_card" @click="goAll">全部物品</button>
        </div>
    </div>
</template>

<style scoped>
.categoryPage {
    max-width: 720px;
    margin: 0 auto;
    padding: 24px;
    min-height: 100vh;
    box-sizing: border-box;
}
.categoryPage h1 {
    margin: 0 0 20px;
    color: #333;
}
.category_grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.category_card {
    border: 1px solid #e6e9f2;
    border-radius: 8px;
    padding: 16px;
    font-size: 16px;
    font-family: inherit;
    background: #fff;
    color: #333;
    cursor: pointer;
    transition: 0.2s ease;
}
.category_card:hover {
    border-color: #1677ff;
    color: #1677ff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}
</style>