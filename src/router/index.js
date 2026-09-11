// Vue 3 写法
import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home/home.vue'; // 注意路径
import Login from '../views/Login/login.vue';
import Register from '../views/Register/register.vue';
import ChangePassword from '../views/ChangePassword/ChangePassword.vue';
import Account from '../views/Account/account.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {title:'龙娘都会打的九个字'}
  },

  {
    path:'/login',
    name:'Login',
    component: Login,
    meta: {title:'大手子请登录'}
  },
  {
    path:'/register',   
    name: 'Register',
    component: Register,
    meta: {title:'希望工程注册'}
  },
  {
    path:'/changePassowrd',   
    name: 'ChangePassword',
    component: ChangePassword,
    meta: {title:'花来！'}
  },
  {
    path:'/account',   
    name: 'Account',
    component: Account,
    meta: {title:'喜欢你就是喜欢你，我的心dokidoki'}
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