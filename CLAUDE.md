# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

「超ミニ4X」（シヴィライゼーション風ミニゲーム）。5×5グリッドの小さな盤面で、自都市1つ・CPU都市1つが資源・テックツリーを競うターン制ゲーム。ポートフォリオ量産体制の1本目として、Issue駆動開発＋Git Flow＋PR＋CI/CDのワークフローを実践することが主目的。

## 技術スタック

- **フロントエンド**: Vite（Vanilla JS） + Tailwind CSS v4
  - 選定理由：GitHub Pagesへの静的公開と相性が良く、依存が少なく軽量。Tailwindでデザイン性を確保しつつ、フレームワーク学習コストをかけずワークフロー実践に集中するため
- **デプロイ先**: GitHub Pages（無料枠、無期限利用可）
- **装飾方針**: ネイティブCSSトランジション・絵文字/簡易SVGアイコンの範囲に留め、JSアニメーションライブラリ等の重い依存は追加しない

## コーディング規約

- ESLint（`eslint.config.js`）+ Prettierに従う。`npm run lint` / `npm run format` で確認・整形する
- 独自ルールが必要になった場合はこのファイルに追記する

## テスト方針

- できる限り広くテストを書く（カバレッジを意識する）
- CI（GitHub Actions）でlint・buildを自動実行する。テスト導入時はCIにも組み込む

## Git Flow運用

- ブランチ：`main` / `develop` / `feature/*` / `release/*` / `hotfix/*`
- 命名規則：`feature/{Issue番号}-{英語の短い説明}`（例: `feature/2-board-display`）
- 流れ：Issue作成 → `feature/*` → 実装 → PR → `develop` → （全セクション完成後）`release/vX.X.X` → テスト・修正 → `main` → タグ付け → デプロイ
- **release作成もPR経由**：`develop`→`release/*`、`release/*`→`main`のいずれもPRを作成し、社長の承認を経てマージする（標準Git Flowの単純分岐ではなく、プロセス可視化のため明示的にPR化している）

## 作業権限のルール

`zentai/CLAUDE.md`の全社共通ルール（実行前に必ず社長の許可を取る）を、この開発ライン向けに以下のように具体化する。

- Issue着手の許可が出た後は、該当 `feature/{Issue番号}-...` ブランチ内での実装・コミットは芹沢の裁量で自由に進めてよい
- **PR作成前**：PRの内容（差分・変更概要）を社長に提示し、承認を得てから作成する
- **developへのマージ**：PR承認とは別に、マージ実行前に改めて確認を取る
- **release/main関連**：`release/*`作成（PR含む）、`release`→`main`へのマージ、リリースタグ付けは必ず事前確認
- **デプロイ実行**：必ず事前確認
- 依存パッケージの追加・削除、ファイル削除などの取り消しにくい操作も必ず事前確認

## Issue / PRテンプレート

- Issue（Step Log方式）：`## 📌 概要` `## ✅ ToDo` `## 🎯 完了条件`
- PR：`## 概要` `## 変更内容` `## 関連Issue（Closes #）` `## 動作確認方法` `## スクリーンショット` `## レビューしてほしい観点`
