import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', // FastAPI 서버 주소
  headers: {
    'Content-Type': 'application/json',
  },
});


// Login.js
export const login = async ({ email, password }) => {
  try {
    const response = await api.post('/api/user/login',
      { email, password });
    return response.data; 
  } catch (error) {
    const message =
      error.response?.data?.message || error.message || '로그인 실패';
    throw new Error(message);
  }
};

// Signup.js
export const signup = async ({ email, password, password_confirm, username }) => {
  try {
    const response = await api.post('/api/user/signup', {
      email,
      password,
      password_confirm,
      username,
    });
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || error.message || '회원가입 실패';
    throw new Error(message);
  }
};

// 이메일 중복 확인
export const checkEmail = async (email) => {
  try {
    const response = await api.get('/api/user/signup/email/check', {
      params: { email },
    });
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || error.message || '이메일 중복 확인 실패';
    throw new Error(message);
  }
};