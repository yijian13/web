const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

// 连接数据库
const db = new sqlite3.Database('./book.db', (err) => {
  if (err) {
    console.error('数据库连接失败:', err.message);
  } else {
    console.log('数据库连接成功');
    createTables();
  }
});

// 创建数据表
function createTables() {
  // 创建用户表
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      login_attempts INTEGER DEFAULT 0,
      locked_at TEXT
    )
  `);

  // 创建图书表
  db.run(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      publish_date TEXT NOT NULL,
      status TEXT DEFAULT '可借'
    )
  `);

  // 创建操作日志表
  db.run(`
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      book_id INTEGER,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (book_id) REFERENCES books(id)
    )
  `);

  // 初始化管理员用户
  db.get('SELECT * FROM users WHERE username = ?', ['admin'], (err, row) => {
    if (!row) {
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['admin', hashedPassword, 'admin']);
    }
  });

  // 初始化示例图书数据
  db.get('SELECT COUNT(*) as count FROM books', (err, row) => {
    if (row.count === 0) {
      const books = [
        ['JavaScript高级程序设计', 'Nicholas C. Zakas', '2020-01-01', '可借'],
        ['Python编程：从入门到实践', 'Eric Matthes', '2019-06-01', '可借'],
        ['Java核心技术', 'Cay S. Horstmann', '2021-02-01', '已借出'],
        ['数据结构与算法分析', 'Mark Allen Weiss', '2019-12-01', '可借'],
        ['计算机网络', 'Andrew S. Tanenbaum', '2020-05-01', '可借']
      ];

      const stmt = db.prepare('INSERT INTO books (title, author, publish_date, status) VALUES (?, ?, ?, ?)');
      books.forEach(book => {
        stmt.run(book);
      });
      stmt.finalize();
    }
  });
}

module.exports = db;