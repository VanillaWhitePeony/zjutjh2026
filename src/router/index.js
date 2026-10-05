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
import PostEdit from '../views/Items/PostEdit.vue';
import userDetail from '../views/AdminPrivilege/UserDetail/UserDetail.vue'
import stats from '../views/AdminPrivilege/stats/stats.vue'
import auditItem from '../views/AdminPrivilege/Audit/AuditItem/AuditItem.vue'
import auditClaim from '../views/AdminPrivilege/Audit/AuditClaim/AuditClaim.vue'
import claimPost from '../views/Claim/ClaimPost.vue'
import myClaimList from '../views/Claim/MyClaimList.vue'
import claimDetails from '../views/Claim/ClaimDetails.vue'
import claimCheck from '../views/Claim/ClaimCheck.vue'
import category from '../views/Category/Category.vue'
import announcements from '../views/Announcements/Announcements/announcements.vue'
import AnnouncementsDetail from '../views/Announcements/AnnouncementsDetail/AnnouncementsDetail.vue'
import AnnouncementsPost from '../views/Announcements/AnnouncementsPost/AnnouncementsPost.vue'
import AnnouncementsEdit from '../views/Announcements/AnnouncementsEdit/AnnouncementsEdit.vue'

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
    path:'/postEdit/:id',
    name:'PostEdit',
    component:PostEdit,
    meta:{title:'编辑物品信息',
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
  {
    path:'/auditItem',
    name:'auditItem',
    component:auditItem,
    meta:{title:'神鹤！'}
  },
  {
    path:'/auditClaim',
    name:'auditClaim',
    component:auditClaim,
    meta:{title:'我的认领已经饥渴难耐了'}
  },
  {
    path:'/claimPost/:itemId?',
    name:'claimPost',
    component:claimPost,
    meta:{title:'申请认领', requiresAuth:true}
  },
  {
    path:'/myClaimList',
    name:'myClaimList',
    component:myClaimList,
    meta:{title:'我的认领申请', requiresAuth:true}
  },
  {
    path:'/claimDetails',
    name:'claimDetails',
    component:claimDetails,
    meta:{title:'认领详情', requiresAuth:true}
  },
  {
    path:'/claimCheck',
    name:'claimCheck',
    component:claimCheck,
    meta:{title:'收到的认领申请', requiresAuth:true}
  },
  {
    path:'/category',
    name:'category',
    component:category,
    meta:{title:'物品分类'}
  },
  {
    path: '/announcements',
    name: 'announcements',
    component: announcements,
    meta: {title:'老大老大，你真的会认真看嘛'}
  },
  {
    path:'/announcements/:id',   
    name: 'AnnouncementsDetail',
    component: AnnouncementsDetail,
    props: true ,
    meta: {title:'老大我相思了'}
  },
  {
    path:'/announcements/post',   
    name: 'AnnouncementsPost',
    component: AnnouncementsPost,
    meta: {title:'创作鼠鼠笑话'}
  },
  {
    path:'/announcements/:id/edit',
    name: 'AnnouncementsEdit',
    component: AnnouncementsEdit,
    props: true,
    meta: {title:'鼠鼠笑话不好笑，写米莉拉野史'}
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

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({
      path:'/login',
      query:{redirect:to.fullPath}
    })
    return
  }
  next()
})



export default router