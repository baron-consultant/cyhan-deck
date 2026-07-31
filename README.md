# cyhan-deck

Slidev 발표 자료를 하나의 GitHub Pages 사이트 아래에 배포하는 저장소입니다.

현재 등록된 발표 자료:

- `ai-basics`: AI의 기본 이해

배포 주소:

- 목록: `https://baron-consultant.github.io/cyhan-deck/`
- AI의 기본 이해: `https://baron-consultant.github.io/cyhan-deck/ai-basics/`

## 실행

```sh
npm install
npm run dev
npm run dev:remote
npm run build
npm run export:pptx
npm run export:pdf
npm run export:png
```

`npm run build`는 `decks.json`에 등록된 모든 덱을 각각의 base path로
`dist/<slug>/`에 빌드하고, `dist/index.html`에 발표 자료 목록을 만듭니다.

## 새 발표 자료 추가

기존 `ai-basics`는 이 저장소의 루트 덱입니다. 새 발표 자료는 다음처럼 추가합니다.

1. 새 발표 자료와 전용 자산을 별도 디렉터리에 둡니다.
2. `decks.json`에 `slug`, `title`, `entry`를 추가합니다.
3. `npm run build`로 모든 base path를 검증합니다.

예:

```json
{
  "slug": "another-talk",
  "title": "다른 발표 자료",
  "entry": "decks/another-talk/slides.md"
}
```

GitHub의 `main` 브랜치에 푸시하면 `.github/workflows/deploy-pages.yml`이
모든 덱을 한 번에 빌드해 Pages에 배포합니다.

현재 덱은 `32:9` 비율과 `8000` 캔버스를 사용합니다.
