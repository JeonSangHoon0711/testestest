import React, { useState } from "react";
import styles from "../styles/login.module.css";
import { useNavigate } from "react-router"; // useNavigate를 import합니다.
import Header from "./header";
import axios from 'axios';
import { useAuth } from "./users/AuthContext";


const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const navigate = useNavigate(); // useNavigate를 사용합니다.
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
        login(response.data.userData); // 로그인 API 호출 후 로그인 함수 호출에 사용자 정보를 전달합니다.
        navigate("/");
      } else {
        console.error("Error: user data is missing in the response:", response);
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("이메일과 비밀번호를 확인해주세요.");
    }
  };

  const handleRegisterClick = () => {
    navigate("/register"); 
  };

  return (
    <>
      <Header />
      <div className={styles.loginPageContainer}>
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
            <button type="button" onClick={handleRegisterClick}>
              회원가입
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default LoginPage;
