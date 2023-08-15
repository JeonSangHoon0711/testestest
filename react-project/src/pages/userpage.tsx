import React, { useState, useEffect, useCallback } from "react";
import styles from "../styles/userpage.module.css";
import Header from './header';
import { useAuth } from "./users/AuthContext";
import { Link } from 'react-router-dom';

type Post = {
  pid: number;
  uid: number;
  cid: number;
  title: string;
  content: string;
  writedate: Date;
}

type Comment = {
  pid: number;
  cid: number;
  uid: number;
  postTitle: string;
  content: string;
  writedate: Date;
}

const UserPage: React.FC = () => {
  const { user } = useAuth();
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [userComments, setUserComments] = useState<Comment[]>([]); // 추가된 상태
  const [likedPosts, setLikedPosts] = useState<Post[]>([]); // 추가된 상태

  const fetchUserComments = useCallback(async () => {
    if (user && user.uid) {
      const response = await fetch(`/api/comments/user/${user.uid}`);
      const data = await response.json();
      setUserComments(data.comments);
    }
  }, [user]);

  const fetchLikedPosts = useCallback(async () => {
    if (user && user.uid) {
      const response = await fetch(`/api/liked_posts/user/${user.uid}`);
      const data = await response.json();
      setLikedPosts(data.posts);
    }
  }, [user]);


  useEffect(() => {
    const fetchUserPosts = async () => {
      if (user && user.uid) {
        const response = await fetch(`/api/posts/user/${user.uid}`);
        const data = await response.json();
        setUserPosts(data.posts);
      }
    };
    fetchUserPosts();
    fetchUserComments(); 
    fetchLikedPosts(); 
  }, [user, fetchUserComments, fetchLikedPosts]);
  return (
    <>
      <Header />
      <div className={styles.userPage}>
        {user ? (
          <>
          <div className={styles.usercontainer}>
            <h1 className={styles.title}>사용자 프로필</h1>
            <p className={styles.userInfo}>
              이름: {user.name}
            </p>
            <p className={styles.userInfo}>
              이메일: {user.email}
            </p>
            </div>

            <div>
              <span className={styles.title}>작성글</span><hr></hr>
              {userPosts.map((post, index) => (
                <div key={index} className={styles.postItem}>
                  <h3>
                    <Link className={styles.link} to={`/blogcontent/${post.pid}`}>
                      {post.title}
                    </Link>
                  </h3>
                  <p className={styles.postContent}>{post.content}</p>
                </div>
              ))}
            </div>
            <div>
              <span className={styles.title}>작성한 댓글</span><hr></hr>
              {userComments.map((comment, index) => (
                <div key={index} className={styles.postItem}>
                  <h3>
                    <Link className={styles.link} to={`/blogcontent/${comment.pid}`}>
                      {comment.postTitle}
                    </Link>
                  </h3>
                  <p className={styles.postContent}>{comment.content}</p>
                </div>
              ))}
            </div>

            <div>
              <span className={styles.title}>좋아요 누른 게시물</span><hr></hr>
              {likedPosts.map((post, index) => (
                <div key={index} className={styles.postItem}>
                  <h3>
                    <Link className={styles.link} to={`/blogcontent/${post.pid}`}>
                      {post.title}
                    </Link>
                  </h3>
                  <p className={styles.postContent}>{post.content}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p>사용자 정보를 불러오는 중...</p>
        )}
      </div>
    </>
  );
};

export default UserPage;