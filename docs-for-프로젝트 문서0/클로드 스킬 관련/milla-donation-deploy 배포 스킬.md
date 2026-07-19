# milla-donation-deploy — 배포 스킬

> 작성: 2026-07-20
> 스킬 위치: `~/.claude/skills/milla-donation-deploy/SKILL.md`
> 대상 프로젝트: `/Users/terecal/milla-pilot`

---

## 1. 왜 만들었나

이 프로젝트는 **english-agent-hub의 인프라 슬롯을 인계**받아 배포돼 있다. 그래서 이름이 전부 어긋나 있다.

- S3 버킷: `beauty-book-hair-front` (milla 것이 아님)
- 도메인: `dxline-tallent.com` (milla 이름이 안 들어감)
- ACM 인증서: BeautyBook 발급분

이름만 보고 "잘못된 버킷"이라고 판단해 새로 만들면 **운영 사이트가 깨진다.** 이 맥락을 매번 설명하지 않아도 되도록 스킬로 고정했다.

또 하나 — 배포 경로가 두 개(GitHub Actions / 로컬 aws-cli)인데, 어느 쪽을 언제 써야 하는지가 문서에 흩어져 있었다.

---

## 2. 트리거

"배포해줘", "deploy", "프론트 배포", "백엔드 배포", "운영 반영", "빌드하고 올려줘", "S3 올려줘", "EC2 올려줘", "밀라 배포", "후원 플랫폼 배포"

**적용 조건**: 작업 디렉토리에 `donation-platform-server/`와 `donation-platform-front/`가 동시에 존재해야 한다. 사용자의 다른 배포 스킬(restaurant-book, towercrane, english-agent-hub)과 겹치지 않도록 하기 위함이다.

---

## 3. 절차 요약

| Step | 내용 |
|---|---|
| 1 | 배포 대상 확인 (프론트 / 백엔드 / 둘 다) |
| 2 | **미커밋 변경 확인** — GitHub Actions는 main의 커밋된 코드만 배포 |
| 3 | `gh workflow run deploy.yml -f target=frontend` (권장 경로) |
| 4 | 로컬 직접 배포 (대체 경로 — 커밋 없이 급히 확인할 때만) |
| 5 | 배포 확인 + 체크리스트 |

---

## 4. 설계 판단

**기본 경로를 GitHub Actions로 정한 이유**

비밀값(AWS 키, SSH 키, JWT)이 전부 GitHub Secrets에 있다. 로컬 배포는 자격증명이 로컬에 있어야 하고 사람마다 상태가 다르다. CI 경로는 재현 가능하고 스모크 체크까지 자동으로 돈다.

**로컬 경로를 남겨둔 이유**

커밋하지 않은 상태로 급히 확인해야 할 때가 있다. 다만 백엔드 로컬 배포는 SSH 키 경로가 불확실하면 시도하지 말라고 명시했다 — 반쯤 배포된 상태가 제일 위험하다.

**푸시 자동배포 함정을 경고에 넣은 이유**

`deploy.yml`은 `workflow_run`으로 **CI 성공 시 자동 실행**된다. 즉 main에 푸시하면 프론트·백엔드가 **둘 다** 나간다. "프론트만 배포"하려고 푸시하면 의도와 다르게 백엔드도 배포된다. 이 함정을 Step 2 경고로 박아뒀다.

---

## 5. 인프라 (요약)

| 항목 | 값 |
|---|---|
| 도메인 | `dxline-tallent.com` |
| CloudFront | `E11NF3HMOB52NI` |
| 프론트 S3 | `beauty-book-hair-front` |
| 이미지 S3 | `milla-donation-images` |
| EC2 | `13.209.195.64` · 포트 `4301` |
| systemd | `milla-server.service` |
| DB | `donation_platform` @ `:5436` |
| 리포지토리 | `dota-pilot1/milla-pilot` |

**비밀값은 서버 `.env`와 GitHub Secrets에만 존재한다. 문서·코드에 기재하지 않는다.**

---

## 6. 알려진 제약

1. **CORS 하드코딩** — `SecurityConfig.java`에 허용 origin이 박혀 있다. 도메인 추가 시 코드 수정 + 재배포 필요.
2. **정적 export** — 동적 라우트 불가. `/donate/facility?id=` 쿼리스트링 방식을 유지해야 한다.
3. **롤백** — 백엔드는 EC2의 `app.jar.prev`가 직전 버전. 프론트는 S3 `--delete` 동기화라 이전 버전이 남지 않는다(필요하면 재빌드·재배포).

---

## 7. 관련 문서

- `docs-for-프로젝트 문서1/배포 관련/서버·프론트 배포 방법 (EC2·S3).md`
- `docs-for-프로젝트 문서1/배포 관련/배포 사이트 정보.html`
- `docs-for-프로젝트 문서1/배포 관련/데스크탑 앱 릴리스 방법 (Tauri).md` — Tauri 앱은 이 스킬 대상이 아님
- `.github/workflows/deploy.yml`
