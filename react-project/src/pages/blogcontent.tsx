import React, { useState, useEffect, useCallback } from "react";
import styles from "../styles/blogcontent.module.css";
import Header from "./header";
import { useParams } from "react-router-dom";
import sanitizeHtml from "sanitize-html";
import { sanitizeOptions } from "../config/sanitizeOptions"
import axios from "axios";
import { useAuth } from "./users/AuthContext";

type PostParams = {
  pid: string;
};

type Comment = {
  uid: string;
  username: string;
  content: string;
  createdAt: number;
};

function createMarkup(content: string) {
  const sanitizedHtml = sanitizeHtml(content, sanitizeOptions);
  return { __html: sanitizedHtml };
}

export default function Home() {
  const [post, setPost] = useState({ content: "Loading...", title: "Loading..." });
  const [likes, setLikes] = useState<number>(0);
  const [userLiked, setUserLiked] = useState<boolean | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  // `useParams()`를 사용하여 URL에서 `pid`를 가져옵니다.
  const { pid } = useParams<PostParams>();
  const { user } = useAuth();

  const handleLike = async () => {
    if (user) {
      // 현재 로그인한 사용자의 ID(uid)
      const { uid } = user;
  
      try {
        await axios.post(`/api/posts/${pid}/likes/toggle`, { uid });
  
        if (userLiked !== null) {
          setUserLiked(!userLiked);
        }
  
        // 좋아요 상태에 따라 좋아요 개수를 증가 또는 감소시킵니다.
        if (userLiked) {
          setLikes((prev) => prev - 1);
        } else {
          setLikes((prev) => prev + 1);
        }
      } catch (error) {
        console.error("Error toggling like:", error);
      }
    } else {
      alert("좋아요를 누르려면 로그인하세요.");
    }
  };
  

  // 좋아요 수 가져오기 함수
  const fetchLikes = useCallback(async () => {
    try {
      const response = await axios.get(`/api/posts/${pid}/likes`);
      setLikes(response.data.likes);
    } catch (error) {
      console.error("Error fetching likes:", error);
    }
  }, [pid]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const commentInput = e.target as HTMLFormElement;
    const commentText = commentInput.comment.value;

    if (user) {
      // 현재 로그인한 사용자의 ID(uid)와 이름(username)
      const { uid, name } = user;
      const createdAt = Date.now();
      try {
        await axios.post(`/api/posts/${pid}/comments`, { uid, username: name, content: commentText, createdAt });
        setComments((prev) => [...prev, { uid: uid.toString(), username: name, content: commentText, createdAt }]); // uid 자료형 수정
        commentInput.reset();
      } catch (error) {
        console.error("Error adding comment:", error);
      }
    } else {
      alert("댓글을 작성하려면 로그인하세요.");
    }
  };
  // 댓글 목록 가져오기 함수
  const fetchComments = useCallback(async () => {
    try {
      const response = await axios.get(`/api/posts/${pid}/comments`);
      setComments(response.data.comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  }, [pid]);
  
  const fetchUserLike = useCallback(async () => {
    if (user) {
      try {
        const response = await axios.get(`/api/posts/${pid}/likes/${user.uid}`);
        setUserLiked(response.data.liked);
      } catch (error) {
        console.error("Error fetching user like:", error);
      }
    }
  }, [pid, user]);


  useEffect(() => {
    fetch(`/api/posts/${pid}`)
      .then((response) => response.json())
      .then((data) => setPost(data))
      .catch((error) => {
        console.error("Error fetching data:", error);
        setPost({ content: "Error loading content", title: "Error loading title" });
      });
    fetchLikes();
    fetchUserLike();
    fetchComments();
  }, [pid, fetchLikes, fetchUserLike, fetchComments]);
  
  return (
    <>
      <Header />
      <div className={styles.outerContainer}>
        <div></div>

        <div className={styles.container1}>
          <div className={styles.header}>{post.title}</div>

          <div className={styles.item1} dangerouslySetInnerHTML={createMarkup(post.content)}></div>
          <div className={styles.like}><button onClick={handleLike}>&#10084; : {likes}</button></div>
          <div className={styles.commentSection}>
            <h3>댓글</h3>
            <form onSubmit={handleSubmitComment} className={styles.commentForm}>
              <input type="text" name="comment" placeholder="댓글을 입력하세요..." className={styles.commentInput} />
              <button type="submit" className={styles.commentButton}>등록</button>
            </form>
            <ul className={styles.commentList}>
              {
                comments.map((comment, index) => (
                  <li key={index} className={styles.commentItem}>
                    <strong> &lt;{comment.username}&gt; </strong>{" "}
                    <span className={styles.commentDate}>({
                      new Date(comment.createdAt)
                        .toLocaleString("ko-KR", { timeZone: 'UTC', year: "numeric", month: "long", day: "numeric" })} 
                      )</span> : {comment.content}
                  </li>
                ))
              }
            </ul>
          </div>

        </div>
      </div>
    </>
  );
}
