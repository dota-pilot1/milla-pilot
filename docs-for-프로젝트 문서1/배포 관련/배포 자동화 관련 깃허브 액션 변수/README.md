# 배포 자동화 관련 GitHub Actions 변수

대상 repo: <https://github.com/dota-pilot1/milla-pilot>

GitHub Actions 배포 자동화를 위해 등록해야 하는 Actions Secrets 정리 문서다.
GitHub 화면에서는 **Name과 Secret을 한 쌍씩** 등록해야 한다.
여러 변수명을 Secret 칸에 한꺼번에 붙여 넣으면 안 된다.

등록 페이지:
<https://github.com/dota-pilot1/milla-pilot/settings/secrets/actions>

## 1. 현재 라이브 배포 기준 값

| Name | Secret 값 | 비고 |
|---|---|---|
| `EC2_HOST` | `13.209.195.64` | 현재 라이브 EC2 IP |
| `EC2_USER` | `ubuntu` | EC2 SSH 사용자 |
| `EC2_SSH_KEY` | `hibot-d-server-key.pem 파일 내용 전체` | 파일 경로가 아니라 private key 본문 전체 |
| `AWS_ACCESS_KEY_ID` | `AWS IAM Access Key ID` | S3 sync + CloudFront invalidation 권한 필요 |
| `AWS_SECRET_ACCESS_KEY` | `AWS IAM Secret Access Key` | 문서/git에 저장 금지 |
| `AWS_REGION` | `ap-northeast-2` | 서울 리전 |
| `FRONT_S3_BUCKET` | `beauty-book-hair-front` | 현재 milla 정적 프론트 S3 버킷 |
| `CLOUDFRONT_DISTRIBUTION_ID` | `E11NF3HMOB52NI` | 현재 dxline-tallent.com CloudFront 배포 ID |
| `NEXT_PUBLIC_API_URL` | `https://dxline-tallent.com` | 프론트 운영 API URL |

## 2. GitHub 화면 입력용

아래 블록을 하나씩 등록한다.

### EC2_HOST

```txt
Name
EC2_HOST

Secret
13.209.195.64
```

### EC2_USER

```txt
Name
EC2_USER

Secret
ubuntu
```

### EC2_SSH_KEY

```txt
Name
EC2_SSH_KEY

Secret
TODO: hibot-d-server-key.pem 파일 내용 전체
```

### AWS_ACCESS_KEY_ID

```txt
Name
AWS_ACCESS_KEY_ID

Secret
TODO: AWS IAM Access Key ID
```

### AWS_SECRET_ACCESS_KEY

```txt
Name
AWS_SECRET_ACCESS_KEY

Secret
TODO: AWS IAM Secret Access Key
```

### AWS_REGION

```txt
Name
AWS_REGION

Secret
ap-northeast-2
```

### FRONT_S3_BUCKET

```txt
Name
FRONT_S3_BUCKET

Secret
beauty-book-hair-front
```

### CLOUDFRONT_DISTRIBUTION_ID

```txt
Name
CLOUDFRONT_DISTRIBUTION_ID

Secret
E11NF3HMOB52NI
```

### NEXT_PUBLIC_API_URL

```txt
Name
NEXT_PUBLIC_API_URL

Secret
https://dxline-tallent.com
```

## 3. 로컬 비밀값 파일

실제 AWS 키나 pem 내용을 적어두고 복붙하고 싶으면 같은 폴더에 아래 파일 중 하나를 만든다.

- `secret-values.local.md`
- `secret-values.local.html`

이 두 파일명은 이 폴더의 `.gitignore`에 등록되어 있어 git에 올라가지 않는다.

권장 로컬 파일 예시:

```txt
EC2_SSH_KEY
private key 파일 본문 전체

AWS_ACCESS_KEY_ID
실제 Access Key ID

AWS_SECRET_ACCESS_KEY
실제 Secret Access Key
```

## 4. EC2_SSH_KEY 넣는 법

`EC2_SSH_KEY`는 `.pem` 파일 경로나 파일명이 아니라 파일 내용 전체다.

```bash
cat /path/to/hibot-d-server-key.pem
```

GitHub Secret 칸에는 private key 파일의 본문 전체가 들어가야 한다.

```txt
private key 파일 첫 줄부터 마지막 줄까지 전체
```

private key 본문은 문서, 채팅, git commit에 남기지 않는다.
GitHub Actions Secret 입력 화면 또는 `.gitignore`된 로컬 파일에만 둔다.

## 5. AWS 키 권한

배포 자동화용 AWS 키는 가능하면 전용 IAM User 또는 Role로 만들고 최소 권한만 준다.

| 권한 | 대상 | 이유 |
|---|---|---|
| `s3:ListBucket` | `beauty-book-hair-front` | `aws s3 sync --delete` 실행 |
| `s3:GetObject`, `s3:PutObject`, `s3:DeleteObject` | `beauty-book-hair-front/*` | 정적 빌드 산출물 업로드/삭제 |
| `cloudfront:CreateInvalidation` | `E11NF3HMOB52NI` | 배포 후 CloudFront 캐시 무효화 |

임시로 기존 AWS 키를 쓸 수는 있지만, 권장 방식은 배포 전용 최소 권한 키다.
이미지 업로드용 앱 키와 배포 자동화 키를 분리하면 사고 범위가 줄어든다.

## 6. GitHub Actions에서 쓰는 방식

```yaml
env:
  AWS_REGION: ${{ secrets.AWS_REGION }}
  FRONT_S3_BUCKET: ${{ secrets.FRONT_S3_BUCKET }}
  CLOUDFRONT_DISTRIBUTION_ID: ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }}
  NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}
```

```bash
ssh -i ~/.ssh/deploy_key "${{ secrets.EC2_USER }}@${{ secrets.EC2_HOST }}" \
  "sudo systemctl restart milla-server"
```

## 7. 참고 파일

- `docs-for-프로젝트 문서1/배포 관련/배포 사이트 정보.html`
- `docs-for-프로젝트 문서1/배포 관련/서버·프론트 배포 방법 (EC2·S3).md`
- `docs-for-프로젝트 문서1/배포 관련/ci cd 현황 파악 및 업데이트 계획/index.html`
- `donation-platform-front/next.config.ts`
- `donation-platform-front/src/shared/api/axios.ts`
