import { createWebHistory, createRouter } from "vue-router";
import Login from "../views/Login.vue";
import Quotes from "../views/Quotes.vue";

const routes = [
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
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
