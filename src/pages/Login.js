import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../features/user/auth';
import '../styles/login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    
    e.preventDefault(); // 페이지 새로고침 막기
    console.log('로그인 시도:', { email, password });
    

    try {
      const response = await login({ email, password }); // API 호출
      console.log('로그인 응답:', response);  // 여기에 로그인 응답 데이터 출력

      if (response.access_token || response.status === 'success') {
        navigate('/main');
      } else {
        setErrorMsg(response.message || '로그인 실패');
      }
    } catch (err) {
      setErrorMsg(err.message || '로그인 중 오류 발생');
    }
  };

  return (
    <div>
      <h1>U+hok</h1>
      <form className="login-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {errorMsg && <p className="error-message">{errorMsg}</p>}
        <button type="submit">로그인</button>

        <div className="signup-link">
          <Link to="/signup">회원가입</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;