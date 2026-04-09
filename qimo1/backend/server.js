const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const SECRET_KEY = 'your-secret-key';

// 模拟数据库
// 用户表
let users = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin', name: '管理员', email: 'admin@example.com', avatar: '' },
  { id: 2, username: 'user1', password: 'user123', role: 'user', name: '用户1', email: 'user1@example.com', avatar: '' }
];

// 书目类型表
let categories = [
  { id: 1, name: '计算机科学', description: '计算机相关书籍' },
  { id: 2, name: '文学', description: '文学作品' },
  { id: 3, name: '历史', description: '历史类书籍' },
  { id: 4, name: '艺术', description: '艺术类书籍' },
  { id: 5, name: '科学', description: '科学类书籍' }
];

// 图书表
let books = [
  { id: 1, title: 'JavaScript高级程序设计', author: 'Nicholas C. Zakas', category_id: 1, publish_date: '2020-01-01', description: 'JavaScript权威指南', cover: '' },
  { id: 2, title: 'Python编程：从入门到实践', author: 'Eric Matthes', category_id: 1, publish_date: '2019-06-01', description: 'Python入门书籍', cover: '' },
  { id: 3, title: 'Java核心技术', author: 'Cay S. Horstmann', category_id: 1, publish_date: '2021-02-01', description: 'Java经典教程', cover: '' },
  { id: 4, title: '数据结构与算法分析', author: 'Mark Allen Weiss', category_id: 1, publish_date: '2019-12-01', description: '数据结构与算法', cover: '' },
  { id: 5, title: '计算机网络', author: 'Andrew S. Tanenbaum', category_id: 1, publish_date: '2020-05-01', description: '计算机网络教程', cover: '' },
  { id: 6, title: '红楼梦', author: '曹雪芹', category_id: 2, publish_date: '1982-01-01', description: '中国古典文学名著', cover: '' },
  { id: 7, title: '三国演义', author: '罗贯中', category_id: 2, publish_date: '1980-01-01', description: '中国古典文学名著', cover: '' },
  { id: 8, title: '史记', author: '司马迁', category_id: 3, publish_date: '1959-01-01', description: '中国历史名著', cover: '' },
  // 艺术类书籍
  { id: 9, title: '艺术的故事', author: '贡布里希', category_id: 4, publish_date: '2018-01-01', description: '艺术史经典著作', cover: '' },
  { id: 10, title: '写给大家的西方美术史', author: '蒋勋', category_id: 4, publish_date: '2019-03-01', description: '西方美术史入门书籍', cover: '' },
  { id: 11, title: '中国美术史', author: '李泽厚', category_id: 4, publish_date: '2020-05-01', description: '中国美术史经典著作', cover: '' },
  // 科学类书籍
  { id: 12, title: '时间简史', author: '史蒂芬·霍金', category_id: 5, publish_date: '2017-08-01', description: '科普经典著作', cover: '' },
  { id: 13, title: '万物理论', author: '史蒂芬·霍金', category_id: 5, publish_date: '2019-02-01', description: '霍金的科学思想', cover: '' },
  { id: 14, title: '宇宙', author: '卡尔·萨根', category_id: 5, publish_date: '2018-11-01', description: '宇宙科学普及读物', cover: '' }
];

// 图书副本表
let book_copies = [];
// 为每本书创建3个副本
books.forEach(book => {
  for (let i = 1; i <= 3; i++) {
    book_copies.push({
      id: book_copies.length + 1,
      book_id: book.id,
      status: '可借', // 可借、已借出、损坏
      borrow_date: null,
      borrower_id: null
    });
  }
});

// 借阅记录表
let borrow_records = [];

// 归还记录表
let return_records = [];

// 收藏表
let collections = [];

// 通知公告表
let notifications = [
  { id: 1, title: '系统上线通知', content: '图书借阅管理系统正式上线，欢迎使用！', created_at: new Date().toISOString() },
  { id: 2, title: '关于我们', content: '我们是一个致力于为读者提供优质图书资源的图书馆。', created_at: new Date().toISOString() },
  { id: 3, title: '联系方式', content: '电话：12345678900，邮箱：contact@library.com', created_at: new Date().toISOString() }
];

// 图书资讯表
let book_news = [
  { id: 1, title: '2026年新书推荐', content: '2026年最新图书推荐，包括计算机、文学、历史等多个类别。', created_at: new Date().toISOString() },
  { id: 2, title: '读书节活动', content: '4月23日世界读书日，图书馆将举办读书节活动，欢迎参加！', created_at: new Date().toISOString() }
];



// 轮播图
let carousels = [
  { id: 1, image: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%221200%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%201200%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_15e8781e618%20text%20%7B%20fill%3A%23555%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A60pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_15e8781e618%22%3E%3Crect%20width%3D%221200%22%20height%3D%22400%22%20fill%3D%22%23777%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22480%22%20y%3D%22218%22%3E欢迎来到图书馆%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E', title: '欢迎来到图书馆', link: '#' },
  { id: 2, image: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%221200%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%201200%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_15e8781e618%20text%20%7B%20fill%3A%23555%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A60pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_15e8781e618%22%3E%3Crect%20width%3D%221200%22%20height%3D%22400%22%20fill%3D%22%23666%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22490%22%20y%3D%22218%22%3E阅读的乐趣%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E', title: '阅读的乐趣', link: '#' },
  { id: 3, image: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%221200%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%201200%20400%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_15e8781e618%20text%20%7B%20fill%3A%23555%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A60pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_15e8781e618%22%3E%3Crect%20width%3D%221200%22%20height%3D%22400%22%20fill%3D%22%23555%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22480%22%20y%3D%22218%22%3E新书推荐%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E', title: '新书推荐', link: '#' }
];

// 生成JWT token
function generateToken(user) {
  return Buffer.from(JSON.stringify({ id: user.id, username: user.username, role: user.role })).toString('base64');
}

// 验证JWT token
function verifyToken(token) {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    return decoded;
  } catch (error) {
    return null;
  }
}

// 处理CORS
function handleCors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }
  return false;
}

// 解析请求体
function parseBody(req, callback) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    try {
      callback(JSON.parse(body));
    } catch (error) {
      callback({});
    }
  });
}

// 创建HTTP服务器
const server = http.createServer((req, res) => {
  // 处理CORS
  if (handleCors(req, res)) {
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // 注册接口
  if (pathname === '/api/register' && method === 'POST') {
    parseBody(req, (body) => {
      const { username, password, name, email } = body;
      
      // 检查用户名是否已存在
      if (users.find(u => u.username === username)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ code: 400, message: '用户名已存在' }));
        return;
      }
      
      // 创建新用户
      const newUser = {
        id: users.length + 1,
        username,
        password,
        role: 'user',
        name: name || username,
        email: email || '',
        avatar: ''
      };
      users.push(newUser);
      
      // 生成token
      const token = generateToken(newUser);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ code: 200, message: 'success', data: { token, user: newUser } }));
    });
    return;
  }

  // 登录接口
  if (pathname === '/api/login' && method === 'POST') {
    parseBody(req, (body) => {
      const { username, password } = body;
      
      const user = users.find(u => u.username === username);
      if (!user || user.password !== password) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ code: 401, message: '用户名或密码错误' }));
        return;
      }

      // 生成token
      const token = generateToken(user);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ code: 200, message: 'success', data: { token, user } }));
    });
    return;
  }

  // 公开API - 不需要认证
  // 获取轮播图
  if (pathname === '/api/carousels' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ code: 200, message: 'success', data: carousels }));
    return;
  }

  // 获取通知公告
  if (pathname === '/api/notifications' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ code: 200, message: 'success', data: notifications }));
    return;
  }

  // 获取图书资讯
  if (pathname === '/api/book-news' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ code: 200, message: 'success', data: book_news }));
    return;
  }

  // 获取图书列表
  if (pathname === '/api/books' && method === 'GET') {
    const { category_id, query } = parsedUrl.query;
    let filteredBooks = books;
    
    if (category_id) {
      filteredBooks = filteredBooks.filter(book => book.category_id == category_id);
    }
    
    if (query) {
      filteredBooks = filteredBooks.filter(book => 
        book.title.includes(query) || book.author.includes(query)
      );
    }
    
    // 获取每本书的可借数量
    const booksWithStatus = filteredBooks.map(book => {
      const copies = book_copies.filter(copy => copy.book_id === book.id);
      const availableCount = copies.filter(copy => copy.status === '可借').length;
      const totalCount = copies.length;
      return {
        ...book,
        available_count: availableCount,
        total_count: totalCount
      };
    });
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ code: 200, message: 'success', data: booksWithStatus }));
    return;
  }

  // 获取图书详情
  if (pathname.match(/^\/api\/books\/\d+$/) && method === 'GET') {
    const id = parseInt(pathname.split('/').pop());
    const book = books.find(book => book.id === id);
    if (!book) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ code: 404, message: '图书不存在' }));
      return;
    }
    
    // 获取图书副本信息
    const copies = book_copies.filter(copy => copy.book_id === id);
    const availableCount = copies.filter(copy => copy.status === '可借').length;
    const totalCount = copies.length;
    
    // 不需要认证的字段
    const bookDetails = {
      ...book,
      available_count: availableCount,
      total_count: totalCount
    };
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ code: 200, message: 'success', data: bookDetails }));
    return;
  }

  // 需要验证token的接口
  const token = req.headers.authorization;
  const decodedUser = verifyToken(token);
  if (!decodedUser) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ code: 401, message: '未授权' }));
    return;
  }
  
  // 权限控制
  const isUser = decodedUser.role === 'user';
  const isAdmin = decodedUser.role === 'admin';

  // 借书
  if (pathname === '/api/borrow' && method === 'POST') {
    parseBody(req, (body) => {
      const { book_id } = body;
      const bookId = parseInt(book_id);
      
      // 查找可借的图书副本
      const availableCopy = book_copies.find(copy => copy.book_id === bookId && copy.status === '可借');
      if (!availableCopy) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ code: 400, message: '没有可借的图书' }));
        return;
      }
      
      // 更新副本状态
      availableCopy.status = '已借出';
      availableCopy.borrow_date = new Date().toISOString();
      availableCopy.borrower_id = decodedUser.id;
      
      // 创建借阅记录
      const borrowRecord = {
        id: borrow_records.length + 1,
        user_id: decodedUser.id,
        book_id: bookId,
        copy_id: availableCopy.id,
        borrow_date: availableCopy.borrow_date,
        status: '已借出', // 已借出、已归还、逾期
        created_at: new Date().toISOString()
      };
      borrow_records.push(borrowRecord);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ code: 200, message: 'success', data: borrowRecord }));
    });
    return;
  }

  // 还书
  if (pathname === '/api/return' && method === 'POST') {
    parseBody(req, (body) => {
      const { borrow_id } = body;
      
      // 查找借阅记录
      const borrowRecord = borrow_records.find(record => record.id === borrow_id && record.user_id === decodedUser.id);
      if (!borrowRecord) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ code: 404, message: '借阅记录不存在' }));
        return;
      }
      
      if (borrowRecord.status === '已归还') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ code: 400, message: '图书已归还' }));
        return;
      }
      
      // 更新借阅记录状态
      borrowRecord.status = '已归还';
      borrowRecord.return_date = new Date().toISOString();
      
      // 更新图书副本状态
      const copy = book_copies.find(copy => copy.id === borrowRecord.copy_id);
      if (copy) {
        copy.status = '可借';
        copy.borrow_date = null;
        copy.borrower_id = null;
      }
      
      // 创建归还记录
      const returnRecord = {
        id: return_records.length + 1,
        user_id: decodedUser.id,
        borrow_id,
        book_id: borrowRecord.book_id,
        return_date: borrowRecord.return_date,
        status: '待审核', // 待审核、已通过、已拒绝
        created_at: new Date().toISOString()
      };
      return_records.push(returnRecord);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ code: 200, message: 'success', data: returnRecord }));
    });
    return;
  }

  // 获取用户借阅记录
  if (pathname === '/api/user/borrow-records' && method === 'GET') {
    const userBorrows = borrow_records.filter(record => record.user_id === decodedUser.id);
    // 关联图书信息
    const borrowsWithBook = userBorrows.map(record => {
      const book = books.find(book => book.id === record.book_id);
      return {
        ...record,
        book: book || null
      };
    });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ code: 200, message: 'success', data: borrowsWithBook }));
    return;
  }

  // 获取用户归还记录
  if (pathname === '/api/user/return-records' && method === 'GET') {
    const userReturns = return_records.filter(record => record.user_id === decodedUser.id);
    // 关联图书信息
    const returnsWithBook = userReturns.map(record => {
      const borrowRecord = borrow_records.find(br => br.id === record.borrow_id);
      const book = borrowRecord ? books.find(book => book.id === borrowRecord.book_id) : null;
      return {
        ...record,
        book: book || null
      };
    });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ code: 200, message: 'success', data: returnsWithBook }));
    return;
  }

  // 获取用户收藏
  if (pathname === '/api/user/collections' && method === 'GET') {
    const userCollections = collections.filter(col => col.user_id === decodedUser.id);
    // 关联图书信息
    const collectionsWithBook = userCollections.map(col => {
      if (col.target_type === 'book') {
        const book = books.find(book => book.id === col.target_id);
        return {
          ...col,
          book: book || null
        };
      }
      return col;
    });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ code: 200, message: 'success', data: collectionsWithBook }));
    return;
  }



  // 获取用户信息
  if (pathname === '/api/user/info' && method === 'GET') {
    const user = users.find(u => u.id === decodedUser.id);
    if (!user) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ code: 404, message: '用户不存在' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ code: 200, message: 'success', data: user }));
    return;
  }

  // 更新用户信息
  if (pathname === '/api/user/info' && method === 'PUT') {
    parseBody(req, (body) => {
      const { name, email, avatar } = body;
      const user = users.find(u => u.id === decodedUser.id);
      if (!user) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ code: 404, message: '用户不存在' }));
        return;
      }
      
      if (name) user.name = name;
      if (email) user.email = email;
      if (avatar) user.avatar = avatar;
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ code: 200, message: 'success', data: user }));
    });
    return;
  }

  // 修改密码
  if (pathname === '/api/user/change-password' && method === 'POST') {
    parseBody(req, (body) => {
      const { old_password, new_password } = body;
      const user = users.find(u => u.id === decodedUser.id);
      if (!user || user.password !== old_password) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ code: 400, message: '原密码错误' }));
        return;
      }
      
      user.password = new_password;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ code: 200, message: 'success' }));
    });
    return;
  }

  // 管理员接口
  if (isAdmin) {
    // 获取用户列表
    if (pathname === '/api/admin/users' && method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ code: 200, message: 'success', data: users }));
      return;
    }

    // 添加用户
    if (pathname === '/api/admin/users' && method === 'POST') {
      parseBody(req, (body) => {
        const { username, password, role, name, email } = body;
        
        if (users.find(u => u.username === username)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ code: 400, message: '用户名已存在' }));
          return;
        }
        
        const newUser = {
          id: users.length + 1,
          username,
          password,
          role: role || 'user',
          name: name || username,
          email: email || '',
          avatar: ''
        };
        users.push(newUser);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ code: 200, message: 'success', data: newUser }));
      });
      return;
    }

    // 删除用户
    if (pathname.match(/^\/api\/admin\/users\/\d+$/) && method === 'DELETE') {
      const id = parseInt(pathname.split('/').pop());
      const userIndex = users.findIndex(u => u.id === id);
      if (userIndex === -1) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ code: 404, message: '用户不存在' }));
        return;
      }
      users.splice(userIndex, 1);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ code: 200, message: 'success' }));
      return;
    }

    // 获取所有借阅记录
    if (pathname === '/api/admin/borrow-records' && method === 'GET') {
      // 关联用户和图书信息
      const borrowsWithDetails = borrow_records.map(record => {
        const user = users.find(u => u.id === record.user_id);
        const book = books.find(b => b.id === record.book_id);
        return {
          ...record,
          user: user || null,
          book: book || null
        };
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ code: 200, message: 'success', data: borrowsWithDetails }));
      return;
    }

    // 获取所有归还记录
    if (pathname === '/api/admin/return-records' && method === 'GET') {
      // 关联用户和图书信息
      const returnsWithDetails = return_records.map(record => {
        const user = users.find(u => u.id === record.user_id);
        const borrowRecord = borrow_records.find(br => br.id === record.borrow_id);
        const book = borrowRecord ? books.find(b => b.id === borrowRecord.book_id) : null;
        return {
          ...record,
          user: user || null,
          book: book || null
        };
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ code: 200, message: 'success', data: returnsWithDetails }));
      return;
    }

    // 审核归还记录
    if (pathname.match(/^\/api\/admin\/return-records\/\d+\/approve$/) && method === 'POST') {
      const id = parseInt(pathname.split('/')[4]);
      const returnRecord = return_records.find(r => r.id === id);
      if (!returnRecord) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ code: 404, message: '归还记录不存在' }));
        return;
      }
      returnRecord.status = '已通过';
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ code: 200, message: 'success', data: returnRecord }));
      return;
    }

    // 添加图书
    if (pathname === '/api/admin/books' && method === 'POST') {
      parseBody(req, (body) => {
        const { title, author, category_id, publish_date, description, cover } = body;
        const newBook = {
          id: books.length + 1,
          title,
          author,
          category_id,
          publish_date,
          description,
          cover
        };
        books.push(newBook);
        
        // 创建3个副本
        for (let i = 1; i <= 3; i++) {
          book_copies.push({
            id: book_copies.length + 1,
            book_id: newBook.id,
            status: '可借',
            borrow_date: null,
            borrower_id: null
          });
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ code: 200, message: 'success', data: newBook }));
      });
      return;
    }

    // 删除图书
    if (pathname.match(/^\/api\/admin\/books\/\d+$/) && method === 'DELETE') {
      const id = parseInt(pathname.split('/').pop());
      const bookIndex = books.findIndex(b => b.id === id);
      if (bookIndex === -1) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ code: 404, message: '图书不存在' }));
        return;
      }
      books.splice(bookIndex, 1);
      // 删除相关副本
      book_copies = book_copies.filter(copy => copy.book_id !== id);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ code: 200, message: 'success' }));
      return;
    }

    // 添加通知公告
    if (pathname === '/api/admin/notifications' && method === 'POST') {
      parseBody(req, (body) => {
        const { title, content } = body;
        const newNotification = {
          id: notifications.length + 1,
          title,
          content,
          created_at: new Date().toISOString()
        };
        notifications.push(newNotification);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ code: 200, message: 'success', data: newNotification }));
      });
      return;
    }

    // 添加图书资讯
    if (pathname === '/api/admin/book-news' && method === 'POST') {
      parseBody(req, (body) => {
        const { title, content } = body;
        const newNews = {
          id: book_news.length + 1,
          title,
          content,
          created_at: new Date().toISOString()
        };
        book_news.push(newNews);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ code: 200, message: 'success', data: newNews }));
      });
      return;
    }
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ code: 404, message: '接口不存在' }));
  return;
});

// 启动服务器
server.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});