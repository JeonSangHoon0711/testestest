import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import styles from "../../src/styles/header.module.css";
import axios from "axios";
import { useAuth } from "./users/AuthContext";
import { useNavigate } from 'react-router-dom';



const Header: React.FC = () => {
  const [showCategory, setShowCategory] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleWriteBlogClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (user) {
      navigate("/writeblog");
    } else {
      alert("로그인이 필요합니다.");
      navigate("/login");
    }
  };

  const toggleCategory = () => setShowCategory(!showCategory);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/categories");
      setCategories(response.data.categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <>
      <div className={styles.fixedContainer}>
        {user ? (
          <Link className={styles.login} to="/userpage">
            {user.name}
          </Link>
        ) : (
          <Link className={styles.login} to="/login">
            비사용자
          </Link>
        )}
        <Link className={styles.writeBtn} to="#" onClick={handleWriteBlogClick}>
          글쓰기
        </Link>

        {user ? (
          <button className={styles.logout} onClick={handleLogout}>
            로그아웃
          </button>
        ) : (
          <Link className={styles.login} to="/login">
            로그인
          </Link>
        )}
      </div>
      <div className={styles.blogContainer}>블로그</div>

      <hr />

      <div className={styles.menubuttonContainer}>
        <Link
          className={`${styles.categorybtn} ${styles.link}`}
          onClick={toggleCategory}
          to="#"
        >
          ≡
        </Link>
        <Link className={`${styles.menubtn} ${styles.link}`} to="/">
          Home
        </Link>
        <Link className={`${styles.menubtn} ${styles.link}`} to="/list">
          List
        </Link>
        <Link className={`${styles.menubtn} ${styles.link}`} to="/about">
          About
        </Link>
      </div>

      {showCategory && (
        <div className={styles.categoryContainer}>
          <span
            className={styles.closeCategory}
            onClick={toggleCategory}
          >
            ×
          </span>
          <ul>
            {categories.map((category) => (
              <li key={category.cid}>
                <Link
                  to={`/list/${category.cid}`}
                  className={styles.categoryItem}
                >
                  ◆{category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      <hr />
    </>
  );
};

export default Header;
