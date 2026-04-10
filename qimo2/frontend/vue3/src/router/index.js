// 使用CDN版本的Vue Router
const { createRouter, createWebHistory } = VueRouter

import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/books',
      name: 'books',
      component: () => import('../views/BooksView.vue')
    },
    {
      path: '/book/:id',
      name: 'book-detail',
      component: { template: '<div>图书详情</div>' }
    },
    {
      path: '/news',
      name: 'news',
      component: { template: '<div>图书资讯</div>' }
    },
    {
      path: '/news/:id',
      name: 'news-detail',
      component: { template: '<div>资讯详情</div>' }
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: { template: '<div>通知公告</div>' }
    },
    {
      path: '/notification/:id',
      name: 'notification-detail',
      component: { template: '<div>通知详情</div>' }
    },
    {
      path: '/login',
      name: 'login',
      component: { template: '<div>登录</div>' }
    },
    {
      path: '/register',
      name: 'register',
      component: { template: '<div>注册</div>' }
    },
    {
      path: '/personal',
      name: 'personal',
      component: { template: '<div>个人中心</div>' }
    },
    {
      path: '/admin',
      name: 'admin',
      component: { template: '<div>管理员后台</div>' }
    }
  ]
})

export default router
