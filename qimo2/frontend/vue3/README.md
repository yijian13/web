# 图书借阅管理系统 - Vue 3 前端

## 项目简介

这是一个使用Vue 3 + Vite + Vue Router构建的图书借阅管理系统前端项目，包含以下功能：

- 首页（轮播图、热门图书、图书资讯、通知公告）
- 图书列表（搜索、分类筛选、分页）
- 图书详情
- 图书资讯
- 通知公告
- 用户登录/注册
- 个人中心
- 管理员后台

## 技术栈

- Vue 3 (Composition API)
- Vite
- Vue Router
- Bootstrap 5

## 如何运行

1. 安装依赖

```bash
npm install
```

2. 启动开发服务器

```bash
npm run dev
```

3. 构建生产版本

```bash
npm run build
```

4. 预览生产构建

```bash
npm run preview
```

## 项目结构

```
vue3/
├── src/
│   ├── router/         # 路由配置
│   ├── views/          # 页面组件
│   ├── App.vue         # 根组件
│   └── main.js         # 入口文件
├── index.html          # HTML模板
├── package.json        # 项目配置
├── vite.config.js      # Vite配置
└── README.md           # 项目说明
```

## 注意事项

- 确保后端服务运行在 http://localhost:3000
- 前端开发服务器运行在 http://localhost:3000（通过Vite代理转发API请求）
