import {createRouter, createWebHistory} from 'vue-router'
import wordRoutes from "@/router/word";
import authRoutes from "@/router/auth";
import SettingRoutes from "@/router/setting";

const routes = [
    {
        path: '/',
        name: 'home',
        redirect: '/word',
    },
    {
        path: '/404',
        name: '404',
        redirect: '/word'
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/404'
    }
]

const router = createRouter({
    mode: 'hash',
    history: createWebHistory(),
    routes: [
        ...wordRoutes,
        ...authRoutes,
        ...SettingRoutes,
        ...routes,
    ]
})

export default router
