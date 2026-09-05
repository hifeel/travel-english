# Travel English

여행에서 바로 쓰는 영어 회화 PWA.

라이브: https://towns.co.kr/travel-english/

## 구성

| 파일 | 역할 |
|---|---|
| `index.html` | 대화 목록 |
| `lesson.html` | 대화 화면 (재생, 반복, 완료) |
| `app.js` | 공통 재생/완료 로직 |
| `data/lessons.json` | 대화 데이터 (문장·번역·음성 경로) |
| `audio/` | 문장별 MP3 (라이브에서 받음) |
| `icons/` | PWA 아이콘 |

## 로컬에서 보기

```bash
git clone git@github.com:hifeel/travel-english.git
cd travel-english
./scripts/fetch-media.sh    # 음성·아이콘 다운로드 (~7MB)
python3 -m http.server 8080
```

브라우저에서 http://localhost:8080 을 엽니다.

PWA 경로가 `/travel-english/` 이라 로컬에서는 아이콘·서비스워커 경로가 조금 다를 수 있습니다. 대화와 재생은 그대로 동작합니다.

## 데이터만 고치기

새 대화는 `data/lessons.json` 의 `lessons` 배열에 추가합니다.

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

- `role`: `you` (여성 목소리) / 그 외 스태프 (남성)
- 음성 파일은 `audio/` 에 같은 이름으로 둡니다.

## Towns 서버 배포

Towns 호스트에서 저장소를 clone한 뒤:

```bash
./scripts/deploy.sh
```

`towns-web` nginx 컨테이너의 `/usr/share/nginx/html/travel-english/` 로 복사합니다.
