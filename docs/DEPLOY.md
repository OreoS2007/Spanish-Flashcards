# 公開方法

Claude Code は手元の `index.html` を編集できるが、claude.ai のアーティファクトを直接更新することはできない。公開方法は2つある。

## 方法A：今の claude.ai のリンクを使い続ける（現在の方法）
- リンク：https://claude.ai/artifact/8fRhEgVQk9GarwHoCeVVu9
- 手順：
  1. Claude Code で作業し、`npm run check` と `npm test` が通ることを確認する。
  2. claude.ai の「スペイン語単語帳」プロジェクトでチャットを開き、`index.html` を添付して次のように頼む。
     「添付の index.html で https://claude.ai/artifact/8fRhEgVQk9GarwHoCeVVu9 を更新して公開して。新しいアーティファクトは作らないで。」
- 長所：同じリンクのまま、これまでの進捗もそのまま残る。
- 短所：公開のたびに claude.ai に戻る手間がある。

## 方法B：GitHub Pages で自分のサイトとして公開する
- 自分の GitHub リポジトリに置き、`https://<ユーザー名>.github.io/<リポジトリ名>/` で公開する。Claude Code が push まで行えるので、公開も Claude Code の中で完結する。
- 準備（初回だけ。Claude Code に「GitHub Pages で公開できるように手伝って」と頼めば一歩ずつ案内する）：
  1. GitHub アカウントを作る（無料）。
  2. 新しいリポジトリを作り、このフォルダを push する。
  3. リポジトリの設定で Pages を有効にする（ブランチ main、フォルダは / ）。
- 長所：公開まで Claude Code で完結。スマホからは URL を開くだけ。
- 短所：URL が変わるので、**claude.ai 版の進捗は引き継がれない**（ユーザーは進捗より品質を優先すると言っているので、許容範囲）。公開リポジトリは誰でも見られる。
- 注意：localStorage はそのサイト専用なので、同じ URL を使い続ければ進捗は残る。

## どちらがよいか
- 手間を最小にしたいなら、まずは方法Aで始めて、慣れてきたら方法Bに移るのがよい。
- 方法Bに移るときは、移行日をユーザーに確認し、claude.ai 版を「旧版」として残すかどうかも決める。
