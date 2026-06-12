# 《自強三十年》城市熱點、四角設施、DSE 對應總表 v1

> 用途：作為探索版城市內容、圖片生成、DSE 考核點與後續程式實作的對照文件。  
> 依據：探索版設計文件、圖片資產需求清單、現有 `intro.js` 內容，以及已上傳的洋務運動 DSE 溫習筆記。  
> 更新日期：2026-05-29

---

## 0. 設計原則

### 0.1 熱點數量不硬性固定

每城不必死守 5 個熱點。建議採用：

| 類型 | 數量 | 用途 |
|---|---:|---|
| 核心熱點 | 3 個左右 | 直接對應洋務運動 DSE 核心考點 |
| 城市特色熱點 | 1-2 個 | 呈現地方角色、社會氣味、改革場景 |
| 路線 / 年份熱點 | 0-2 個 | 隨人物路線、年份、鐵釘事件解鎖 |

因此每城可有 **4-7 個熱點**。圖片 prompt 則以「最重要的 5 個可見線索」為主，避免畫面過滿。

### 0.2 熱點與四角設施分工

| 類型 | 畫面位置 | 功能 |
|---|---|---|
| Hotspots | 城市主圖中 | 玩家在圖中尋找的線索、事件入口、DSE 證據 |
| Corner Facilities | 四角固定 UI 入口 | 城市功能，例如休整、學堂、衙門、商局、軍港、礦務局 |

圖片生成時必須同時照顧兩者：

- 中央與中景要容納可探索熱點。
- 四角要預留設施錨點，讓 UI 標籤有歷史物件可對應。
- 四角設施不可只是裝飾，必須呼應 gameplay function。

### 0.3 DSE 核心分類

本文件把 DSE 考核點集中在以下五類：

1. **背景**：內憂外患、新思潮、開明官員倡導、經濟危機。
2. **措施**：強兵、富國、外交、教育、軍事工業、民用企業。
3. **成效**：軍事與工業近代化起步、外交制度轉變、翻譯與留學、交通礦務發展。
4. **局限**：中學為體西學為用、識見有限、只學器物、官督商辦弊端。
5. **失敗原因**：中央統籌不足、官員不和、守舊派反對、經費不足、民智未開、甲午戰敗。

### 0.4 英文圖片 Prompt 規則

每個城市 prompt 必須包含：

- `gameplay function`
- `clickable hotspots`
- `corner facility anchors`
- `DSE historical focus`
- `visual readability`
- `reserved UI space`

固定句式：

```text
The image must visually support the city gameplay function: ...
The following objects should be readable as clickable clues rather than decorative background details.
Reserve the four corners for facility anchors that remain visible beneath UI labels.
```

---

# 1. 上海 Shanghai

## 1.1 城市定位

上海是洋務運動中「軍事工業、商業航運、翻譯西學、買辦階層」交會最密集的城市。它不是單一的工廠城市，而是清末中國最早把軍事、商業、知識與外國勢力同時壓在同一個畫面裡的地方。

## 1.2 改革角色

- 前期「強兵」：江南機器製造總局。
- 後期「富國」：輪船招商局、機器織布局。
- 文教改革：譯書局、廣方言館、翻譯西學。
- 經濟背景：通商口岸、洋行、買辦、列強經濟壓力。

## 1.3 城市特色功能

上海應是玩家最早學懂「洋務不是只有軍事」的城市。它的 gameplay function 是：

- 解鎖「強兵」與「富國」兩條內容線。
- 透過熱點發現自由事件，例如外灘洋行、煙囪、碼頭工人。
- 四角設施提供商務、翻譯、洋行資訊與休整功能。
- 是李鴻章與容閎兩條路線都會重複回到的核心城市。

## 1.4 Hotspots

| 類型 | 熱點 | 畫面線索 | 對應事件 / 功能 | 對應路線 | DSE 考核點 |
|---|---|---|---|---|---|
| 核心 | 江南製造煙囪 | 右上背景高聳紅磚煙囪、黑煙 | 解鎖「寫信予奕訢」、江南製造事件 | 李鴻章、奕訢、自由 | 強兵、軍事工業、製器為先 |
| 核心 | 外灘洋行 | 中景洋行、英美法旗、買辦與洋商 | 解鎖「外灘買辦」事件，連結廣州公行瓦解後的買辦興起 | 自由、容閎 | 通商口岸、列強經濟入侵、公行制度瓦解、買辦階層 |
| 核心 | 西洋輪船 | 黃浦江上單煙囪輪船 | 招商局、航運、求富線索 | 李鴻章、自由 | 富國、官督商辦、挽回利權 |
| 城市特色 | 中式帆船 | 與輪船並行的三桅帆船 | 對比中西交通與技術 | 所有路線 | 船堅炮利、技術差距 |
| 城市特色 | 碼頭工人 | 左下前景苦力挑貨 | 解鎖社會觀察、勞工與商業事件 | 自由 | 洋務未改變基層社會、局限 |
| 路線 | 留美學童碼頭 | 年份達 1872 後出現送行場面 | 留美學童出發 / 撤回 | 容閎 | 教育改革、派遣留學生、成效與挫折 |

## 1.5 Corner Facilities

| 角落 | 設施 | 解鎖年份 | Gameplay Function | DSE Link | 圖像錨點 |
|---|---|---:|---|---|---|
| 左上 | 外灘碼頭 | 1860 | 船期、貨運、商務傳聞 | 通商口岸、航運、經濟壓力 | 碼頭、旗幟、貨箱、人流 |
| 右上 | 譯書館 | 1867 | 增加見識、解鎖西學書籍與翻譯事件 | 文教改革、西學傳入 | 書架、翻譯桌、外文書 |
| 左下 | 貨棧 | 1860 | 打聽工人與商務消息 | 官督商辦前奏、基層社會 | 貨箱、茶包、苦力、倉庫 |
| 右下 | 客棧 | 1860 | 休整、等待一季、保存旅程 | 時間推進、自由探索 | 街角客棧、燈籠、行李 |

## 1.6 對應事件

- 1865 江南機器製造總局創辦。
- 1867 譯書局 / 廣方言館相關事件。
- 1872 首批留美學童出發。
- 1873 輪船招商局。
- 1881 留美學童撤回。
- 1890 上海機器織布局。

## 1.7 對應人物路線

- **李鴻章**：軍事工業、招商局、官督商辦。
- **容閎**：譯書、留美學童、教育改革。
- **奕訢**：總理衙門與地方洋務建議的回應。
- **自由書記**：通商口岸、買辦、工人、市場觀察。

## 1.8 DSE 考核點

- 洋務背景：外患與經濟危機。
- 改革措施：軍事工業、民用企業、翻譯西學、派遣留學生。
- 成效：近代工業、航運與文教改革起步。
- 局限：只學器物、官督商辦弊端、基層社會未變。

## 1.9 Image Prompt

```text
19th century copper etching, panoramic view of Shanghai Bund, circa 1865. Foreground left: stone embankment with Chinese coolies in conical hats carrying heavy bales of goods on bamboo shoulder poles, with ropes, crates, and cargo stacked nearby. Foreground right: the edge of a Western-style counting house with arched windows, balconies, foreign merchants, and a small flag, integrated naturally into the street rather than presented as a label. Middle ground: the Huangpu River crowded with Chinese three-masted junks with mat sails alongside British paddle steamers with tall black smokestacks belching smoke. Background: a row of two-storey colonial merchant houses and warehouses facing the river; farther in the right background, a subtle land-based industrial compound with brick smokestacks suggests the emerging Jiangnan Arsenal, visible but not dominant. The composition feels cosmopolitan, busy, and transitional between two eras.

No readable labels, no caption boxes, no inset panels, no diagrammatic markers, no decorative UI frames. Leave subtle architectural anchors near the four corners for later game UI labels, but make them part of the natural city scene. Reserve some open sky and central river space for UI overlay. Warm sepia-amber tones throughout. Dense fine crosshatching. Aged paper texture. Horizontal 16:9 composition with visual weight on the right two-thirds.
```

## 1.10 玩家一句總結

上海讓玩家明白：洋務運動既是造槍造船，也是航運、翻譯、買辦和官督商辦交織而成的近代化嘗試。

---

# 2. 北京 Peking

## 2.1 城市定位

北京是朝廷決策、外交制度與守舊思想衝突的中心。它的重點不是工廠，而是「清廷是否願意承認世界已經改變」。

## 2.2 改革角色

- 設立總理各國事務衙門，代表外交制度近代化。
- 設立同文館，培養翻譯與外交人才。
- 守舊派反對西學，是洋務失敗原因的重要場景。
- 朝廷權力鬥爭影響改革推行。

## 2.3 城市特色功能

北京的 gameplay function 是「政治判斷與朝廷信用」：

- 玩家可透過衙門、同文館、廷議等設施提升或消耗朝廷信用。
- 奕訢路線的主場。
- 守舊派反對事件集中地。
- 用來呈現制度改革雖開始，但仍受天朝思想限制。

## 2.4 Hotspots

| 類型 | 熱點 | 畫面線索 | 對應事件 / 功能 | 對應路線 | DSE 考核點 |
|---|---|---|---|---|---|
| 核心 | 總理衙門 | 右側低調衙門、外國使節、文書 | 1861 總理衙門 | 奕訢、自由 | 外交制度、放下天朝思想 |
| 核心 | 同文館 | 西式拱門小樓、學生、外文書 | 1862 同文館 / 西學教育 | 奕訢、容閎 | 教育改革、翻譯人才 |
| 核心 | 守舊官員 | 老臣聚集、冷眼旁觀 | 倭仁反對同文館 | 奕訢 | 守舊派反對、奇技淫巧 |
| 城市特色 | 紫禁城城牆 | 左側宏大皇城 | 舊秩序與新制度對比 | 所有路線 | 中體西用、政治局限 |
| 城市特色 | 外國使節 | 黑色禮服、文件、地圖 | 外交談判、蒲安臣使團線索 | 奕訢 | 近代外交、中外關係轉變 |
| 路線 | 頤和園陰影 | 後期才出現園林 / 工地暗示 | 挪用海軍經費 | 李鴻章、自由 | 經費不足、統治者問題 |

## 2.5 Corner Facilities

| 角落 | 設施 | 解鎖年份 | Gameplay Function | DSE Link | 圖像錨點 |
|---|---|---:|---|---|---|
| 左上 | 總理衙門 | 1861 | 朝廷信用、外交任務、政策文書 | 外交制度近代化 | 衙門門牌、文書桌 |
| 右上 | 同文館 | 1862 | 增加見識、翻譯與外語事件 | 教育改革 | 學堂、學生、外文書 |
| 左下 | 軍機處 / 內閣 | 1861 | 政治抉擇、守舊派壓力 | 改革權力有限 | 朝臣、奏摺、屏風 |
| 右下 | 會館 / 客棧 | 1860 | 休整、收集京中傳聞 | 自由探索 | 旅舍、茶桌、行李 |

## 2.6 對應事件

- 1861 總理衙門設立。
- 1862 同文館成立。
- 同文館之爭 / 倭仁反對西學。
- 1881 留美學童撤回廷議。
- 後期慈禧挪用海軍經費。

## 2.7 對應人物路線

- **奕訢**：主線城市，外交、制度、朝廷妥協。
- **容閎**：教育與留學生計劃的中央阻力。
- **李鴻章**：地方洋務與中央權力的牽制。
- **自由書記**：可在京中聽取各派意見。

## 2.8 DSE 考核點

- 措施：總理衙門、同文館。
- 成效：外交制度突破、翻譯人才培養。
- 局限：中學為體西學為用、守舊派反對。
- 失敗原因：權力分散、最高領導未全力支持、朝廷保守。

## 2.9 Image Prompt

```text
19th century steel engraving, Beijing near the Imperial City, circa 1861-1862. Foreground left: a quiet courtyard edge with Qing officials in embroidered robes, sedan chairs, document boxes, and a few conservative elder statesmen watching with suspicion. Foreground right: a modest guild hall or inn entrance with travelers, servants, and notice boards, integrated into the street scene. Middle ground: a narrow lane where a small diplomatic office resembling the Zongli Yamen sits beside a newer school-like building suggesting the Tongwen Guan; Qing clerks, foreign envoys in dark coats, young students, maps, brush pens, and foreign-language books are visible through doorways and windows. Background: the Forbidden City wall and distant imperial roofs dominate the skyline, making the old order feel massive behind the new institutions. The composition should feel like two systems occupying the same city, not a diagram.

No readable labels, no caption boxes, no inset panels, no diagrammatic markers, no decorative UI frames. Leave subtle architectural anchors near the four corners for later game UI labels: official office, school, inner court document space, and inn, all naturally embedded in the street. Reserve a calmer area of sky or wall texture near the center for UI overlay. Cool stone-grey tone with faint muted gold on distant roofs. Dense fine crosshatching. Aged paper texture. Horizontal 16:9 composition.
```

## 2.10 玩家一句總結

北京讓玩家看見：洋務運動最大的阻力不在機器是否能買到，而在朝廷是否願意真正改變。

---

# 3. 福州 / 馬尾 Foochow / Mawei

## 3.1 城市定位

福州是中國近代海軍與造船技術的搖籃，也是海軍夢最早遭遇實戰崩潰的地方。

## 3.2 改革角色

- 福州船政局與船政學堂。
- 培養造船、駕駛、海軍技術人才。
- 日本侵台後加強海防。
- 馬尾海戰暴露海軍制度與戰備不足。

## 3.3 城市特色功能

福州的 gameplay function 是「海軍技術學習與悲劇倒數」：

- 玩家可透過船廠、學堂、法國工程師增加器物與制度見識。
- 隨年份推進，城市由建設場景轉為戰爭危機場景。
- 是海防、船政、馬尾海戰三組 DSE 論點的集中地。

## 3.4 Hotspots

| 類型 | 熱點 | 畫面線索 | 對應事件 / 功能 | 對應路線 | DSE 考核點 |
|---|---|---|---|---|---|
| 核心 | 馬尾船塢 | 木製船台、半成形船身 | 1866 福州船政 | 李鴻章、自由 | 軍事工業、造船技術 |
| 核心 | 船政學堂 | 學生、航海圖、儀器 | 培養海軍人才 | 容閎、自由 | 教育改革、技術人才 |
| 核心 | 法國工程師 | 工程圖、歐式服裝 | 外國技術輸入 | 自由 | 借助外國技術、局限 |
| 城市特色 | 閩江艦船 | 中式船與新式艦船並存 | 海軍建設觀察 | 所有路線 | 船堅炮利、海防 |
| 城市特色 | 炮台 / 艦影 | 遠處炮台、戰艦陰影 | 日本侵台、馬尾海戰預兆 | 李鴻章、自由 | 海防不足、甲午前局限 |
| 年份 | 戰火煙霧 | 1885 後出現煙霧與殘骸 | 馬尾海戰 | 所有路線 | 洋務挫敗、軍事成效有限 |

## 3.5 Corner Facilities

| 角落 | 設施 | 解鎖年份 | Gameplay Function | DSE Link | 圖像錨點 |
|---|---|---:|---|---|---|
| 左上 | 福州船政局 | 1866 | 器物見識、造船事件 | 軍事工業 | 船廠辦公樓、旗杆 |
| 右上 | 船政學堂 | 1866 | 教育見識、技術人才事件 | 文教改革 | 課室、航海圖、學生 |
| 左下 | 馬尾船塢 | 1866 | 造船熱點、船台檢查 | 強兵、海軍 | 船台、木架、工人 |
| 右下 | 江岸客棧 | 1860 | 休整、等待、聽聞海防消息 | 自由探索 | 江邊旅舍、燈火 |

## 3.6 對應事件

- 1866 福州船政局創辦。
- 1867 船政學堂開學。
- 1869 第一艘國造輪船下水。
- 1874 日本侵台與台灣防務。
- 1885 馬尾海戰。

## 3.7 對應人物路線

- **李鴻章**：海防與北洋對照。
- **容閎**：技術人才與出洋學習。
- **自由書記**：可從建設到失敗完整觀察。

## 3.8 DSE 考核點

- 措施：船政局、船政學堂、海軍建設。
- 成效：造船與海軍人才培養。
- 局限：依賴外國工程師、制度和指揮不足。
- 失敗原因：馬尾海戰反映器物改革不足以支撐全面軍事現代化。

## 3.9 Image Prompt

```text
19th century steel engraving, Mawei district on the Min River near Foochow, circa 1866. Foreground left: a riverside construction yard with timber beams, iron components, laborers, ropes, and a wooden slipway descending into the water. Foreground right: a small riverside inn or workmen's rest house partly visible near the shore. Middle ground: the unfinished wooden skeleton of a steamship hull on the slipway, Chinese workers carrying materials, and two French engineers examining technical drawings on a makeshift table. Nearby, a modest school building suggests the Shipbuilding School, with students, navigation charts, measuring instruments, and books visible through open windows. Background: the Min River carries traditional Fujian junks and bamboo rafts, while a faint coastal battery or distant warship silhouette hints at later naval conflict. Hills and white-walled Fujian buildings frame the scene.

No readable labels, no caption boxes, no inset panels, no diagrammatic markers, no decorative UI frames. Leave subtle architectural anchors near the four corners for later game UI labels: navy yard office, shipbuilding school, shipyard slipway, and riverside inn, all naturally part of the riverbank. Reserve misty river or sky space near the center for UI overlay. Deep teal blue-green tone with iron-grey and warm timber accents. Dense fine crosshatching. Aged paper texture. Horizontal 16:9 composition.
```

## 3.10 玩家一句總結

福州讓玩家明白：洋務運動確實能建立船廠與學堂，但海軍現代化不只靠造出船。

---

# 4. 天津 Tianjin

## 4.1 城市定位

天津是直隸門戶與北洋根據地，是李鴻章後期權力、海防、陸軍訓練和對外防務的樞紐。

## 4.2 改革角色

- 北洋大臣與直隸總督辦事核心。
- 大沽炮台與海防。
- 天津機器製造局、電報局、水師學堂、武備學堂。
- 反映地方督撫推行洋務的權力與局限。

## 4.3 城市特色功能

天津的 gameplay function 是「北洋軍政基地」：

- 李鴻章路線的重要召見地。
- 可提升軍事 / 制度見識。
- 可觸發海防、武備、電報、北洋籌建事件。
- 也是玩家理解「地方督撫各自為政」的重要城市。

## 4.4 Hotspots

| 類型 | 熱點 | 畫面線索 | 對應事件 / 功能 | 對應路線 | DSE 考核點 |
|---|---|---|---|---|---|
| 核心 | 北洋大臣府 | 官署、李鴻章幕僚、奏摺 | 李鴻章召見 | 李鴻章 | 地方督撫、洋務推行 |
| 核心 | 大沽炮台 | 土壘、新式炮台、海口 | 海防建設 | 李鴻章、自由 | 海防、外患刺激 |
| 核心 | 武備學堂 | 士兵操練、西式槍械 | 1885 武備學堂 | 李鴻章 | 新式軍隊、軍事人才 |
| 城市特色 | 海河碼頭 | 河船、軍需、外國船 | 北方交通與軍需 | 所有路線 | 交通、軍事補給 |
| 城市特色 | 電報線 | 電線杆、電報房 | 天津電報總局 | 自由 | 交通通訊、防務必須 |
| 路線 | 外國顧問 | 德國 / 西洋軍官 | 軍事訓練支線 | 李鴻章 | 借用外國人才、局限 |

## 4.5 Corner Facilities

| 角落 | 設施 | 解鎖年份 | Gameplay Function | DSE Link | 圖像錨點 |
|---|---|---:|---|---|---|
| 左上 | 北洋大臣府 | 1870 | 李鴻章召見、朝廷信用、軍政任務 | 地方督撫洋務 | 官署、門牌、轎子 |
| 右上 | 武備學堂 | 1885 | 軍事人才、操練事件 | 新式軍隊 | 操場、學生、槍械 |
| 左下 | 大沽炮台 | 1860 | 海防事件、炮台調查 | 外患、海防 | 土壘、火炮、海口 |
| 右下 | 驛館 / 客棧 | 1860 | 休整、等待、北上南下交通 | 回合推進 | 驛站、馬車、行李 |

## 4.6 對應事件

- 1870 李鴻章任直隸總督。
- 1874 後加強海防。
- 1880 天津電報總局。
- 1885 天津武備學堂。
- 1885-1888 北洋成軍籌備。

## 4.7 對應人物路線

- **李鴻章**：主線城市。
- **奕訢**：中央外交政策與地方執行對照。
- **自由書記**：可觀察地方洋務運作。

## 4.8 DSE 考核點

- 措施：新式軍隊、武備學堂、海防、電報。
- 成效：北洋系成為清廷主力之一。
- 局限：依賴地方督撫，缺乏中央統籌。
- 失敗原因：官員不和、各自為政。

## 4.9 Image Prompt

```text
19th century steel engraving, Tianjin on the Hai River plain, circa 1870-1885. Foreground left: low earthwork cannon positions and rough defensive ramparts suggesting Dagu-style coastal batteries, with old bronze guns beside newer artillery. Foreground right: a relay station or inn at the river road, with pack animals, military messengers, and cargo crates. Middle ground: the Hai River carries Chinese junks, military supply boats, and a small foreign gunboat at anchor. On one bank stands a Beiyang administrative compound with Qing officials, sedan chairs, military documents, and guards. Slightly beyond it, a drill ground shows cadets practicing with Western rifles under instructors, while telegraph poles and wires cut across the flat landscape. Background: sparse foreign concession buildings and northern shop-houses sit under a dry, open sky.

No readable labels, no caption boxes, no inset panels, no diagrammatic markers, no decorative UI frames. Leave subtle architectural anchors near the four corners for later game UI labels: Beiyang office, military academy, Dagu battery, and relay inn, all naturally integrated into the riverscape. Reserve open river or sky space near the center for UI overlay. Dusty ochre-yellow northern tone. Dense fine crosshatching. Aged paper texture. Horizontal 16:9 composition with a wide flat horizon.
```

## 4.10 玩家一句總結

天津讓玩家明白：洋務運動能靠地方重臣推動，但也因此受制於地方權力和中央統籌不足。

---

# 5. 威海衛 Weihaiwei

## 5.1 城市定位

威海衛是北洋艦隊高峰與失敗的象徵，是洋務成效與洋務終局在同一地點相撞的城市。

## 5.2 改革角色

- 北洋艦隊基地與軍港。
- 1888 北洋艦隊正式成軍。
- 1894-1895 甲午戰爭與威海衛陷落。
- 展示軍艦、炮台、海軍制度與戰爭結果之間的落差。

## 5.3 城市特色功能

威海衛的 gameplay function 是「後期壓力城市」：

- 1888 後才真正成為核心城市。
- 進城時應感到軍事高峰與戰敗陰影並存。
- 可觸發北洋成軍、黃海海戰、威海衛陷落等事件。
- 適合做結局前的壓力測試場。

## 5.4 Hotspots

| 類型 | 熱點 | 畫面線索 | 對應事件 / 功能 | 對應路線 | DSE 考核點 |
|---|---|---|---|---|---|
| 核心 | 定遠 / 鎮遠艦 | 海灣中大型鐵甲艦 | 北洋成軍、黃海海戰 | 李鴻章、自由 | 北洋艦隊、軍事成效 |
| 核心 | 劉公島炮台 | 島上炮台、岸防 | 威海衛基地 | 李鴻章 | 海防建設 |
| 核心 | 海軍提督府 | 軍官、旗幟、命令 | 丁汝昌、海軍指揮 | 李鴻章 | 軍事制度與指揮 |
| 城市特色 | 軍港碼頭 | 水兵、煤炭、補給 | 艦隊維修與補給 | 所有路線 | 經費、後勤、制度 |
| 城市特色 | 遠海黑影 | 遠方敵艦 / 烏雲 | 甲午危機預兆 | 所有路線 | 失敗原因、外來挑戰 |
| 年份 | 破損炮位 | 1895 後顯示殘破 | 威海衛陷落 | 所有路線 | 洋務終結 |

## 5.5 Corner Facilities

| 角落 | 設施 | 解鎖年份 | Gameplay Function | DSE Link | 圖像錨點 |
|---|---|---:|---|---|---|
| 左上 | 海軍提督府 | 1888 | 艦隊命令、丁汝昌事件 | 北洋艦隊 | 官署、軍旗、文書 |
| 右上 | 劉公島炮台 | 1888 | 海防檢查、戰前事件 | 海防建設 | 炮台、岩岸 |
| 左下 | 軍港碼頭 | 1888 | 補給、艦隊觀察、煤炭 | 後勤與經費 | 煤堆、碼頭、水兵 |
| 右下 | 水師營房 | 1888 | 休整、士氣、戰前傳聞 | 軍隊制度 | 營房、燈火、水兵 |

## 5.6 對應事件

- 1888 北洋艦隊成軍。
- 1894 黃海海戰。
- 1895 威海衛陷落、馬關條約。

## 5.7 對應人物路線

- **李鴻章**：結局核心城市。
- **自由書記**：可觀察洋務由高峰走向失敗。

## 5.8 DSE 考核點

- 成效：北洋艦隊一度成軍，顯示洋務有具體成果。
- 局限：制度、後勤、經費、統籌不足。
- 失敗原因：甲午戰敗暴露器物改革不足。

## 5.9 Image Prompt

```text
19th century steel engraving, Weihaiwei naval base and Liugong Island, circa 1888-1894. Foreground left: a military harbor pier with coal piles, repair equipment, ropes, supply crates, and sailors moving between docked boats. Foreground right: low naval barracks and a guard post near the rocky shore, quiet but tense. Middle ground: the cold bay contains large ironclad warships resembling Dingyuan and Zhenyuan, anchored with smaller support craft around them. On the nearby hillside or island, a naval command office and signal flags appear naturally among military buildings. Background: Liugong Island coastal batteries sit on rugged cliffs with heavy guns facing the open sea, while distant dark ship silhouettes or storm clouds gather on the horizon. The scene should feel like a naval achievement shadowed by approaching disaster.

No readable labels, no caption boxes, no inset panels, no diagrammatic markers, no decorative UI frames. Leave subtle architectural anchors near the four corners for later game UI labels: naval command office, island battery, harbor pier, and barracks, all naturally part of the coast. Reserve some cold sky and open water near the center for UI overlay. Cold steel blue-grey tone, rugged rocks, heavy winter sky, energetic wave crosshatching, aged paper texture. Horizontal 16:9 composition.
```

## 5.10 玩家一句總結

威海衛讓玩家明白：洋務運動可以買到鐵甲艦，卻未必能建立支撐鐵甲艦的國家制度。

---

# 6. 香港 Hong Kong

## 6.1 城市定位

香港是殖民港口、西學書籍、留學籌劃與中西中介的窗口。它不是洋務政策中心，但它是新知識、新制度和海外經驗進入中國的門縫。

## 6.2 改革角色

- 容閎與留學線的重要節點。
- 傳教士書館與西學書籍。
- 維多利亞港展示殖民秩序與華洋雜處。
- 可呈現中國學習西方時面對的殖民不平等背景。

## 6.3 城市特色功能

香港的 gameplay function 是「知識與留學入口」：

- 容閎路線起點或關鍵補給地。
- 可購買 / 解鎖西學書籍。
- 可觸發留美學童家屬、海外學習、傳教士書館事件。
- 是思想與教育見識的重要來源。

## 6.4 Hotspots

| 類型 | 熱點 | 畫面線索 | 對應事件 / 功能 | 對應路線 | DSE 考核點 |
|---|---|---|---|---|---|
| 核心 | 傳教士書館 | 書架、英文書、華人學生 | 西學書籍、翻譯知識 | 容閎、自由 | 西學傳入、文教改革 |
| 核心 | 容閎寓所 | 書信、箱籠、地圖 | 留學籌劃 | 容閎 | 派遣留學生、人才培養 |
| 核心 | 維多利亞港 | 英艦、華人船、商船 | 中西中介與殖民港口 | 所有路線 | 列強衝擊、通商背景 |
| 城市特色 | 殖民法院 / 教堂 | 山坡英式建築 | 殖民秩序觀察 | 自由 | 政治制度差異 |
| 城市特色 | 華人碼頭 | 苦力、家屬、行李 | 留美學童家屬線索 | 容閎 | 教育改革的人情面 |

## 6.5 Corner Facilities

| 角落 | 設施 | 解鎖年份 | Gameplay Function | DSE Link | 圖像錨點 |
|---|---|---:|---|---|---|
| 左上 | 傳教士書館 | 1860 | 購入西學書、思想見識 | 西學傳入 | 書館、書架、招牌 |
| 右上 | 教堂 / 書院 | 1860 | 教育事件、外語學習 | 新式教育 | 教堂尖頂、校舍 |
| 左下 | 維港洋行 | 1860 | 商務情報、殖民港口觀察 | 通商口岸 | 洋行、碼頭、旗幟 |
| 右下 | 客棧 | 1860 | 休整、等待船期 | 留學路線 | 旅舍、行李、船票 |

## 6.6 對應事件

- 容閎回國與留學籌劃。
- 留美學童家屬集結。
- 撤回學童經香港。
- 西學書籍流入。

## 6.7 對應人物路線

- **容閎**：主線城市。
- **自由書記**：可獲得思想與西學線索。

## 6.8 DSE 考核點

- 措施：派遣留學生、翻譯與西學。
- 成效：開近代教育模式、影響日後維新思想。
- 背景：列強衝擊與香港殖民地角色。
- 局限：中國學習西方是在不平等國際秩序下進行。

## 6.9 Image Prompt

```text
19th century steel engraving, Victoria Harbour, Hong Kong, circa 1861-1872. Foreground left: a busy Chinese waterfront with sampans, cargo baskets, porters, and a foreign hong partly visible behind verandas and arcades. Foreground right: a modest boarding house or inn near the pier, with travel trunks, rolled bedding, and young Chinese students waiting with family members. Middle ground: Victoria Harbour contains Chinese junks, sampans, merchant vessels, and a British naval ship at anchor, all sharing the same water. On the hillside, colonial buildings rise in ordered rows: a church or school, merchant houses, and a courthouse-like structure. Near one side street, a small missionary bookshop or reading room is visible through open windows, with bookshelves, maps, and Chinese readers, but without any label. The composition should feel like a cold colonial port where knowledge, empire, trade, and departure intersect.

No readable labels, no caption boxes, no inset panels, no diagrammatic markers, no decorative UI frames. Leave subtle architectural anchors near the four corners for later game UI labels: missionary bookshop, church or college, foreign hong, and boarding house, all naturally integrated into the harbor city. Reserve open harbor water or pale sky near the center for UI overlay. Cool grey-blue tone, careful ship rigging, hillside depth, dense fine crosshatching, aged paper texture. Horizontal 16:9 composition.
```

## 6.10 玩家一句總結

香港讓玩家明白：洋務運動的西學與留學，不只來自朝廷命令，也來自殖民港口中的書籍、船票和中介人物。

---

# 7. 廣州 Canton

## 7.1 城市定位

廣州是早期通商、鴉片戰爭記憶與列強衝擊的城市。它主要負責解釋洋務運動為何會出現。

## 7.2 改革角色

- 十三行與通商口岸傳統。
- 虎門炮台與鴉片戰爭記憶。
- 外國商船與洋貨衝擊中國經濟。
- 張之洞督粵可作後期改革支線。

## 7.3 城市特色功能

廣州的 gameplay function 是「背景原因城市」：

- 讓玩家收集外患與經濟危機證據。
- 可追溯列強如何打開中國市場。
- 可觸發通商、炮台、洋貨、買辦事件。

## 7.4 Hotspots

| 類型 | 熱點 | 畫面線索 | 對應事件 / 功能 | 對應路線 | DSE 考核點 |
|---|---|---|---|---|---|
| 核心 | 十三行舊址 | 中西混合商館、火災痕跡 | 通商口岸、商貿事件 | 自由、容閎 | 經濟危機、列強商貿 |
| 核心 | 虎門炮台殘垣 | 炮台、破炮、海口 | 鴉片戰爭記憶 | 自由 | 外患、軍事落後 |
| 核心 | 珠江洋船 | 英美法商船 | 洋貨輸入與航運 | 所有路線 | 列強經濟入侵 |
| 城市特色 | 總督府 | 官員、文書、商務奏摺 | 地方官應對外患 | 自由 | 官員倡導改革 |
| 城市特色 | 買辦商人 | 中式長衫配西式帽 | 中介階層 | 自由 | 通商口岸社會 |
| 路線 | 張之洞督粵 | 1884 後官署旗號 | 後期改革支線 | 自由 | 地方督撫改革 |

## 7.5 Corner Facilities

| 角落 | 設施 | 解鎖年份 | Gameplay Function | DSE Link | 圖像錨點 |
|---|---|---:|---|---|---|
| 左上 | 兩廣總督府 | 1860 | 官員任務、地方政策 | 開明官員倡導 | 官署、奏摺 |
| 右上 | 十三行會館 | 1860 | 商貿事件、洋貨線索 | 通商口岸 | 商館、旗幟 |
| 左下 | 虎門炮台 | 1860 | 外患記憶、軍事落後證據 | 背景、外患 | 殘炮、海防牆 |
| 右下 | 珠江客棧 | 1860 | 休整、收集商人傳聞 | 自由探索 | 江邊旅舍 |

## 7.6 對應事件

- 鴉片戰爭與虎門炮台記憶。
- 十三行與洋商交涉。
- 洋貨輸入與本土工商業受壓。
- 張之洞督粵改革支線。

## 7.7 對應人物路線

- **自由書記**：主要探索城市。
- **容閎**：西學與通商背景補充。
- **李鴻章**：可作與上海求富比較。

## 7.8 DSE 考核點

- 背景：外患刺激、經濟危機。
- 措施前因：列強船堅炮利與清軍落後。
- 局限：通商口岸開放後中國被動應對。

## 7.9 Image Prompt

```text
19th century copper engraving, Canton Pearl River waterfront, circa 1861. Foreground left: a weathered coastal-defense remnant with an old cannon, broken stonework, and soldiers or boatmen passing by, quietly recalling the Opium War. Foreground right: a Pearl River inn or tea house opens onto the waterfront, with travelers, merchants, and boat tickets implied through luggage and tables. Middle ground: the river is crowded with sampans, flower boats, Chinese cargo vessels, and Western merchant ships flying small foreign flags. Along the waterfront stands the Thirteen Hongs district, a dense row of European-Chinese merchant facades, some bearing traces of fire damage and repair. Nearby, Chinese compradores and merchants move between foreign traders and local shops. Background: a provincial administrative building or governor's compound is partly visible behind the commercial street, linking trade pressure to official response.

No readable labels, no caption boxes, no inset panels, no diagrammatic markers, no decorative UI frames. Leave subtle architectural anchors near the four corners for later game UI labels: governor's office, Thirteen Hongs guild space, Humen battery memory, and Pearl River inn, all naturally embedded in the waterfront. Reserve river or humid sky space near the center for UI overlay. Warm ochre-orange tone, dense architectural detail, tropical humidity, fine crosshatching, aged paper texture. Horizontal 16:9 composition.
```

## 7.10 玩家一句總結

廣州讓玩家明白：洋務運動不是突然出現，而是鴉片戰爭、通商口岸和經濟壓力長期累積的結果。

---

# 8. 南京 Nanking

## 8.1 城市定位

南京是內憂、戰亂廢墟、湘淮勢力與地方督撫興起的城市。它讓玩家理解洋務運動不是在和平環境中發生，而是在太平天國後的殘局中出現。

## 8.2 改革角色

- 太平天國餘燼。
- 曾國藩、湘軍、地方督撫。
- 安慶軍械所與早期製器。
- 戰亂後重建與地方權力擴張。

## 8.3 城市特色功能

南京的 gameplay function 是「內憂與地方勢力城市」：

- 收集太平天國與內亂背景證據。
- 理解為何清廷依賴地方督撫與新式武器。
- 可開啟曾國藩、沈葆楨、容閎線索。

## 8.4 Hotspots

| 類型 | 熱點 | 畫面線索 | 對應事件 / 功能 | 對應路線 | DSE 考核點 |
|---|---|---|---|---|---|
| 核心 | 太平天國廢墟 | 焦黑屋樑、倒塌屋瓦 | 內憂背景 | 所有路線 | 太平天國、內憂刺激 |
| 核心 | 明城牆 | 完整巨大城牆 | 歷史延續與戰亂對照 | 自由 | 清末危機與舊秩序 |
| 核心 | 兩江總督衙門 | 曾國藩 / 幕僚文書 | 地方督撫興起 | 李鴻章、容閎 | 地方官倡導洋務 |
| 城市特色 | 重建市集 | 工人、市集、木架 | 戰後重建 | 自由 | 內亂後經濟殘破 |
| 城市特色 | 安慶軍械所檔案 | 槍炮圖紙、舊檔 | 軍事工業前奏 | 李鴻章 | 強兵、製器 |
| 路線 | 容閎拜訪線索 | 書信、旅箱、引薦文件 | 容閎見曾國藩 | 容閎 | 人才培育開端 |

## 8.5 Corner Facilities

| 角落 | 設施 | 解鎖年份 | Gameplay Function | DSE Link | 圖像錨點 |
|---|---|---:|---|---|---|
| 左上 | 兩江總督衙門 | 1861 | 地方督撫任務、曾國藩線索 | 開明官員倡導 | 官署、幕僚 |
| 右上 | 安慶軍械所檔案 | 1861 | 早期製器證據、兵工支線 | 軍事工業 | 檔案、圖紙、槍炮 |
| 左下 | 靜海寺 / 條約遺址 | 1860 | 條約記憶、外患背景 | 不平等條約 | 石碑、寺門 |
| 右下 | 市集客棧 | 1860 | 休整、民間傳聞、重建事件 | 社會背景 | 市集、旅舍 |

## 8.6 對應事件

- 太平天國平定後重建。
- 曾國藩與地方督撫權力。
- 安慶軍械所。
- 容閎拜訪曾國藩支線。

## 8.7 對應人物路線

- **容閎**：拜訪曾國藩與留學計劃前奏。
- **李鴻章**：湘淮勢力與兵工前奏。
- **自由書記**：內憂背景與重建觀察。

## 8.8 DSE 考核點

- 背景：太平天國與內憂。
- 措施前因：地方官體驗西式武器的威力。
- 局限：洋務由地方督撫推行，中央統籌不足。

## 8.9 Image Prompt

```text
19th century steel engraving, Nanking in recovery after the Taiping conflict, circa 1864-1872. Foreground left: broken courtyard stones, charred beams, weeds, and a quiet treaty-memory site or temple entrance partly damaged but still standing. Foreground right: a small market inn has reopened among ruins, with vendors, travelers, baskets, and new timber stacked nearby. Middle ground: laborers rebuild a damaged structure, raising roof beams while a few officials and clerks move through the street with document boxes. Beside the official quarter, a small archive or workshop area shows old cannon parts, weapon drawings, and early arsenal clues without any signboard. Background: the massive Ming city wall remains intact, moss-covered and monumental, while a rebuilt Liangjiang administrative compound suggests the rise of regional governors after civil war. The city should feel wounded but alive.

No readable labels, no caption boxes, no inset panels, no diagrammatic markers, no decorative UI frames. Leave subtle architectural anchors near the four corners for later game UI labels: Liangjiang governor's office, arsenal archive, treaty-memory site, and market inn, all naturally part of the ruined city. Reserve a calm wall, sky, or open street area near the center for UI overlay. Muted grey-green tone with small warm ochre areas on new timber and straw. Dense fine crosshatching. Aged paper texture. Horizontal 16:9 composition.
```

## 8.10 玩家一句總結

南京讓玩家明白：洋務運動的「自強」首先來自內亂後清廷對生存危機的恐懼。

---

# 9. 武漢 / 漢陽 Wuhan / Hanyang

## 9.1 城市定位

武漢 / 漢陽是洋務後期重工業與張之洞改革的城市。它展示洋務由軍工、航運逐漸走向鋼鐵、紡織與大型工業體系。

## 9.2 改革角色

- 漢陽鐵廠。
- 湖北織布局。
- 大冶鐵礦、煤鐵資源。
- 張之洞後期改革。

## 9.3 城市特色功能

武漢的 gameplay function 是「後期工業城市」：

- 1889 後解鎖，象徵洋務後期。
- 可收集重工業、織布局、礦鐵、張之洞改革資料。
- 可與上海、開平形成「工業鏈」對照。

## 9.4 Hotspots

| 類型 | 熱點 | 畫面線索 | 對應事件 / 功能 | 對應路線 | DSE 考核點 |
|---|---|---|---|---|---|
| 核心 | 漢陽鐵廠骨架 | 鐵架、煙囪、建築工地 | 漢陽鐵廠 | 自由、李鴻章對照 | 富國、重工業 |
| 核心 | 湖廣督署 | 張之洞文書、官署 | 張之洞改革 | 自由 | 開明地方官員 |
| 核心 | 長江碼頭 | 船運、貨物、煤鐵 | 交通與工業運輸 | 所有路線 | 交通、沿江工業 |
| 城市特色 | 兩湖書院 | 學生、書院、課堂 | 新式教育支線 | 自由 | 文教改革 |
| 城市特色 | 織布局 | 紡織機、女工 / 工人 | 湖北織布局 | 自由 | 民用企業、富國 |
| 路線 | 礦鐵樣本 | 鐵礦石、煤炭、技師 | 大冶礦 / 鐵廠支線 | 自由 | 煤鐵、原材料 |

## 9.5 Corner Facilities

| 角落 | 設施 | 解鎖年份 | Gameplay Function | DSE Link | 圖像錨點 |
|---|---|---:|---|---|---|
| 左上 | 湖廣督署 | 1889 | 張之洞任務、政策事件 | 地方督撫改革 | 官署、文書 |
| 右上 | 兩湖書院 | 1889 | 教育見識、新式人才 | 文教改革 | 書院、學生 |
| 左下 | 漢陽鐵廠 | 1890 | 重工業事件、器物見識 | 富國、重工業 | 鐵廠、煙囪 |
| 右下 | 長江碼頭 | 1889 | 交通、商務、休整 | 沿江交通 | 碼頭、貨船 |

## 9.6 對應事件

- 1890 漢陽鐵廠籌建。
- 1892 湖北織布局。
- 1894 漢陽鐵廠開爐。
- 大冶鐵礦與煤鐵資源支線。

## 9.7 對應人物路線

- **自由書記**：最適合完整探索。
- **李鴻章**：可與北洋 / 上海形成比較。

## 9.8 DSE 考核點

- 措施：民用企業、重工業、礦鐵。
- 成效：近代工業進一步發展。
- 局限：技術、資金、管理問題；改革起步太晚。

## 9.9 Image Prompt

```text
19th century copper engraving, panoramic Wuhan and Hanyang riverfront, circa 1889-1894. Foreground left: the edge of a large industrial construction site with iron beams, brick foundations, coal piles, and workers preparing the Hanyang Ironworks. Foreground right: a busy Yangtze River dock with cargo boats, coal, ore baskets, porters, and merchants. Middle ground: the broad Yangtze River carries junks, flat-bottom cargo boats, and industrial materials between the three towns. On one bank, a Huguang administrative compound appears behind trees and walls, with officials and reform documents suggested through open doors and courtyards. Nearby, a modernizing academy or Lianghu-style school shows students and books through a veranda. Farther back, a textile workshop or weaving bureau with machinery and workers hints at late self-strengthening industry. The composition should feel like ancient river commerce beginning to turn into heavy industry.

No readable labels, no caption boxes, no inset panels, no diagrammatic markers, no decorative UI frames. Leave subtle architectural anchors near the four corners for later game UI labels: Huguang governor's office, academy, ironworks, and Yangtze dock, all naturally integrated into the riverfront. Reserve open river or pale sky near the center for UI overlay. River blue-grey tone shifting to industrial smoke-brown near the ironworks. Dense fine crosshatching. Aged paper texture. Horizontal 16:9 composition with broad horizontal depth.
```

## 9.10 玩家一句總結

武漢讓玩家明白：洋務後期已開始走向大型重工業，但這種轉型來得太遲，也太依賴少數地方官。

---

# 10. 開平 Kaiping

## 10.1 城市定位

開平是煤礦、鐵路與能源基礎的城市。它不像上海或北京那樣顯眼，但它回答一個根本問題：沒有煤、鐵和交通，所有機器都只是空話。

## 10.2 改革角色

- 開平礦務局。
- 唐胥鐵路。
- 機器採煤。
- 風水反對、民智未開與新技術阻力。

## 10.3 城市特色功能

開平的 gameplay function 是「資源與阻力城市」：

- 可補充工業資源線索。
- 可觸發煤礦、鐵路、風水反對事件。
- 可作為求富事業與民智未開的 DSE 證據庫。

## 10.4 Hotspots

| 類型 | 熱點 | 畫面線索 | 對應事件 / 功能 | 對應路線 | DSE 考核點 |
|---|---|---|---|---|---|
| 核心 | 開平煤礦坑道 | 礦坑、煤堆、木架 | 開平礦務局 | 李鴻章、自由 | 礦務、能源、富國 |
| 核心 | 唐胥鐵路 | 小鐵軌、運煤車 | 唐胥鐵路 | 李鴻章、自由 | 交通、鐵路 |
| 核心 | 唐廷樞辦公處 | 商辦文書、礦圖 | 官督商辦 / 商人經營 | 李鴻章 | 官督商辦、用人 |
| 城市特色 | 礦工棚 | 礦工、工具、疲態 | 勞工與資源事件 | 自由 | 社會成本 |
| 城市特色 | 風水反對碑 / 村民 | 鄉紳、墳地、阻工 | 反對鐵路 / 採礦 | 自由 | 民智未開、保守風氣 |
| 年份 | 蒸汽機車影子 | 後期出現蒸汽裝置 | 新技術阻力事件 | 自由 | 科技與社會衝突 |

## 10.5 Corner Facilities

| 角落 | 設施 | 解鎖年份 | Gameplay Function | DSE Link | 圖像錨點 |
|---|---|---:|---|---|---|
| 左上 | 開平礦務局 | 1877 | 資源、煤礦事件、俸祿 | 礦務、富國 | 礦務局牌匾、礦圖 |
| 右上 | 唐廷樞辦公處 | 1877 | 商務管理、官督商辦事件 | 官督商辦 | 辦公桌、帳簿 |
| 左下 | 唐胥鐵路站 | 1881 | 交通事件、鐵路阻力 | 交通改革 | 鐵軌、運煤車 |
| 右下 | 礦工棚 / 客棧 | 1877 | 休整、礦工傳聞、社會事件 | 民間反應 | 工棚、煤燈 |

## 10.6 對應事件

- 1877 開平煤礦籌辦。
- 1881 開平礦務局 / 唐胥鐵路。
- 反對鐵路、風水阻力。
- 機器採煤與能源供應。

## 10.7 對應人物路線

- **李鴻章**：求富與能源基礎。
- **自由書記**：民智未開與技術阻力觀察。

## 10.8 DSE 考核點

- 措施：礦務、鐵路、交通。
- 成效：供應煤鐵、促進交通。
- 局限：民間反對、風水迷信、官督商辦弊端。
- 失敗原因：社會保守，改革不能順利開展。

## 10.9 Image Prompt

```text
19th century steel engraving, Kaiping coalfields and early Tangxu Railway, circa 1877-1881. Foreground left: a short early railway track with small coal wagons, wooden sleepers, and workers loading coal by hand. Foreground right: a miner shed or rough inn with oil lamps, tools, tired workers, and baskets of coal. Middle ground: a coal mine entrance with timber supports, dark pits, coal piles, and miners carrying tools. Nearby, a modest mining administration office shows maps, ledgers, and officials or merchants discussing plans through an open doorway, suggesting Kaiping Mining Bureau and Tang Tingshu's business management without written labels. Background: low rural hills, village rooftops, graves, and a few local gentry or villagers watching uneasily, implying fengshui resistance to mining and railways. The landscape should feel sparse, earthy, and full of hidden industrial potential.

No readable labels, no caption boxes, no inset panels, no diagrammatic markers, no decorative UI frames. Leave subtle architectural anchors near the four corners for later game UI labels: mining bureau, manager's office, Tangxu railway track, and miner shed or inn, all naturally embedded in the coalfield. Reserve open hillside or sky space near the center for UI overlay. Dark earth-brown and charcoal tone, heavy shadows in mine pits, dense fine crosshatching, aged paper texture. Horizontal 16:9 composition.
```

## 10.10 玩家一句總結

開平讓玩家明白：洋務運動的機器時代，最底層其實是煤、鐵、鐵路與願不願意接受新事物的社會。

---

# 11. 全局對照表

## 11.1 城市與 DSE 分工

| DSE 類別 | 主要城市 | 輔助城市 |
|---|---|---|
| 內憂外患背景 | 北京、廣州、南京 | 上海、天津 |
| 開明官員倡導 | 北京、天津、南京、武漢 | 上海 |
| 強兵措施 | 上海、福州、天津、威海衛 | 南京 |
| 富國措施 | 上海、開平、武漢 | 天津 |
| 文教改革 | 北京、上海、福州、香港 | 武漢 |
| 外交制度 | 北京 | 上海、香港 |
| 海防與海軍 | 福州、天津、威海衛 | 上海 |
| 官督商辦 | 上海、開平 | 武漢 |
| 中體西用局限 | 北京、上海、威海衛 | 福州 |
| 守舊 / 民智未開 | 北京、開平 | 南京、廣州 |
| 經費與統籌不足 | 北京、天津、威海衛 | 上海 |
| 甲午失敗 | 威海衛、天津 | 福州、上海 |

## 11.2 人物路線與城市重心

| 路線 | 核心城市 | 補充城市 | 主題 |
|---|---|---|---|
| 李鴻章 | 上海、天津、威海衛、開平 | 福州、武漢 | 強兵、富國、北洋、官督商辦、甲午挫敗 |
| 容閎 | 香港、上海、南京、北京 | 福州 | 西學、留學、翻譯、教育改革、夢想受挫 |
| 奕訢 | 北京 | 上海、天津 | 外交制度、總理衙門、同文館、朝廷妥協 |
| 自由書記 | 全城市 | 視玩家選擇 | 從城市網絡理解洋務運動全貌 |

## 11.3 四角設施設計規則

| 角落 | 常見功能 | 設計意義 |
|---|---|---|
| 左上 | 官署 / 管理機關 | 政策、信用、任務 |
| 右上 | 學堂 / 書館 / 技術機構 | 見識、教育、西學 |
| 左下 | 產業 / 軍事 / 交通設施 | 器物、資源、城市主功能 |
| 右下 | 客棧 / 營房 / 休整點 | 休整、等待、旅程節奏 |

此規則可按城市微調，但應保持玩家直覺：上方偏制度與知識，下方偏實地與生活。

---

# 12. 下一步建議

1. 先以 **上海** 作為完整實作樣板，確認「場景背景 + 熱點 + 四角設施 + 事件解鎖」的流程。
2. 第二批實作 **北京、福州、天津**，因為它們承載最多 DSE 核心考點。
3. 第三批實作 **香港、廣州、南京、開平**，補足背景、教育、資源與內憂。
4. 最後實作 **武漢、威海衛**，作為後期與結局壓力城市。
