# 장바구니 API 명세서

## 기본 정보
- Base URL: `http://localhost:9000`
- Content-Type: `application/json`
- Authorization: `Bearer {access_token}` (인증이 필요한 엔드포인트)

## 1. 장바구니 추가

### POST /api/kok/carts
사용자가 상품을 장바구니에 추가한다.

**요청 헤더:**
```
Content-Type: application/json
```

**요청 본문:**
```json
{
  "kok_product_id": 10046186,
  "kok_quantity": 1
}
```

**응답:**
```json
{
  "kok_cart_id": 5,
  "message": "장바구니에 추가되었습니다."
}
```

## 2. 장바구니 상품 조회

### GET /api/kok/carts
사용자가 담아놓은 상품 전체를 조회한다.

**요청 헤더:**
```
Authorization: Bearer <access_token>
```

**응답:**
```json
{
  "cart_items": [
    {
      "kok_cart_id": 1,
      "kok_product_id": 123,
      "kok_product_name": "상품명",
      "kok_thumbnail": "https://example.com/thumbnail.jpg",
      "kok_product_price": 15000,
      "kok_discount_rate": 10,
      "kok_discounted_price": 13500,
      "kok_store_name": "스토어명",
      "kok_quantity": 2
    }
  ]
}
```

## 3. 장바구니 상품 수량 변경

### PATCH /api/kok/carts/{cartItemId}
장바구니에서 상품의 수량을 변경한다.

**요청 헤더:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**요청 본문:**
```json
{
  "quantity": 3
}
```

**응답:**
```json
{
  "kok_cart_id": 123,
  "kok_quantity": 3,
  "message": "수량이 3개로 변경되었습니다."
}
```

## 4. 장바구니 상품 삭제

### DELETE /api/kok/carts/{cartItemId}
장바구니에서 상품을 삭제한다.

**요청 헤더:**
```
Authorization: Bearer <access_token>
```

**응답:**
```json
{
  "message": "장바구니에서 상품이 삭제되었습니다."
}
```

## 에러 응답 형식

모든 API에서 에러 발생 시 다음과 같은 형식으로 응답합니다:

```json
{
  "error": "에러 메시지",
  "error_code": "ERROR_CODE",
  "details": "상세 에러 정보"
}
```

### 주요 에러 코드
- `UNAUTHORIZED`: 인증 실패
- `FORBIDDEN`: 권한 없음
- `NOT_FOUND`: 리소스를 찾을 수 없음
- `BAD_REQUEST`: 잘못된 요청
- `INTERNAL_SERVER_ERROR`: 서버 내부 오류
- `CART_ITEM_NOT_FOUND`: 장바구니 상품을 찾을 수 없음
- `INSUFFICIENT_STOCK`: 재고 부족
- `INVALID_QUANTITY`: 잘못된 수량

## 상태 코드

- `200 OK`: 성공
- `201 Created`: 생성 성공
- `400 Bad Request`: 잘못된 요청
- `401 Unauthorized`: 인증 실패
- `403 Forbidden`: 권한 없음
- `404 Not Found`: 리소스를 찾을 수 없음
- `500 Internal Server Error`: 서버 내부 오류
