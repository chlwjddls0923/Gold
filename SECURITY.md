# Security Checklist

배포 후 진행한 보안 점검 결과입니다.

---

## 점검 결과 요약

| # | 항목 | 방법 | 결과 |
|---|------|------|------|
| 1 | SQL Injection | 로그인 폼에 SQL 구문 입력 테스트 | ✅ 통과 |
| 2 | XSS | 입력 필드에 스크립트 태그 입력 테스트 | ✅ 통과 |
| 3 | CSRF | 인증 방식 구조 검토 | ✅ 통과 |
| 4 | 세션 쿠키 보안 | 인증 방식 구조 검토 | ✅ 통과 |
| 5 | 관리자 페이지 무단 접근 | 비인증 상태에서 관리자 경로 직접 접속 | ✅ 통과 |
| 6 | API 인증 우회 | 토큰 없이 쓰기 API 호출 | ✅ 통과 |
| 7 | HTTP → HTTPS 자동 전환 | HTTP 접속 후 리다이렉트 확인 | ✅ 통과 |
| 8 | TLS/인증서 보안 | SSL Labs 등급 확인 | ✅ 통과 (A등급) |
| 9 | 내부 서비스 포트 노출 | 외부에서 DB 포트 접근 시도 | ✅ 통과 |
| 10 | 서버 버전 정보 노출 | 응답 헤더 확인 | ✅ 통과 (조치 완료) |
| 11 | 보안 헤더 누락 | 응답 헤더 및 외부 도구로 점검 | ✅ 통과 (조치 완료) |
| 12 | CORS 설정 오류 | 허용되지 않은 Origin으로 API 요청 | ✅ 통과 |
| 13 | Clickjacking | X-Frame-Options 헤더 확인 | ✅ 통과 |
| 14 | 불필요한 HTTP 메서드 허용 | TRACE 메서드 요청 테스트 | ✅ 통과 |
| 15 | 민감 파일 외부 노출 | 설정 파일 경로 직접 접속 | ✅ 통과 |
| 16 | 에러 메시지 내부 정보 노출 | 잘못된 API 요청 후 응답 확인 | ✅ 통과 |
| 17 | 디렉토리 목록 노출 | 업로드 디렉토리 직접 접속 | ✅ 통과 |
| 18 | 비공개 페이지 노출 | API 문서 경로 직접 접속 | ✅ 통과 |
| 19 | robots.txt 내부 경로 노출 | robots.txt 직접 접속 | ✅ 통과 |
| 20 | 기본/샘플 파일 잔존 | 기본 파일 경로 직접 접속 | ✅ 통과 |

---

## 조치 내역

### 서버 버전 정보 숨김 (항목 10)
- Nginx `server_tokens off` 설정 적용
- 프록시 응답에서 프레임워크 식별 헤더 제거

### 보안 헤더 추가 (항목 11)
응답 헤더에 아래 보안 정책을 적용했습니다.

| 헤더 | 설명 |
|------|------|
| `X-Frame-Options` | Clickjacking 방지 |
| `X-Content-Type-Options` | MIME 스니핑 방지 |
| `Referrer-Policy` | 외부 이동 시 URL 정보 제한 |
| `Permissions-Policy` | 불필요한 브라우저 기능 비활성화 |
| `Content-Security-Policy` | 허용된 리소스 출처만 로드 |
| `Strict-Transport-Security` | HTTPS 강제 (HSTS) |

---

## 구조적 보안 설계

- **인증 방식**: JWT Bearer 토큰 — 모든 쓰기 API에 인증 필요
- **CSRF**: localStorage 기반 JWT 사용으로 구조적으로 차단
- **SQL Injection**: ORM 파라미터 바인딩으로 구조적으로 차단
- **XSS**: React JSX 자동 이스케이프로 구조적으로 차단
- **DB 접근**: 외부 포트 미개방, 내부 네트워크에서만 접근 가능
- **HTTPS**: Let's Encrypt 인증서, TLS 1.3 지원

---

## 점검 도구

- [SSL Labs](https://www.ssllabs.com/ssltest/) — TLS/인증서 등급 확인
- [Security Headers](https://securityheaders.com/) — 보안 헤더 점검
- 브라우저 개발자 도구 (Network, Console)
- curl

---

*점검일: 2026-03-23*
