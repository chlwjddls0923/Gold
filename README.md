# BrandFolio

브랜드 제품 소개 및 관리자 페이지가 포함된 카탈로그형 웹사이트

## 주요 기능

### 방문자
- 브랜드 소개 및 제조 과정 페이지
- 카테고리별 제품 목록 조회
- 제품 상세 정보 및 이미지 슬라이더

### 관리자
- JWT 기반 로그인 인증
- 제품 등록 / 수정 / 삭제 (이미지 업로드 포함)
- 카테고리 등록 / 삭제
- About, Manufacturing 페이지 텍스트 직접 편집 (인라인 편집)
- 사이트 전체 문구 및 Hero 슬라이더 이미지 관리

## 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | Next.js 14 (App Router, TypeScript, Tailwind CSS) |
| Backend | NestJS, TypeORM |
| Database | PostgreSQL 16 |
| 실행 환경 | Docker Compose |

## 로컬 실행

### 1. 환경변수 설정

```bash
cp .env.example .env
```

`.env` 파일을 열어 비밀번호를 설정합니다.

### 2. 실행

```bash
docker compose up -d --build
```

브라우저에서 `http://localhost:3000` 접속

## 페이지

| 경로 | 설명 |
|------|------|
| `/` | 메인 (Hero 슬라이더, 제품 미리보기) |
| `/products` | 카테고리별 제품 목록 |
| `/products/:slug` | 제품 상세 |
| `/about` | 브랜드 소개 |
| `/manufacturing` | 제조 과정 |
| `/contact` | 문의 |
| `/admin` | 관리자 로그인 |
| `/admin/products` | 제품 관리 |

## 관리자

- URL: `http://localhost:3000/admin`
- 비밀번호: `.env`의 `ADMIN_PASSWORD` 값

## API

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| GET | /api/products | 공개 상품 목록 | |
| GET | /api/products/:id | 상품 상세 | |
| POST | /api/products | 상품 등록 | JWT |
| PATCH | /api/products/:id | 상품 수정 | JWT |
| DELETE | /api/products/:id | 상품 삭제 | JWT |
| GET | /api/categories | 카테고리 목록 | |
| POST | /api/categories | 카테고리 등록 | JWT |
| DELETE | /api/categories/:id | 카테고리 삭제 | JWT |
| GET | /api/site-settings | 사이트 설정 조회 | |
| PUT | /api/site-settings | 사이트 설정 수정 | JWT |
| POST | /api/auth/login | 관리자 로그인 | |
