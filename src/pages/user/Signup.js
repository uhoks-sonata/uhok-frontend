import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup, checkEmail } from '../../features/user/auth';
import '../../styles/signup.css';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();

  const handleEmailCheck = async () => {
  try {
    const result = await checkEmail(email);

    if (!result.is_duplicate) {
      setEmailMessage('사용 가능한 아이디입니다.');
      setIsEmailChecked(true);
    } else {
      setEmailMessage('이미 존재하는 이메일입니다.');
      setIsEmailChecked(false);
    }
  } catch (err) {
    setEmailMessage(err.message || '이메일 중복 확인 실패');
    setIsEmailChecked(false);
  }
};

const handleSignup = async (e) => {
  e.preventDefault();

  if (!isEmailChecked) {
    setErrorMsg('이메일 중복 확인을 해주세요.');
    return;
  }

  if (password !== confirmPassword) {
    setErrorMsg('비밀번호가 일치하지 않습니다.');
    return;
  }

  try {
    await signup({
      email,
      password,
      username,
    });
    alert('회원가입이 완료되었습니다.');
    navigate('/');
  } catch (err) {
    setErrorMsg(err.message || '회원가입 실패');
  }
};

 return (
    <div>
      <h1>U+hok</h1>
      <form className="signup-form" onSubmit={handleSignup}>
        <div className="email-check-group">
          <input
            type="text"
            placeholder="이메일"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setIsEmailChecked(false); 
              setEmailMessage('');
            }}
            required
          />
          <button type="button" onClick={handleEmailCheck}>중복 확인</button>
        </div>

        {emailMessage && <p className="email-message">{emailMessage}</p>}

        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="비밀번호 확인"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="이름"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        {errorMsg && <p className="error-message">{errorMsg}</p>}

        <button type="submit">회원가입</button>

        <div className="login-link">
          <Link to="/">로그인</Link>
        </div>
      </form>
    </div>
  );
};

export default Signup;
