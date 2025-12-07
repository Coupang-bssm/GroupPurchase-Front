# Coupang FE

쿠팡 스타일의 공동구매 프론트엔드 애플리케이션

## 기술 스택

- React 18
- TypeScript
- Vite
- React Router
- React Query
- Axios

## 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

### 빌드

```bash
npm run build
```

### 환경 변수

기본적으로 프로덕션 백엔드 주소(`https://grouppurchase-back.onrender.com`)가 사용됩니다.

로컬 개발 시 다른 백엔드 주소를 사용하려면 `.env` 파일을 생성하고 다음 변수를 설정하세요:

```
VITE_API_BASE_URL=http://localhost:8080
```

## 주요 기능

- 회원가입/로그인
- 상품 등록/조회/삭제
- 공동구매 생성/참여/관리
- 댓글 시스템 (무한 뎁스)

## 프로젝트 구조

```
src/
├── components/     # 재사용 가능한 컴포넌트
├── pages/         # 페이지 컴포넌트
├── types/         # TypeScript 타입 정의
├── utils/         # 유틸리티 함수 (API, 인증 등)
└── App.tsx        # 메인 앱 컴포넌트
```

