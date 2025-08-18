# API 명세서

## 개요
이 문서는 U+hok 프론트엔드 애플리케이션에서 사용하는 API 엔드포인트들의 명세를 정의합니다.

## 인증
- JWT 토큰 기반 인증
- `Authorization: Bearer <access_token>` 헤더 사용
- 토큰은 로컬 스토리지에 저장

## API 엔드포인트

### 1. 회원가입
- **기능**: 사용자가 이메일, 비밀번호, 사용자이름을 입력하여 회원가입을 진행
- **HTTP 메서드**: POST
- **엔드포인트 URL**: `/api/user/signup`
- **Header**: -
- **Query Parameter**: -
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "string",
    "username": "string"
  }
  ```
- **Response Code**: 201
- **Response Value**:
  ```json
  {
    "user_id": 0,
    "email": "user@example.com",
    "username": "string",
    "created_at": "2025-08-10T02:44:56.611Z"
  }
  ```

### 2. 이메일 중복 확인
- **기능**: 회원가입 중 입력한 email의 중복을 확인
- **HTTP 메서드**: GET
- **엔드포인트 URL**: `/api/user/signup/email/check`
- **Header**: -
- **Query Parameter**: `email`
- **Request Body**: -
- **Response Code**: 200
- **Response Value**:
  ```json
  {
    "email": "user@example.com",
    "is_duplicate": true,
    "message": "string"
  }
  ```

### 3. 로그인
- **기능**: 이메일과 비밀번호를 입력하여 로그인을 진행
- **HTTP 메서드**: POST
- **엔드포인트 URL**: `/api/user/login`
- **Header**: -
- **Query Parameter**: -
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "secure_password"
  }
  ```
- **Response Code**: 200
- **Response Value**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1...",
    "token_type": "bearer"
  }
  ```

### 4. 로그아웃
- **기능**: 사용자의 현재 세션을 종료하고 JWT 토큰을 블랙리스트에 추가하여 재사용을 방지
- **HTTP 메서드**: POST
- **엔드포인트 URL**: `/api/user/logout`
- **Header**: `Authorization: Bearer <access_token>`
- **Query Parameter**: -
- **Request Body**: -
- **Response Code**: 200
- **Response Value**:
  ```json
  {
    "message": "로그아웃이 완료되었습니다."
  }
  ```

### 5. 사용자 정보 조회
- **기능**: 로그인한 사용자의 기본 정보를 조회
- **HTTP 메서드**: GET
- **엔드포인트 URL**: `/api/user/info`
- **Header**: `Authorization: Bearer <access_token>`
- **Query Parameter**: -
- **Request Body**: -
- **Response Code**: 200
- **Response Value**:
  ```json
  {
    "user_id": 0,
    "email": "user@example.com",
    "username": "string",
    "created_at": "2025-08-10T02:48:48.352Z"
  }
  ```

### 6. 로그 기록
- **기능**: 사용자 로그 적재 (USER_LOG 테이블에 기록)
- **HTTP 메서드**: POST
- **엔드포인트 URL**: `/log`
- **Header**: -
- **Query Parameter**: -
- **Request Body**:
  ```json
  {
    "user_id": 0,
    "event_type": "string",
    "event_data": {
      "additionalProp1": {}
    }
  }
  ```
- **Response Code**: 201
- **Response Value**:
  ```json
  {
    "user_id": 0,
    "event_type": "string",
    "event_data": {
      "additionalProp1": {}
    },
    "log_id": 0,
    "created_at": "2025-08-10T02:49:20.762Z"
  }
  ```

### 7. 사용자 로그 조회
- **기능**: 특정 사용자의 최근 로그 조회
- **HTTP 메서드**: GET
- **엔드포인트 URL**: `/log/user/{user_id}`
- **Header**: -
- **Query Parameter**: `user_id`
- **Request Body**: -
- **Response Code**: 200
- **Response Value**:
  ```json
  [
    {
      "user_id": 0,
      "event_type": "string",
      "event_data": {
        "additionalProp1": {}
      },
      "log_id": 0,
      "created_at": "2025-08-10T02:49:49.693Z"
    }
  ]
  ```

## 구현된 기능

### 프론트엔드 API 모듈
- `src/api/userApi.js`: 사용자 인증 관련 API 함수들
- `src/api/logApi.js`: 로그 관련 API 함수들
- `src/api/cartApi.js`: 장바구니 관련 API 함수들 (기존)

### 수정된 컴포넌트
- `src/pages/user/Login.js`: 새로운 API에 맞게 수정
- `src/pages/user/Signup.js`: 새로운 API에 맞게 수정
- `src/pages/user/Logout.js`: 새로운 API에 맞게 생성
- `src/pages/user/MyPage.js`: 새로운 API에 맞게 수정
- `src/contexts/UserContext.js`: 로그 기능 추가

### 주요 변경사항
1. **API 엔드포인트 통일**: 명세서에 맞는 엔드포인트 사용
2. **비동기 처리**: async/await 패턴으로 일관성 있는 비동기 처리
3. **에러 핸들링**: 체계적인 에러 처리 및 로깅
4. **로그 기능**: 사용자 활동 로그 기록 및 조회
5. **토큰 관리**: JWT 토큰 자동 저장/제거 및 만료 처리

## 사용 예시

### 로그인
```javascript
import { userApi } from '../api/userApi';

const handleLogin = async (email, password) => {
  try {
    const response = await userApi.login({ email, password });
    console.log('로그인 성공:', response);
  } catch (error) {
    console.error('로그인 실패:', error);
  }
};
```

### 사용자 정보 조회
```javascript
import { userApi } from '../api/userApi';

const getUserInfo = async () => {
  try {
    const userInfo = await userApi.getUserInfo();
    console.log('사용자 정보:', userInfo);
  } catch (error) {
    console.error('사용자 정보 조회 실패:', error);
  }
};
```

### 로그 기록
```javascript
import { logApi } from '../api/logApi';

const logUserActivity = async (userId, eventType, eventData) => {
  try {
    await logApi.createUserLog({
      user_id: userId,
      event_type: eventType,
      event_data: eventData
    });
    console.log('로그 기록 완료');
  } catch (error) {
    console.error('로그 기록 실패:', error);
  }
};
```
