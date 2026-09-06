# Travel English

여행에서 바로 쓰는 영어 회화 PWA.

라이브: https://hifeel.github.io/travel-english/

저장소: https://github.com/hifeel/travel-english

## GitHub Pages

1. 저장소를 **Public** 로 바꿉니다. (Pages는 public 저장소에서 무료입니다.)
2. GitHub 저장소 → **Settings** → **Pages**
3. Source를 **GitHub Actions** 로 선택합니다.
4. **Actions** 탭에서 `Deploy GitHub Pages` 워크플로가 돌아가면 사이트가 열립니다.

이후에는 `main`에 push하면 자동 배포됩니다. Towns 서버 / MCP / `deploy.sh`는 필요 없습니다.

## 구성

| 파일 | 역할 |
|---|---|
| `index.html` | 대화 목록 |
| `lesson.html` | 대화 화면 |
| `app.js` | 공통 재생/완료/데이터 로더 |
| `data/index.json` | 대화 ID 목록 |
| `data/lessons/*.json` | 대화 데이터 |
| `audio/` | MP3 |
| `icons/` | PWA 아이콘 |
| `manifest.json` | PWA 매니페스트 |
| `sw.js` | 서비스 워커 |

## 로컬

```bash
git clone git@github.com:hifeel/travel-english.git
cd travel-english
python3 -m http.server 8080
```

http://localhost:8080

## 새 대화 추가

1. `data/lessons/28.json` 처럼 JSON을 만듭니다.
2. `data/index.json`에 ID를 넣습니다.
3. `audio/`에 mp3를 넣습니다.
4. `main`에 push합니다.

- `role`: `you` → en-US-JennyNeural / 스태프 → en-US-GuyNeural
