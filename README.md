# Travel English

여행에서 바로 쓰는 영어 회화 PWA.

라이브: https://hifeel.github.io/travel-english/

저장소: https://github.com/hifeel/travel-english

## 배포 (GitHub Pages, MCP 없음)

Pages Source: **Deploy from a branch** → `main` / `/ (root)`

`main`에 push하면 사이트가 갱신됩니다. Towns 서버, MCP, docker cp는 쓰지 않습니다.

```bash
git add data/lessons/28.json data/index.json audio/*.mp3
git commit -m "Add lesson 28"
git push origin main
```

## 구성

| 파일 | 역할 |
|---|---|
| `index.html` | 대화 목록 |
| `lesson.html` | 대화 화면 |
| `app.js` | 공통 로더 |
| `data/index.json` | 대화 ID 목록 |
| `data/lessons/*.json` | 대화 데이터 |
| `audio/` | MP3 |
| `icons/` | PWA 아이콘 |

## 음성

```bash
pip install edge-tts
./scripts/generate-audio.sh data/lessons/28.json
```

- `you` → en-US-JennyNeural
- 스태프 → en-US-GuyNeural

## 로컬

```bash
git clone git@github.com:hifeel/travel-english.git
cd travel-english
python3 -m http.server 8080
```
