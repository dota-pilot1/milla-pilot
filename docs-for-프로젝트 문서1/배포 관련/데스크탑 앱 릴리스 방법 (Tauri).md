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
| `APPLE_CERTIFICATE` | ✅ (워크플로가 참조하면) | Developer ID 인증서(base64) |
| `APPLE_CERTIFICATE_PASSWORD` | ✅ (워크플로가 참조하면) | 인증서 비밀번호 |
| `APPLE_SIGNING_IDENTITY` | ✅ (워크플로가 참조하면) | `Developer ID Application: ...` |
| `APPLE_ID` / `APPLE_PASSWORD` / `APPLE_TEAM_ID` | ✅ (워크플로가 참조하면) | 노터라이제이션 |

> ### ⚠️ APPLE_* 시크릿 누락 = 미서명이 아니라 **빌드 실패**
>
> "Apple 시크릿이 없으면 미서명으로 나온다"는 **틀렸다.** 워크플로에
> `APPLE_CERTIFICATE: ${{ secrets.APPLE_CERTIFICATE }}` 줄이 있는데 시크릿이 등록돼 있지 않으면,
> 변수가 **없는 게 아니라 빈 문자열**로 주입된다. Tauri는 이를 "서명하라는 지시"로 해석하고
> 빈 인증서를 키체인에 import하려다 실패한다:
>
> ```
> security: SecKeychainItemImport: One or more parameters passed to a function were not valid.
> failed to bundle project: failed codesign application
> ```
>
> 결과: **macOS job만 죽고 Windows는 성공** → 릴리스에 `.exe`만 올라가고 `.dmg`가 없다.
> `latest.json`에 `darwin-*` 항목이 빠져서 **Mac 자동 업데이트도 조용히 멈춘다.**
>
> **선택지는 둘뿐이다 — 중간은 없다.**
> 1. **서명한다** → APPLE_* 6개를 모두 등록 (권장)
> 2. **서명 안 한다** → 워크플로에서 `APPLE_*` env 줄을 **삭제**한다.
>    주석 처리나 빈 시크릿으로 두면 안 된다. 그래야 진짜 미서명 `.dmg`가 나온다.
>
> 실제 사고 2건: `donation-admin-tauri` v0.1.1, `milla-dev-task-tauri` v0.1.10·v0.1.11.
> 리포가 다르면 시크릿이 공유되지 않으므로 **앱마다 따로 등록해야 한다.**

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

> `Cargo.lock`의 이 앱 패키지 `version`도 함께 올려야 빌드 중 lock 갱신으로 인한 diff가 생기지 않는다.

그다음:

- [ ] `plugins.updater.pubkey`가 이 앱 키의 공개키인지 확인
- [ ] `plugins.updater.endpoints`가 이 앱 repo의 releases를 가리키는지 확인
- [ ] **GitHub Secrets 등록 확인 — 워크플로가 참조하는 시크릿이 전부 있는지 대조**
  ```bash
  # 워크플로가 요구하는 목록
  grep -oE '[A-Z_]+: \$\{\{ secrets\.[A-Z_]+' .github/workflows/tauri-release.yml
  # 실제 등록된 목록 (값은 안 나온다)
  gh secret list --repo <owner>/<repo>
  ```
  두 목록이 다르면 **릴리스를 시작하지 않는다.** 하나라도 비면 macOS가 죽는다(§3 경고).
- [ ] 변경 커밋 → `git commit -am "chore: release vX.Y.Z"`
- [ ] 태그 + push
  ```bash
  git tag v0.1.2
  git push origin v0.1.2
  ```
- [ ] Actions 탭에서 macOS/Windows 빌드 성공 확인 — **Windows만 성공했는지 반드시 본다**
- [ ] Releases에 `.dmg` **와** `.exe` + `latest.json` 업로드 확인
  ```bash
  gh release view vX.Y.Z --repo <owner>/<repo> --json assets --jq '.assets[].name'
  ```
- [ ] `latest.json`에 `darwin-*` 항목이 있는지 확인 (없으면 Mac 자동 업데이트가 멈춘다)
- [ ] 기존 설치본에서 자동 업데이트 팝업 뜨는지 확인

### 새 Tauri 앱 repo를 만들 때 (1회)

시크릿은 repo마다 따로다. 앱을 새로 만들면 **8개를 전부 다시 등록**해야 한다.

- [ ] `TAURI_SIGNING_PRIVATE_KEY` / `_PASSWORD` — **앱마다 새 키쌍**(재사용 금지)
- [ ] `APPLE_CERTIFICATE` / `APPLE_CERTIFICATE_PASSWORD`
- [ ] `APPLE_SIGNING_IDENTITY` / `APPLE_TEAM_ID`
- [ ] `APPLE_ID` / `APPLE_PASSWORD`
- [ ] 등록 후 `gh secret list`로 8개 확인
- [ ] 서명하지 않기로 했다면 → 워크플로에서 `APPLE_*` env 줄 **삭제**

> Apple 값은 `배포 관련/tauri 인증 관련/.local-secrets/`에 보관돼 있다(git 제외).
> base64는 개행이 섞이면 import가 깨지므로 `--body "$(tr -d '\n' < 파일)"` 형태로 넣는다.

---

## 7. 자주 막히는 곳

| 증상 | 원인 | 해결 |
|---|---|---|
| 워크플로가 안 돎 | 앱이 모노레포 하위 폴더 | 앱을 자체 repo로 분리(§2) |
| 자동 업데이트 안 뜸 | endpoint가 다른 repo/오타 | `tauri.conf.json` endpoints 수정 |
| 업데이트 서명 검증 실패 | pubkey ≠ 서명 개인키 | 키쌍 재확인, pubkey 교체 후 재릴리스 |
| macOS "손상됨" 경고 | 미서명/미공증 | APPLE_* 시크릿으로 공증 또는 내부 배포로 감수 |
| 버전 불일치 빌드 실패 | 3개 파일 version 다름 | 세 파일 동일 버전으로 |
| **`security: SecKeychainItemImport ... not valid`**<br>**`failed codesign application`** | **APPLE_* 시크릿 미등록 → 빈 문자열 주입** | 시크릿 6개 등록, 또는 워크플로에서 `APPLE_*` env 줄 삭제 (§3 경고) |
| **Windows만 성공하고 macOS만 실패** | 위와 동일 | 위와 동일. `.dmg` 없이 릴리스가 "성공"처럼 보이니 자산 목록을 반드시 확인 |
| **Mac만 자동 업데이트 안 됨** | `latest.json`에 `darwin-*` 누락 | macOS 빌드가 실패한 것이다. 위 항목 확인 후 재릴리스 |
| base64 인증서 import 실패 | 시크릿 값에 개행 포함 | `--body "$(tr -d '\n' < apple_certificate_base64.txt)"`로 재등록 |

---

## 8. 남은 정리 (milla-dev-task-tauri 전용)

- [ ] 자체 GitHub repo 생성 후 push
- [ ] 업데이터 endpoint: towercrane → `dota-pilot1/milla-dev-task-tauri`
- [ ] **새 서명 키쌍 생성**(towercrane 키 재사용 금지) → pubkey 교체 + Secrets 등록
- [ ] `client.ts`의 운영 API(`api.hibot-docu.com`)를 밀라 백엔드로 교체 (별도 백엔드 필요 — 이 앱은 현재 towercrane task API 종속)
