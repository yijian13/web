<template>
  <div class="books">
    <div class="container">
      <h2 class="section-title">图书信息</h2>
      
      <!-- 搜索和筛选 -->
      <div class="row mb-4">
        <div class="col-md-6">
          <div class="input-group">
            <input 
              type="text" 
              class="form-control" 
              placeholder="搜索图书..." 
              v-model="searchQuery"
              @input="handleSearch"
            >
            <button class="btn btn-primary" type="button" @click="handleSearch">搜索</button>
          </div>
        </div>
        <div class="col-md-6">
          <select class="form-select" v-model="selectedCategory" @change="handleCategoryChange">
            <option value="0">全部分类</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>
      </div>
      
      <!-- 图书列表 -->
      <div class="row">
        <div 
          v-for="(book, index) in books" 
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
      
      <!-- 分页 -->
      <div class="d-flex justify-content-center mt-4">
        <nav aria-label="Page navigation example">
          <ul class="pagination">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">上一页</a>
            </li>
            <li 
              v-for="page in totalPages" 
              :key="page"
              class="page-item" 
              :class="{ active: currentPage === page }"
            >
              <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">下一页</a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const books = ref([])
const categories = ref([
  { id: 1, name: '计算机科学' },
  { id: 2, name: '文学' },
  { id: 3, name: '历史' },
  { id: 4, name: '艺术' },
  { id: 5, name: '科学' }
])
const searchQuery = ref('')
const selectedCategory = ref(0)
const currentPage = ref(1)
const pageSize = ref(12)
const totalItems = ref(0)

const totalPages = computed(() => {
  return Math.ceil(totalItems.value / pageSize.value)
})

const loadBooks = () => {
  let url = `/api/books?page=${currentPage.value}&page_size=${pageSize.value}`
  
  if (selectedCategory.value) {
    url += `&category_id=${selectedCategory.value}`
  }
  
  if (searchQuery.value) {
    url += `&search=${searchQuery.value}`
  }
  
  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.code === 200) {
        books.value = data.data
        totalItems.value = data.total || books.value.length
      }
    })
    .catch(error => console.error('加载图书失败:', error))
}

const handleSearch = () => {
  currentPage.value = 1
  loadBooks()
}

const handleCategoryChange = () => {
  currentPage.value = 1
  loadBooks()
}

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadBooks()
  }
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

onMounted(() => {
  // 从路由参数中获取分类ID
  const categoryId = route.query.category_id
  if (categoryId) {
    selectedCategory.value = parseInt(categoryId)
  }
  loadBooks()
})
</script>

<style scoped>
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
  .book-cover {
    height: 200px;
  }
  
  .section-title {
    margin: 40px 0 20px;
  }
}
</style>
