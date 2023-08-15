import React, { useState } from "react";
import { useNavigate } from 'react-router-dom'; 
import styles from '../styles/register.module.css';
import Header from '../pages/header';
import axios, { AxiosError } from "axios";

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    if (password !== passwordConfirmation) {
      alert("비밀번호가 일치하지 않습니다. 다시 확인해주세요.");
      return;
    }
  
    try {
      const response = await axios.post('/api/register', {
        name,
        email,
        password
      });
  
      if (response.status === 201) {
        alert("회원가입에 성공하였습니다!");
        navigate('/login'); // 로그인 페이지로 이동
      } else {
        alert("회원가입에 실패했습니다. 서버상 에러가 있는 것으로 추정됩니다.");
      }
    } 
    catch (error) {
      const axiosError = error as AxiosError;
      console.error(axiosError);
      if (axiosError.response && axiosError.response.data && axiosError.response.data) {
        alert(JSON.stringify(axiosError.response.data));

      } else {
        alert('회원가입 중 알 수 없는 에러가 발생했습니다. 다시 시도해주세요.');
      }
    }
  };


  return (
    <>
    <Header/>
    <div className={styles.signupPageContainer}>
      <form onSubmit={handleSubmit} className={styles.signupForm}>
        <div className={styles.formRow}>
          <label htmlFor="name">이름  </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.inputField}
          />
        </div>
        <br></br>
        <div className={styles.formRow}>
          <label htmlFor="email">이메일  </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.inputField}
          />
        </div>
        <br></br>
        <div className={styles.formRow}>
          <label htmlFor="password"> 비밀번호 </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.inputField}
          />
        </div>
        <br></br>
        <div className={styles.formRow}>
          <label htmlFor="passwordConfirmation">비밀번호 확인 </label>
          <input
            type="password"
            id="passwordConfirmation"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            className={styles.inputField}
          />
        </div>
        <button type="submit" className={styles.submitButton}>
          회원가입
        </button>
      </form>
    </div>
    </>
  );
};

export default SignupPage;
