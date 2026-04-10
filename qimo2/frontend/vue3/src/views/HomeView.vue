<template>
  <div class="home">
    <!-- 轮播图 -->
    <div id="carouselExampleIndicators" class="carousel slide" data-bs-ride="carousel">
      <div class="carousel-indicators">
        <button 
          v-for="(carousel, index) in carousels" 
          :key="index"
          type="button" 
          data-bs-target="#carouselExampleIndicators" 
          :data-bs-slide-to="index"
          :class="{ active: index === 0 }"
        ></button>
      </div>
      <div class="carousel-inner" id="carousel-inner">
        <div 
          v-for="(carousel, index) in carousels" 
          :key="carousel.id"
          class="carousel-item" 
          :class="{ active: index === 0 }"
        >
          <img :src="carousel.image" class="d-block w-100" :alt="carousel.title">
          <div class="carousel-caption d-none d-md-block">
            <h5>{{ carousel.title }}</h5>
          </div>
        </div>
      </div>
      <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
        <span class="carousel-control-prev-icon"></span>
        <span class="visually-hidden">Previous</span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
        <span class="carousel-control-next-icon"></span>
        <span class="visually-hidden">Next</span>
      </button>
    </div>

    <div class="container">
      <!-- 图书分类 -->
      <h2 class="section-title">图书分类</h2>
      <div class="row">
        <div class="col-md-3">
          <ul class="category-list">
            <li v-for="category in categories" :key="category.id">
              <router-link :to="`/books?category_id=${category.id}`">{{ category.name }}</router-link>
            </li>
          </ul>
        </div>
        
        <!-- 热门图书 -->
        <div class="col-md-9">
          <h3>热门图书</h3>
          <div class="row" id="hot-books">
            <div 
              v-for="(book, index) in hotBooks" 
              :key="book.id"
              class="col-md-4 fade-in-up"
              :class="`delay-${index % 3 + 1}`"
            >
              <div class="card book-card">
                <div class="overflow-hidden">
                  <img :src="getBookCover(book)" class="card-img-top book-cover" :alt="book.title">
                </div>
                <div class="card-body">
                  <h5 class="card-title">{{ book.title }}</h5>
                  <p class="card-text">作者: {{ book.author }}</p>
                  <p class="card-text">可借: {{ book.available_count }}/{{ book.total_count }}</p>
                  <router-link :to="`/book/${book.id}`" class="btn btn-primary">查看详情</router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 图书资讯 -->
      <h2 class="section-title">图书资讯</h2>
      <div class="row" id="book-news">
        <div 
          v-for="(news, index) in bookNews" 
          :key="news.id"
          class="col-md-4 fade-in-up"
          :class="`delay-${index % 3 + 1}`"
        >
          <div class="card news-card">
            <div class="card-body">
              <h5 class="card-title">{{ news.title }}</h5>
              <p class="card-text">{{ news.content.substring(0, 100) }}...</p>
              <p class="card-text"><small class="text-muted">{{ formatDate(news.created_at) }}</small></p>
              <router-link :to="`/news/${news.id}`" class="btn btn-primary">查看详情</router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- 通知公告 -->
      <h2 class="section-title">通知公告</h2>
      <div class="row" id="notifications">
        <div 
          v-for="(notification, index) in notifications" 
          :key="notification.id"
          class="col-md-4 fade-in-up"
          :class="`delay-${index % 3 + 1}`"
        >
          <div class="card news-card">
            <div class="card-body">
              <h5 class="card-title">{{ notification.title }}</h5>
              <p class="card-text">{{ notification.content.substring(0, 100) }}...</p>
              <p class="card-text"><small class="text-muted">{{ formatDate(notification.created_at) }}</small></p>
              <router-link :to="`/notification/${notification.id}`" class="btn btn-primary">查看详情</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const carousels = ref([])
const hotBooks = ref([])
const bookNews = ref([])
const notifications = ref([])
const categories = ref([
  { id: 1, name: '计算机科学' },
  { id: 2, name: '文学' },
  { id: 3, name: '历史' },
  { id: 4, name: '艺术' },
  { id: 5, name: '科学' }
])

const loadCarousels = () => {
  fetch('/api/carousels')
    .then(response => response.json())
    .then(data => {
      if (data.code === 200) {
        carousels.value = data.data
      }
    })
    .catch(error => console.error('加载轮播图失败:', error))
}

const loadHotBooks = () => {
  fetch('/api/books')
    .then(response => response.json())
    .then(data => {
      if (data.code === 200) {
        // 取前6本作为热门图书
        hotBooks.value = data.data.slice(0, 6)
      }
    })
    .catch(error => console.error('加载热门图书失败:', error))
}

const loadBookNews = () => {
  fetch('/api/book-news')
    .then(response => response.json())
    .then(data => {
      if (data.code === 200) {
        bookNews.value = data.data
      }
    })
    .catch(error => console.error('加载图书资讯失败:', error))
}

const loadNotifications = () => {
  fetch('/api/notifications')
    .then(response => response.json())
    .then(data => {
      if (data.code === 200) {
        notifications.value = data.data
      }
    })
    .catch(error => console.error('加载通知公告失败:', error))
}

const getBookCover = (book) => {
  if (book.cover) {
    return book.cover
  } else {
    // 使用 JavaScript 构建包含书名的 SVG，带有更好的样式
    const svgContent = `
      <svg width="300" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="300" height="400" fill="#f8f9fa" stroke="#e9ecef" stroke-width="1"/>
        <rect width="280" height="380" x="10" y="10" fill="#ffffff" rx="4"/>
        <text x="150" y="180" font-size="16" text-anchor="middle" fill="#3a5a78" font-family="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" font-weight="500">${book.title}</text>
        <text x="150" y="220" font-size="14" text-anchor="middle" fill="#666" font-family="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">${book.author}</text>
        <rect width="200" height="2" x="50" y="240" fill="#f39c12"/>
        <text x="150" y="280" font-size="12" text-anchor="middle" fill="#999" font-family="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">图书封面</text>
      </svg>
    `
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgContent)
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString()
}

onMounted(() => {
  loadCarousels()
  loadHotBooks()
  loadBookNews()
  loadNotifications()
})
</script>

<style scoped>
/* 轮播图 */
.carousel-item {
  height: 500px;
  position: relative;
}

.carousel-item img {
  height: 100%;
  object-fit: cover;
  filter: brightness(0.8);
}

.carousel-caption {
  bottom: 30%;
  text-align: center;
  background: rgba(0,0,0,0.5);
  padding: 2rem;
  border-radius: var(--border-radius);
  max-width: 800px;
  margin: 0 auto;
}

.carousel-caption h5 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: white;
}

.carousel-caption p {
  font-size: 1.2rem;
  color: rgba(255,255,255,0.9);
}

/* 章节标题 */
.section-title {
  margin: 50px 0 30px;
  text-align: center;
  color: var(--dark-color);
  font-weight: 700;
  position: relative;
  padding-bottom: 15px;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 3px;
  background-color: var(--accent-color);
}

/* 图书分类 */
.category-list {
  list-style: none;
  padding: 0;
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 20px;
}

.category-list li {
  margin-bottom: 12px;
}

.category-list a {
  text-decoration: none;
  color: var(--text-color);
  transition: var(--transition);
  display: block;
  padding: 8px 12px;
  border-radius: var(--border-radius);
}

.category-list a:hover {
  color: var(--primary-color);
  background-color: rgba(58, 90, 120, 0.1);
  transform: translateX(5px);
}

/* 图书卡片 */
.book-card {
  margin-bottom: 25px;
  transition: var(--transition);
  border: none;
  border-radius: var(--border-radius);
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  overflow: hidden;
}

.book-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}

.book-cover {
  height: 250px;
  object-fit: cover;
  transition: var(--transition);
}

.book-card:hover .book-cover {
  transform: scale(1.05);
}

.card-body {
  padding: 1.5rem;
}

.card-title {
  font-weight: 600;
  margin-bottom: 0.8rem;
  color: var(--dark-color);
}

.card-text {
  color: var(--text-light);
  margin-bottom: 0.5rem;
}

/* 按钮样式 */
.btn-primary {
  background-color: var(--primary-color);
  border: none;
  border-radius: var(--border-radius);
  padding: 8px 16px;
  font-weight: 500;
  transition: var(--transition);
}

.btn-primary:hover {
  background-color: var(--secondary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(58, 90, 120, 0.3);
}

/* 资讯和通知卡片 */
.news-card {
  margin-bottom: 25px;
  border: none;
  border-radius: var(--border-radius);
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: var(--transition);
  overflow: hidden;
}

.news-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.12);
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
}

/* 延迟动画 */
.delay-1 {
  animation-delay: 0.1s;
}

.delay-2 {
  animation-delay: 0.2s;
}

.delay-3 {
  animation-delay: 0.3s;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .carousel-item {
    height: 300px;
  }
  
  .carousel-caption {
    bottom: 20%;
    padding: 1rem;
  }
  
  .carousel-caption h5 {
    font-size: 1.5rem;
  }
  
  .carousel-caption p {
    font-size: 1rem;
  }
  
  .book-cover {
    height: 200px;
  }
  
  .section-title {
    margin: 40px 0 20px;
  }
}
</style>
