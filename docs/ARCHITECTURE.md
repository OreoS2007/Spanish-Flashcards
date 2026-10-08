# アーキテクチャ（index.html の中身）

`index.html` は自己完結した1ファイル。外部から読み込むのは Google Fonts だけ。`<script>` は1つで、上から次の順に並ぶ。
場所は行番号ではなく、**検索文字列**で探すこと（行番号はすぐ変わる）。

## 1. データ部（`buildDict();` より前）

| 検索文字列 | 内容 |
|---|---|
| `const COGS=[` | 同根語の一覧 `{es,pos,en}`。Toolkit の Cognate rules 用。cog:1 の語は必ずここにもある |
| `const WORDS=[` と `WORDS.push(` | デッキ本体。追加バッチごとに `WORDS.push(...)` ブロックが続く |
| `const GLOSS_V1=` / `const EXTRA=` / `Object.assign(EXTRA,` | 補助辞書（活用形・派生形・デッキ外の語・複数語のチップ） |
| `const DETAIL=` / `Object.assign(DETAIL,` | 各カードの詳細（意味・例文・類義語・対義語）。後のブロックが前を上書きする |
| `/* B1 batch 1` など | 追加バッチ。`/* audit fixes ... */` は点検時の修正（DETAIL の上書き、EXTRA 追加） |
| `const PHRASES=[];` | **空**。フレーズは WORDS に pos `"phr"` で入っている。新ブロックはこの直前に足す |
| `const TOPICS=[` | 名詞のトピック分類 `[id, 名前, 絵文字, "語 語 語..."]`。後から追加した名詞の多くは未分類（"Other" 扱い） |
| `const IRR={` | 不規則活用。`pres` `pret` `subj` `part` `ger` `futst` など。キーは引用符あり／なしが混在 |
| `function conjugate(` / `function lookup(` | 活用表の自動生成、単語タップ時の辞書検索 |

### WORDS の要素
```js
{es:"tener", pos:"v:irr", en:"to have", cefr:"A1", r:1, cog:1, ff:"注意書き", new:1}
```
- `es` 見出し語（進捗キー）。小文字。動詞は不定詞、再帰動詞は `-se`。フレーズは `"tener que"` `"estar + gerundio"` `"¿qué tal?"` のような形
- `pos`：`m` `f` `f!`（agua, aula, ave など el を取る女性名詞） `mf` / `v` `v:ie` `v:ue` `v:i` `v:zc` `v:irr` / `adj` `adv` `prep` `conj` `pron` `det` `num` `int` / **`phr`（フレーズ）**
- `en`：意味の区切りは `;`、言い換えは `,`。複数形の名詞は `(plural)` を含める
- `cefr`：A1〜C2（ワールド分け）。`r:1` 頻度リスト由来、`cog:1` 同根語、`ff` 偽の友、`new:1` 後から追加

### DETAIL の要素
```js
"tener":{ n:"注意（任意）", s:[ [0,"to have","Tengo dos hermanos.","I have two brothers.",["poseer"],[]], ... ] }
```
各意味 = `[品詞ラベル(0 か "adverb" など), 英語の意味, 例文, 英訳, 類義語[], 対義語[]]`。最初の意味の例文がカード表面のヒントになる。

### EXTRA の要素
`"tengo":["I have","tener"]`（[意味, 原形]）。キーは小文字。`"de acuerdo":["OK"]` のような複数語や `"¡jesús!"` のような記号付きも可（チップ用）。

## 2. アプリ部（`buildDict();` 以降）

| 検索文字列 | 役割 |
|---|---|
| `const UNIT=10, LEVEL=100` | 1ユニット10枚、1パート100枚 |
| `const KEY="esfc-v2"` / `const FRESH=` | 保存キーと状態 `S`。`st`（ES→EN の評価）`st2`（EN→ES）`last`（グルーピングごとの最後のユニット）`cp`（チェックポイントの成績）など |
| `function worldWords(` | ワールド内のカード順。**フレーズを単語の間に均等に散らす** |
| `function sections(` / `unitsOf` / `uState` | グルーピング（頻度／品詞／トピック等）とユニット |
| `function nextUnit(` / `unitAfter` / `upNext` / `worldAfter` | 「次」の決め方。完了画面の Next は直前のユニットの次、Learn の Next up は最後に遊んだ位置から続ける、次のワールドは順番どおり |
| `/* ---------- learn (path)` | 道のり画面。5ユニットごとにチェックポイント（`cpNodeHTML`） |
| `/* ---------- checkpoint tests` | `CP_EVERY=5, CP_Q=15, CP_PASS=.8`。`makeQuiz`（苦手優先で15問、同レベル・同品詞・意味が重ならない誤答）、`renderTest`、`renderTestRes`。**8割（15問中12問）で合格 → テストに出なかった35語がチェックリストで出て、覚えていない語にチェック → `clearBlock()` が5ユニットを「クリア」にする**（チェックした語とテストで間違えた語は ✖ で Review、それ以外は全部 ◯。チェック0・全問正解なら5ユニット完璧）。テストは未学習のブロックでもいつでも受けられる（先に進むための手段）。記録は `S.cp[key]={best,n,last,cleared}` |
| `function openSheet(` | 一覧からタップしたときの詳細シート（`backHTML` を流用） |
| `function isTarget(` / `function phraseHits(` / `function wrapWords(` | 例文中のターゲット語の判定。フレーズは縮約（al, del, conmigo）、語順の入れ替え、活用・性の変化にも対応 |
| `function frontHTML(` / `function backHTML(` | カード表面・裏面 |
| `function renderDone(` | セッション完了画面（Next / Checkpoint / 次のワールド） |
| `/* ---------- toolkit` | Phrases（全フレーズへの近道）、Conjugation drill（10問）、Cognate rules |

## 3. 進捗について
- 進捗はブラウザの localStorage（そのページ専用）。**公開場所（URL）が変わると進捗は引き継がれない。**
- **バックアップ**：Toolkit の「Backup」カード。`exportProgress()` が `{app:"esfc-v2", saved, data:S}` を JSON ファイルで保存し、`importProgress()` が確認ダイアログのあと `S` を置き換える。`S.lastBackup` に最終バックアップ日を記録。Learn 画面の `backupDue()` が、最終バックアップ（なければ初回利用日）から `BACKUP_DAYS=12` 日たつとリマインダーを表示。「Later」は `S.bkLater` でその日だけ非表示。起動時に `navigator.storage.persist()` も要求している（Safari ではホーム画面に追加したときだけ効く）。
- db ケーパビリティ（claude.ai の共有DB）は使っていない。外部共有を妨げないためにあえて localStorage にしている。
