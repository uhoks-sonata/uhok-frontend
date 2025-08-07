// React 관련 라이브러리 import
import React, { useState } from 'react';
// React Router의 Link와 useNavigate 훅 import
import { Link, useNavigate } from 'react-router-dom';
// 로그인 API 함수 import
import { login } from './auth';
// 로그인 페이지 스타일 CSS 파일 import
import '../../styles/login.css';

// ===== 로그인 페이지 컴포넌트 =====
// 사용자 로그인을 처리하는 페이지 컴포넌트
const Login = () => {
  // ===== 상태 관리 =====
  // 이메일 입력값 상태 관리
  const [email, setEmail] = useState('');
  // 비밀번호 입력값 상태 관리
  const [password, setPassword] = useState('');

  // ===== React Router 훅 =====
  // 페이지 이동을 위한 navigate 함수 가져오기
  const navigate = useNavigate();

  // ===== 이벤트 핸들러 함수 =====
  // 폼 제출 핸들러 함수 (로그인 처리)
  const handleSubmit = async (e) => {
    // 기본 폼 제출 동작 방지
    e.preventDefault();
    // 콘솔에 로그인 시도 정보 출력
    console.log('로그인 시도:', { email, password });

    // try-catch 블록으로 에러 처리
    try {
      // 로그인 API 호출
      const response = await login({ email, password });
      // 콘솔에 로그인 응답 출력
      console.log('로그인 응답:', response);

      // 로그인 성공 조건 확인 (액세스 토큰이 있거나 성공 상태인 경우)
      if (response.access_token || response.status === 'success') {
        // 로그인 성공 시 메인 페이지로 이동
        navigate('/main');
      } else {
        // 로그인 실패 시 에러 메시지 출력
        console.error(response.message || '로그인 실패'); 
      }
    } catch (err) {
      // 로그인 중 오류 발생 시 에러 메시지 출력
      console.error(err.message || '로그인 중 오류 발생'); 
    }
  };

  // 로그인 페이지 JSX 반환
  return (
    // 로그인 페이지 컨테이너
    <div>
      {/* 앱 제목 */}
      <h1>U+hok</h1>
      
      {/* 로그인 폼 */}
      <form className="login-form" onSubmit={handleSubmit}>
        {/* 이메일 입력 필드 */}
        <input
          type="text" // 텍스트 입력 타입
          placeholder="이메일" // 입력 안내 텍스트
          value={email} // 현재 이메일 상태값
          onChange={(e) => setEmail(e.target.value)} // 이메일 변경 시 상태 업데이트
          required // 필수 입력 필드
        />
        
        {/* 비밀번호 입력 필드 */}
        <input
          type="password" // 비밀번호 입력 타입 (마스킹 처리)
          placeholder="비밀번호" // 입력 안내 텍스트
          value={password} // 현재 비밀번호 상태값
          onChange={(e) => setPassword(e.target.value)} // 비밀번호 변경 시 상태 업데이트
          required // 필수 입력 필드
        />
        
        {/* 로그인 버튼 */}
        <button type="submit">로그인</button>

        {/* 회원가입 링크 영역 */}
        <div className="signup-link">
          {/* 회원가입 페이지로 이동하는 링크 */}
          <Link to="/signup">회원가입</Link>
        </div>
      </form>
    </div>
  );
};

// 컴포넌트를 기본 export로 내보내기
export default Login;