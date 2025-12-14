# 배포 가이드

## GitHub에 업로드하기

### 1. GitHub에서 저장소 생성
1. [GitHub](https://github.com)에 로그인
2. 우측 상단의 "+" 버튼 클릭 → "New repository" 선택
3. 저장소 이름 입력 (예: `germ-battle`)
4. "Public" 또는 "Private" 선택
5. "Create repository" 클릭

### 2. 로컬 저장소를 GitHub에 연결

```bash
# GitHub 저장소 URL로 원격 저장소 추가
git remote add origin https://github.com/사용자명/저장소명.git

# 브랜치 이름을 main으로 변경 (GitHub 기본 브랜치)
git branch -M main

# GitHub에 푸시
git push -u origin main
```

> **참고**: 사용자명과 저장소명을 실제 값으로 변경하세요.

## Vercel로 배포하기

### 방법 1: Vercel 웹 대시보드 사용 (권장)

1. [Vercel](https://vercel.com)에 접속
2. GitHub 계정으로 로그인
3. 대시보드에서 "Add New..." → "Project" 클릭
4. 방금 만든 GitHub 저장소 선택
5. 프로젝트 설정:
   - Framework Preset: "Other" 선택
   - Root Directory: `./` (기본값)
6. "Deploy" 클릭
7. 배포 완료 후 제공되는 URL로 접속 가능!

### 방법 2: Vercel CLI 사용

```bash
# Vercel CLI 설치 (처음 한 번만)
npm install -g vercel

# 프로젝트 디렉토리에서 실행
vercel

# 처음 실행 시:
# - Vercel 계정 로그인
# - 프로젝트 설정 질문에 답변
# - 배포 완료!
```

### 배포 후
- Vercel은 자동으로 GitHub 저장소와 연결
- 새로운 커밋을 main 브랜치에 푸시하면 자동으로 재배포됩니다!

## 트러블슈팅

### Git 원격 저장소가 이미 있는 경우
```bash
# 기존 원격 저장소 확인
git remote -v

# 기존 원격 저장소 변경
git remote set-url origin https://github.com/사용자명/저장소명.git
```

### Vercel 배포 오류
- `vercel.json` 파일이 올바른지 확인
- Vercel 대시보드의 로그에서 오류 확인
- 필요시 Vercel 설정에서 Build Command와 Output Directory 확인

