import React, { useState } from "react";
import styles from "../styles/login.module.css";
import { useNavigate } from "react-router";
import Header from "./header";
import axios from 'axios';
import { useAuth } from "./users/AuthContext";

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/login", {
        email,
        password,
      });
      console.log("Login response:", response);
  
      if (response.data && response.data.userData) {
        if (response.data.userData.isAdmin) { // 관리자 여부를 확인합니다.
          login(response.data.userData);
          navigate("/admindashboard"); // 관리자 대시보드로 이동합니다.
        } else {
          alert("관리자만 로그인할 수 있습니다.");
        }
      } else {
        console.error("Error: user data is missing in the response:", response);
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("이메일과 비밀번호를 확인해주세요.");
    }
  };

  return (
    <>
      <Header />
      <div className={styles.loginPageContainer}>
        <h2>관리자 로그인</h2> {/* 로그인 페이지의 제목을 변경합니다. */}
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={styles.formRow}>
            <label htmlFor="email">이메일:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className={styles.formRow}>
            <label htmlFor="password">비밀번호:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className={styles.formRowLoginReg}>
            <button type="submit">로그인</button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AdminLoginPage;
