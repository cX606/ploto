# PLOTO — 스크롤 인터랙티브 웹사이트

카페 · 미용실 · 네일샵 · 오피스 · 음식점, 다섯 가지 공간 컨셉을 보여주는 원페이지 사이트입니다.
빌드 도구나 라이브러리 없이 HTML, CSS, JavaScript만으로 동작합니다.

## 스크롤 인터랙션

| 섹션 | 동작 |
| --- | --- |
| Hero | 스크롤하면 평면도가 선부터 그려지고, PLOTO 로고가 흩어집니다. |
| About | 소개 문장이 단어 단위로 차례차례 밝아집니다. |
| Spaces | 화면이 고정된 채 다섯 공간이 가로로 넘어갑니다. 배경색이 공간별로 바뀌고, 일러스트가 패럴랙스로 움직이며, Seedance 영상은 스크롤에 맞춰 재생됩니다. |
| Process | 단계가 아래에서 떠오르고 진행선이 채워집니다. |
| Contact | 공간 이름 띠가 스크롤 방향으로 흐릅니다. |

화면 폭이 860px 이하면 Spaces가 세로 목록으로 바뀝니다. 시스템의 "동작 줄이기" 설정도 존중합니다.

## 로컬에서 보기

```bash
npx http-server -p 8080
# http://localhost:8080
```

영상 스크럽(스크롤에 맞춘 재생)은 HTTP Range 요청이 필요합니다. `python3 -m http.server`는 이를 지원하지 않아 영상이 첫 프레임에 멈춥니다.
GitHub Pages, Netlify, Vercel 같은 일반 정적 호스팅은 모두 지원합니다.

## Seedance 2.0 컨셉 영상

다섯 공간의 영상은 Seedance 2.0으로 생성했습니다. 1920×1080, 5초, 오디오 없음입니다.
생성 기록과 원본 주소는 `seedance/clips.json`, 프롬프트는 `seedance/prompts.json`에 있습니다.

지금 사이트는 Higgsfield 서버에 올려 둔 스크롤용 영상(1280×720, 4프레임마다 키프레임)과 컨셉 이미지를 바로 불러옵니다. 주소는 `seedance/clips.json`의 `web_video_url`, `web_still_url`에 있습니다.

### 영상을 사이트 안으로 가져오기 (권장)

원본 영상은 스크롤 재생용으로 인코딩되지 않았고 외부 서버에 의존합니다. 아래 명령 하나로 원본을 내려받아 사이트 안에 최적화된 사본을 만듭니다. ffmpeg와 python3가 필요합니다.

```bash
scripts/fetch-seedance.sh
```

공간마다 다음 파일이 `assets/media/`에 생깁니다.

- 스크럽용으로 다시 인코딩한 `<id>.mp4`(H.264)와 `<id>.webm`(VP9)
- 영상 중간 프레임을 뽑은 컨셉 이미지 `<id>.jpg`
- 사이트가 읽는 목록 `manifest.js`. 로컬 파일이 있으면 로컬을, 없으면 원본 주소를 씁니다.

다른 영상으로 바꾸려면 `cafe.mp4`처럼 공간 이름으로 저장한 폴더를 `scripts/prepare-media.sh <폴더>`에 넘기면 됩니다.

## 수정할 곳

- 문의 이메일: `js/main.js` 맨 위 `CONFIG.contactEmail`
- 공간별 문구·태그·팔레트: `index.html`의 `.space` 블록
- 공간별 배경색: `js/main.js`의 `SPACES`
- 컨셉 일러스트: `js/scenes.js`
