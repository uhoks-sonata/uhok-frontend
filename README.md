# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## 콕 결제 확인 API

### 개요
이 프로젝트는 콕 쇼핑몰의 결제 확인 기능을 제공하는 React 애플리케이션입니다.

### 주요 기능
- **단건 결제 확인**: 개별 콕 주문의 결제 상태를 PAYMENT_COMPLETED로 변경
- **주문 단위 결제 확인**: 특정 주문에 속한 모든 콕 주문의 결제 상태를 일괄 변경
- **비동기 처리**: 모든 API 호출은 비동기 방식으로 처리되어 사용자 경험 향상
- **에러 처리**: 다양한 HTTP 상태 코드에 대한 적절한 에러 처리 및 사용자 피드백

### API 엔드포인트

#### 1. 콕 결제 확인 (단건)
- **HTTP 메서드**: POST
- **엔드포인트**: `/api/orders/kok/{kok_order_id}/payment/confirm`
- **헤더**: `Authorization: Bearer {access_token}`
- **Path Parameter**: `kok_order_id`
- **응답 코드**: 200
- **설명**: 현재 상태가 PAYMENT_REQUESTED인 해당 kok_order_id의 주문을 PAYMENT_COMPLETED로 변경

#### 2. 결제 확인 (주문 단위)
- **HTTP 메서드**: POST
- **엔드포인트**: `/api/orders/kok/order-unit/{order_id}/payment/confirm`
- **헤더**: `Authorization: Bearer {access_token}`
- **Path Parameter**: `order_id`
- **응답 코드**: 200
- **설명**: 주어진 order_id에 속한 모든 KokOrder를 PAYMENT_COMPLETED로 변경

### 사용법

#### API 호출 예시
```javascript
import { kokApi } from './api/kokApi';

// 단건 결제 확인
const result = await kokApi.confirmKokPayment('12345');

// 주문 단위 결제 확인
const result = await kokApi.confirmOrderUnitPayment('ORD-001');
```

#### 응답 형식
```javascript
// 성공 시
{
  success: true,
  message: "결제 확인이 완료되었습니다.",
  data: "결제 확인이 완료되었습니다."
}

// 실패 시
{
  success: false,
  message: "에러 메시지",
  error: "ERROR_CODE"
}
```

### 컴포넌트

#### KokPayment.js
- 메인 결제 페이지
- 결제 방법 선택 및 카드 정보 입력
- 결제 처리 및 결제 확인 API 연동
- 실시간 결제 상태 표시

#### KokPaymentTest.js
- API 테스트용 컴포넌트
- 단건/주문 단위 결제 확인 테스트
- API 엔드포인트 정보 표시

### 스타일링
- `kok_payment.css`: 결제 페이지 및 테스트 컴포넌트 스타일
- 반응형 디자인 지원
- 결제 상태별 시각적 피드백

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)



