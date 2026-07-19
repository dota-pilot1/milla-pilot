# 데스크탑 앱 릴리스 방법 (Tauri)

> 참고 원본: `towercrane-for-uiux/towercrane-for-uiux-tauri` 및 각 Tauri 앱의 `.github/workflows/tauri-release.yml`
> 대상: 밀라의 Tauri 데스크탑 앱들 (macOS `.dmg` / Windows `.exe`) 자동 빌드 + 자동 업데이트

---

## 0. 밀라의 Tauri 앱 현황

| 앱 | productName | identifier | 버전 | 업데이터 대상 repo |
|---|---|---|---|---|
| `donation-admin-tauri` | Donation Admin | `com.donationplatform.admin.desktop` | 0.1.1 | `dota-pilot1/donation-admin-tauri` |
| `milla-dev-task-tauri` | Milla Dev Task | `com.milla-pilot.devtask` | 0.1.10 | ⚠️ 아직 towercrane repo 가리킴 (수정 필요) |

---

## 1. 릴리스 방식 (한눈에)

```text
git tag vX.Y.Z  →  git push origin vX.Y.Z
        │
        ▼
GitHub Actions (tauri-release.yml, on: push tags v*)
        │  matrix: macOS(universal) + Windows
        ▼
tauri-apps/tauri-action
   ├─ 프론트 빌드(npm ci → vite build)
   ├─ Rust 빌드(src-tauri)
   ├─ 서명(minisign) + (macOS) 코드사인/공증
   └─ GitHub Release 발행 + 업데이터 아티팩트(latest.json) 업로드
        │
        ▼
설치된 앱이 endpoints의 latest.json 폴링 → 서명 검증 후 자동 업데이트
```

- 트리거: **`v*` 태그 push** (예: `v0.1.2`).
- 산출물: macOS `.dmg`(universal: arm64+x86_64), Windows `.exe`(nsis), 그리고 `latest.json`.
- `createUpdaterArtifacts: true` + `plugins.updater` 설정으로 **자동 업데이트** 지원.

---

## 2. ⚠️ 구조 전제 — 각 Tauri 앱 = 독립 GitHub repo

towercrane 방식은 **Tauri 앱 하나당 GitHub repo 하나**다. 이유:

- `tauri.conf.json`의 업데이터 `endpoints`가 **그 앱 전용 repo의 releases**를 가리킨다.
  예: `https://github.com/dota-pilot1/donation-admin-tauri/releases/latest/download/latest.json`
- GitHub Actions는 **repo 루트의 `.github/workflows/`만** 실행한다. 지금처럼 앱이 `milla-pilot` 모노레포의 하위 폴더면 `donation-admin-tauri/.github/workflows/tauri-release.yml`는 **동작하지 않는다.**

따라서 릴리스하려면 둘 중 하나:

- **(권장) 각 Tauri 앱을 자체 repo로 push** — `dota-pilot1/donation-admin-tauri`, `dota-pilot1/milla-dev-task-tauri`. 워크플로가 그 repo 루트에서 돈다.
- (대안) 모노레포 루트에 워크플로를 두고 `working-directory` + 태그 접두사(`admin-v*`)로 앱 구분 — 설정 복잡, 비권장.

> `milla-dev-task-tauri`는 아직 업데이터 endpoint가 `towercrane-for-uiux`를 가리킨다. 자체 repo로 옮기고 endpoint를 `dota-pilot1/milla-dev-task-tauri`로 바꿔야 한다.

---

## 3. 서명 키 (앱마다 1회)

자동 업데이트는 **minisign 서명**으로 무결성을 보장한다. 앱마다 키쌍을 만든다.

```bash
cd <tauri-app>
npm run tauri signer generate -- -w ~/.tauri/milla-<app>.key
# 출력: 공개키(pubkey) + 비밀번호로 암호화된 개인키 파일
```

- **공개키** → `src-tauri/tauri.conf.json`의 `plugins.updater.pubkey`에 넣는다.
- **개인키(파일 내용) + 비밀번호** → GitHub Secrets에 넣는다(아래).

> 개인키는 **절대 git에 커밋하지 않는다.** 분실 시 기존 설치본은 더 이상 업데이트를 받지 못하므로 안전하게 백업한다.

---

## 4. GitHub Secrets (repo Settings → Secrets → Actions)

| Secret | 필수 | 용도 |
|---|---|---|
| `GITHUB_TOKEN` | 자동 | Release 생성 (Actions 기본 제공) |
| `TAURI_SIGNING_PRIVATE_KEY` | ✅ | 업데이터 서명 개인키(파일 내용) |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | ✅ | 위 개인키 비밀번호 |
| `APPLE_CERTIFICATE` | macOS 공증 시 | Developer ID 인증서(base64) |
| `APPLE_CERTIFICATE_PASSWORD` | macOS 공증 시 | 인증서 비밀번호 |
| `APPLE_SIGNING_IDENTITY` | macOS 공증 시 | `Developer ID Application: ...` |
| `APPLE_ID` / `APPLE_PASSWORD` / `APPLE_TEAM_ID` | macOS 공증 시 | 노터라이제이션 |

> Apple 관련이 없으면 macOS 빌드는 **미서명**으로 나온다(설치 시 Gatekeeper 경고). 내부 배포면 그대로도 가능, 외부 배포면 공증 권장.

---

## 5. 워크플로 핵심 (tauri-release.yml)

```yaml
on:
  push:
    tags: ["v*"]
permissions:
  contents: write
jobs:
  build-and-release:
    strategy:
      matrix:
        include:
          - platform: macos-15      # universal (arm64 + x86_64)
            args: "--target universal-apple-darwin"
          - platform: windows-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4          # node lts
      - uses: dtolnay/rust-toolchain@stable
      - run: npm ci
      - uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          VITE_API_BASE_URL: <밀라 API 도메인>     # 앱이 붙을 운영 API
          TAURI_SIGNING_PRIVATE_KEY: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY }}
          TAURI_SIGNING_PRIVATE_KEY_PASSWORD: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY_PASSWORD }}
          # (선택) APPLE_* 공증 시크릿
        with:
          tagName: ${{ github.ref_name }}
          releaseName: "Milla ... ${{ github.ref_name }}"
          releaseDraft: false
          prerelease: true
```

> `VITE_API_BASE_URL`은 빌드된 앱이 붙을 **운영 백엔드 주소**다. 앱별로 실제 API 도메인으로 바꾼다.
> `milla-dev-task-tauri`는 코드가 `import.meta.env.DEV`로 dev/prod를 가르므로(현재 dev=`localhost:3000`), 운영 API도 `client.ts`에 맞춰 확인한다.

---

## 6. 릴리스 절차 (체크리스트)

**버전은 3개 파일이 반드시 일치해야 한다.**

- [ ] `package.json` → `version`
- [ ] `src-tauri/tauri.conf.json` → `version`
- [ ] `src-tauri/Cargo.toml` → `version`

그다음:

- [ ] `plugins.updater.pubkey`가 이 앱 키의 공개키인지 확인
- [ ] `plugins.updater.endpoints`가 이 앱 repo의 releases를 가리키는지 확인
- [ ] GitHub Secrets(서명 키) 등록 확인
- [ ] 변경 커밋 → `git commit -am "chore: release vX.Y.Z"`
- [ ] 태그 + push
  ```bash
  git tag v0.1.2
  git push origin v0.1.2
  ```
- [ ] Actions 탭에서 macOS/Windows 빌드 성공 확인
- [ ] Releases에 `.dmg`/`.exe` + `latest.json` 업로드 확인
- [ ] 기존 설치본에서 자동 업데이트 팝업 뜨는지 확인

---

## 7. 자주 막히는 곳

| 증상 | 원인 | 해결 |
|---|---|---|
| 워크플로가 안 돎 | 앱이 모노레포 하위 폴더 | 앱을 자체 repo로 분리(§2) |
| 자동 업데이트 안 뜸 | endpoint가 다른 repo/오타 | `tauri.conf.json` endpoints 수정 |
| 업데이트 서명 검증 실패 | pubkey ≠ 서명 개인키 | 키쌍 재확인, pubkey 교체 후 재릴리스 |
| macOS "손상됨" 경고 | 미서명/미공증 | APPLE_* 시크릿으로 공증 또는 내부 배포로 감수 |
| 버전 불일치 빌드 실패 | 3개 파일 version 다름 | 세 파일 동일 버전으로 |

---

## 8. 남은 정리 (milla-dev-task-tauri 전용)

- [ ] 자체 GitHub repo 생성 후 push
- [ ] 업데이터 endpoint: towercrane → `dota-pilot1/milla-dev-task-tauri`
- [ ] **새 서명 키쌍 생성**(towercrane 키 재사용 금지) → pubkey 교체 + Secrets 등록
- [ ] `client.ts`의 운영 API(`api.hibot-docu.com`)를 밀라 백엔드로 교체 (별도 백엔드 필요 — 이 앱은 현재 towercrane task API 종속)
