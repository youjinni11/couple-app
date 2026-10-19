# 우리둘 — 커플 버킷리스트 & 기록 (개인 테스트용 PWA)

- 화면: 정적 파일(index.html, app.js, lib.js, styles.css, sw.js) — GitHub Pages로 배포
- 데이터/로그인/사진: Supabase 프로젝트 `couple-bucket`
- 알림: Supabase Edge Function `notify` (supabase/functions/notify) + DB 트리거
- 알림 클릭 시 해당 화면으로 이동: sw.js 의 notificationclick
