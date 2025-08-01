import api from '../api';

// Login.js
export const login = async ({ email, password }) => {
  const formData = new URLSearchParams();
  formData.append('username', email); // FastAPI에서 username으로 받는 것에 맞춤
  formData.append('password', password);

  try {
    const response = await api.post('/api/user/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
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