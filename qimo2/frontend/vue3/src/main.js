// 使用CDN版本的Vue和Vue Router
const { createApp, ref, computed, onMounted, provide, inject, reactive, watch } = Vue
const { createRouter, createWebHistory, useRouter, useRoute } = VueRouter

// 创建首页组件
const HomeView = {
  template: `
    <div class="home">
      <!-- 轮播图 -->
      <div id="carouselExampleIndicators" class="carousel slide" data-bs-ride="carousel">
        <div class="carousel-indicators">
          <button 
            v-for="(carousel, index) in globalState.carousels" 
            :key="index"
            type="button" 
            data-bs-target="#carouselExampleIndicators" 
            :data-bs-slide-to="index"
            :class="{ active: index === 0 }"
          ></button>
        </div>
        <div class="carousel-inner">
          <div 
            v-for="(carousel, index) in globalState.carousels" 
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
              <li v-for="category in globalState.categories" :key="category.id">
                <router-link :to="'/books?category_id=' + category.id">{{ category.name }}</router-link>
              </li>
            </ul>
          </div>
          
          <!-- 热门图书 -->
          <div class="col-md-9">
            <h3>热门图书</h3>
            <div class="row" id="hot-books">
              <div 
                v-for="(book, index) in globalState.hotBooks" 
                :key="book.id"
                class="col-md-4 fade-in-up"
                :class="'delay-' + (index % 3 + 1)"
              >
                <div class="card book-card">
                  <div class="overflow-hidden">
                    <img :src="getBookCover(book)" class="card-img-top book-cover" :alt="book.title">
                  </div>
                  <div class="card-body">
                    <h5 class="card-title">{{ book.title }}</h5>
                    <p class="card-text">作者: {{ book.author }}</p>
                    <p class="card-text">可借: {{ book.available }}/{{ book.total }}</p>
                    <router-link :to="'/book/' + book.id" class="btn btn-primary">查看详情</router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 图书资讯 -->
        <h2 class="section-title">
          <span class="section-title-text">图书资讯</span>
          <router-link to="/news" class="section-more">查看更多 <i class="bi bi-chevron-right"></i></router-link>
        </h2>
        <div class="row" id="book-news">
          <div 
            v-for="(news, index) in globalState.bookNews" 
            :key="news.id"
            class="col-md-4 fade-in-up"
            :class="'delay-' + (index % 3 + 1)"
          >
            <div class="card news-card h-100 transition-all duration-300 hover:shadow-lg">
              <div class="card-header bg-gradient text-white">
                <i class="bi bi-newspaper"></i> 图书资讯
              </div>
              <div class="card-body">
                <h5 class="card-title font-weight-bold mb-3">{{ news.title }}</h5>
                <p class="card-text text-gray-600 mb-4">{{ news.content.substring(0, 120) }}...</p>
                <div class="card-footer bg-transparent border-top-0">
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="text-sm text-muted"><i class="bi bi-calendar3"></i> {{ formatDate(news.created_at) }}</span>
                    <router-link :to="'/news/' + news.id" class="btn btn-primary btn-sm">
                      查看详情 <i class="bi bi-arrow-right"></i>
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 通知公告 -->
        <h2 class="section-title">
          <span class="section-title-text">通知公告</span>
          <router-link to="/notifications" class="section-more">查看更多 <i class="bi bi-chevron-right"></i></router-link>
        </h2>
        <div class="row" id="notifications">
          <div 
            v-for="(notification, index) in globalState.notifications" 
            :key="notification.id"
            class="col-md-4 fade-in-up"
            :class="'delay-' + (index % 3 + 1)"
          >
            <div class="card notification-card h-100 transition-all duration-300 hover:shadow-lg">
              <div class="card-header bg-warning text-white">
                <i class="bi bi-bell"></i> 通知公告
              </div>
              <div class="card-body">
                <h5 class="card-title font-weight-bold mb-3">{{ notification.title }}</h5>
                <p class="card-text text-gray-600 mb-4">{{ notification.content.substring(0, 120) }}...</p>
                <div class="card-footer bg-transparent border-top-0">
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="text-sm text-muted"><i class="bi bi-calendar3"></i> {{ formatDate(notification.created_at) }}</span>
                    <router-link :to="'/notification/' + notification.id" class="btn btn-warning btn-sm text-white">
                      查看详情 <i class="bi bi-arrow-right"></i>
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  setup() {
    const globalState = inject('globalState')

    const getBookCover = (book) => {
      if (book.cover) {
        return book.cover
      } else {
        // 使用简单的默认封面
        return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg width="300" height="400" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="400" fill="#f8f9fa" stroke="#e9ecef" stroke-width="1"/><text x="150" y="200" font-size="16" text-anchor="middle" fill="#3a5a78">' + book.title + '</text><text x="150" y="230" font-size="14" text-anchor="middle" fill="#666">' + book.author + '</text></svg>')
      }
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleString()
    }

    return {
      globalState,
      getBookCover,
      formatDate
    }
  }
}

// 创建图书资讯列表组件
const NewsListView = {
  template: `
    <div class="news-list">
      <div class="container">
        <h2 class="section-title">
          <span class="section-title-text">图书资讯</span>
        </h2>
        
        <div class="row">
          <div 
            v-for="(news, index) in globalState.bookNews" 
            :key="news.id"
            class="col-md-6 col-lg-4 mb-4 fade-in-up"
            :class="'delay-' + (index % 3 + 1)"
          >
            <div class="card news-card h-100 transition-all duration-300">
              <div class="card-header bg-gradient text-white">
                <i class="bi bi-newspaper"></i> 图书资讯
              </div>
              <div class="card-body">
                <h5 class="card-title font-weight-bold mb-3">{{ news.title }}</h5>
                <p class="card-text text-gray-600 mb-4">{{ news.content.substring(0, 150) }}...</p>
                <div class="card-footer bg-transparent border-top-0">
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="text-sm text-muted"><i class="bi bi-calendar3"></i> {{ formatDate(news.created_at) }}</span>
                    <router-link :to="'/news/' + news.id" class="btn btn-primary btn-sm">
                      查看详情 <i class="bi bi-arrow-right"></i>
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  setup() {
    // 注入全局状态
    const globalState = inject('globalState')
    
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleString()
    }
    
    return {
      globalState,
      formatDate
    }
  }
}

// 创建图书资讯详情组件
const NewsDetailView = {
  template: `
    <div class="news-detail">
      <div class="container">
        <div class="news-detail-container" v-if="news">
          <div class="card">
            <div class="card-header bg-gradient text-white">
              <i class="bi bi-newspaper"></i> 图书资讯
            </div>
            <div class="card-body">
              <h1 class="news-title mb-4">{{ news.title }}</h1>
              <div class="news-meta mb-4">
                <span class="text-muted"><i class="bi bi-calendar3"></i> 发布时间：{{ formatDate(news.created_at) }}</span>
              </div>
              <div class="news-content">
                <p class="lead">{{ news.content }}</p>
              </div>
              <div class="news-footer mt-5">
                <router-link to="/news" class="btn btn-secondary">
                  <i class="bi bi-arrow-left"></i> 返回列表
                </router-link>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center mt-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3">正在加载...</p>
        </div>
      </div>
    </div>
  `,
  setup() {
    const route = useRoute()
    const news = ref(null)
    
    const loadNewsDetail = () => {
      const newsId = route.params.id
      
      const mockNews = {
        1: {
          id: 1,
          title: '2026年新书推荐',
          content: '2026年最新图书推荐，包括计算机、文学、历史等多个类别。本次推荐的图书涵盖了各个领域的最新研究成果和经典著作，希望能够满足广大读者的阅读需求。\n\n推荐书目包括：\n1. 《深度学习》：AI领域的经典教材，详细介绍了神经网络的核心概念和实践应用\n2. 《百年孤独》：马尔克斯的代表作，魔幻现实主义的巅峰之作\n3. 《人类简史》：从史前时代到现代社会，讲述人类发展的宏大叙事\n4. 《艺术的故事》：贡布里希的经典艺术史著作，带领读者领略世界艺术的魅力\n5. 《时间简史》：霍金的科普名著，用通俗易懂的语言解释宇宙的奥秘\n\n这些图书都是各个领域的优秀作品，无论是学术研究还是休闲阅读，都能给您带来丰富的知识和愉快的阅读体验。欢迎广大读者到图书馆借阅！',
          created_at: '2026-04-10T11:04:55.000Z'
        },
        2: {
          id: 2,
          title: '读书节活动',
          content: '4月23日世界读书日，图书馆将举办读书节活动，欢迎参加！\n\n活动内容：\n1. 图书推荐角：设立主题图书推荐区，展示各类精选图书\n2. 阅读分享会：邀请读者分享自己的读书心得和推荐书目\n3. 作者见面会：邀请知名作家与读者面对面交流\n4. 互动游戏：举办与图书相关的趣味问答游戏\n5. 奖品兑换：参与活动可获得精美书签、图书优惠券等\n\n活动时间：4月23日 9:00-17:00\n活动地点：图书馆一楼大厅\n\n我们将提供丰富的图书资源和舒适的阅读环境，让每一位读者都能享受到阅读的乐趣。期待您的参与！',
          created_at: '2026-04-09T10:30:00.000Z'
        },
        3: {
          id: 3,
          title: '图书馆新增电子资源',
          content: '图书馆近期新增了一批电子资源，包括学术期刊、电子书籍、数据库等。\n\n新增资源包括：\n1. 中国知网（CNKI）：国内最大的学术文献数据库，覆盖各学科领域\n2. 万方数据：提供学位论文、会议论文、期刊等资源\n3. 维普期刊：中文科技期刊全文数据库\n4. IEEE Xplore：国际电气与电子工程领域权威数据库\n5. SpringerLink：国际著名学术出版集团的电子期刊平台\n\n访问方式：\n在校师生可通过校园网IP认证后访问上述数据库\n校外访问需使用VPN或在校内注册账号后申请远程访问权限\n\n如有疑问，请联系图书馆信息技术部。',
          created_at: '2026-04-08T09:15:00.000Z'
        },
        4: {
          id: 4,
          title: '暑期阅读计划',
          content: '为了丰富学生的暑期生活，图书馆推出了暑期阅读计划。\n\n计划内容：\n1. 暑期书单推荐：根据不同年龄段和兴趣方向，推荐适合暑期阅读的图书\n2. 线上读书会：每月举办一次线上读书分享活动\n3. 阅读打卡挑战：鼓励学生坚持每日阅读并记录心得\n4. 创意写作比赛：阅读后撰写书评或读后感，优秀作品将获得奖励\n\n推荐书单包括：\n- 儿童文学：《小王子》、《夏洛的网》、《窗边的小豆豆》等\n- 青少年读物：《骆驼祥子》、《简爱》、《钢铁是怎样炼成的》等\n- 科普读物：《十万个为什么》、《万物简史》、《果壳中的宇宙》等\n\n参与方式：关注图书馆微信公众号，获取更多活动信息和参与方式。',
          created_at: '2026-04-07T14:20:00.000Z'
        },
        5: {
          id: 5,
          title: '作家讲座系列',
          content: '本月起，图书馆将举办作家讲座系列活动。\n\n讲座安排：\n第一期：4月15日 15:00\n主讲人：著名科幻作家 刘慈欣\n主题：从《三体》看中国科幻文学的发展\n\n第二期：4月22日 15:00\n主讲人：知名悬疑作家 阿加莎·克里斯蒂研究者\n主题：推理小说的魅力与创作技巧\n\n第三期：4月29日 15:00\n主讲人：儿童文学作家 郑渊洁\n主题：童话创作与儿童阅读培养\n\n讲座地点：图书馆报告厅\n报名方式：到图书馆服务台登记或电话报名\n报名电话：12345678900\n\n每场讲座限100个名额，先到先得！',
          created_at: '2026-04-06T16:45:00.000Z'
        },
        6: {
          id: 6,
          title: '儿童阅读专区开放',
          content: '图书馆儿童阅读专区现已开放！\n\n专区特色：\n1. 丰富的图书资源：收藏3-12岁儿童绘本、故事书、科普读物等2000余册\n2. 舒适的阅读环境：设有可爱的儿童家具、柔和的灯光、宽敞的阅读空间\n3. 多媒体互动区：提供儿童电子书、有声读物等多媒体资源\n4. 定期活动：每周六下午举办故事会、绘本阅读等亲子活动\n\n开放时间：\n周一至周五：9:00-12:00，14:00-17:00\n周六至周日：9:00-17:00\n\n借阅规则：\n- 儿童读者可借阅5册图书\n- 借阅期限为14天，可续借一次\n- 请家长陪同阅读，共同培养孩子的阅读习惯\n\n欢迎小朋友和家长们前来体验！',
          created_at: '2026-04-05T11:30:00.000Z'
        }
      }
      
      fetch('/api/book-news/' + newsId)
        .then(response => response.json())
        .then(data => {
          if (data.code === 200) {
            news.value = data.data
          } else {
            news.value = mockNews[newsId] || mockNews[1]
          }
        })
        .catch(error => {
          console.error('加载资讯详情失败:', error)
          news.value = mockNews[newsId] || mockNews[1]
        })
    }
    
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleString()
    }
    
    onMounted(() => {
      loadNewsDetail()
    })
    
    return {
      news,
      formatDate
    }
  }
}

// 创建通知公告列表组件
const NotificationsListView = {
  template: `
    <div class="notifications-list">
      <div class="container">
        <h2 class="section-title">
          <span class="section-title-text">通知公告</span>
        </h2>
        
        <div class="row">
          <div 
            v-for="(notification, index) in globalState.notifications" 
            :key="notification.id"
            class="col-md-6 col-lg-4 mb-4 fade-in-up"
            :class="'delay-' + (index % 3 + 1)"
          >
            <div class="card notification-card h-100 transition-all duration-300">
              <div class="card-header bg-warning text-white">
                <i class="bi bi-bell"></i> 通知公告
              </div>
              <div class="card-body">
                <h5 class="card-title font-weight-bold mb-3">{{ notification.title }}</h5>
                <p class="card-text text-gray-600 mb-4">{{ notification.content.substring(0, 150) }}...</p>
                <div class="card-footer bg-transparent border-top-0">
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="text-sm text-muted"><i class="bi bi-calendar3"></i> {{ formatDate(notification.created_at) }}</span>
                    <router-link :to="'/notification/' + notification.id" class="btn btn-warning btn-sm text-white">
                      查看详情 <i class="bi bi-arrow-right"></i>
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  setup() {
    // 注入全局状态
    const globalState = inject('globalState')
    
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleString()
    }
    
    return {
      globalState,
      formatDate
    }
  }
}

// 创建通知公告详情组件
const NotificationDetailView = {
  template: `
    <div class="notification-detail">
      <div class="container">
        <div class="notification-detail-container" v-if="notification">
          <div class="card">
            <div class="card-header bg-warning text-white">
              <i class="bi bi-bell"></i> 通知公告
            </div>
            <div class="card-body">
              <h1 class="notification-title mb-4">{{ notification.title }}</h1>
              <div class="notification-meta mb-4">
                <span class="text-muted"><i class="bi bi-calendar3"></i> 发布时间：{{ formatDate(notification.created_at) }}</span>
              </div>
              <div class="notification-content">
                <p class="lead">{{ notification.content }}</p>
              </div>
              <div class="notification-footer mt-5">
                <router-link to="/notifications" class="btn btn-secondary">
                  <i class="bi bi-arrow-left"></i> 返回列表
                </router-link>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center mt-5">
          <div class="spinner-border text-warning" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3">正在加载...</p>
        </div>
      </div>
    </div>
  `,
  setup() {
    const route = useRoute()
    const notification = ref(null)
    
    const loadNotificationDetail = () => {
      const notificationId = route.params.id
      
      const mockNotifications = {
        1: {
          id: 1,
          title: '系统上线通知',
          content: '图书借阅管理系统正式上线，欢迎使用！\n\n系统功能：\n1. 图书查询：支持按书名、作者、ISBN等多种方式查询图书信息\n2. 图书借阅：在线借阅图书，查看借阅状态和归还日期\n3. 图书预约：预约已被借出的图书，预约成功后可优先借阅\n4. 个人信息管理：查看借阅历史、修改个人信息、设置提醒等\n5. 公告资讯：查看图书馆最新通知和图书资讯\n\n使用说明：\n1. 首次使用请先注册账号并进行身份验证\n2. 借阅图书时请携带有效证件到图书馆前台办理\n3. 请在规定期限内归还图书，逾期将产生罚款\n4. 如有疑问，请联系图书馆工作人员\n\n我们致力于为读者提供更加便捷、高效的图书借阅服务，欢迎大家提出宝贵意见！',
          created_at: '2026-04-10T11:04:55.000Z'
        },
        2: {
          id: 2,
          title: '图书馆开放时间调整',
          content: '自4月15日起，图书馆开放时间调整如下：\n\n调整后的开放时间：\n周一至周五：8:00-22:00（开放自习室和借阅服务）\n周六至周日：9:00-21:00（开放自习室和借阅服务）\n节假日：9:00-17:00（仅开放自习室）\n\n特别说明：\n1. 寒暑假期间开放时间另行通知\n2. 考试周期间将适当延长开放时间\n3. 闭馆前30分钟停止入馆\n\n请各位读者合理安排学习时间，遵守图书馆相关规定。如有不便，敬请谅解。',
          created_at: '2026-04-09T15:20:00.000Z'
        },
        3: {
          id: 3,
          title: '借阅规则更新',
          content: '图书馆借阅规则已更新，请各位读者注意：\n\n借阅数量限制：\n1. 本科生：每人最多借阅10册图书\n2. 研究生：每人最多借阅15册图书\n3. 教师：每人最多借阅20册图书\n4. 校外读者：每人最多借阅3册图书\n\n借阅期限：\n1. 普通图书：借阅期限30天，可续借一次（续借期限15天）\n2. 热门图书：借阅期限15天，不可续借\n3. 期刊杂志：借阅期限7天，不可续借\n4. 光盘资料：借阅期限14天，可续借一次\n\n逾期处理：\n1. 逾期未还：每册每天罚款0.10元\n2. 损坏图书：按图书原价赔偿，并收取加工费\n3. 丢失图书：按图书原价3倍赔偿\n\n请各位读者按时归还图书，共同维护图书馆的正常运行。',
          created_at: '2026-04-08T10:10:00.000Z'
        },
        4: {
          id: 4,
          title: '数据库培训通知',
          content: '图书馆将于4月20日举办数据库使用培训，欢迎有兴趣的读者参加。\n\n培训内容：\n1. 中国知网（CNKI）检索技巧与使用方法\n2. 万方数据资源的获取与利用\n3. 维普期刊全文检索操作演示\n4. IEEE Xplore英文文献检索方法\n5. 如何利用数据库进行学术论文写作\n\n培训时间：4月20日（周三）14:00-16:00\n培训地点：图书馆五楼电子阅览室\n培训讲师：图书馆信息检索专家 王教授\n\n报名方式：\n1. 到图书馆服务台现场报名\n2. 电话报名：12345678900\n3. 微信公众号报名：回复"培训报名+姓名+联系方式"\n\n报名截止日期：4月18日\n培训人数：限50人，额满为止\n\n参加培训的读者将获得图书馆颁发的培训证书，并有机会获得精美礼品一份！',
          created_at: '2026-04-07T14:30:00.000Z'
        },
        5: {
          id: 5,
          title: '图书捐赠活动',
          content: '图书馆正在开展图书捐赠活动，欢迎读者捐赠闲置图书！\n\n捐赠范围：\n1. 正式出版的图书（内容健康、积极向上）\n2. 学术著作、专业教材、参考书籍\n3. 文学艺术类图书\n4. 科普读物、青少年图书\n\n不接受捐赠的图书：\n1. 破损严重、影响阅读的图书\n2. 内容不健康的图书\n3. 非法出版物\n4. 超过10年且已过时的专业书籍\n\n捐赠方式：\n1. 现场捐赠：图书馆一楼服务台\n2. 上门收取：捐赠50册以上可联系工作人员上门收取\n\n捐赠权益：\n1. 图书馆将向捐赠者颁发荣誉证书\n2. 捐赠图书将根据实际情况纳入馆藏或调剂到其他需要的地方\n3. 定期在图书馆网站公布捐赠者名单\n\n让我们一起为图书馆资源建设贡献力量！',
          created_at: '2026-04-06T09:45:00.000Z'
        },
        6: {
          id: 6,
          title: '系统维护通知',
          content: '图书馆系统将于4月12日凌晨进行维护升级，届时系统可能暂时无法访问。\n\n维护时间：4月12日（周二）凌晨2:00-4:00\n维护内容：\n1. 系统数据库优化，提升查询速度\n2. 安全漏洞修复，增强系统安全性\n3. 功能升级，新增图书推荐功能\n4. 界面优化，提升用户体验\n\n影响范围：\n1. 图书馆网站暂停访问\n2. 图书查询系统暂时不可用\n3. 在线借阅功能暂停服务\n4. 微信公众号功能暂时受限\n\n注意事项：\n1. 请提前办理所需业务避开维护时间\n2. 维护期间图书馆前台业务正常办理\n3. 维护完成后所有功能将恢复正常\n\n如有紧急情况，请联系图书馆值班电话：12345678900\n\n给您带来不便，敬请谅解！',
          created_at: '2026-04-05T16:00:00.000Z'
        }
      }
      
      fetch('/api/notifications/' + notificationId)
        .then(response => response.json())
        .then(data => {
          if (data.code === 200) {
            notification.value = data.data
          } else {
            notification.value = mockNotifications[notificationId] || mockNotifications[1]
          }
        })
        .catch(error => {
          console.error('加载通知详情失败:', error)
          notification.value = mockNotifications[notificationId] || mockNotifications[1]
        })
    }
    
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleString()
    }
    
    onMounted(() => {
      loadNotificationDetail()
    })
    
    return {
      notification,
      formatDate
    }
  }
}

// 创建登录页面组件
const LoginView = {
  template: `
    <div class="login-page">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-6 col-lg-4">
            <div class="login-card card shadow-lg">
              <div class="card-header bg-gradient text-white text-center">
                <h3><i class="bi bi-door-open"></i> 用户登录</h3>
              </div>
              <div class="card-body">
                <form @submit.prevent="handleLogin">
                  <div class="mb-4">
                    <label for="username" class="form-label">用户名</label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="bi bi-person"></i></span>
                      <input 
                        type="text" 
                        class="form-control" 
                        id="username" 
                        v-model="loginForm.username"
                        placeholder="请输入用户名"
                        required
                      >
                    </div>
                  </div>
                  <div class="mb-4">
                    <label for="password" class="form-label">密码</label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="bi bi-lock"></i></span>
                      <input 
                        type="password" 
                        class="form-control" 
                        id="password" 
                        v-model="loginForm.password"
                        placeholder="请输入密码"
                        required
                      >
                    </div>
                  </div>
                  <div class="mb-4 form-check">
                    <input type="checkbox" class="form-check-input" id="remember" v-model="loginForm.remember">
                    <label class="form-check-label" for="remember">记住我</label>
                  </div>
                  <button type="submit" class="btn btn-primary w-100" :disabled="isLoading">
                    <span v-if="isLoading"><i class="bi bi-spinner bi-spin"></i> 登录中...</span>
                    <span v-else>登录</span>
                  </button>
                  <div class="text-center mt-3">
                    <router-link to="/register" class="text-primary">还没有账号？立即注册</router-link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  setup() {
    const router = useRouter()
    const updateUser = inject('updateUser')
    const loginForm = ref({
      username: '',
      password: '',
      remember: false
    })
    const isLoading = ref(false)
    
    const handleLogin = () => {
      isLoading.value = true
      
      // 模拟登录请求
      setTimeout(() => {
        // 模拟登录成功
        const user = {
          id: 1,
          username: loginForm.value.username,
          name: '测试用户',
          role: loginForm.value.username === 'admin' ? 'admin' : 'user'
        }
        
        // 保存用户信息到本地存储
        localStorage.setItem('token', 'mock-token-' + Date.now())
        localStorage.setItem('user', JSON.stringify(user))
        
        // 更新App组件中的用户状态
        if (updateUser) {
          updateUser(user)
        }
        
        isLoading.value = false
        
        // 跳转到首页
        router.push('/')
      }, 1000)
    }
    
    return {
      loginForm,
      isLoading,
      handleLogin
    }
  }
}

// 创建注册页面组件
const RegisterView = {
  template: `
    <div class="register-page">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-6 col-lg-5">
            <div class="register-card card shadow-lg">
              <div class="card-header bg-gradient text-white text-center">
                <h3><i class="bi bi-person-plus"></i> 用户注册</h3>
              </div>
              <div class="card-body">
                <form @submit.prevent="handleRegister">
                  <div class="mb-3">
                    <label for="reg-username" class="form-label">用户名</label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="bi bi-person"></i></span>
                      <input 
                        type="text" 
                        class="form-control" 
                        id="reg-username" 
                        v-model="registerForm.username"
                        placeholder="请输入用户名"
                        required
                      >
                    </div>
                  </div>
                  <div class="mb-3">
                    <label for="reg-name" class="form-label">姓名</label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="bi bi-person-fill"></i></span>
                      <input 
                        type="text" 
                        class="form-control" 
                        id="reg-name" 
                        v-model="registerForm.name"
                        placeholder="请输入姓名"
                        required
                      >
                    </div>
                  </div>
                  <div class="mb-3">
                    <label for="reg-password" class="form-label">密码</label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="bi bi-lock"></i></span>
                      <input 
                        type="password" 
                        class="form-control" 
                        id="reg-password" 
                        v-model="registerForm.password"
                        placeholder="请输入密码" 
                        required
                      >
                    </div>
                  </div>
                  <div class="mb-3">
                    <label for="reg-confirm-password" class="form-label">确认密码</label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="bi bi-lock-fill"></i></span>
                      <input 
                        type="password" 
                        class="form-control" 
                        id="reg-confirm-password" 
                        v-model="registerForm.confirmPassword"
                        placeholder="请再次输入密码" 
                        required
                      >
                    </div>
                  </div>
                  <button type="submit" class="btn btn-primary w-100" :disabled="isLoading">
                    <span v-if="isLoading"><i class="bi bi-spinner bi-spin"></i> 注册中...</span>
                    <span v-else>注册</span>
                  </button>
                  <div class="text-center mt-3">
                    <router-link to="/login" class="text-primary">已有账号？立即登录</router-link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  setup() {
    const router = useRouter()
    const updateUser = inject('updateUser')
    const globalState = inject('globalState')
    const registerForm = ref({
      username: '',
      name: '',
      password: '',
      confirmPassword: ''
    })
    const isLoading = ref(false)
    
    const handleRegister = () => {
      if (registerForm.value.password !== registerForm.value.confirmPassword) {
        alert('两次输入的密码不一致，请重新输入')
        return
      }
      
      isLoading.value = true
      
      // 模拟注册请求
      setTimeout(() => {
        // 模拟注册成功后自动登录
        const user = {
          id: globalState.users.length + 1,
          username: registerForm.value.username,
          name: registerForm.value.name,
          role: 'user',
          registerDate: new Date().toISOString().split('T')[0]
        }
        
        // 保存用户信息到本地存储
        localStorage.setItem('token', 'mock-token-' + Date.now())
        localStorage.setItem('user', JSON.stringify(user))
        
        // 添加用户到全局状态
        globalState.users.push(user)
        
        // 更新App组件中的用户状态
        if (updateUser) {
          updateUser(user)
        }
        
        isLoading.value = false
        alert('注册成功！')
        router.push('/')
      }, 1000)
    }
    
    return {
      registerForm,
      isLoading,
      handleRegister
    }
  }
}

// 创建个人中心页面组件
const PersonalView = {
  template: `
    <div class="personal-page">
      <div class="container">
        <h2 class="section-title">
          <span class="section-title-text">个人中心</span>
        </h2>
        <div class="card shadow-lg">
          <div class="card-header bg-gradient text-white">
            <h3><i class="bi bi-person-circle"></i> 个人信息</h3>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-4">
                <div class="text-center">
                  <div class="avatar mb-4">
                    <i class="bi bi-person-fill" style="font-size: 4rem; color: #3a5a78;"></i>
                  </div>
                  <h4>{{ user?.name || '用户' }}</h4>
                  <p class="text-muted">{{ user?.username || '未登录' }}</p>
                </div>
              </div>
              <div class="col-md-8">
                <h5 class="mb-3">基本信息</h5>
                <div class="row mb-3">
                  <div class="col-md-6">
                    <p><strong>姓名：</strong>{{ user?.name || '未知' }}</p>
                  </div>
                  <div class="col-md-6">
                    <p><strong>用户名：</strong>{{ user?.username || '未知' }}</p>
                  </div>
                </div>
                <div class="row mb-3">
                  <div class="col-md-6">
                    <p><strong>角色：</strong>{{ user?.role === 'admin' ? '管理员' : '普通用户' }}</p>
                  </div>
                  <div class="col-md-6">
                    <p><strong>注册时间：</strong>2026-04-01</p>
                  </div>
                </div>
                <h5 class="mt-5 mb-3">借阅记录</h5>
                <div class="table-responsive">
                  <table class="table table-hover">
                    <thead>
                      <tr>
                        <th>图书标题</th>
                        <th>借阅日期</th>
                        <th>应还日期</th>
                        <th>状态</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="borrow in (globalState.userBorrows[user.id] || [])" :key="borrow.id">
                        <td>{{ borrow.bookTitle }}</td>
                        <td>{{ borrow.borrowDate }}</td>
                        <td>{{ borrow.returnDate }}</td>
                        <td><span class="badge" :class="{ 'bg-success': borrow.status === '已归还', 'bg-warning': borrow.status === '借阅中' }">{{ borrow.status }}</span></td>
                      </tr>
                      <tr v-if="(!globalState.userBorrows[user.id] || globalState.userBorrows[user.id].length === 0)">
                        <td colspan="4" class="text-center">暂无借阅记录</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <h5 class="mt-5 mb-3">收藏记录</h5>
                <div class="table-responsive">
                  <table class="table table-hover">
                    <thead>
                      <tr>
                        <th>图书标题</th>
                        <th>作者</th>
                        <th>收藏日期</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="collection in (globalState.userCollections[user.id] || [])" :key="collection.id">
                        <td>{{ collection.bookTitle }}</td>
                        <td>{{ collection.author }}</td>
                        <td>{{ collection.collectDate }}</td>
                      </tr>
                      <tr v-if="(!globalState.userCollections[user.id] || globalState.userCollections[user.id].length === 0)">
                        <td colspan="3" class="text-center">暂无收藏记录</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  setup() {
    const user = ref(JSON.parse(localStorage.getItem('user')))
    const globalState = inject('globalState')
    
    return {
      user,
      globalState
    }
  }
}

// 创建管理员后台页面组件
const AdminView = {
  template: `
    <div class="admin-page">
      <div class="container">
        <h2 class="section-title">
          <span class="section-title-text">管理员后台</span>
        </h2>
        <div class="row">
          <div class="col-md-3">
            <div class="card shadow">
              <div class="card-header bg-gradient text-white">
                <h5>管理菜单</h5>
              </div>
              <ul class="list-group list-group-flush">
                <li class="list-group-item cursor-pointer" :class="{ active: activeTab === 'dashboard' }" @click="activeTab = 'dashboard'">
                  <i class="bi bi-speedometer"></i> 控制台
                </li>
                <li class="list-group-item cursor-pointer" :class="{ active: activeTab === 'books' }" @click="activeTab = 'books'">
                  <i class="bi bi-book"></i> 图书管理
                </li>
                <li class="list-group-item cursor-pointer" :class="{ active: activeTab === 'users' }" @click="activeTab = 'users'">
                  <i class="bi bi-people"></i> 用户管理
                </li>
                <li class="list-group-item cursor-pointer" :class="{ active: activeTab === 'news' }" @click="activeTab = 'news'">
                  <i class="bi bi-newspaper"></i> 资讯管理
                </li>
                <li class="list-group-item cursor-pointer" :class="{ active: activeTab === 'notifications' }" @click="activeTab = 'notifications'">
                  <i class="bi bi-bell"></i> 通知管理
                </li>
                <li class="list-group-item cursor-pointer" :class="{ active: activeTab === 'analysis' }" @click="activeTab = 'analysis'">
                  <i class="bi bi-bar-chart"></i> 统计分析
                </li>
              </ul>
            </div>
          </div>
          <div class="col-md-9">
            <!-- 控制台 -->
            <div v-if="activeTab === 'dashboard'">
              <div class="card shadow">
                <div class="card-header bg-gradient text-white">
                  <h5>控制台</h5>
                </div>
                <div class="card-body">
                <div class="row">
                  <div class="col-md-3">
                    <div class="card text-center">
                      <div class="card-body">
                        <div class="text-primary mb-2"><i class="bi bi-book" style="font-size: 2rem;"></i></div>
                        <h3>{{ globalState.stats.books }}</h3>
                        <p class="text-muted">图书总数</p>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="card text-center">
                      <div class="card-body">
                        <div class="text-success mb-2"><i class="bi bi-people" style="font-size: 2rem;"></i></div>
                        <h3>{{ globalState.stats.users }}</h3>
                        <p class="text-muted">用户总数</p>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="card text-center">
                      <div class="card-body">
                        <div class="text-warning mb-2"><i class="bi bi-arrow-right-left" style="font-size: 2rem;"></i></div>
                        <h3>{{ globalState.stats.borrows }}</h3>
                        <p class="text-muted">今日借阅</p>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="card text-center">
                      <div class="card-body">
                        <div class="text-danger mb-2"><i class="bi bi-exclamation-triangle" style="font-size: 2rem;"></i></div>
                        <h3>{{ globalState.stats.overdue }}</h3>
                        <p class="text-muted">逾期图书</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="mt-4">
                  <h5>最近借阅</h5>
                  <div class="table-responsive">
                    <table class="table table-hover">
                      <thead>
                        <tr>
                          <th>用户</th>
                          <th>图书</th>
                          <th>借阅日期</th>
                          <th>应还日期</th>
                          <th>状态</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="borrow in globalState.recentBorrows" :key="borrow.id">
                          <td>{{ borrow.user }}</td>
                          <td>{{ borrow.book }}</td>
                          <td>{{ borrow.borrowDate }}</td>
                          <td>{{ borrow.returnDate }}</td>
                          <td>
                            <span class="badge" :class="{
                              'bg-success': borrow.status === '已归还',
                              'bg-warning': borrow.status === '借阅中',
                              'bg-danger': borrow.status === '逾期'
                            }">{{ borrow.status }}</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              </div>
            </div>

            <!-- 图书管理 -->
            <div v-if="activeTab === 'books'">
              <div class="card shadow">
                <div class="card-header bg-gradient text-white d-flex justify-content-between align-items-center">
                  <h5>图书管理</h5>
                  <button class="btn btn-success btn-sm" @click="showAddBookModal">
                    <i class="bi bi-plus"></i> 添加图书
                  </button>
                </div>
                <div class="card-body">
                  <div class="mb-4">
                    <div class="input-group">
                      <input type="text" class="form-control" v-model="searchBook" placeholder="搜索图书...">
                      <button class="btn btn-primary" @click="searchBooks">
                        <i class="bi bi-search"></i> 搜索
                      </button>
                    </div>
                  </div>
                  <div class="table-responsive">
                    <table class="table table-hover">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>书名</th>
                          <th>作者</th>
                          <th>分类</th>
                          <th>可借数量</th>
                          <th>操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="book in globalState.hotBooks" :key="book.id">
                          <td>{{ book.id }}</td>
                          <td>{{ book.title }}</td>
                          <td>{{ book.author }}</td>
                          <td>{{ book.category }}</td>
                          <td>{{ book.available }}/{{ book.total }}</td>
                          <td>
                            <button class="btn btn-primary btn-sm mr-2" @click="editBook(book)">
                              <i class="bi bi-pencil"></i> 编辑
                            </button>
                            <button class="btn btn-danger btn-sm" @click="deleteBook(book.id)">
                              <i class="bi bi-trash"></i> 删除
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <!-- 用户管理 -->
            <div v-if="activeTab === 'users'">
              <div class="card shadow">
                <div class="card-header bg-gradient text-white d-flex justify-content-between align-items-center">
                  <h5>用户管理</h5>
                  <button class="btn btn-success btn-sm" @click="showAddUserModal">
                    <i class="bi bi-plus"></i> 添加用户
                  </button>
                </div>
                <div class="card-body">
                  <div class="mb-4">
                    <div class="input-group">
                      <input type="text" class="form-control" v-model="searchUser" placeholder="搜索用户...">
                      <button class="btn btn-primary" @click="searchUsers">
                        <i class="bi bi-search"></i> 搜索
                      </button>
                    </div>
                  </div>
                  <div class="table-responsive">
                    <table class="table table-hover">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>用户名</th>
                          <th>姓名</th>
                          <th>角色</th>
                          <th>注册时间</th>
                          <th>操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="user in globalState.users" :key="user.id">
                          <td>{{ user.id }}</td>
                          <td>{{ user.username }}</td>
                          <td>{{ user.name }}</td>
                          <td>
                            <span class="badge" :class="{
                              'bg-primary': user.role === 'admin',
                              'bg-secondary': user.role === 'user'
                            }">{{ user.role === 'admin' ? '管理员' : '普通用户' }}</span>
                          </td>
                          <td>{{ user.registerDate }}</td>
                          <td>
                            <button class="btn btn-primary btn-sm mr-2" @click="editUser(user)">
                              <i class="bi bi-pencil"></i> 编辑
                            </button>
                            <button class="btn btn-danger btn-sm" @click="deleteUser(user.id)">
                              <i class="bi bi-trash"></i> 删除
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <!-- 资讯管理 -->
            <div v-if="activeTab === 'news'">
              <div class="card shadow">
                <div class="card-header bg-gradient text-white d-flex justify-content-between align-items-center">
                  <h5>资讯管理</h5>
                  <button class="btn btn-success btn-sm" @click="showAddNewsModal">
                    <i class="bi bi-plus"></i> 添加资讯
                  </button>
                </div>
                <div class="card-body">
                  <div class="table-responsive">
                    <table class="table table-hover">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>标题</th>
                          <th>发布时间</th>
                          <th>操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="news in globalState.bookNews" :key="news.id">
                          <td>{{ news.id }}</td>
                          <td>{{ news.title }}</td>
                          <td>{{ news.created_at }}</td>
                          <td>
                            <button class="btn btn-primary btn-sm mr-2" @click="editNews(news)">
                              <i class="bi bi-pencil"></i> 编辑
                            </button>
                            <button class="btn btn-danger btn-sm" @click="deleteNews(news.id)">
                              <i class="bi bi-trash"></i> 删除
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <!-- 通知管理 -->
            <div v-if="activeTab === 'notifications'">
              <div class="card shadow">
                <div class="card-header bg-gradient text-white d-flex justify-content-between align-items-center">
                  <h5>通知管理</h5>
                  <button class="btn btn-success btn-sm" @click="showAddNotificationModal">
                    <i class="bi bi-plus"></i> 添加通知
                  </button>
                </div>
                <div class="card-body">
                  <div class="table-responsive">
                    <table class="table table-hover">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>标题</th>
                          <th>发布时间</th>
                          <th>操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="notification in globalState.notifications" :key="notification.id">
                          <td>{{ notification.id }}</td>
                          <td>{{ notification.title }}</td>
                          <td>{{ notification.created_at }}</td>
                          <td>
                            <button class="btn btn-primary btn-sm mr-2" @click="editNotification(notification)">
                              <i class="bi bi-pencil"></i> 编辑
                            </button>
                            <button class="btn btn-danger btn-sm" @click="deleteNotification(notification.id)">
                              <i class="bi bi-trash"></i> 删除
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <!-- 统计分析 -->
            <div v-if="activeTab === 'analysis'">
              <div class="card shadow">
                <div class="card-header bg-gradient text-white">
                  <h5>统计分析</h5>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6">
                      <h6>图书分类统计</h6>
                      <div class="chart-container" style="height: 300px;">
                        <canvas id="bookCategoryChart"></canvas>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <h6>借阅趋势</h6>
                      <div class="chart-container" style="height: 300px;">
                        <canvas id="borrowTrendChart"></canvas>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 添加图书模态框 -->
      <div class="modal fade" id="addBookModal" tabindex="-1" aria-labelledby="addBookModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="addBookModalLabel">{{ editingBook ? '编辑图书' : '添加图书' }}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveBook">
                <div class="mb-3">
                  <label for="bookTitle" class="form-label">书名</label>
                  <input type="text" class="form-control" id="bookTitle" v-model="bookForm.title" required>
                </div>
                <div class="mb-3">
                  <label for="bookAuthor" class="form-label">作者</label>
                  <input type="text" class="form-control" id="bookAuthor" v-model="bookForm.author" required>
                </div>
                <div class="mb-3">
                  <label for="bookCategory" class="form-label">分类</label>
                  <select class="form-control" id="bookCategory" v-model="bookForm.category" required>
                    <option value="计算机科学">计算机科学</option>
                    <option value="文学">文学</option>
                    <option value="历史">历史</option>
                    <option value="艺术">艺术</option>
                    <option value="科学">科学</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label for="bookTotal" class="form-label">总数量</label>
                  <input type="number" class="form-control" id="bookTotal" v-model.number="bookForm.total" min="1" required>
                </div>
                <div class="mb-3">
                  <label for="bookAvailable" class="form-label">可借数量</label>
                  <input type="number" class="form-control" id="bookAvailable" v-model.number="bookForm.available" min="0" required>
                </div>
                <button type="submit" class="btn btn-primary w-100">保存</button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- 添加用户模态框 -->
      <div class="modal fade" id="addUserModal" tabindex="-1" aria-labelledby="addUserModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="addUserModalLabel">{{ editingUser ? '编辑用户' : '添加用户' }}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveUser">
                <div class="mb-3">
                  <label for="userUsername" class="form-label">用户名</label>
                  <input type="text" class="form-control" id="userUsername" v-model="userForm.username" required>
                </div>
                <div class="mb-3">
                  <label for="userName" class="form-label">姓名</label>
                  <input type="text" class="form-control" id="userName" v-model="userForm.name" required>
                </div>
                <div class="mb-3">
                  <label for="userPassword" class="form-label">密码</label>
                  <input type="password" class="form-control" id="userPassword" v-model="userForm.password" :required="!editingUser">
                </div>
                <div class="mb-3">
                  <label for="userRole" class="form-label">角色</label>
                  <select class="form-control" id="userRole" v-model="userForm.role" required>
                    <option value="user">普通用户</option>
                    <option value="admin">管理员</option>
                  </select>
                </div>
                <button type="submit" class="btn btn-primary w-100">保存</button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- 添加资讯模态框 -->
      <div class="modal fade" id="addNewsModal" tabindex="-1" aria-labelledby="addNewsModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="addNewsModalLabel">{{ editingNews ? '编辑资讯' : '添加资讯' }}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveNews">
                <div class="mb-3">
                  <label for="newsTitle" class="form-label">标题</label>
                  <input type="text" class="form-control" id="newsTitle" v-model="newsForm.title" required>
                </div>
                <div class="mb-3">
                  <label for="newsContent" class="form-label">内容</label>
                  <textarea class="form-control" id="newsContent" v-model="newsForm.content" rows="5" required></textarea>
                </div>
                <button type="submit" class="btn btn-primary w-100">保存</button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- 添加通知模态框 -->
      <div class="modal fade" id="addNotificationModal" tabindex="-1" aria-labelledby="addNotificationModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="addNotificationModalLabel">{{ editingNotification ? '编辑通知' : '添加通知' }}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveNotification">
                <div class="mb-3">
                  <label for="notificationTitle" class="form-label">标题</label>
                  <input type="text" class="form-control" id="notificationTitle" v-model="notificationForm.title" required>
                </div>
                <div class="mb-3">
                  <label for="notificationContent" class="form-label">内容</label>
                  <textarea class="form-control" id="notificationContent" v-model="notificationForm.content" rows="5" required></textarea>
                </div>
                <button type="submit" class="btn btn-primary w-100">保存</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  setup() {
    const activeTab = ref('dashboard')
    const globalState = inject('globalState')
    
    // 图书管理
    const searchBook = ref('')
    const bookForm = ref({})
    const editingBook = ref(false)
    const showAddBookModal = () => {
      bookForm.value = {}
      editingBook.value = false
      // 使用Bootstrap的JavaScript API显示模态框
      const modal = new bootstrap.Modal(document.getElementById('addBookModal'))
      modal.show()
    }
    
    // 用户管理
    const searchUser = ref('')
    const userForm = ref({})
    const editingUser = ref(false)
    const showAddUserModal = () => {
      userForm.value = {}
      editingUser.value = false
      // 使用Bootstrap的JavaScript API显示模态框
      const modal = new bootstrap.Modal(document.getElementById('addUserModal'))
      modal.show()
    }
    
    // 资讯管理
    const newsForm = ref({})
    const editingNews = ref(false)
    const showAddNewsModal = () => {
      newsForm.value = {}
      editingNews.value = false
      // 使用Bootstrap的JavaScript API显示模态框
      const modal = new bootstrap.Modal(document.getElementById('addNewsModal'))
      modal.show()
    }
    
    // 通知管理
    const notificationForm = ref({})
    const editingNotification = ref(false)
    const showAddNotificationModal = () => {
      notificationForm.value = {}
      editingNotification.value = false
      // 使用Bootstrap的JavaScript API显示模态框
      const modal = new bootstrap.Modal(document.getElementById('addNotificationModal'))
      modal.show()
    }
    
    // 图书管理方法
    const searchBooks = () => {
      // 实际项目中这里会调用API进行搜索
      console.log('搜索图书:', searchBook.value)
    }
    
    const editBook = (book) => {
      bookForm.value = { ...book }
      editingBook.value = true
      // 使用Bootstrap的JavaScript API显示模态框
      const modal = new bootstrap.Modal(document.getElementById('addBookModal'))
      modal.show()
    }
    
    const deleteBook = (id) => {
      if (confirm('确定要删除这本书吗？')) {
        globalState.hotBooks = globalState.hotBooks.filter(book => book.id !== id)
        alert('删除成功！')
      }
    }
    
    const saveBook = () => {
      if (editingBook.value) {
        const index = globalState.hotBooks.findIndex(book => book.id === bookForm.value.id)
        if (index !== -1) {
          globalState.hotBooks[index] = { ...bookForm.value }
          alert('编辑成功！')
        }
      } else {
        const newBook = {
          ...bookForm.value,
          id: globalState.hotBooks.length + 1
        }
        globalState.hotBooks.push(newBook)
        alert('添加成功！')
      }
      // 使用Bootstrap的JavaScript API关闭模态框
      const modal = bootstrap.Modal.getInstance(document.getElementById('addBookModal'))
      if (modal) {
        modal.hide()
      }
      bookForm.value = {}
      editingBook.value = false
    }
    
    // 用户管理方法
    const searchUsers = () => {
      // 实际项目中这里会调用API进行搜索
      console.log('搜索用户:', searchUser.value)
    }
    
    const editUser = (user) => {
      userForm.value = { ...user }
      editingUser.value = true
      // 使用Bootstrap的JavaScript API显示模态框
      const modal = new bootstrap.Modal(document.getElementById('addUserModal'))
      modal.show()
    }
    
    const deleteUser = (id) => {
      if (confirm('确定要删除这个用户吗？')) {
        globalState.users = globalState.users.filter(user => user.id !== id)
        alert('删除成功！')
      }
    }
    
    const saveUser = () => {
      if (editingUser.value) {
        const index = globalState.users.findIndex(user => user.id === userForm.value.id)
        if (index !== -1) {
          globalState.users[index] = { ...userForm.value }
          alert('编辑成功！')
        }
      } else {
        const newUser = {
          ...userForm.value,
          id: globalState.users.length + 1,
          registerDate: new Date().toISOString().split('T')[0]
        }
        globalState.users.push(newUser)
        alert('添加成功！')
      }
      // 使用Bootstrap的JavaScript API关闭模态框
      const modal = bootstrap.Modal.getInstance(document.getElementById('addUserModal'))
      if (modal) {
        modal.hide()
      }
      userForm.value = {}
      editingUser.value = false
    }
    
    // 资讯管理方法
    const editNews = (news) => {
      newsForm.value = { ...news }
      editingNews.value = true
      // 使用Bootstrap的JavaScript API显示模态框
      const modal = new bootstrap.Modal(document.getElementById('addNewsModal'))
      modal.show()
    }
    
    const deleteNews = (id) => {
      if (confirm('确定要删除这条资讯吗？')) {
        globalState.bookNews = globalState.bookNews.filter(news => news.id !== id)
        alert('删除成功！')
      }
    }
    
    const saveNews = () => {
      if (editingNews.value) {
        const index = globalState.bookNews.findIndex(news => news.id === newsForm.value.id)
        if (index !== -1) {
          globalState.bookNews[index] = { ...newsForm.value }
          alert('编辑成功！')
        }
      } else {
        const newNews = {
          ...newsForm.value,
          id: globalState.bookNews.length + 1,
          created_at: new Date().toISOString()
        }
        globalState.bookNews.push(newNews)
        alert('添加成功！')
      }
      // 使用Bootstrap的JavaScript API关闭模态框
      const modal = bootstrap.Modal.getInstance(document.getElementById('addNewsModal'))
      if (modal) {
        modal.hide()
      }
      newsForm.value = {}
      editingNews.value = false
    }
    
    // 通知管理方法
    const editNotification = (notification) => {
      notificationForm.value = { ...notification }
      editingNotification.value = true
      // 使用Bootstrap的JavaScript API显示模态框
      const modal = new bootstrap.Modal(document.getElementById('addNotificationModal'))
      modal.show()
    }
    
    const deleteNotification = (id) => {
      if (confirm('确定要删除这条通知吗？')) {
        globalState.notifications = globalState.notifications.filter(notification => notification.id !== id)
        alert('删除成功！')
      }
    }
    
    const saveNotification = () => {
      if (editingNotification.value) {
        const index = globalState.notifications.findIndex(notification => notification.id === notificationForm.value.id)
        if (index !== -1) {
          globalState.notifications[index] = { ...notificationForm.value }
          alert('编辑成功！')
        }
      } else {
        const newNotification = {
          ...notificationForm.value,
          id: globalState.notifications.length + 1,
          created_at: new Date().toISOString()
        }
        globalState.notifications.push(newNotification)
        alert('添加成功！')
      }
      // 使用Bootstrap的JavaScript API关闭模态框
      const modal = bootstrap.Modal.getInstance(document.getElementById('addNotificationModal'))
      if (modal) {
        modal.hide()
      }
      notificationForm.value = {}
      editingNotification.value = false
    }
    
    // 初始化图表
    onMounted(() => {
      // 监听标签页变化，当切换到统计分析标签页时初始化图表
      watch(() => activeTab.value, (newTab) => {
        if (newTab === 'analysis') {
          // 延迟执行，确保图表容器已经渲染完成
          setTimeout(() => {
            initCharts()
          }, 100)
        }
      })
    })
    
    const initCharts = () => {
      // 图书分类统计图表
      const bookCategoryCtx = document.getElementById('bookCategoryChart')
      if (bookCategoryCtx) {
        // 计算各分类图书数量
        const categoryCounts = {} 
        globalState.hotBooks.forEach(book => {
          if (categoryCounts[book.category]) {
            categoryCounts[book.category]++
          } else {
            categoryCounts[book.category] = 1
          }
        })
        
        const categories = Object.keys(categoryCounts)
        const counts = Object.values(categoryCounts)
        
        new Chart(bookCategoryCtx, {
          type: 'pie',
          data: {
            labels: categories,
            datasets: [{
              data: counts,
              backgroundColor: [
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 99, 132, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(153, 102, 255, 0.6)'
              ],
              borderColor: [
                'rgba(54, 162, 235, 1)',
                'rgba(255, 99, 132, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)'
              ],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom'
              }
            }
          }
        })
      }
      
      // 借阅趋势图表
      const borrowTrendCtx = document.getElementById('borrowTrendChart')
      if (borrowTrendCtx) {
        // 模拟过去7天的借阅数据
        const labels = ['4月4日', '4月5日', '4月6日', '4月7日', '4月8日', '4月9日', '4月10日']
        const data = [12, 19, 15, 17, 22, 25, 30]
        
        new Chart(borrowTrendCtx, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [{
              label: '借阅数量',
              data: data,
              borderColor: 'rgba(54, 162, 235, 1)',
              backgroundColor: 'rgba(54, 162, 235, 0.1)',
              tension: 0.4,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top'
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  precision: 0
                }
              }
            }
          }
        })
      }
    }
    
    return {
      activeTab,
      globalState,
      searchBook,
      bookForm,
      editingBook,
      showAddBookModal,
      searchUser,
      userForm,
      editingUser,
      showAddUserModal,
      newsForm,
      editingNews,
      showAddNewsModal,
      notificationForm,
      editingNotification,
      showAddNotificationModal,
      searchBooks,
      editBook,
      deleteBook,
      saveBook,
      searchUsers,
      editUser,
      deleteUser,
      saveUser,
      editNews,
      deleteNews,
      saveNews,
      editNotification,
      deleteNotification,
      saveNotification
    }
  }
}

// 创建图书列表组件
const BooksView = {
  template: `
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
              >
              <button class="btn btn-primary" type="button" @click="handleSearch">搜索</button>
            </div>
          </div>
          <div class="col-md-6">
            <select class="form-select" v-model="selectedCategory">
              <option value="0">全部分类</option>
              <option v-for="category in globalState.categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>
        </div>
        
        <!-- 图书列表 -->
        <div class="row">
          <div 
            v-for="(book, index) in filteredBooks" 
            :key="book.id"
            class="col-md-4 fade-in-up"
            :class="'delay-' + (index % 3 + 1)"
          >
            <div class="card book-card">
              <div class="overflow-hidden">
                <img :src="getBookCover(book)" class="card-img-top book-cover" :alt="book.title">
              </div>
              <div class="card-body">
                <h5 class="card-title">{{ book.title }}</h5>
                <p class="card-text">作者: {{ book.author }}</p>
                <p class="card-text">可借: {{ book.available }}/{{ book.total }}</p>
                <router-link :to="'/book/' + book.id" class="btn btn-primary">查看详情</router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  setup() {
    // 注入全局状态
    const globalState = inject('globalState')
    
    const searchQuery = ref('')
    const selectedCategory = ref(0)

    // 过滤图书
    const filteredBooks = computed(() => {
      let result = [...globalState.hotBooks]
      
      // 按分类筛选
      if (selectedCategory.value) {
        result = result.filter(book => book.category_id === selectedCategory.value || book.category === globalState.categories.find(c => c.id === selectedCategory.value)?.name)
      }
      
      // 按搜索关键词筛选
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(book => 
          book.title.toLowerCase().includes(query) || 
          book.author.toLowerCase().includes(query)
        )
      }
      
      return result
    })

    const handleSearch = () => {
      // 搜索逻辑已在computed中处理
    }

    const getBookCover = (book) => {
      if (book.cover) {
        return book.cover
      } else {
        // 使用简单的默认封面
        return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg width="300" height="400" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="400" fill="#f8f9fa" stroke="#e9ecef" stroke-width="1"/><text x="150" y="200" font-size="16" text-anchor="middle" fill="#3a5a78">' + book.title + '</text><text x="150" y="230" font-size="14" text-anchor="middle" fill="#666">' + book.author + '</text></svg>')
      }
    }

    return {
      globalState,
      searchQuery,
      selectedCategory,
      filteredBooks,
      handleSearch,
      getBookCover
    }
  }
}

// 创建路由
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
      component: BooksView
    },
    {
      path: '/book/:id',
      name: 'book-detail',
      component: {
        template: `
          <div class="book-detail">
            <div class="container">
              <div class="book-detail-container" v-if="book">
                <div class="card">
                  <div class="card-header bg-gradient text-white">
                    <h3><i class="bi bi-book"></i> 图书详情</h3>
                  </div>
                  <div class="card-body">
                    <div class="row">
                      <div class="col-md-4">
                        <img :src="getBookCover(book)" class="img-fluid rounded" alt="Book cover">
                      </div>
                      <div class="col-md-8">
                        <h1 class="book-title mb-4">{{ book.title }}</h1>
                        <p class="book-meta mb-4">
                          <span class="mr-4"><i class="bi bi-person"></i> 作者：{{ book.author }}</span>
                          <span class="mr-4"><i class="bi bi-tag"></i> 分类：{{ book.category }}</span>
                          <span><i class="bi bi-bookmark"></i> 可借：{{ book.available }}/{{ book.total }}</span>
                        </p>
                        <div class="book-description">
                          <h3 class="mb-3">图书简介</h3>
                          <p>{{ book.description || '暂无简介' }}</p>
                        </div>
                        <div class="book-actions mt-5">
                          <button class="btn btn-primary mr-3" @click="borrowBook">
                            <i class="bi bi-bookmark-plus"></i> 借阅
                          </button>
                          <button class="btn btn-secondary" @click="collectBook">
                            <i class="bi bi-star"></i> 收藏
                          </button>
                        </div>
                      </div>
                    </div>
                    <div class="book-footer mt-5">
                      <router-link to="/books" class="btn btn-secondary">
                        <i class="bi bi-arrow-left"></i> 返回列表
                      </router-link>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center mt-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3">正在加载...</p>
              </div>
            </div>
          </div>
        `,
        setup() {
          const route = useRoute()
          const globalState = inject('globalState')
          const book = ref(null)
          const user = ref(JSON.parse(localStorage.getItem('user')))
          
          const loadBookDetail = () => {
            const bookId = parseInt(route.params.id)
            // 从全局状态中获取图书信息
            book.value = globalState.hotBooks.find(book => book.id === bookId) || null
          }
          
          const getBookCover = (book) => {
            if (book.cover) {
              return book.cover
            } else {
              // 使用简单的默认封面
              return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg width="300" height="400" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="400" fill="#f8f9fa" stroke="#e9ecef" stroke-width="1"/><text x="150" y="200" font-size="16" text-anchor="middle" fill="#3a5a78">' + book.title + '</text><text x="150" y="230" font-size="14" text-anchor="middle" fill="#666">' + book.author + '</text></svg>')
            }
          }
          
          const borrowBook = () => {
            // 检查用户是否登录
            if (!user.value) {
              alert('请先登录后再借阅图书！')
              return
            }
            
            // 检查图书是否可借
            if (book.value.available <= 0) {
              alert('该图书当前无可用副本！')
              return
            }
            
            // 执行借阅操作
            book.value.available--
            
            // 确保当前用户的借阅记录数组存在
            if (!globalState.userBorrows[user.value.id]) {
              globalState.userBorrows[user.value.id] = []
            }
            
            // 记录借阅记录
            const borrowRecord = {
              id: globalState.userBorrows[user.value.id].length + 1,
              bookTitle: book.value.title,
              borrowDate: new Date().toISOString().split('T')[0],
              returnDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              status: '借阅中'
            }
            globalState.userBorrows[user.value.id].push(borrowRecord)
            
            // 同时添加到最近借阅记录，供管理员后台查看
            const recentBorrowRecord = {
              id: globalState.recentBorrows.length + 1,
              user: user.value.name,
              book: book.value.title,
              borrowDate: new Date().toISOString().split('T')[0],
              returnDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              status: '借阅中'
            }
            globalState.recentBorrows.push(recentBorrowRecord)
            
            alert('借阅成功！')
          }
          
          const collectBook = () => {
            // 检查用户是否登录
            if (!user.value) {
              alert('请先登录后再收藏图书！')
              return
            }
            
            // 确保当前用户的收藏记录数组存在
            if (!globalState.userCollections[user.value.id]) {
              globalState.userCollections[user.value.id] = []
            }
            
            // 检查是否已经收藏
            const alreadyCollected = globalState.userCollections[user.value.id].some(item => item.bookId === book.value.id)
            if (alreadyCollected) {
              alert('您已经收藏过这本书了！')
              return
            }
            
            // 执行收藏操作
            const collectRecord = {
              id: globalState.userCollections[user.value.id].length + 1,
              bookId: book.value.id,
              bookTitle: book.value.title,
              author: book.value.author,
              collectDate: new Date().toISOString().split('T')[0]
            }
            globalState.userCollections[user.value.id].push(collectRecord)
            
            alert('收藏成功！')
          }
          
          onMounted(() => {
            loadBookDetail()
          })
          
          return {
            book,
            getBookCover,
            borrowBook,
            collectBook
          }
        }
      }
    },
    {
      path: '/news',
      name: 'news',
      component: NewsListView
    },
    {
      path: '/news/:id',
      name: 'news-detail',
      component: NewsDetailView
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: NotificationsListView
    },
    {
      path: '/notification/:id',
      name: 'notification-detail',
      component: NotificationDetailView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/personal',
      name: 'personal',
      component: PersonalView
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView
    }
  ]
})

// 创建根组件
const App = {
  template: `
    <div class="app">
      <!-- 导航栏 -->
      <nav class="navbar navbar-expand-lg navbar-dark" style="background-color: #3a5a78; box-shadow: 0 2px 8px rgba(0,0,0,0.1); padding: 0.8rem 0;">
        <div class="container">
          <router-link to="/" class="navbar-brand" style="font-size: 1.5rem; font-weight: 700; color: white; transition: all 0.3s ease;">
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
      <router-view></router-view>

      <!-- 页脚 -->
      <footer class="footer" style="background-color: #2c3e50; color: white; padding: 40px 0 20px; margin-top: 60px;">
        <div class="container">
          <div class="row">
            <div class="col-md-4">
              <h4 style="font-weight: 600; margin-bottom: 1.5rem; color: #f39c12;">关于我们</h4>
              <p style="color: rgba(255,255,255,0.8); margin-bottom: 0.5rem;">我们是一个致力于为读者提供优质图书资源的图书馆。</p>
            </div>
            <div class="col-md-4">
              <h4 style="font-weight: 600; margin-bottom: 1.5rem; color: #f39c12;">联系方式</h4>
              <p style="color: rgba(255,255,255,0.8); margin-bottom: 0.5rem;">电话：12345678900</p>
              <p style="color: rgba(255,255,255,0.8); margin-bottom: 0.5rem;">邮箱：contact@library.com</p>
            </div>
            <div class="col-md-4">
              <h4 style="font-weight: 600; margin-bottom: 1.5rem; color: #f39c12;">快速链接</h4>
              <ul class="list-unstyled">
                <li><router-link to="/" style="color: rgba(255,255,255,0.8); transition: all 0.3s ease; text-decoration: none;">首页</router-link></li>
                <li><router-link to="/books" style="color: rgba(255,255,255,0.8); transition: all 0.3s ease; text-decoration: none;">图书信息</router-link></li>
                <li><router-link to="/news" style="color: rgba(255,255,255,0.8); transition: all 0.3s ease; text-decoration: none;">图书资讯</router-link></li>
                <li><router-link to="/notifications" style="color: rgba(255,255,255,0.8); transition: all 0.3s ease; text-decoration: none;">通知公告</router-link></li>
              </ul>
            </div>
          </div>
          <div class="text-center mt-4">
            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.6);">&copy; 2026 图书借阅管理系统. 保留所有权利.</p>
          </div>
        </div>
      </footer>
    </div>
  `,
  setup() {
    const user = ref(null)
    const router = useRouter()

    // 全局状态管理
    const globalState = reactive({
      // 轮播图数据
      carousels: [
        {
          id: 1,
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20library%20interior%20with%20bookshelves%20and%20students%20reading&image_size=landscape_16_9',
          title: '欢迎使用图书借阅管理系统',
          link: '/'
        },
        {
          id: 2,
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=students%20studying%20in%20library%20with%20books&image_size=landscape_16_9',
          title: '读书是人类进步的阶梯',
          link: '/books'
        },
        {
          id: 3,
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20library%20with%20digital%20resources&image_size=landscape_16_9',
          title: '丰富的电子资源等你来探索',
          link: '/books'
        }
      ],
      // 热门图书数据
      hotBooks: [
        {
          id: 1,
          title: 'JavaScript高级程序设计',
          author: 'Nicholas C. Zakas',
          cover: '',
          category: '计算机科学',
          available: 3,
          total: 3
        },
        {
          id: 2,
          title: 'Python编程：从入门到实践',
          author: 'Eric Matthes',
          cover: '',
          category: '计算机科学',
          available: 3,
          total: 3
        },
        {
          id: 3,
          title: 'Java核心技术',
          author: 'Cay S. Horstmann',
          cover: '',
          category: '计算机科学',
          available: 3,
          total: 3
        },
        {
          id: 4,
          title: '数据结构与算法分析',
          author: 'Mark Allen Weiss',
          cover: '',
          category: '计算机科学',
          available: 3,
          total: 3
        },
        {
          id: 5,
          title: '计算机网络',
          author: 'Andrew S. Tanenbaum',
          cover: '',
          category: '计算机科学',
          available: 3,
          total: 3
        },
        {
          id: 6,
          title: '红楼梦',
          author: '曹雪芹',
          cover: '',
          category: '文学',
          available: 3,
          total: 3
        }
      ],
      // 图书资讯数据
      bookNews: [
        {
          id: 1,
          title: '2026年新书推荐',
          content: '2026年最新图书推荐，包括计算机、文学、历史等多个类别。我们精选了一批高质量的图书，涵盖了各个领域的最新研究成果和经典著作。无论您是学生、教师还是研究人员，都能在这里找到适合自己的图书。',
          created_at: '2026-04-10T11:04:55.000Z'
        },
        {
          id: 2,
          title: '读书节活动',
          content: '4月23日世界读书日，图书馆将举办读书节活动，欢迎参加！活动包括图书漂流、读书分享会、作家讲座等多个环节，还有丰富的奖品等你来拿。',
          created_at: '2026-04-09T10:30:00.000Z'
        },
        {
          id: 3,
          title: '图书馆新增电子资源',
          content: '图书馆近期新增了一批电子资源，包括学术期刊、电子书籍、数据库等。这些资源涵盖了各个学科领域，为师生的学习和研究提供了更加丰富的资料。',
          created_at: '2026-04-08T09:15:00.000Z'
        },
        {
          id: 4,
          title: '暑期阅读计划',
          content: '图书馆推出暑期阅读计划，鼓励学生在假期多读书、读好书。参与计划的学生可以获得阅读积分，积分可以兑换精美礼品。',
          created_at: '2026-04-07T14:00:00.000Z'
        },
        {
          id: 5,
          title: '作家讲座系列',
          content: '图书馆将举办作家讲座系列活动，邀请知名作家分享创作经验和读书心得。首场讲座将于4月15日举行，欢迎广大读者参加。',
          created_at: '2026-04-06T16:20:00.000Z'
        },
        {
          id: 6,
          title: '儿童阅读专区开放',
          content: '图书馆新开设了儿童阅读专区，为3-12岁的儿童提供适合的图书和阅读环境。专区内有丰富的绘本、童话、科普读物等，欢迎家长带孩子前来阅读。',
          created_at: '2026-04-05T10:00:00.000Z'
        }
      ],
      // 通知公告数据
      notifications: [
        {
          id: 1,
          title: '系统上线通知',
          content: '图书借阅管理系统正式上线，欢迎使用！系统提供图书查询、借阅、预约等功能，为读者提供更加便捷的服务。',
          created_at: '2026-04-10T11:04:55.000Z'
        },
        {
          id: 2,
          title: '图书馆开放时间调整',
          content: '自4月15日起，图书馆开放时间调整为周一至周五 8:00-22:00，周六至周日 9:00-21:00，节假日另行通知。',
          created_at: '2026-04-09T15:20:00.000Z'
        },
        {
          id: 3,
          title: '借阅规则更新',
          content: '图书馆借阅规则已更新，读者可借图书数量调整为本科生10本，研究生15本，教师20本，借阅期限为30天，可续借一次。',
          created_at: '2026-04-08T10:10:00.000Z'
        },
        {
          id: 4,
          title: '数据库培训通知',
          content: '图书馆将于4月20日举办数据库使用培训，内容包括常用数据库的检索技巧和资源利用，欢迎有兴趣的读者参加。',
          created_at: '2026-04-07T14:30:00.000Z'
        },
        {
          id: 5,
          title: '图书捐赠活动',
          content: '图书馆正在开展图书捐赠活动，欢迎读者捐赠闲置图书，为图书馆资源建设贡献力量。捐赠的图书将经过筛选后纳入馆藏。',
          created_at: '2026-04-06T09:45:00.000Z'
        },
        {
          id: 6,
          title: '系统维护通知',
          content: '图书馆系统将于4月12日凌晨2:00-4:00进行维护升级，期间系统可能暂时无法访问，给您带来不便敬请谅解。',
          created_at: '2026-04-05T16:00:00.000Z'
        }
      ],
      // 图书分类
      categories: [
        { id: 1, name: '计算机科学' },
        { id: 2, name: '文学' },
        { id: 3, name: '历史' },
        { id: 4, name: '艺术' },
        { id: 5, name: '科学' }
      ],
      // 用户数据
      users: [
        {
          id: 1,
          username: 'admin',
          name: '管理员',
          role: 'admin',
          registerDate: '2026-04-01'
        },
        {
          id: 2,
          username: 'user1',
          name: '用户1',
          role: 'user',
          registerDate: '2026-04-02'
        },
        {
          id: 3,
          username: 'user2',
          name: '用户2',
          role: 'user',
          registerDate: '2026-04-03'
        }
      ],
      // 最近借阅记录
      recentBorrows: [
        {
          id: 1,
          user: '张三',
          book: 'Java核心技术',
          borrowDate: '2026-04-10',
          returnDate: '2026-05-10',
          status: '借阅中'
        },
        {
          id: 2,
          user: '李四',
          book: '数据结构与算法分析',
          borrowDate: '2026-04-09',
          returnDate: '2026-05-09',
          status: '借阅中'
        },
        {
          id: 3,
          user: '王五',
          book: '计算机网络',
          borrowDate: '2026-04-08',
          returnDate: '2026-05-08',
          status: '借阅中'
        },
        {
          id: 4,
          user: '赵六',
          book: 'JavaScript高级程序设计',
          borrowDate: '2026-04-07',
          returnDate: '2026-05-07',
          status: '已归还'
        }
      ],
      // 用户借阅记录，以用户ID为键
      userBorrows: {},
      // 用户收藏记录，以用户ID为键
      userCollections: {},
      // 统计数据
      stats: {
        books: 1250,
        users: 850,
        borrows: 320,
        overdue: 12
      }
    })

    // 提供全局状态和更新方法
    provide('globalState', globalState)

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

    const updateUser = (userInfo) => {
      user.value = userInfo
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

    // 提供updateUser方法给子组件
    provide('updateUser', updateUser)

    return {
      user,
      isLoggedIn,
      userName,
      isAdmin,
      logout
    }
  }
}

// 创建并挂载应用
const app = createApp(App)
app.use(router)
app.mount('#app')
