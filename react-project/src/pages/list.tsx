import React, { useState, useEffect } from "react";
import Header from "./header";
import styles from "../styles/list.module.css";
import { Link, useParams } from "react-router-dom";
import sanitizeHtml from "sanitize-html";
import axios from "axios";
import { sanitizeOptions } from "../config/sanitizeOptions";

type Post = {
  pid: number;
  title: string;
  content: string;
  category_name: string; 
};

function createMarkup(content: string) {
  const sanitizedHtml = sanitizeHtml(content, sanitizeOptions);
  return { __html: sanitizedHtml };
}

function truncateContent(content: string, maxLength: number) {
  if (content.length > maxLength) {
    return content.slice(0, maxLength) + "...";
  }

  return content;
}

const PostList: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const { cid } = useParams(); // cid 가져오기
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = cid ? `/api/posts?cid=${cid}` : "/api/posts";
        const response = await axios.get(apiUrl);
        setPosts(response.data.posts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchData();
  }, [cid]); // cid가 변경될 때마다 fetchData를 호출

  return (
    <>
      <Header />
      <div className={styles.postListContainer}>
        <ul>
          {posts.map((post: Post) => (
            <li key={post.pid} className={styles.postItem}>
              <Link className={styles.link} to={`/blogcontent/${post.pid}`}>
                <h2 className={styles.postTitle}>{post.title}</h2>
                <p className={styles.postCategory}>{post.category_name}</p> 
                <p
                  className={styles.postContent}
                  dangerouslySetInnerHTML={createMarkup(truncateContent(post.content, 20))}
                ></p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default PostList;
