// src/utils/refreshToken.js
import axios from 'axios'
import { url } from '@/config'
import { useUserStore } from '@/store/user'

let refreshflag = false
let queue = []


function doRefresh() {
    const userStore = useUserStore()
    if (!userStore.refreshToken) {
        return Promise.reject('无 refreshToken')
    }
    return axios.post(`${url}/auth/refresh`, { refreshToken: userStore.refreshToken })

        .then(function (res) {
            const body = res.data
            if (body.code !== 200) {
                throw new Error(body.msg)
            }
            userStore.login({
                accessToken: body.data.accessToken,
                refreshToken: body.data.refreshToken,
                expiresIn: body.data.expiresIn,
                userInfo: userStore.user || { username: userStore.username }
            })
            return body.data.accessToken
        })
}

function onResponse(response) {
    return response
}

async function onError(error) {
    const response = error.response
    const config = error.config

    if (!response || response.status !== 401 || !config || config._retry) {
        return Promise.reject(error)
    }
    if (config.url && config.url.indexOf('/auth/refresh') !== -1) {
        return Promise.reject(error)
    }
    config._retry = true

    let token
    if (refreshflag) {
        token = await new Promise(function (resolve, reject) {
            queue.push({ resolve: resolve, reject: reject })
        })
    } else {
        refreshflag = true
        try {
            token = await doRefresh()
            for (let i = 0; i < queue.length; i++) {
                queue[i].resolve(token)
            }
        } catch (e) {
            for (let i = 0; i < queue.length; i++) {
                queue[i].reject(e)
            }
            useUserStore().logout()
            return Promise.reject(e)
        } finally {
            refreshflag = false
            queue = []
        }
    }

    if (!config.headers) {
        config.headers = {}
    }
    config.headers.Authorization = 'Bearer ' + token
    return axios(config)
}

axios.interceptors.response.use(onResponse, onError)

//这个纯ai的，我也没招了，我还没看明白，老大抱歉捏
//白牡丹的败北