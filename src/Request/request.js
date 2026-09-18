import axios from 'axios'
import{useUserStore}from '@/store/user'

const request=axios.create({
    baseURL:'',
    timeout:10000
})

request.interceptors.request.use(
    (config)=>{
        const userStore=useUserStore()
        if (userStore.token) {
            config.header.Authorization=`Bearer ${userStore.token}`
        }
        return config
    },
    (error)=>{
        return Promise.reject(error)
    }
)

request.interceptors.response.use(
    (response)=>{
        return response
    },
    (error)=>{
        if (error.response?.status===401){
            const userStore=useUserStore()
            userStore.logout()
            window.location.href='/login'
        }
        return Promise.reject(error)
    }
)

export default request
//拦截什么的感觉还是搞得不是很清楚，这部分ai改了很多