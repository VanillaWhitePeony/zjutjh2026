// Vue 3 写法
import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../store/user';
import Account from '../views/AccountArrange/Account/account.vue';
import ChangePassword from '../views/AccountArrange/ChangePassword/ChangePassword.vue';
import Login from '../views/AccountArrange/Login/login.vue';
import Register from '../views/AccountArrange/Register/register.vue';
import userDetailList from '../views/AdminPrivilege/UserDetailList/UserDetailList.vue';
import Home from '../views/Home/home.vue'; // 注意路径
import PostMessage from '../views/Items/PostMessage.vue';
import userDetail from '../views/AdminPrivilege/UserDetail/UserDetail.vue'
import stats from '../views/AdminPrivilege/stats/stats.vue'

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
  },
  {
    path:'/userDetailList',
    name:'userDetailList',
    component:userDetailList,
    meta:{title:'让我看看你的账号正不正常'}
  },
  {
    path:'/userDetailList/:id',   
    name: 'userDetail',
    component: userDetail,
    props: true ,
    meta: {title:'捅死我喵'}
  },
  {
    path:'/stats',
    name:'stats',
    component:stats,
    meta:{title:'神秘统计数据'}
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