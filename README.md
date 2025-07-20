# 🚀 Web3 블로그 - React + TypeScript + Wagmi

현대적인 Web3 블로그 애플리케이션으로, 블록체인 기술과 DeFi 서비스를 경험할 수 있는 플랫폼입니다.

## ✨ 주요 기능

- 🔗 **지갑 연결**: MetaMask 등 다양한 지갑 지원
- 💰 **스테이킹 시스템**: 토큰 스테이킹 및 보상 관리
- 🎨 **현대적 UI**: 반응형 디자인과 글래스모피즘 효과
- ⚡ **빠른 성능**: Vite 기반 빠른 개발 및 빌드
- 🔒 **타입 안전성**: TypeScript로 완전한 타입 체크

## 🏗️ 프로젝트 구조

```
jeong-byeol.github.io/
├── src/                    # 소스 코드
│   ├── component/         # React 컴포넌트
│   ├── pages/            # 페이지 컴포넌트
│   ├── styles/           # CSS 스타일 파일
│   ├── abis/             # 스마트 컨트랙트 ABI
│   └── wagmi.ts          # Wagmi 설정
├── docs/                 # GitHub Pages 배포용 (자동 생성)
├── public/               # 정적 파일
└── README.md            # 이 파일
```

## 🚀 시작하기

### 개발 환경 설정

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 배포용 빌드

```bash
# docs 폴더에 배포용 빌드
npm run build:docs

# 자동 배포 (GitHub Pages)
npm run deploy
```

## 📦 사용된 기술

### Frontend
- **React 19** - 최신 React 기능 활용
- **TypeScript** - 타입 안전성 보장
- **Vite** - 빠른 개발 및 빌드 도구
- **React Router** - SPA 라우팅

### Web3
- **Wagmi** - React용 Ethereum 훅 라이브러리
- **Viem** - 타입 안전한 Ethereum 클라이언트
- **MetaMask** - 지갑 연결 지원

### 스타일링
- **CSS3** - 모던 CSS 기능 활용
- **반응형 디자인** - 모든 디바이스 지원
- **글래스모피즘** - 현대적인 UI 효과

## 🎯 주요 페이지

### 🏠 홈 페이지
- 웰컴 메시지 및 소개
- 지갑 연결 기능
- 주요 기능 카드

### 💰 스테이킹 페이지
- 토큰 스테이킹/언스테이킹
- 보상 관리
- 실시간 데이터 표시

## 🔧 개발 스크립트

```bash
npm run dev          # 개발 서버 실행 (localhost:5173)
npm run build        # 프로덕션 빌드 (dist 폴더)
npm run build:docs   # GitHub Pages용 빌드 (docs 폴더)
npm run deploy       # 자동 배포
npm run preview      # 빌드 결과 미리보기
```

## 🌐 배포

### GitHub Pages 설정

1. GitHub 저장소 설정 → Pages
2. Source: Deploy from a branch
3. Branch: main
4. Folder: /docs

### 배포 과정

```bash
# 1. 빌드
npm run build:docs

# 2. Git에 추가 및 커밋
git add docs
git commit -m "Deploy to GitHub Pages"
git push
```

## 📱 반응형 디자인

- **데스크톱**: 사이드바 + 메인 콘텐츠 레이아웃
- **태블릿**: 적응형 그리드 레이아웃
- **모바일**: 세로 스택 레이아웃

## 🔒 보안

- **타입 안전성**: TypeScript로 런타임 오류 방지
- **지갑 연결**: 안전한 Web3 연결
- **에러 처리**: 사용자 친화적인 오류 메시지

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 연락처

프로젝트 링크: [https://github.com/jeong-byeol/jeong-byeol.github.io](https://github.com/jeong-byeol/jeong-byeol.github.io)

---

⭐ 이 프로젝트가 도움이 되었다면 스타를 눌러주세요!
