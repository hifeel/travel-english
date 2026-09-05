# Travel English

여행에서 바로 쓰는 영어 회화 PWA.

라이브: https://towns.co.kr/travel-english/

저장소: https://github.com/hifeel/travel-english (
private)

## 구성

| 파일 | 역할 |
|---|---|
| `index.html` | 대화 목록 |
| `lesson.html` | 대화 화면 |
| `app.js` | 공통 재생/완료 로직 |
| `data/index.json` | 대화 ID 목록 |
| `data/lessons/*.json` | 대화 데이터 (문장·번역) |
| `audio/` | MP3. **Git에 넣지 않음** — 라이브에서 받음 |
| `icons/` | PWA 아이콘. 동일히 라이브에서 받음 |

음성 파일은 저장소에 없습니다. 필요하면 `./scripts/fetch-media.sh` 로 라이브 사이트에서 다운로드합니다.

## 로컬에서 보기

```bash
git clone git@github.com:hifeel/travel-english.git
cd travel-english
./scripts/fetch-media.sh    # 음성·아이콘 (~7MB), 선택
python3 -m http.server 8080
```

http://localhost:8080 을 엽니다.

음성을 받지 않아도 대화 텍스트는 보이고, 없는 MP3는 브라우저 TTS로 대체됩니다.

## 데이터만 고치기

새 대화는 `data/lessons/18.json` 처럼 파일을 만들고 `data/index.json` 에 ID를 추가합니다.

```json
{
  "id": "18",
  "slug": "at-the-hotel-gym",
  "title_en": "...",
  "title_ko": "...",
  "subtitle": "...",
  "desc": "...",
  "turns": [
    { "role": "you", "speaker": "You (Traveler)", "en": "...", "ko": "...", "audio": "audio/xx01.mp3" }
  ],
  "tips": [{ "en": "...", "ko": "..." }]
}
```

- `role`: `you` (여성) / 그 외 스태프 (남성)

## Towns 서버 배포

Towns 호스트에서:

```bash
./scripts/deploy.sh
```
