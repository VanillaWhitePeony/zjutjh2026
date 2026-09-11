import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        token: localStorage.getItem('token') || null,
        refreshToken: localStorage.getItem('refreshToken') || null,
        expiresIn: Number(localStorage.getItem('expiresIn')) || 0,
        username: localStorage.getItem('username') || null,
        user: JSON.parse(localStorage.getItem('user') || 'null')
    }),
    getters: {
        isLoggedIn: (state) => !!state.token
    },
    actions: {
        login(data) {
            this.token = data.accessToken
            this.refreshToken = data.refreshToken
            this.expiresIn = data.expiresIn
            this.username = data.userInfo.username
            this.user = data.userInfo

            localStorage.setItem('token', data.accessToken)
            localStorage.setItem('refreshToken', data.refreshToken)
            localStorage.setItem('expiresIn', data.expiresIn)
            localStorage.setItem('username', data.userInfo.username)
            localStorage.setItem('user', JSON.stringify(data.userInfo))
        },
        logout() {
            this.token = null
            this.refreshToken = null
            this.expiresIn = 0
            this.username = null
            this.user = null

            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('expiresIn')
            localStorage.removeItem('username')
            localStorage.removeItem('user')
        }
    }
})