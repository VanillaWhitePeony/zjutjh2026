// Vue 3 写法
import { createRouter, createWebHistory } from 'vue-router';
import{useUserStore}from '../store/user';
import Home from '../views/Home/home.vue'; // 注意路径
import Login from '../views/Login/login.vue';
import Register from '../views/Register/register.vue';
import ChangePassword from '../views/ChangePassword/ChangePassword.vue';
import Account from '../views/Account/account.vue';
import PostMessage from '../views/Items/PostMessage.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {title:'失物招领首页'}
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

  {
    path:'/postMessage',
    name:'PostMessage',
    component:PostMessage,
    meta:{title:'拾取到什么装备啦？',
        requiresAuth:true
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title
  }

  const userStore=useUserStore()

  if (to.meta.requiresAuth&&!userStore.isLoggedIn) {
    next({
      path:'/login',
      query:{redirect:to.fullPath}
    })
    
  }
  next()
})



export default router