# 멀티스테이지 빌드를 사용한 React 앱 Dockerfile

# 1단계: 빌드 스테이지
FROM node:18-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사 (의존성 캐싱 최적화)
COPY package*.json ./

# 의존성 설치
RUN npm ci --silent

# 소스 코드 복사
COPY . .

# React 앱 빌드
RUN npm run build

# 2단계: 프로덕션 스테이지
FROM nginx:alpine AS production

# nginx 설정 파일 복사
COPY nginx.conf /etc/nginx/nginx.conf

# 빌드된 React 앱을 nginx 웹 루트로 복사
COPY --from=builder /app/build /usr/share/nginx/html

# 포트 80 노출
EXPOSE 80

# nginx 실행
CMD ["nginx", "-g", "daemon off;"]
