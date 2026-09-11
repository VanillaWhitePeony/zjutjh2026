// Vue 3 写法
import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home/home.vue'; // 注意路径

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {title:'龙娘都会打的九个字'}
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title
  }
  next()
})

export default router