import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Header from './header';
import styles from "../styles/admindashboard.module.css"
import { useAuth } from './users/AuthContext';

type User = {
  uid: number;
  name: string;
  email: string;
};

type Post = {
  pid: number;
  title: string;
  content: string;
  category: string;
};

type Comment = {
  comid: number;
  pid: number;
  uid: number;
  content: string;
  createdAt: number;
  username: string;
};

type Category = {
  cid: number;
  name: string;
};

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showUsers, setShowUsers] = useState(false);
  const [showPosts, setShowPosts] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  const fetchUsers = useCallback(async () => { 
    try {
      const response = await axios.get('/api/admin/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchPosts = useCallback(async () => { 
    try {
      const response = await axios.get('/api/admin/posts');
      setPosts(response.data.posts);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchComments = useCallback(async () => { // useCallback 사용
    try {
      const response = await axios.get('/api/admin/comments');
      setComments(response.data.comments);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchCategories = useCallback(async () => { // useCallback 사용
    try {
      const response = await axios.get('/api/admin/categories');
      setCategories(response.data.categories);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    if (user && !user.isAdmin) {
      alert('관리자만 접근 가능합니다.');
    }
    fetchUsers();
    fetchPosts();
    fetchComments();
    fetchCategories();
  }, [user, fetchUsers, fetchPosts, fetchComments, fetchCategories]);

  const toggleUsers = () => {
    setShowUsers(!showUsers);
  };

  const togglePosts = () => {
    setShowPosts(!showPosts);
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  const toggleCategories = () => {
    setShowCategories(!showCategories);
  };





  const deleteUser = async (uid: number) => {
    if (!window.confirm('정말로 이 사용자를 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`/api/admin/users/${uid}`);
      fetchUsers(); // 삭제 후 사용자 목록을 다시 가져옴
    } catch (error) {
      console.error(error);
    }
  };

  const deleteComment = async (comid: number) => {
    if (!window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`/api/admin/comments/${comid}`);
      fetchComments(); // 삭제 후 댓글 목록을 다시 가져옴
    } catch (error) {
      console.error(error);
    }
  };

  const deleteCategory = async (cid: number) => {
    if (!window.confirm('정말로 이 카테고리를 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`/api/admin/categories/${cid}`);
      fetchCategories(); // 삭제 후 카테고 목록을 다시 가져옴
    } catch (error) {
      console.error(error);
    }
  };
  const deletePost = async (pid: number) => {
    console.log(pid);

    if (!window.confirm('정말로 이 게시물을 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`/api/admin/posts/${pid}`);
      fetchPosts(); // 삭제 후 게시물 리스트를 다시 가져옴
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Header />
      {user && user.isAdmin && (
        <div className={styles.dashboard}>
          <h2>관리자 대시보드</h2>
  
          <div className={styles.section} onClick={toggleUsers}>
            <h3>사용자 관리</h3>
          </div>
          {showUsers && users.map((user, index) => (
            <div key={user.uid + user.name + index} className={styles.userinfo}>
              <p>{user.name} ({user.email})</p>
              <button onClick={() => deleteUser(user.uid)}>삭제</button>
            </div>
          ))}
  
          <div className={styles.section} onClick={togglePosts}>
            <h3>게시글 관리</h3>
          </div>
          {showPosts &&
            posts.map((post, index) => (
              <div key={post.pid + post.title + index} className={styles.postinfo}>
                <p>{post.title}</p>
                <button onClick={() => deletePost(post.pid)}>삭제</button>
              </div>
            ))}
  
          <div className={styles.section} onClick={toggleComments}>
            <h3>댓글 관리</h3>
          </div>
  
          {showComments && comments.map((comment) => (
            <div key={comment.comid} className={styles.commentinfo}>
              <p>{comment.username} ({new Date(comment.createdAt)
                .toLocaleString("ko-KR", { timeZone: 'UTC', year: "numeric", month: "long", day: "numeric" })}): {comment.content}</p>
              <button onClick={() => deleteComment(comment.comid)}>삭제</button>
            </div>
          ))}
  
          <div className={styles.section} onClick={toggleCategories}>
            <h3>카테고리 관리</h3>
          </div>
          {showCategories && categories.map((category, index) => (
            <div key={category.cid + category.name + index} className={styles.categoryinfo}>
              <p>{category.name}</p>
              <button onClick={() => deleteCategory(category.cid)}>삭제</button>
            </div>
          ))}
        </div>
      )}
    </>
  );
  
};

export default AdminDashboard;