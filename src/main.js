// main.js (Vue 入口文件)
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'

// 导入页面组件
import AdminPage from './Admin.vue'
import LoginPage from './Login.vue'

// 创建路由配置
const routes = [
    {
        path: '/',
        redirect: '/admin' // 默认重定向到admin页面
    },
    {
        path: '/admin',
        name: 'Admin',
        component: AdminPage
    },
    {
        path: '/login',
        name: 'Login',
        component: LoginPage
    }
]

// 创建路由实例
const router = createRouter({
    history: createWebHistory(),
    routes
})

// 创建Vue应用并挂载路由
const app = createApp(App)
app.use(router)
app.mount('#app')
