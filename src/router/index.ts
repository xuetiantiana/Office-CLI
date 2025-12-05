import { createRouter, RouteRecordRaw, createWebHashHistory } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: {
      keepAlive: true, //此页面需要缓存
      requiresFrontEndAuth: true
    },
  },
  { path: "/chat/:sessionId", component: () => import('../views/Chat.vue'), }

]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 前端添加密码，防止release流程未走完，外部人员访问
// router.beforeEach((to, from, next) => {
//   console.log(from)
//   if (!!to.meta && to.meta.requiresFrontEndAuth === false) {
//     //这里判断用户是否登录，验证本地存储是否有token
//     next();
//     return;
//   }
//   if (!sessionStorage.getItem("token")) { // 判断当前的token是否存在
//     next({
//       name: 'Login',
//       query: { redirect: to.fullPath }
//     })
//   } else {
//     next();
//   }
// })

// router.beforeEach((to, from, next) => {
//   const isAuthenticated = sessionStorage.getItem('token');
//   if (to.path === '/protected' && !isAuthenticated) {
//     next('/'); // 重定向到登录页面
//   } else {
//     next();
//   }
// });

export default router