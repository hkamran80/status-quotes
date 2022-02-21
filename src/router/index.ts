import { createWebHistory, createRouter, RouteRecordRaw } from "vue-router";
import Login from "../views/Login.vue";
import Quotes from "../views/Quotes.vue";
import Profile from "../views/Profile.vue";

const routes: RouteRecordRaw[] = [
    {
        path: "/login",
        name: "Login",
        component: Login,
    },
    {
        path: "/",
        name: "Quotes",
        component: Quotes,
    },
    {
        path: "/profile",
        name: "Profile",
        component: Profile,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
