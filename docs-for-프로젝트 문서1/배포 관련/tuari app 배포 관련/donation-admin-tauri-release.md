# Donation Admin Tauri 앱 배포 절차

> 이 문서는 `donation-admin-tauri` 데스크탑 앱을 GitHub Release와 Tauri updater로 배포하는 운영 절차를 정리한다.
> 폴더명은 요청에 맞춰 `tuari app 배포 관련`으로 두지만, 대상 기술은 Tauri다.

## 현재 결론

- `dota-pilot1/donation-admin-tauri` repo에는 이미 `.github/workflows/tauri-release.yml`이 있다.
- `v0.1.4`까지 Tauri Release workflow가 성공했고, 최신 릴리즈도 해당 repo에 게시되어 있다.
- 따라서 새 workflow를 만드는 작업보다 중요한 것은 `milla-pilot/donation-admin-tauri` 변경을 release repo로 동기화하고 새 버전 태그를 푸시하는 것이다.
- Tauri updater endpoint도 이미 `https://github.com/dota-pilot1/donation-admin-tauri/releases/latest/download/latest.json`를 바라본다.

## Repo 역할

| Repo | 역할 |
|---|---|
| `dota-pilot1/milla-pilot` | 모노레포 원본. backend, web, admin source 개발 기준 |
| `dota-pilot1/donation-admin-tauri` | 데스크탑 앱 release 전용 repo. Tauri Release workflow가 실행되는 위치 |

GitHub Actions는 repo root의 `.github/workflows`만 실행하므로, 모노레포 하위 폴더에 workflow를 넣어도 release repo에서는 실행되지 않는다.

## Release 전 확인

1. `milla-pilot`에서 관리앱 변경을 커밋/푸시한다.
2. `donation-admin-tauri` 버전을 아래 파일에 맞춘다.
   - `donation-admin-tauri/package.json`
   - `donation-admin-tauri/package-lock.json`
   - `donation-admin-tauri/src-tauri/tauri.conf.json`
   - `donation-admin-tauri/src-tauri/Cargo.toml`
   - `donation-admin-tauri/src-tauri/Cargo.lock`
3. 로컬 검증을 통과시킨다.
   - `cd donation-admin-tauri && npm run build`
   - backend API 변경이 있으면 `cd donation-platform-server && ./gradlew compileJava`

## 표준 절차

```bash
# 1. 모노레포 앱 버전 bump
cd /Users/terecal/milla-pilot/donation-admin-tauri
npm version X.Y.Z --no-git-tag-version
# src-tauri/tauri.conf.json, src-tauri/Cargo.toml도 X.Y.Z로 수정

# 2. 검증
npm run build
cd /Users/terecal/milla-pilot/donation-platform-server
./gradlew compileJava

# 3. 모노레포 커밋/푸시
cd /Users/terecal/milla-pilot
git add donation-admin-tauri/package.json \
  donation-admin-tauri/package-lock.json \
  donation-admin-tauri/src-tauri/tauri.conf.json \
  donation-admin-tauri/src-tauri/Cargo.toml \
  donation-admin-tauri/src-tauri/Cargo.lock
git commit -m "chore: bump admin app to vX.Y.Z"
git push origin main

# 4. release repo clone
tmpdir=$(mktemp -d /tmp/donation-admin-tauri-release.XXXXXX)
gh repo clone dota-pilot1/donation-admin-tauri "$tmpdir"

# 5. 모노레포 앱 소스를 release repo에 동기화
rsync -a --delete --exclude '.git' --exclude '.github' \
  /Users/terecal/milla-pilot/donation-admin-tauri/ \
  "$tmpdir"/

# 6. release repo 검증, 커밋, 태그
cd "$tmpdir"
npm run build
git add .
git commit -m "Release Donation Admin vX.Y.Z"
git tag vX.Y.Z
git push origin main
git push origin vX.Y.Z
```

## Release workflow 확인

```bash
gh run list --repo dota-pilot1/donation-admin-tauri --limit 5
gh run watch <run-id> --repo dota-pilot1/donation-admin-tauri --exit-status
gh release list --repo dota-pilot1/donation-admin-tauri --limit 5
curl -I -L https://github.com/dota-pilot1/donation-admin-tauri/releases/latest/download/latest.json
```

성공 기준:

- `Tauri Release` workflow가 성공한다.
- `dota-pilot1/donation-admin-tauri`에 새 정식 release가 생긴다.
- release asset에 macOS/Windows 설치 파일과 updater artifact가 포함된다.
- `latest.json`이 latest release URL에서 200으로 내려온다.

## 자동화 필요 여부

새 Tauri Release workflow는 현재 필요 없다. 이미 release repo에 있다.

추가 자동화를 만든다면 대상은 workflow 자체가 아니라 아래 반복 작업이다.

- 모노레포 `donation-admin-tauri`를 release repo로 동기화
- 버전 bump 일관성 확인
- release repo 커밋 생성
- `vX.Y.Z` 태그 푸시
- GitHub Actions 결과 확인

이 자동화는 shell script나 Codex skill로 충분하다. GitHub workflow로 만들려면 외부 repo push 권한을 가진 PAT secret이 필요하므로 운영 복잡도가 올라간다.

## 주의사항

- `TAURI_SIGNING_PRIVATE_KEY`와 `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`는 release repo secrets에 있어야 한다.
- Apple 서명/공증 secrets가 없으면 macOS 설치 시 Gatekeeper 경고가 날 수 있다.
- 기존 설치 앱은 `donation-admin-tauri` repo의 latest release를 바라보므로 endpoint를 모노레포로 바꾸지 않는다.
- `pre-release`는 `/releases/latest` 대상에서 제외될 수 있으므로 updater용 릴리즈는 정식 release로 게시한다.
