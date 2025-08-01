import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../../features/user/auth';
import '../../styles/login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  console.log('로그인 시도:', { email, password });

  try {
    const response = await login({ email, password });
    console.log('로그인 응답:', response);

    if (response.access_token || response.status === 'success') {
      navigate('/main');
    } else {
      console.error(response.message || '로그인 실패'); 
    }
  } catch (err) {
    console.error(err.message || '로그인 중 오류 발생'); 

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
        <button type="submit">로그인</button>

        <div className="signup-link">
          <Link to="/signup">회원가입</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;