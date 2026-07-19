# 서버 · 프론트 배포 방법 (EC2 · S3)

> 참고 원본: `rocket-banchan-container/docs-for-배포 가이드` (동일 EC2·AWS 계정·S3 방식 재사용)
> 대상: 밀라 `donation-platform-server`(Spring Boot) + `donation-platform-front`(Next.js 정적)

---

## 0. 재사용 vs 신규 (한 줄 요약)

- **재사용(그대로)**: EC2 인스턴스(`43.200.241.26`), AWS 계정(`057480506658`), S3 배포 방식, 프론트=CloudFront+S3 / 백엔드=EC2 systemd 패턴.
- **신규(밀라 전용)**: 백엔드 포트, PostgreSQL 컨테이너, systemd 서비스, 프론트/이미지 S3 버킷, **도메인 + CloudFront 배포 + ACM 인증서**, `.env`.
- ⚠️ **핵심 주의 2가지** (아래 §1, §2) — 이거 놓치면 배포해도 안 뜬다.

---

## 1. ⚠️ 도메인 / CloudFront 는 그대로 못 쓴다

rocket-banchan은 `smart-fnb-design.com` + CloudFront `E1S9GLX4VGE79C`를 **인계(그 도메인의 주인 교체)**한 것이다. 밀라는 그 라이브 도메인을 뺏어올 수 없으므로 **밀라 전용이 필요**하다:

- 밀라 전용 **도메인 또는 서브도메인** (예: `milla-donation.com` 또는 `donation.<보유도메인>`)
- 밀라 전용 **CloudFront 배포** (새로 생성)
- 밀라 전용 **ACM 인증서** — 반드시 **us-east-1** 발급 (CloudFront 필수)

> EC2·S3·AWS 계정은 공유하되, **도메인/CloudFront/ACM만 신규**로 만든다. rocket-banchan의 CloudFront를 건드리면 그쪽 서비스가 죽는다.

---

## 2. ⚠️ 백엔드 CORS 가 코드 하드코딩이다

밀라 `SecurityConfig.java`는 허용 origin이 **코드에 하드코딩**돼 있다 (localhost:4300·1422·tauri). rocket-banchan처럼 `CORS_ALLOWED_ORIGIN` 환경변수로 안 받는다.

→ 운영 배포 전 **둘 중 하나**:

- (권장) `CORS_ALLOWED_ORIGIN` 환경변수를 읽도록 `SecurityConfig` 수정 (rocket-banchan 방식)
- (임시) `setAllowedOrigins`에 밀라 운영 도메인을 추가하고 재빌드

누락하면 프론트에서 API 호출이 CORS로 막힌다.

---

## 3. 아키텍처 (밀라판)

```text
                사용자
                  │  HTTPS
                  ▼
        <밀라 도메인> (Route 53)
                  │
                  ▼
         CloudFront (밀라 신규 배포)
         ACM 인증서 (us-east-1, 신규)
        ┌─────────┼──────────────┐
   기본(*) 정적   /api/* 동적
        │            │
        ▼            ▼
  ┌──────────┐   EC2 43.200.241.26:4302
  │ S3        │   (Spring Boot 직접, Nginx 없음)
  │ milla-    │         │
  │ front     │         ▼
  └──────────┘   milla-server.service (4302)
                        │
                        ▼
              PostgreSQL :5438 (milla-postgres 컨테이너)

  이미지 업로드: 백엔드 presigned URL 발급 → 클라이언트가 milla-images S3에 직접 PUT
```

> CloudFront origin이 EC2 포트로 직접 붙는다(Nginx 없음). EC2 보안그룹에 **CloudFront → 4302 인바운드**를 열어야 한다.

---

## 4. 인프라 정보

### 공유 (rocket-banchan과 동일 EC2)

| 항목 | 값 |
|---|---|
| EC2 퍼블릭 IP | `43.200.241.26` (t3.small · Ubuntu · ap-northeast-2) |
| AWS 계정 | `057480506658` |
| SSH 키 | rocket-banchan의 `.pem` 재사용 (문서에 값 미기재 — 안전 보관본 사용) |

> ⚠️ EC2가 t3.small(2GB)이다. rocket-banchan Spring Boot(4301)와 **동시 구동 시 메모리 부족** 위험 → swap 2GB 권장, 또는 동시 실행 지양.

### 밀라 신규

| 항목 | 값 |
|---|---|
| 백엔드 포트 | **`4302`** (rocket-banchan이 4301 사용 → 충돌 회피) |
| systemd 서비스 | `milla-server.service` |
| JAR | `/home/ubuntu/milla-app.jar` |
| env | `/home/ubuntu/milla.env` |
| PostgreSQL 컨테이너 | `milla-postgres` (`postgres:15-alpine`), 포트 **`5438`**, DB `donation_platform` |
| Java | OpenJDK 21 |
| 프론트 S3 버킷 | `milla-donation-front` (ap-northeast-2, 퍼블릭 읽기) |
| 이미지 S3 버킷 | `milla-donation-images` (ap-northeast-2) |

---

## 5. 최초 세팅 (처음 한 번만)

### 5-1. EC2 — Postgres 컨테이너 추가

```bash
ssh -i <키.pem> ubuntu@43.200.241.26

docker run -d --name milla-postgres --restart always \
  -e POSTGRES_DB=donation_platform \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=<운영 DB 비번> \
  -p 5438:5432 postgres:15-alpine
```

> rocket-banchan / restaurant-book의 기존 컨테이너는 **건드리지 않는다.**

### 5-2. env 파일 업로드

`.env` 예시 (실제 값은 별도 안전 보관, git 금지):

```env
JWT_SECRET=<32바이트 이상>
AWS_ACCESS_KEY_ID=<IAM 키>
AWS_SECRET_ACCESS_KEY=<IAM 시크릿>
AWS_S3_BUCKET_NAME=milla-donation-images
AWS_S3_REGION=ap-northeast-2
AWS_S3_PREFIX=donation-platform
# DB (application.yaml 기본 localhost:5436 → 운영은 EC2 내부 5438로 오버라이드)
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5438/donation_platform
SPRING_DATASOURCE_PASSWORD=<운영 DB 비번>
```

```bash
scp -i <키.pem> milla.env ubuntu@43.200.241.26:~/milla.env
ssh -i <키.pem> ubuntu@43.200.241.26 "chmod 600 ~/milla.env"
```

### 5-3. systemd 서비스 등록

```bash
sudo tee /etc/systemd/system/milla-server.service > /dev/null << 'EOF'
[Unit]
Description=Milla Donation Platform Spring Boot
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu
EnvironmentFile=/home/ubuntu/milla.env
Environment=SERVER_PORT=4302
ExecStart=/usr/bin/java -jar /home/ubuntu/milla-app.jar
SuccessExitStatus=143
Restart=on-failure
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable milla-server
```

### 5-4. S3 버킷 + CloudFront + ACM + Route 53

- 프론트 버킷 `milla-donation-front` 생성 + 퍼블릭 읽기 정책(GetObject)
- 이미지 버킷 `milla-donation-images` 생성 (presign 업로드용, CORS PUT 허용)
- **ACM 인증서(us-east-1)** 발급 — 밀라 도메인 + `*.도메인`
- **CloudFront 신규 배포**:
  - Origin(S3): `milla-donation-front.s3-website.ap-northeast-2.amazonaws.com` (HTTP)
  - Origin(EC2): `ec2-43-200-241-26.ap-northeast-2.compute.amazonaws.com:4302` (**IP 아닌 DNS 이름**, HTTP)
  - Behavior: `/api/*` → EC2(CachingDisabled), `*` → S3(CachingOptimized)
  - CNAME = 밀라 도메인, SSL = ACM, HTTP→HTTPS 리디렉션
- Route 53 A(별칭) → CloudFront

> 이미지 업로드는 프론트가 아니라 **백엔드 presign → 클라이언트가 S3에 직접 PUT** 이므로, `milla-donation-images` 버킷 CORS에 도메인 PUT 허용 필요.

---

## 6. 재배포 (코드 변경 시)

### 백엔드

```bash
# 로컬 빌드
cd donation-platform-server
./gradlew build -x test        # → build/libs/donation-platform-server-0.0.1-SNAPSHOT.jar

# EC2 전송 + 재시작
scp -i <키.pem> build/libs/donation-platform-server-0.0.1-SNAPSHOT.jar \
  ubuntu@43.200.241.26:~/milla-app.jar
ssh -i <키.pem> ubuntu@43.200.241.26 \
  "sudo systemctl restart milla-server && sleep 3 && sudo systemctl status milla-server --no-pager"
```

### 프론트

```bash
cd donation-platform-front

# 운영 API 도메인으로 빌드 (NODE_ENV=production 시 next.config 가 output:export)
NEXT_PUBLIC_API_URL=https://<밀라 도메인> npm run build   # → out/

aws s3 sync out/ s3://milla-donation-front --delete --region ap-northeast-2
aws cloudfront create-invalidation --distribution-id <밀라 CF ID> --paths "/*"
```

> `donation-platform-front`은 `NODE_ENV=production`에서 `next.config`가 `output: "export"`로 정적 익스포트 → `out/` 생성. `NEXT_PUBLIC_API_URL` 미설정 시 `http://localhost:4301`로 붙으니 **반드시 운영 도메인 지정**.

---

## 7. 환경변수

| 키 | 예시/설명 |
|---|---|
| `JWT_SECRET` | 32바이트 이상 서명 키 |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | 이미지 업로드용 IAM |
| `AWS_S3_BUCKET_NAME` | `milla-donation-images` |
| `AWS_S3_REGION` | `ap-northeast-2` |
| `AWS_S3_PREFIX` | `donation-platform` |
| `SERVER_PORT` | `4302` (systemd에서 주입) |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5438/donation_platform` |
| (프론트) `NEXT_PUBLIC_API_URL` | 빌드 시 `https://<밀라 도메인>` |

> ⚠️ CORS는 아직 env가 아니라 코드(`SecurityConfig`)다 — §2 참조.

---

## 8. 배포 체크리스트

- [ ] 백엔드 빌드 통과 (`./gradlew build -x test`)
- [ ] 프론트 빌드 통과 (`NEXT_PUBLIC_API_URL=... npm run build` → `out/`)
- [ ] `SecurityConfig` CORS에 밀라 운영 도메인 반영 (§2)
- [ ] EC2: `milla-postgres`(5438) 실행, `~/milla.env`(600), `milla-server.service` 등록
- [ ] EC2 보안그룹: CloudFront → **4302** 인바운드 허용
- [ ] (메모리) rocket-banchan과 동시 구동 시 swap 확인
- [ ] JAR scp → `sudo systemctl start milla-server`
- [ ] `ss -tlnp | grep ':4302'` → LISTEN, `curl -sf http://127.0.0.1:4302/api/site-settings`
- [ ] 프론트 S3 sync + CloudFront `/*` 무효화
- [ ] ACM(us-east-1) + CloudFront(밀라 신규) + Route 53 연결
- [ ] `https://<밀라 도메인>` 로딩, 로그인/후원/구매현황 동작
- [ ] 이미지 업로드(presign → milla-donation-images) 동작

---

## 9. 트러블슈팅

| 증상 | 원인 | 해결 |
|---|---|---|
| API CORS 에러 | `SecurityConfig`에 운영 도메인 없음 | 코드 추가 후 재빌드·재배포 (§2) |
| 서비스 시작 실패 | 포트 충돌(4302)·JAR 손상 | `ss -tlnp \| grep 4302` |
| DB 연결 실패 | `milla-postgres` 중단/포트 | `docker start milla-postgres`, URL `:5438` 확인 |
| 502/504 | Spring 미실행 | `systemctl restart milla-server` |
| 프론트 404 | S3 퍼블릭 정책 미설정 | 버킷 GetObject 허용 |
| API 502 | CloudFront EC2 origin에 IP 입력 | EC2 **DNS 이름** + `:4302` |
| CF 인증서 오류 | ACM us-east-2 발급 | 반드시 **us-east-1** |
| 배포 후 구버전 | CloudFront 캐시 | `/*` 무효화 |
| EC2 OOM | rocket-banchan과 동시 구동 | swap 2GB, 또는 한쪽만 |
