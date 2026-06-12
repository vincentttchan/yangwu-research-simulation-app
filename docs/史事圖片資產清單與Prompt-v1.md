# 史事圖片資產清單與 Prompt v1

本文件整理目前遊戲「史 · 事」事件所需圖片。程式會自動讀取：

`assets/events/<eventId>.webp`

因此已接線事件必須使用下方「檔案位置」的精確檔名。圖片由你自行生成後放入 `assets/events/`，無需再改程式。

---

## 共同視覺規格

- **比例**：16:9 horizontal composition。
- **建議尺寸**：1792x1024、1536x864 或其他 16:9 尺寸。
- **格式**：`.webp`。
- **風格**：19th century copper etching / steel engraving，dense fine crosshatching，aged paper texture。
- **色調**：以 warm sepia-amber 為主；北京可偏冷灰，福州戰事可加煙黑，圓明園可加火橙，但不要變成彩色插畫。
- **構圖原則**：像上海主場景一樣，讓玩家感覺到「時代場面」而不只是單一街角。事件圖可以比城市主場景更集中，但仍要有前景、中景、遠景。
- **線索原則**：重要線索自然融入人物、建築、船艦、文書、機器、地圖、煙囪、碼頭等物件中，不使用突兀標籤。
- **避免**：modern photo realism, anime, fantasy, cinematic color grading, clean digital painting, neon, 3D render, readable large labels, UI icons, modern clothes, modern buildings, watermark。

通用 negative prompt：

```text
No modern buildings, no modern clothing, no fantasy elements, no digital painting look, no anime, no photorealistic camera lens effects, no neon colors, no UI markers, no floating labels, no large readable text signs, no watermark, no logo, no decorative collage frames.
```

---

## 已接線史事圖片

### 01. 1860 北京｜圓明園

- **事件 ID**：`e_yuanmingyuan`
- **檔案位置**：`assets/events/e_yuanmingyuan.webp`
- **核心感覺**：天朝體面被烈火撕開，洋務的危機感由屈辱開始。
- **自然線索**：焚毀的西洋樓、火光、黑煙、逃散宮人、遠處英法士兵、地上破裂石獸或銅器。

```text
19th century copper etching, panoramic view of Yuanmingyuan burning in October 1860. Ornate Chinese-European palace buildings collapse under flames, black smoke rising across the sky. Foreground: cracked stone ornament, fallen bronze vessel, scattered imperial objects on scorched ground. Middle ground: palace courtyards filled with smoke and fleeing servants, small silhouettes of British and French soldiers in the distance. Background: ruined garden pavilions fading into haze. The scene feels tragic, humiliating, and historically decisive, not theatrical fantasy. Warm sepia-amber engraving with controlled flame orange and smoke black accents, dense fine crosshatching, aged paper texture, horizontal 16:9 composition.
```

---

### 02. 1861 北京｜總理衙門

- **事件 ID**：`e_zongli_yamen`
- **檔案位置**：`assets/events/e_zongli_yamen.webp`
- **核心感覺**：舊帝國第一次被迫建立專門處理對外事務的制度。
- **自然線索**：東堂子胡同、總理衙門院門、清吏、外國使節、海防地圖、奏摺、紫禁城遠景。

```text
19th century copper etching, wide view of Beijing's Dongtangzi Hutong in 1861, where the newly established Zongli Yamen handles foreign affairs. Foreground: Qing officials carrying memorials and maps through a courtyard gate, while a small group of foreign envoys in Victorian coats wait beside sedan chairs. Middle ground: modest government buildings with clerks moving between rooms, desks with coastline maps and sealed documents visible through open doors. Background: grey Beijing rooftops, city walls, and a distant suggestion of the Forbidden City. The atmosphere feels cautious, formal, and politically tense, as an old empire learns diplomatic equality under pressure. Cool grey-sepia copper engraving with small vermilion seal accents, dense crosshatching, aged paper texture, horizontal 16:9 composition.
```

---

### 03. 1862 北京｜同文館

- **事件 ID**：`e_tongwen_guan`
- **檔案位置**：`assets/events/e_tongwen_guan.webp`
- **核心感覺**：西學進入京師，但每一張書桌都被守舊目光盯着。
- **自然線索**：八旗少年、外文書、地球儀、黑板、洋教習、倭仁式守舊老臣在門外或陰影中。

```text
19th century copper etching, interior and courtyard view of the Tongwen Guan in Beijing, 1862. Foreground: young Bannermen students seated at wooden desks, studying foreign-language books, maps, a globe, and simple scientific instruments. Middle ground: a foreign instructor gestures toward a coastline map while Qing clerks observe carefully. At the courtyard threshold, conservative elder officials in dark robes watch with suspicion, their presence quiet but heavy. Background: the Zongli Yamen compound and Beijing rooftops beyond. The image should feel like a fragile classroom experiment inside a resistant old capital. Warm grey-sepia engraving, fine crosshatching, aged paper texture, horizontal 16:9 composition.
```

---

### 04. 1865 上海｜江南製造

- **事件 ID**：`e_jiangnan_pinned`
- **檔案位置**：`assets/events/e_jiangnan_pinned.webp`
- **核心感覺**：通商口岸的繁華背後，清廷把「自強」變成一座吞銀、冒煙、仿西而造的軍工巨物。
- **自然線索**：黃浦江、外灘遠景、江南製造總局、煙囪、旗記鐵廠痕跡、炮管、輪船部件、翻譯館、華工與洋匠。

```text
19th century copper etching, wide panoramic view of Shanghai on the Huangpu River in 1865, showing the Jiangnan Arsenal rising inside a busy treaty-port landscape. Foreground left: Chinese dockworkers carry iron parts, cannon barrels, boiler plates, and wooden crates unloaded from boats; a Qing official studies purchase papers from the former American ironworks while foreign technicians stand nearby. Foreground right: scholars and craftsmen work at a small translation room table, comparing Western mechanical diagrams with Chinese notes, suggesting the arsenal is also a place of learning. Middle ground: the Jiangnan Arsenal stretches along the riverbank with brick workshops, tall smokestacks, steam hammers, lathes, and half-assembled gunboat sections visible through open doors. Background: the Huangpu River remains crowded with junks, paddle steamers, merchant warehouses, and the distant Bund, so the military factory feels embedded in cosmopolitan Shanghai rather than isolated. The image should feel ambitious, costly, noisy, and uneasy: self-strengthening born from foreign machines inside a semi-colonial port. Warm sepia-amber tones, dense fine crosshatching, aged paper texture, horizontal 16:9 composition with strong city-wide depth.
```

---

### 05. 1866 福州｜福州船政

- **事件 ID**：`e_fuzhou_shipyard`
- **檔案位置**：`assets/events/e_fuzhou_shipyard.webp`
- **核心感覺**：閩江山水之間突然長出近代船塢與學堂，海軍夢壯闊，但每一步都倚賴外國技術與巨額餉源。
- **自然線索**：馬尾港全景、閩江轉彎、山勢、船塢、船政學堂、半成品木殼 / 蒸汽艦、法國洋員、沈葆楨、繪事院圖紙。

```text
19th century copper etching, sweeping panoramic view of Mawei on the Min River, Fuzhou, 1866, where the Foochow Navy Yard is being founded between river, hills, shipyard, and school. Foreground: Shen Baozhen, Qing naval students, shipwrights, and French advisers gather around large hull drawings and mechanical plans on wooden tables; measuring tools, account books, and timber samples show both technical ambition and heavy expense. Middle ground: a broad shipyard complex spreads along the riverbank, with dry docks, timber frames, cranes, ropewalks, workshops, and a half-built steam warship on the stocks. To one side, the shipbuilding school and drawing office are visible, with young students carrying books, compasses, and rolled plans. Background: the Min River bends through misty hills, filled with junks, small patrol vessels, and supply boats, making the navy yard feel like a new industrial organism planted into an old southern landscape. The atmosphere should feel grand, disciplined, hopeful, but fragile: a Chinese naval dream taking shape under foreign instruction. Warm sepia-amber engraving with subtle river-grey shadows, dense fine crosshatching, aged paper texture, horizontal 16:9 composition with strong spatial depth.
```

---

### 06. 1870 天津｜天津教案

- **事件 ID**：`e_tianjin_jiaoan`
- **檔案位置**：`assets/events/e_tianjin_jiaoan.webp`
- **核心感覺**：洋務上層想學西方，民間卻在恐懼、謠言與列強壓力中燃起衝突。
- **自然線索**：望海樓教堂、聚集民眾、法國軍艦、清官查辦、海河碼頭、煙火。

```text
19th century copper etching, tense panoramic view of Tianjin near the Wanghailou church and Hai River during the Tientsin Massacre crisis, 1870. Foreground: Qing officials and yamen runners try to hold back an angry crowd gathered around scattered rumors and damaged church objects. Middle ground: smoke rises near the church compound, with missionaries, converts, and local residents moving in confusion. Background: French gunboats on the Hai River and foreign flags at the concession edge, showing diplomatic pressure closing in. The scene must feel socially volatile and morally complicated, not a simple battle scene. Cool sepia-grey engraving with small smoke-black accents, dense fine crosshatching, aged paper texture, horizontal 16:9 composition.
```

---

### 07. 1872 上海｜留美學童

- **事件 ID**：`e_students_depart`
- **檔案位置**：`assets/events/e_students_depart.webp`
- **核心感覺**：洋務由機器走向人才，一群少年把未來帶上船。
- **自然線索**：上海碼頭、容閎、學童、書箱、輪船、家長送別、外灘遠景。

```text
19th century copper etching, Shanghai departure pier in 1872 as the first Chinese Educational Mission students leave for America. Foreground: young Chinese boys with book chests, rolled bedding, and travel papers stand in nervous groups beside their families. Middle ground: Yung Wing and Qing supervisors check lists near the gangway, while sailors prepare a steamship for departure. Background: the Huangpu River, Western merchant houses on the Bund, Chinese junks, and a paddle steamer waiting under smoke. The composition should feel tender, brave, and historically uncertain, with the promise of talent replacing the limits of machines. Warm sepia-amber engraving, dense fine crosshatching, aged paper texture, horizontal 16:9 composition.
```

---

### 08. 1873 上海｜輪船招商局

- **事件 ID**：`e_zhaoshangju`
- **檔案位置**：`assets/events/e_zhaoshangju.webp`
- **核心感覺**：求富不只是賺錢，而是在商戰中奪回航運利權。
- **自然線索**：中國商船、外國輪船、華商入股、官督商辦文書、碼頭貨物、外灘洋行。

```text
19th century copper etching, busy Shanghai waterfront in 1873 at the founding of the China Merchants Steam Navigation Company. Foreground: Chinese merchants, compradors, and Qing officials review share documents and shipping contracts beside stacked cargo bales. Middle ground: a Chinese-operated steamship takes on goods while foreign steamers and flags nearby suggest commercial rivalry. Background: Bund merchant houses, warehouses, junks, and the Huangpu River crowded with traffic. The image should feel energetic and competitive, marking the shift from military self-strengthening to profit-seeking enterprise and recovery of commercial rights. Warm sepia-amber engraving, dense crosshatching, aged paper texture, horizontal 16:9 composition.
```

---

### 09. 1874 福州 / 台灣｜日本侵台

- **事件 ID**：`e_fuzhou_taiwan`
- **檔案位置**：`assets/events/e_fuzhou_taiwan.webp`
- **核心感覺**：日本明治維新後的壓力逼清廷正視海防。
- **自然線索**：閩江艦隊南下、台灣海岸、沈葆楨、臨時炮台、日軍艦影、海防文書。

```text
19th century copper etching, strategic coastal scene linking Fuzhou naval forces and Taiwan during the 1874 Japanese expedition. Foreground: Shen Baozhen and Qing officers examine coastal defense maps and urgent memorials on a windswept deck. Middle ground: Fujian fleet vessels and supply boats prepare to sail south, with sailors loading cannon and provisions. Background: a misty Taiwan coastline with rough temporary fortifications and distant Japanese vessels offshore. The scene should feel like a sudden awakening to maritime vulnerability, with Japan as a new regional threat. Warm sepia engraving with cool sea-grey accents, dense fine crosshatching, aged paper texture, horizontal 16:9 composition.
```

---

### 10. 1875 北京｜海防大籌議

- **事件 ID**：`e_haifang_chouyi`
- **檔案位置**：`assets/events/e_haifang_chouyi.webp`
- **核心感覺**：海防與塞防不是口號之爭，而是國力不足下的艱難取捨。
- **自然線索**：軍機處或朝廷議事空間、李鴻章海防奏摺、左宗棠塞防主張、海疆地圖、新疆地圖、餉銀帳冊。

```text
19th century copper etching, high-level Qing court strategy meeting in Beijing, 1875, debating maritime defense and frontier defense. Foreground: a long table covered with two large maps, one showing China's coast and naval bases, the other showing Xinjiang and the northwest frontier. Memorials, account books, and stacks of silver tael records show limited funds. Middle ground: officials representing Li Hongzhang's maritime defense argument and Zuo Zongtang's frontier defense argument face one another in restrained tension. Background: palace walls and shadowed court architecture. The atmosphere feels intellectual, strategic, and financially constrained rather than theatrical. Cool grey-sepia engraving with small vermilion seal accents, dense crosshatching, aged paper texture, horizontal 16:9 composition.
```

---

### 11. 1881 上海｜留美撤回

- **事件 ID**：`e_students_return`
- **檔案位置**：`assets/events/e_students_return.webp`
- **核心感覺**：清廷願意送人出去學習，卻害怕人真正改變。
- **自然線索**：上海碼頭、歸國學生、西式衣着或短髮、清吏審視、書本儀器、尷尬距離。

```text
19th century copper etching, Shanghai dockside in 1881 as returned Chinese Educational Mission students arrive back from America. Foreground: young returned students carry trunks, engineering books, drafting tools, and Western-style coats, some appearing awkward beside their Qing robes and queues. Middle ground: suspicious Qing officials inspect documents while families and port workers watch with mixed curiosity. Background: steamship at the pier, Bund buildings, and river traffic under a pale sky. The scene should feel emotionally restrained: talent has returned, but trust has not. Warm sepia-amber engraving with muted grey shadows, dense crosshatching, aged paper texture, horizontal 16:9 composition.
```

---

### 12. 1882 上海｜機器織布局

- **事件 ID**：`e_zhibuju`
- **檔案位置**：`assets/events/e_zhibuju.webp`
- **核心感覺**：機器工業開始挑戰洋布，但官督商辦的手太重。
- **自然線索**：織布機、棉紗、鄭觀應、華商、官員、洋布樣本、帳簿。

```text
19th century copper etching, interior and riverside view of the Shanghai Cotton Mill around 1882. Foreground: rows of mechanical looms and cotton threads in motion, Chinese workers operating machinery under the supervision of managers. Middle ground: Zheng Guanying and merchants compare locally woven cloth with imported foreign cloth samples on a long table, while Qing officials examine account books nearby. Background: factory windows show smokestacks and the Shanghai riverfront beyond. The composition should feel productive but constrained, showing commercial ambition caught inside official supervision. Warm sepia-amber industrial engraving, dense fine crosshatching, aged paper texture, horizontal 16:9 composition.
```

---

### 13. 1884 福州｜馬江海戰

- **事件 ID**：`e_fuzhou_mawei`
- **檔案位置**：`assets/events/e_fuzhou_mawei.webp`
- **核心感覺**：能造船不等於能打仗，器物改革在制度缺口前崩塌。
- **自然線索**：馬尾港、法國艦隊、福建艦隊沉沒、船政局遠景、閩江煙火、岸上學堂或船塢。

```text
19th century copper etching, catastrophic panoramic view of the Battle of Foochow at Mawei harbor, 1884. Foreground: Qing sailors and shipyard workers watch helplessly from the riverbank as wreckage, broken masts, and smoke drift on the Min River. Middle ground: French warships fire into the Fujian fleet; Chinese vessels burn or sink near the anchorage. Background: the Foochow Navy Yard, dry docks, and naval school appear through smoke, linking the disaster to twenty years of shipbuilding effort. The scene should feel tragic and diagnostic, revealing that ships without command, training, and strategy cannot save a state. Sepia engraving with smoke-black and muted fire accents, dense expressive crosshatching, aged paper texture, horizontal 16:9 composition.
```

---

## 預留史事圖片

以下三件在時間軸顯示中已有位置，但目前仍未正式接入 `PINNED_BY_YEAR` 和 `EVENTS`。建議先保留 prompt，待威海衛 / 甲午後段完成時再接線。

### 14. 1888 威海衛｜北洋成軍

- **建議事件 ID**：`e_beiyang_fleet`
- **建議檔案位置**：`assets/events/e_beiyang_fleet.webp`
- **核心感覺**：洋務表面達到頂峰，艦隊壯觀，但制度陰影仍在。
- **自然線索**：威海衛、北洋艦隊、定遠鎮遠、操練、炮台、李鴻章檢閱、軍費文書。

```text
19th century copper etching, grand panoramic view of the Beiyang Fleet assembled at Weihaiwei around 1888. Foreground: Qing naval officers and sailors stand in formation near coastal guns, with inspection documents and naval charts on a table. Middle ground: modern ironclad warships including large twin-turret vessels anchor in the harbor, smoke rising from funnels, smaller boats moving between them. Background: Weihaiwei hills, shore batteries, and a fortified naval base under a clear but austere sky. The image should feel impressive and almost triumphant, yet slightly fragile, as if the fleet's strength depends on a thin layer of funding, training, and command. Warm sepia-grey copper engraving, dense crosshatching, aged paper texture, horizontal 16:9 composition.
```

---

### 15. 1894 黃海｜黃海海戰

- **建議事件 ID**：`e_yellow_sea_battle`
- **建議檔案位置**：`assets/events/e_yellow_sea_battle.webp`
- **核心感覺**：甲午戰場把洋務三十年的成績推上火線。
- **自然線索**：北洋艦隊、日本聯合艦隊、炮煙、受損艦艇、官兵救火、海面混亂。

```text
19th century copper etching, vast naval battle scene in the Yellow Sea during the Sino-Japanese War, 1894. Foreground: damaged Qing sailors fight fires and carry ammunition on the deck of a battered ironclad, smoke and splinters around them. Middle ground: Beiyang Fleet ships exchange fire with faster Japanese warships moving in formation through heavy smoke. Background: a wide, chaotic sea horizon filled with shell splashes, burning vessels, and drifting smoke. The scene should feel overwhelming and irreversible, testing every claim of self-strengthening under modern naval warfare. Sepia-grey engraving with smoke-black and muted flame accents, dense dramatic crosshatching, aged paper texture, horizontal 16:9 composition.
```

---

### 16. 1895 馬關｜馬關條約

- **建議事件 ID**：`e_shimonoseki_treaty`
- **建議檔案位置**：`assets/events/e_shimonoseki_treaty.webp`
- **核心感覺**：洋務失敗不只是軍敗，而是整個改革框架的判決。
- **自然線索**：春帆樓、李鴻章、伊藤博文、日本官員、條約文書、海圖、割地賠款的沉重空氣。

```text
19th century copper etching, interior of the treaty negotiation at Shunpanro, Shimonoseki, 1895. Foreground: a long negotiation table with treaty papers, ink brushes, seals, maps of Liaodong, Taiwan, and the sea routes spread under tense hands. Middle ground: Li Hongzhang and Qing envoys sit opposite Japanese officials led by Ito Hirobumi, both sides restrained and formal. Background: tall windows reveal a quiet harbor outside, making the room feel painfully still after war. The atmosphere should be humiliating, cold, and decisive, like the final judgment on three decades of self-strengthening. Cool sepia-grey copper engraving with subtle vermilion seal accents, dense fine crosshatching, aged paper texture, horizontal 16:9 composition.
```

---

## 生成後檢查清單

1. 檔名是否完全等於 `assets/events/<eventId>.webp`。
2. 圖片是否為 16:9，沒有被裁走重要人物或線索。
3. 是否像「歷史場面」而不是「插圖拼貼」。
4. 是否沒有大型文字招牌、浮動標籤或現代元素。
5. 玩家不看說明時，是否仍能從畫面猜到事件的核心衝突。
6. 放入後進入事件 modal，確認圖片沒有太暗、太花或搶走選項文字的可讀性。

---

## 下一批可延伸圖片

本文件只處理「史 · 事」主圖。若下一步要完整化城市探索，可以另開一份文件處理：

- `assets/actions/`：每個行動選項的象徵圖。
- `assets/hotspots/`：每個城市熱點的局部線索圖。
- `assets/facility/`：每個設施解鎖前後的小圖或狀態圖。
