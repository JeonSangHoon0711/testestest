import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "./header";
import styles from "../styles/mainpage.module.css";
import { Link } from 'react-router-dom';
import sanitizeHtml from "sanitize-html";
import { sanitizeOptions } from "../config/sanitizeOptions"

// Define the type for a single post
type Post = {
  pid: number;
  title: string;
  content: string;
}

// Define the type for the Axios response
type AxiosResponse = {
  posts: Post[];
}

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

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get<AxiosResponse>("/api/mainpage/limited");
        setPosts(response.data.posts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, []);

  return (
    <>
      <Header />
      <div className={styles.maincontainer}>
        <div className={styles.container}>
          {posts && posts.map((post) => (
              <Link className={styles.link} to={`/blogcontent/${post.pid}`} key={post.pid}>
              <div className={styles.item}>
                <h4 className={styles.title}>{post.title}</h4>
                <p className={styles.content} dangerouslySetInnerHTML={createMarkup(truncateContent(post.content, 10))}></p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
