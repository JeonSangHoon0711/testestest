// SelfIntroduction.tsx
import React from 'react';
import Header from "./header"
import styles from "../styles/about.module.css"; // CSS 모듈 import

const SelfIntroduction: React.FC = () => {
  const name = '전상훈';
  const age = 24;
  const job = '대학생';
  const interests = ['독서', '영화', '운동', '여행'];

  return <>
    <Header/>
    <div className={styles["grid-container"]}>
      <h1 className={styles.title}>자기소개</h1>
      <div className={styles.name}>이름 : {name}</div>
      <div className={styles.age}>나이 : {age} 세</div>
      <div className={styles.job}>직업 : {job}</div>
      <div className={styles.interests}>
        <p>관심사 </p>
        <ul>
          {interests.map((interest, index) => (
            <li key={index}>{interest}</li>
          ))}
        </ul>
      </div>
    </div>
  </>
};

export default SelfIntroduction;
