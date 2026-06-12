# Sprint A1: 畫面層級與 Modal 互動規則設計

## 目標

建立一套穩定、可測試的畫面層級與 modal 互動規則，解決「隱藏畫面攔截點擊」、「多個面板同時打開」、「右下角功能入口被背後元素覆蓋」、「Esc/背景點擊行為不一致」等問題。

## 範圍

本 sprint 只處理遊戲前台互動基建：

- 登陸頁、人物選擇頁、地圖頁之間的 screen 層級。
- 成就、人物冊、章印面板、事件、熱點、證據任務、書信、插曲、反撲、結算、教學提示等 overlay/modal 的開關規則。
- 右下角功能入口的可點擊性與 modal 開啟穩定性。
- Esc、背景點擊、關閉按鈕的統一行為。

不處理：

- 研究 logger、Supabase、登入、後台資料。
- 新增遊戲內容、人物、圖片資產。
- 大型視覺重設或手機版重排。

## 設計原則

1. 同一時間只允許一個主要 modal 開啟；章印面板視為地圖內面板，也要被主要 modal 壓低。
2. 隱藏 screen 及其子元素必須完全不可見、不可點、不可攔截滑鼠或觸控。
3. 所有 modal 都應具備明確層級、背景遮罩、關閉方式與焦點語意。
4. 右下角 `功業錄`、`人物冊`、`續篇 · 自強之路` 是登陸頁基礎入口，不能被任何隱藏 screen 或過場元素阻擋。
5. Esc 優先關閉最上層可關閉 modal；不應意外退出城市、重置流程或穿透點擊。
6. 背景點擊只關閉非強制 modal；事件選擇、證據任務、結算等流程型 modal 不應因誤觸背景消失。

## 層級規則

- Base screens: intro, selection, map。
- Map panels: `seal-panel`，只在地圖 active 時可互動。
- City sheet and hotspot observation: 屬於城市場景內層，不覆蓋全域 modal。
- Standard modals: hotspot, person, achievement/person gallery, letter, interlude, setback。
- Flow modals: event, evidence task, settlement, cutscene, ending cinema。
- Coachmark: 可覆蓋一般地圖 UI，但不應覆蓋流程型 modal。

## 接受標準

- Hidden screen 不會攔截登陸頁右下角按鈕。
- `功業錄` 和 `人物冊` 可在登陸頁穩定開啟對應 modal。
- 開啟全域 modal 時，其他全域 modal 會先被關閉，避免堆疊。
- Esc 能關閉最上層可關閉 modal。
- 背景點擊只關閉允許背景關閉的 modal。
- CSS 中有明確的全域 overlay 層級 tokens 或規則。
- 穩定性測試覆蓋 hidden screen、modal registry/close helpers、landing utility buttons、no audio strip、no drag ghost。

## 驗證

- `npm run check:syntax`
- `npm run check:stability`
- `npm run check:assets`
- `npm run build`
- 瀏覽器檢查登陸頁右下角 hit target。
- 瀏覽器檢查成就/人物 modal 能開啟，且 hidden selection screen 不再蓋住。
