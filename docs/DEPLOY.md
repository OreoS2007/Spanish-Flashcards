# 公開方法

## 現在の方法：GitHub Pages（2026-10-07 から）
- 公開 URL：https://oreos2007.github.io/Spanish-Flashcards/
- リポジトリ：https://github.com/OreoS2007/Spanish-Flashcards（公開）
- 設定：`main` ブランチのルート（`/`）の `index.html` がそのままサイトになる。
- 更新の手順（Claude Code が行う）：
  1. `npm run check` と `npm test` が通ることを確認する。
  2. `git add -A` → `git commit` → `git push`。
  3. 1〜2分で公開サイトに反映される。
- 進捗はブラウザの localStorage に保存される。**この URL を使い続ければ進捗は残る。** URL が変わると引き継がれない。
- 注意：リポジトリは公開なので、誰でもコードを見られる。コミットにはユーザー名とメールアドレスの記録が含まれる。

## 旧版：claude.ai のアーティファクト（2026-10-07 以降は更新しない）
- リンク：https://claude.ai/artifact/8fRhEgVQk9GarwHoCeVVu9
- 移行前の進捗が残っているが、このデータは GitHub Pages 版には引き継がれない。
- 更新したくなった場合の手順：claude.ai の「スペイン語単語帳」プロジェクトのチャットに `index.html` を添付し、「添付の index.html でこのアーティファクトを更新して公開して。新しいアーティファクトは作らないで。」と頼む。
