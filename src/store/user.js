import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        token: localStorage.getItem('token') || null,
        username: localStorage.getItem('username') ,
        user: JSON.parse(localStorage.getItem('user') || 'null')
    }),
    getters: {
        isLoggedIn: (state) => !!state.token
    },
    actions: {
        // 登录时接收完整的用户对象
        login(token, username, user) {
            this.token = token
            this.username = username
            this.user = user
            // 三个都持久化
            localStorage.setItem('token', token)
            localStorage.setItem('username', username)
            localStorage.setItem('user', JSON.stringify(user))
        },
        logout() {
            this.token = null
            this.username = ''
            this.user = null
            // 三个都清掉
            localStorage.removeItem('token')
            localStorage.removeItem('username')
            localStorage.removeItem('user')
        }
    }
})