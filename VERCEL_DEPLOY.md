# Vercel 배포 가이드

## 빠른 배포 (권장)

### 1. Vercel 웹 대시보드 사용

1. **[Vercel](https://vercel.com)에 접속**

2. **GitHub 계정으로 로그인**
   - "Sign Up" 또는 "Log In" 클릭
   - GitHub 계정 선택

3. **프로젝트 추가**
   - 대시보드에서 "Add New..." 클릭
   - "Project" 선택

4. **저장소 선택**
   - `bope28s/Germ_battle` 저장소 선택
   - 또는 "Import" 클릭하여 저장소 검색

5. **프로젝트 설정**
   - **Framework Preset**: "Other" 또는 "Other" 선택
   - **Root Directory**: `./` (기본값 유지)
   - **Build Command**: 비워두기 (정적 사이트이므로)
   - **Output Directory**: 비워두기 (정적 사이트이므로)

6. **배포**
   - "Deploy" 버튼 클릭
   - 몇 초 후 배포 완료!

7. **배포 URL 확인**
   - 배포 완료 후 제공되는 URL로 접속 가능
   - 예: `https://germ-battle-xxx.vercel.app`
   - 원하는 경우 도메인 설정 가능

### 2. Vercel CLI 사용

```bash
# Vercel CLI 설치 (처음 한 번만)
npm install -g vercel

# 프로젝트 디렉토리에서 실행
vercel

# 질문에 답변:
# - Set up and deploy? Yes
# - Which scope? (계정 선택)
# - Link to existing project? No
# - What's your project's name? germ-battle
# - In which directory is your code located? ./
# - Want to override the settings? No

# 배포 완료!
```

## 자동 배포 설정

- ✅ **자동 배포 활성화됨**: GitHub 저장소에 연결되면 자동으로 설정됩니다
- 새로운 커밋을 `main` 브랜치에 푸시하면 자동으로 재배포됩니다
- Pull Request가 생성되면 미리보기 배포가 자동 생성됩니다

## 커스텀 도메인 설정 (선택사항)

1. Vercel 대시보드에서 프로젝트 선택
2. "Settings" → "Domains" 클릭
3. 원하는 도메인 입력
4. DNS 설정 안내에 따라 도메인 설정

## 배포 확인

배포가 완료되면:
- GitHub 저장소의 Actions 탭에서 자동 배포 상태 확인 가능
- Vercel 대시보드에서 배포 로그 확인 가능
- 제공된 URL로 접속하여 게임 플레이 가능!

