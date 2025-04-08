import { createRouter, createWebHistory } from 'vue-router';
import Home from "@/views/Home.vue";
import Register from "@/views/Register.vue";
import Login from "@/views/Login.vue";
import Profile from "@/views/Profile.vue";
import Discussion from "@/views/Discussion.vue";
import DiscussionList from "@/components/DiscussionList.vue";
import NewDiscussionForm from "@/components/NewDiscussionForm.vue";


const routes = [
  {path:"/",name:"Home",component:Home},
  {path:"/register",name:"Register",component:Register},
  {path:"/login",name:"Login",component:Login},
  {path:"/profil",name:"Profile",component:Profile,meta: { requiresAuth: true }},
  {path:"/discussion",name:"Discussion",component:Discussion,meta: { requiresAuth: true }},
  {path:"/discussion/:categorie",name:"DiscuissionList",component:DiscussionList,props:["categorie"],meta: { requiresAuth: true }},
  {path:"/create-discussion",name:"NewDiscussionForm",component:NewDiscussionForm,meta: { requiresAuth: true }},




];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
