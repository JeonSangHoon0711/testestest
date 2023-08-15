import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import styles from '../styles/writeblog.module.css';
import Header from "./header";
import React from 'react';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "./users/AuthContext";


type Category = {
  cid: number;
  name: string;
}
const submitPost = async (title: string, content: string, categoryId: number, uid: number): Promise<void> => {
  try {
    const formattedContent = content.replace(/\n/g, "<br>");
    await axios.post("/api/posts", {
      title: title,
      content: formattedContent,
      category_id: categoryId,
      uid: uid
    });
    console.log("Post successfully submitted");
  } catch (error) {
    console.error("Failed to submit post:", error);
  }
};

const createNewCategory = async (categoryName: string): Promise<number | null> => {
  try {
    const response = await axios.post<{ cid: number }>("/api/categories", {
      name: categoryName,
    });
    return response.data.cid;
  } catch (error) {
    console.error("Failed to create new category:", error);
    return null;
  }
};

const CreatePost = () => {


  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get<{ categories: Category[] }>("/api/categories");
        setCategories(response.data.categories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }
    let categoryId: number | null = null;
  
    if (category) {
      categoryId = parseInt(category);
    } else if (customCategory) {
      categoryId = await createNewCategory(customCategory);
      if (!categoryId) {
        console.error("Failed to create new category");
        return;
      }
    }
  
    if (!categoryId) {
      alert("카테고리가 선택되지 않았습니다.");
      return;
    }
  
    await submitPost(title, content, categoryId, user.uid);
    navigate("/"); // 글 작성 완료 후 루트 페이지로 이동합니다.
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === "add") {
      setCategory(""); 
      setShowCustomCategoryInput(true);
    } else {
      setCategory(e.target.value);
      setShowCustomCategoryInput(false);
    }
  };

  return (
    <>
      <Header />
      <div className={styles.container}>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputWrapper}>
            <label htmlFor="title">제목</label>
            <input
              type="text"
              id="title"
              className={styles.input}
              placeholder="글 제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className={styles.inputWrapper}>
            <label htmlFor="category">카테고리</label>
            <select
              id="category"
              className={styles.input}
              value={category}
              onChange={handleCategoryChange}
            >
              <option value="">카테고리를 선택하세요</option>
              {categories.map((category) => (
                <option key={category.cid} value={category.cid}>
                  {category.name}
                </option>
              ))}
              <option value="add">카테고리 추가</option>
            </select>
          </div>

          {showCustomCategoryInput && (
            <div className={styles.inputWrapper}>
              <label htmlFor="customCategory">새 카테고리</label>
              <input
                type="text"
                id="customCategory"
                className={styles.input}
                placeholder="새 카테고리를 입력하세요"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
              />
            </div>
          )}

          <div className={styles.inputWrapper}>
            <label htmlFor="content">내용</label>
            <textarea
              id="content"
              className={styles.textarea}
              placeholder="글 내용을 입력하세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <button type="submit" className={styles.submit}>
            글 작성 완료
          </button>
        </form>
        <Link to="/">홈으로 돌아가기</Link>
      </div>
    </>
  );
};

export default CreatePost;
