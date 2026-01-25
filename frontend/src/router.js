import {createRouter, createWebHistory} from "vue-router";
import LoginView from "./views/auth/LoginView.vue";
import RegisterView from "./views/auth/RegisterView.vue";
import TopicListView from "./views/topics/general/TopicListView.vue";
import TopicDetailsView from "./views/topics/details/TopicDetailsView.vue";

const routes = [
    {path: "/login", component: LoginView},
    {path: "/register", component: RegisterView},
    {path: "/", component: TopicListView},
    {path: "/topic/:id", component: TopicDetailsView},
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
