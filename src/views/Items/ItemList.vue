<!--实现功能：筛选+分页+搜索-->
<script setup>
    import {ref,reactive,computed,watch,onMounted} from 'vue'
    import { useRouter } from 'vue-router';
    import {useUserStore} from '@/store/user'
    import { request } from '@/Request/request';

    const router=useRouter();
    const userStore=useUserStore();

    const adminRoles=['lf_admin','sys_admin']//管理员角色名单
    const isAdmin=computed(()=>adminRoles.includes(userStore.role))//????不太对，要改
    const normalVisableStatus=['approved','claimed','closed']//普通账号能见状态
    const adminVisableStatus=['pending','rejected']//管理员能见

    const typeOptions=[
        {label:'寻物启事',value:'LOST'},
        {label:'失物招领',value:'FOUND'}
    ]

    const 
</script>