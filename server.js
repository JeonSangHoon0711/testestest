const express = require('express');
const app = express();
const path = require('path');
const dbConnection = require('./config/db');
const bcrypt = require('bcrypt');
const session = require("express-session");


app.use(express.json());
var cors = require('cors');

app.use(
  cors({
    origin: "http://100.120.230.131:3000", // 클라이언트의 URL을 입력해주세요.
    credentials: true,
  })
);

app.use(express.static(path.join(__dirname, 'react-project/build')));

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // HTTPS 사용 여부에 따라 true나 false로 지정합니다.
      maxAge: 3600 * 1000, // 쿠키 만료 시간(1시간)
    },
  })
);

app.get('/', function (req, res) {
  console.log("hi");
  res.sendFile(path.join(__dirname, 'react-project/build/index.html'));
});



app.get('/api/posts/:pid', (req, res) => {
  const { pid } = req.params;
  dbConnection.query('SELECT * FROM post WHERE pid = ?', [pid], (error, results) => {
    if (error) {
      return res.status(500).json({ error });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json(results[0]);
  });
});


app.get('/api/categories', function (req, res) {
  dbConnection.query('SELECT * FROM category', (error, results) => {
    if (error) {
      return res.status(500).json({ error });
    }
    res.status(200).json({ categories: results });
  });
});

app.get('/api/posts', (req, res) => {
  const categoryId = req.query.cid;

  let sqlQuery = 'SELECT post.pid, post.title, post.content, category.name as category_name FROM post JOIN category ON post.cid = category.cid';

  if (categoryId) {
    sqlQuery += ` WHERE post.cid = ${categoryId}`;
  }

  sqlQuery += ' ORDER BY post.pid DESC';

  dbConnection.query(sqlQuery, (error, results) => {
    if (error) {
      return res.status(500).json({ error });
    }
    res.status(200).json({ posts: results });
  });
});

app.get('/api/mainpage/limited', (req, res) => {
  dbConnection.query('SELECT * FROM post ORDER BY pid DESC LIMIT 8', (error, results) => {
    if (error) {
      return res.status(500).json({ error });
    }
    res.status(200).json({ posts: results });
  });
});


app.post('/api/categories', (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Category name is required" });
  }

  dbConnection.query('INSERT INTO category SET ?', { name: name }, (error, results) => {
    if (error) {
      return res.status(500).json({ error });
    }
    res.status(201).json({ cid: results.insertId });
  });
});



app.post('/api/posts', (req, res) => {
  const { title, content, category_id, uid } = req.body;

  if (!title || !content || !category_id || !uid) {
    return res.status(400).json({ error: "Title, content, category_id, and uid are required" });
  }

  // 현재 날짜를 가져옵니다.
  const currentDate = new Date().toISOString().slice(0, 10);

  dbConnection.query(
    'INSERT INTO post SET ?',
    {
      uid: uid,
      cid: category_id,
      title: title,
      content: content,
      writedate: currentDate,
    },
    (error, results) => {
      if (error) {
        return res.status(500).json({ error });
      }
      res.status(201).json({ pid: results.insertId });
    }
  );
});



app.post('/api/register', async (req, res) => {
  // 사용자로부터 전달 받은 데이터를 추출
  const { name, email, password } = req.body;

  // 필수 입력 항목 확인
  if (!name || !email || !password) {
    return res.status(400).json({ error: "이름, 이메일, 비밀번호를 입력해 주세요." });
  }

  // 이메일 중복 확인
  dbConnection.query("SELECT * FROM user WHERE email = ?", [email], async (error, results) => {
    if (error) {
      return res.status(500).json({ error: "이메일 중복 확인 중 오류가 발생했습니다. 다시 시도해주세요." });
    }

    if (results.length > 0) {
      return res.status(409).json({ error: "이메일이 이미 사용중입니다." });
    }
    
    try {
      // 소금 생성
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);

      // 비밀번호 해싱
      const hashedPassword = await bcrypt.hash(password, salt);

      // 이메일이 존재하지 않으면 회원가입 진행
      dbConnection.query(
        "INSERT INTO user (name, email, password) VALUES (?, ?, ?)",
        [name, email, hashedPassword],
        (error, results) => {
          if (error) {
            return res.status(500).json({ error: "회원가입 중 오류가 발생했습니다. 다시 시도해주세요." });
          }

          res.status(201).json({ message: "회원가입 성공", userId: results.insertId });
        }
      );
    } catch (error) {
      return res.status(500).json({ error: "알 수 없는 서버 오류 발생. 다시 시도해주세요." });
    }
  });
});


app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  dbConnection.query("SELECT * FROM user WHERE email = ?", [email], async (error, results) => {
    if (error || results.length === 0) {
      return res.status(404).json({ error });
    }
    
    const user = results[0];
    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (isPasswordMatched) {
      req.session.user = {
        id: user.uid,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin, // isAdmin 속성을 추가합니다.
      };

      // 로그인 응답에 userData 항목을 추가하고 사용자 데이터를 포함시킵니다.
      res.status(200).json({
        message: "로그인 완료",
        userData: {
          uid: user.uid,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin, // 응답 JSON의 userData 객체에 isAdmin 필드를 추가합니다.
        },
      });
    } else {
      res.status(401).json({ error });
    }
  });
});


app.get('/api/user', (req, res) => {
  if (req.session.user) {
    // 로그인한 사용자가 있는 경우, 사용자 정보를 반환합니다.
    res.status(200).json({ user: req.session.user });
  } else {
    // 로그인한 사용자가 없는 경우, 에러 메시지를 반환합니다.
    console.log("로그인안됨")
    res.status(400).json({error: '로그인이 되어있지 않습니다.'});
  }
});


// 좋아요 추가 API
app.post("/api/posts/:pid/likes", (req, res) => {
  const { pid } = req.params;
  const { uid } = req.body;

  if (!uid) {
    return res.status(400).json({ error: "User ID is required" });
  }

  const currentDate = new Date().toISOString().slice(0, 10);

  dbConnection.query(
    "INSERT INTO likes (uid, pid, likedate) VALUES (?, ?, ?)",
    [uid, pid, currentDate],
    (error, results) => {
      if (error) {
        return res.status(500).json({ error });
      }
      res.status(201).json({ lid: results.insertId });
    }
  );
});

// 특정 게시물의 좋아요 개수 조회 API
app.get("/api/posts/:pid/likes", (req, res) => {
  const { pid } = req.params;

  dbConnection.query(
    "SELECT COUNT(*) AS like_count FROM likes WHERE pid = ?",
    [pid],
    (error, results) => {
      if (error) {
        return res.status(500).json({ error });
      }
      res.status(200).json({ likes: results[0].like_count });
    }
  );
});

app.post("/api/posts/:pid/likes/toggle", (req, res) => {
  const { pid } = req.params;
  const { uid } = req.body;

  if (!uid) {
    return res.status(400).json({ error: "User ID is required" });
  }

  const currentDate = new Date().toISOString().slice(0, 10);

  dbConnection.query("SELECT * FROM likes WHERE uid = ? AND pid = ?", [uid, pid], async (error, results) => {
    if (error) {
      console.error("좋아요 조회 중 오류가 발생했습니다.", error);
      return res.status(500).json({ error: "좋아요 조회 중 오류가 발생했습니다." });
    }

    try {
      // 기존 좋아요가 있을 경우
      if (results.length > 0) {
        await dbConnection.query("DELETE FROM likes WHERE uid = ? AND pid = ?", [uid, pid]);
      } else {
        // 좋아요가 없을 경우
        await dbConnection.query("INSERT INTO likes (uid, pid, likedate) VALUES (?, ?, ?)", [uid, pid, currentDate]);
      }

      res.status(200).json({ message: "좋아요 상태 업데이트" });
    } catch (error) {
      console.error("서버 오류 발생:", error);
      res.status(500).json({ error: "서버 오류가 발생했습니다." });
    }
  });
});

app.get("/api/posts/:pid/likes/:uid", (req, res) => {
  const { pid, uid } = req.params;

  dbConnection.query("SELECT * FROM likes WHERE pid = ? AND uid = ?", [pid, uid], (error, results) => {
    if (error) {
      return res.status(500).json({ error });
    }

    if (results.length === 0) {
      res.status(200).json({ liked: false });
    } else {
      res.status(200).json({ liked: true });
    }
  });
});


// 댓글 추가 API
app.post("/api/posts/:pid/comments", (req, res) => {
  const { pid } = req.params;
  const { uid, content } = req.body;

  if (!uid || !content) {
    return res.status(400).json({ error: "User ID and content are required" });
  }

  const currentDate = new Date().toISOString().slice(0, 10);

  dbConnection.query(
    "INSERT INTO comments (uid, pid, content, writedate) VALUES (?, ?, ?, ?)",
    [uid, pid, content, currentDate],
    (error, results) => {
      if (error) {
        return res.status(500).json({ error });
      }
      res.status(201).json({ comid: results.insertId });
    }
  );
});


// 특정 게시물의 댓글 조회 API
app.get("/api/posts/:pid/comments", (req, res) => {
  const { pid } = req.params;

  dbConnection.query(
    "SELECT c.comid, c.uid, c.pid, c.content, c.writedate as createdAt, u.name as username FROM comments as c JOIN user as u ON c.uid = u.uid WHERE c.pid = ? ORDER BY c.comid ASC",
    [pid],
    (error, results) => {
      if (error) {
        return res.status(500).json({ error });
      }

      res.status(200).json({ comments: results });
    }
  );
});


app.get('/api/posts/user/:uid', (req, res) => {
  const { uid } = req.params;
  
  dbConnection.query('SELECT * FROM post WHERE uid = ? ORDER BY pid DESC', [uid], (error, results) => {
    if (error) {
      return res.status(500).json({ error });
    }
    res.status(200).json({ posts: results });
  });
});


app.get('/api/comments/user/:uid', (req, res) => {
  const { uid } = req.params;
  
  dbConnection.query(
    'SELECT c.comid, c.uid, c.pid, c.content, c.writedate as createdAt, u.name as username, p.title as postTitle FROM comments as c JOIN user as u ON c.uid = u.uid JOIN post as p ON c.pid = p.pid WHERE c.uid = ? ORDER BY c.comid DESC',
    [uid],
    (error, results) => {
      if (error) {
        return res.status(500).json({ error });
      }
      res.status(200).json({ comments: results });
    }
  );
});

app.get('/api/liked_posts/user/:uid', (req, res) => {
  const { uid } = req.params;
  
  dbConnection.query(
    'SELECT p.pid, p.uid, p.cid, p.title, p.content, p.writedate FROM post as p JOIN likes as l ON p.pid = l.pid WHERE l.uid = ? ORDER BY l.lid DESC',
    [uid],
    (error, results) => {
      if (error) {
        return res.status(500).json({ error });
      }
      res.status(200).json({ posts: results });
    }
  );
});

app.get('/api/admin/users', function (req, res) {
  dbConnection.query('SELECT * FROM user', (error, results) => {
    if (error) {
      return res.status(500).json({ error });
    }
    res.status(200).json({ users: results });
  });
});

app.get('/api/admin/posts', function (req, res) {
  dbConnection.query('SELECT * FROM post', (error, results) => {
    if (error) {
      return res.status(500).json({ error });
    }
    res.status(200).json({ posts: results });
  });
});

app.get('/api/admin/comments', function (req, res) {
  dbConnection.query(
    `SELECT comments.comid, comments.pid, comments.uid, user.name as username, comments.content, comments.writedate as createdAt
    FROM comments
    JOIN user ON comments.uid = user.uid`, 
    (error, results) => {
      if (error) {
        return res.status(500).json({ error });
      }
      res.status(200).json({ comments: results });
    }
  );
});


app.get('/api/admin/categories', function (req, res) {
  dbConnection.query('SELECT * FROM category', (error, results) => {
    if (error) {
      return res.status(500).json({ error });
    }
    res.status(200).json({ categories: results });
  });
});


app.delete('/api/admin/users/:uid', (req, res) => {
  const { uid } = req.params;

  dbConnection.query(
    'DELETE FROM user WHERE uid = ?',
    [uid],
    (error, results) => {
      if (error) {
        console.error('Error:', error);
        return res.status(500).json({ error });
      }
      res.status(200).json({ success: true });
    }
  );
});

app.delete('/api/admin/comments/:comid', (req, res) => {
  const { comid } = req.params;

  dbConnection.query(
    'DELETE FROM comments WHERE comid = ?',
    [comid],
    (error, results) => {
      if (error) {
        console.error('Error:', error);
        return res.status(500).json({ error });
      }
      res.status(200).json({ success: true });
    }
  );
});

app.delete('/api/admin/categories/:cid', (req, res) => {
  const { cid } = req.params;

  dbConnection.query(
    'DELETE FROM category WHERE cid = ?',
    [cid],
    (error, results) => {
      if (error) {
        console.error('Error:', error);
        return res.status(500).json({ error });
      }
      res.status(200).json({ success: true });
    }
  );
});



app.delete('/api/admin/posts/:pid', (req, res) => {
  const { pid } = req.params; // 게시글의 고유 id

  dbConnection.query(
    'DELETE FROM post WHERE pid = ?',
    [pid],
    (error, results) => {
      if (error) {
        console.error('Error:', error); 
        return res.status(500).json({ error });
      }
      res.status(200).json({ success: true });
    }
  );
});



app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'react-project/build/index.html'));
});

app.listen(3000, function () {
  console.log('listening 3000');
});


