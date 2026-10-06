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

## Seedance 2.0 컨셉 영상·이미지 넣기

지금 각 공간에는 직접 그린 SVG 컨셉 일러스트가 들어가 있습니다.
Seedance 2.0 결과물을 넣으면 일러스트 위에 자동으로 겹쳐지고, 배지가 "Seedance 2.0"으로 바뀝니다.

1. `seedance/prompts.json`의 프롬프트로 다섯 개 영상을 생성합니다. 4초, 16:9, 오디오 없음, 720p 이상을 권장합니다.
2. 파일 이름을 `cafe.mp4`, `salon.mp4`, `nail.mp4`, `office.mp4`, `restaurant.mp4`로 바꿔 한 폴더에 둡니다.
3. 아래 스크립트를 실행합니다. ffmpeg가 필요합니다.

```bash
scripts/prepare-media.sh ~/Downloads/seedance
```

스크립트는 공간마다 다음 파일을 `assets/media/`에 만듭니다.

- 스크럽용으로 다시 인코딩한 `<id>.mp4`(H.264)와 `<id>.webm`(VP9)
- 영상 중간 프레임을 뽑은 컨셉 이미지 `<id>.jpg`
- 어떤 파일이 있는지 사이트에 알려주는 `manifest.js`

일부 공간만 넣어도 됩니다. 없는 공간은 일러스트가 그대로 보입니다.

## 수정할 곳

- 문의 이메일: `js/main.js` 맨 위 `CONFIG.contactEmail`
- 공간별 문구·태그·팔레트: `index.html`의 `.space` 블록
- 공간별 배경색: `js/main.js`의 `SPACES`
- 컨셉 일러스트: `js/scenes.js`
