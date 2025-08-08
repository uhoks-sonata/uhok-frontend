import React, { createContext, useContext, useState, useEffect } from 'react';

// 사용자 Context 생성
const UserContext = createContext();

// 사용자 정보 Provider 컴포넌트
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 컴포넌트 마운트 시 로컬 스토리지에서 사용자 정보 복원
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const tokenType = localStorage.getItem('token_type');
    
    if (token) {
      // 토큰이 있으면 사용자 정보 설정
      setUser({
        token,
        tokenType,
        isLoggedIn: true,
        email: 'dev_user@example.com' // 기본 이메일 설정
      });
      console.log('UserContext - 로컬 스토리지에서 사용자 정보 복원:', { token: !!token, tokenType });
    } else {
      console.log('UserContext - 로컬 스토리지에 토큰이 없습니다.');
    }
    
    setIsLoading(false);
  }, []);

  // 로그인 함수
  const login = (userData) => {
    setUser({
      ...userData,
      isLoggedIn: true
    });
  };

  // 로그아웃 함수
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_type');
    setUser(null);
  };

  // 토큰 업데이트 함수
  const updateToken = (token, tokenType) => {
    setUser(prev => ({
      ...prev,
      token,
      tokenType
    }));
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    updateToken,
    isLoggedIn: !!user?.isLoggedIn
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// 사용자 Context 사용을 위한 Hook
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;
