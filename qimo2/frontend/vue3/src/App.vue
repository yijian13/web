<template>
  <div class="app">
    <!-- 导航栏 -->
    <nav class="navbar navbar-expand-lg navbar-dark" style="background-color: var(--primary-color); box-shadow: 0 2px 8px rgba(0,0,0,0.1); padding: 0.8rem 0;">
      <div class="container">
        <router-link to="/" class="navbar-brand" style="font-size: 1.5rem; font-weight: 700; color: white; transition: var(--transition);">
          图书借阅管理系统
        </router-link>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <router-link to="/" class="nav-link" :class="{ active: $route.path === '/' }">首页</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/books" class="nav-link" :class="{ active: $route.path === '/books' }">图书信息</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/news" class="nav-link" :class="{ active: $route.path === '/news' }">图书资讯</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/notifications" class="nav-link" :class="{ active: $route.path === '/notifications' }">通知公告</router-link>
            </li>
          </ul>
          <ul class="navbar-nav">
            <li class="nav-item" v-if="!isLoggedIn">
              <router-link to="/login" class="nav-link">登录</router-link>
            </li>
            <li class="nav-item" v-if="!isLoggedIn">
              <router-link to="/register" class="nav-link">注册</router-link>
            </li>
            <li class="nav-item dropdown" v-else>
              <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown">
                {{ userName }}
              </a>
              <ul class="dropdown-menu dropdown-menu-end">
                <li><router-link to="/personal" class="dropdown-item">个人中心</router-link></li>
                <li><router-link to="/admin" class="dropdown-item" v-if="isAdmin">管理员后台</router-link></li>
                <li><a href="#" class="dropdown-item" @click="logout">退出登录</a></li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- 路由视图 -->
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>

    <!-- 页脚 -->
    <footer class="footer" style="background-color: var(--dark-color); color: white; padding: 40px 0 20px; margin-top: 60px;">
      <div class="container">
        <div class="row">
          <div class="col-md-4">
            <h4 style="font-weight: 600; margin-bottom: 1.5rem; color: var(--accent-color);">关于我们</h4>
            <p style="color: rgba(255,255,255,0.8); margin-bottom: 0.5rem;">我们是一个致力于为读者提供优质图书资源的图书馆。</p>
          </div>
          <div class="col-md-4">
            <h4 style="font-weight: 600; margin-bottom: 1.5rem; color: var(--accent-color);">联系方式</h4>
            <p style="color: rgba(255,255,255,0.8); margin-bottom: 0.5rem;">电话：12345678900</p>
            <p style="color: rgba(255,255,255,0.8); margin-bottom: 0.5rem;">邮箱：contact@library.com</p>
          </div>
          <div class="col-md-4">
            <h4 style="font-weight: 600; margin-bottom: 1.5rem; color: var(--accent-color);">快速链接</h4>
            <ul class="list-unstyled">
              <li><router-link to="/" style="color: rgba(255,255,255,0.8); transition: var(--transition); text-decoration: none;">首页</router-link></li>
              <li><router-link to="/books" style="color: rgba(255,255,255,0.8); transition: var(--transition); text-decoration: none;">图书信息</router-link></li>
              <li><router-link to="/news" style="color: rgba(255,255,255,0.8); transition: var(--transition); text-decoration: none;">图书资讯</router-link></li>
              <li><router-link to="/notifications" style="color: rgba(255,255,255,0.8); transition: var(--transition); text-decoration: none;">通知公告</router-link></li>
            </ul>
          </div>
        </div>
        <div class="text-center mt-4">
          <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.6);">&copy; 2026 图书借阅管理系统. 保留所有权利.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref(null)

const isLoggedIn = computed(() => {
  return !!user.value
})

const userName = computed(() => {
  return user.value ? (user.value.name || user.value.username) : ''
})

const isAdmin = computed(() => {
  return user.value && user.value.role === 'admin'
})

const checkLogin = () => {
  const token = localStorage.getItem('token')
  const userStr = localStorage.getItem('user')
  if (token && userStr) {
    user.value = JSON.parse(userStr)
  }
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  user.value = null
  router.push('/')
}

onMounted(() => {
  checkLogin()
})
</script>

<style>
:root {
  --primary-color: #3a5a78;
  --secondary-color: #5a89c6;
  --accent-color: #f39c12;
  --light-color: #f8f9fa;
  --dark-color: #2c3e50;
  --text-color: #333;
  --text-light: #666;
  --border-radius: 8px;
  --box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  --transition: all 0.3s ease;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: var(--text-color);
  background-color: var(--light-color);
}

.nav-link {
  color: rgba(255,255,255,0.9) !important;
  font-weight: 500;
  position: relative;
  margin: 0 0.5rem;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 2px;
  background-color: var(--accent-color);
  transition: var(--transition);
}

.nav-link:hover::after {
  width: 100%;
}

.nav-link.active {
  color: white !important;
  font-weight: 600;
}

.nav-link.active::after {
  width: 100%;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
