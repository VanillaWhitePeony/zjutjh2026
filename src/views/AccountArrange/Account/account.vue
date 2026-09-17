<script setup>
import { useUserStore } from '@/store/user';
import { useRouter } from 'vue-router';

const router = useRouter()
const userStore = useUserStore()

const roleMap = {
    student: '学生',
    teacher: '教师',
    admin: '管理员'
}

function goChangePassword() {
    router.push({ name: 'ChangePassword' })
}
function goHome() {
    router.push({ name: 'Home' })
}
function maskPhone(phone) {
    return phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')
    /*
    ^=开头，$=结尾，
    \d=数字，
    {3}=连续3个，
    {4}=连续4个，
    (\d{3})=捕获前3位数字用$1引用，
    \d{4}=匹配中间4位数字，
    (\d{4})=捕获后4位数字用$2引用。
    */
}
</script>

<template>
    <div class="account">
        <header class="navbar">
            <div class="nav_inner">
                <div class="logo">
                    <span class="logo_text">"失物"招领平台の人材市场の人才</span>
                </div>
                <div class="nav_actions">
                    <button class="btn_back" @click="goHome">回家の诱惑</button>
                </div>
            </div>
        </header>

        <main class="main_content">
            <div class="account_card">
                <h2 class="card_title">账户详情</h2>

                <!-- 头部：头像 + 昵称 + 角色 -->
                <div class="profile">
                    <img class="user_photo" :src="userStore.user.avatar" alt="user_photo" />
                    <br>
                    <span class="modifier">神圣的</span>
                    <br>
                    <br>
                    <span class="pretext">旅行者 开拓者 漂泊者 外乡人 链慰者 引航者 孤勇者 幸存者 生还者 捍卫者 孙行者 村里人 方块人 泰拉人 船上人 洛克人 细胞人 月记人 复制人 灰烬人 老年人 收藏家 资本家 死诞者 分析员 特遣队员 干员 指挥官 柚子厨 应声虫 太刀侠 万穗爷 摸你穷 李三光 垃圾佬 打牌佬 空军佬 小骑士 农场主 庄园主 游戏王 大手子 老色批 p5 五批 妮批 雷批 绳匠 导演 司辰 铁驭 御主 博士 舰长 局长 车长 旅者 冥王 国王 首领 首席 地主 Power 奥日 sensei 达瓦 打劫 侦探 阿斯特塔 光之逆子 传奇旁白 深渊行者 狂战刺客 无敌战神 十年老兵 甲级战犯 植物学家 魔法学院 D级人员 驯龙大师 生存大师 溜鬼大师 下棋大师 音游大师 星战大师 战术大师 扫雷大师 乱斗大师 rushb大师 速建大师 西部牛仔 星际玩家 仓鼠玩家 奥奇玩家 元气玩家 苇名修罗 星际海盗 三人一狗 蒸蒸日上 甲级战犯 第四天灾 凛冬暴君 极限60秒 夜之城传奇 秋名山车神 深水倒钩狼 塞尔达玩家 艾尔登之王 安东星超人 800万勇士 宝可梦大师 和平爱好者 昆特牌爱好者 Uno牌爱好者 ut党 幻想乡人 车万人  训练员 胶佬 潮哥 外星人 铁锈党 红警佬 特摄厨 ⑨ 术曲人 战地佬 萨尼铁塔 逆转批 音游入 部落首领 大荒旅者 毁灭战士 西部牛仔 go学长 瓦学弟 未转变者 特遣队员 土豆兄弟 地底人 泰拉人  意大利水管工  工程师 肯塔基超人 颠佬 萤火虫:</span>
                    <p class="nickname">
                        {{ userStore.user.nickname }}，您好
                    </p>
                    <span class="role_tag">
                        {{ roleMap[userStore.user.role] }}
                    </span>
                </div>

                <!-- 详细信息 -->
                <ul class="info_list">
                    <li>
                        <span class="label">用户名:</span>
                        <span class="value">{{ userStore.user.username }}</span>
                    </li>
                    <li>
                        <span class="label">学号:</span>
                        <span class="value">{{ userStore.user.studentNo }}</span>
                    </li>
                    <li>
                        <span class="label">手机号:</span>
                        <span class="value">{{ maskPhone(userStore.user.phone) }}</span>
                    </li>
                    <li>
                        <span class="label">邮箱:</span>
                        <span class="value">{{ userStore.user.email }}</span>
                    </li>
                    <li>
                        <span class="label">注册时间:</span>
                        <span class="value">{{userStore.user.createTime}}</span>
                    </li>
                </ul>

                <!-- 操作区 -->
                <div class="actions">
                    <button class="btn_change" @click="goChangePassword">修改密码</button>
                </div>
            </div>
        </main>
    </div>
</template>

<style scoped>
@import "account.css";
</style>