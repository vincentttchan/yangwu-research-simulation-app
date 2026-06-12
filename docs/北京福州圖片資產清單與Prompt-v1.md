# 北京、福州圖片資產清單與 Prompt v8

用途：補齊目前遊戲已開放但尚未放入圖片的北京、福州場景、熱點、四角設施。檔名維持不變，方便直接放入現有網站讀取。

## 這一版的核心修正

v7 延續「城市全景張力版」，並根據北京首張生成圖作修正：避免巨型前景官員、展示櫥窗式同文館、貼片式文書前景；改以中景總理衙門作城市敘事焦點，讓使節、同文館、守舊老臣、紫禁城遠景形成同一條視線。

1. 先確立城市真實空間特徵，再放入遊戲線索。
2. 所有線索必須在同一個連續場景內，不可像四張圖拼在一起。
3. 前景、中景、遠景要有一條自然的視線路徑，並呈現城市全貌。
4. 主場景不必呈現四角設施；設施圖另行生成即可。
5. 主場景先生成；熱點／設施小圖等主場景滿意後再做。

共通風格：19th century steel engraving / copper etching，dense fine crosshatching，aged paper texture，低飽和歷史色調。不要現代 UI、不要浮動標籤、不要插圖框、不要漫畫式分格。

---

## 北京 Beijing

城市定位：天朝中樞、胡同衙署、皇城陰影、近代外交與守舊思想的碰撞。

北京不應畫成一個小院落特寫，也不應畫成宏偉西式外交大樓。它應該是一張「內城政治全景」：前景可見官員、使節與文書，中景可見總理衙門與同文館所在的胡同衙署群，遠景由紫禁城城牆與黃瓦屋脊壓住整個畫面。玩家要感覺到：新外交與新學問正在舊帝國的權力陰影下艱難出現。

### 北京主場景設計邏輯

建議畫面是一個「由北京內城稍高處望向東堂子胡同一帶與紫禁城遠景」的全景。用斜向視線把前景街巷人物、中景總理衙門與同文館、遠景紫禁城連起來。主圖不必遷就四角 UI，但必須讓玩家看見北京作為中樞城市的尺度與壓迫感。

| 遊戲元素 | 建議畫面位置 | 如何自然融入 | 對應功能 |
|---|---:|---|---|
| 總理衙門 | 中景主體 | 胡同衙署群中的傳統清代衙門、文書箱、外交檔案 | 1861 近代外交制度誕生 |
| 同文館 | 中景側院 | 同一衙署群旁的小學堂，學生、地球儀、外文書若隱若現 | 1862 文教改革 |
| 軍機處 | 前景／通往皇城方向 | 軍機奏摺、紅印文書、宮中差役送件 | 中央權力與統籌壓力 |
| `bj-envoy` 外國使節 | 中景街巷與衙門入口 | 外國公使沿胡同進入衙署，帶條約文書 | 解鎖「公使駐京」 |
| `bj-woren` 守舊老臣 | 前景或中景廊下 | 老臣手持奏摺，望向同文館與使節 | 解鎖「衞道之爭」 |
| `bj-wall` 紫禁城牆 | 遠景高處 | 紫禁城城牆與黃瓦屋脊形成壓迫感 | 解鎖「天朝舊夢」 |

### 北京主場景 prompt：`assets/city/city-beijing.webp`

```text
19th century steel engraving, panoramic city-scale view of Beijing's Inner City around Dongtangzi Hutong and the Imperial City, 1861-1862. The image should feel like a wide historical political city scene, not a close-up of one courtyard, one official, or one street corner. From a slightly elevated oblique viewpoint, show grey hutong lanes, Qing yamen compounds, tiled roofs, red gates, courtyards, and the distant Forbidden City wall and muted yellow imperial rooflines dominating the skyline.

Foreground: a broad hutong street with Qing clerks, sedan chairs, document boxes, palace messengers, small groups of officials, and red-sealed memorials being carried toward the central yamen. Do not make any single foreground official oversized or portrait-like. A conservative elderly scholar-official holding a memorial scroll stands in partial shadow near the street edge, looking toward the yamen and the school with suspicion, but he remains human-scale within the city.

Middle ground, main focal point: the Zongli Yamen is the clearest architectural anchor within a cluster of traditional Qing yamen buildings. Show a modest yamen gate and courtyard with dispatch boxes, treaty documents, paper files, inkstones, clerks, and a visible entrance path. Nearby, two Western diplomats in dark frock coats and top hats move along the same hutong toward the yamen entrance carrying folded treaty documents, while Qing attendants keep a careful distance. The viewer's eye should naturally follow the street from foreground documents to these envoys and into the yamen.

Middle-right or side courtyard: the Tongwen Guan appears as a modest converted Qing side compound attached to or near the yamen group. Do not show it as a cutaway display window. Show only glimpses through a doorway, courtyard opening, or lattice windows: young banner students, a globe, foreign-language books, brushes and ink, and a simple astronomical instrument. This should feel discovered inside the old administrative city, not exhibited like a museum scene.

Background: the Forbidden City wall and imperial rooflines loom beyond the yamen roofs, larger and more silent than everything in the middle ground. The old imperial order should visually press down on the new institutions.

Composition: one continuous city panorama with depth and flow: foreground officials and documents, middle-ground yamen and foreign envoys, side-ground Tongwen Guan glimpses, far-background Forbidden City walls. The dramatic tension should come from three forces occupying the same city: old imperial authority, new foreign diplomacy, and contested Western learning. Avoid theatrical staging, oversized portrait figures, cutaway rooms, or foreground objects that look pasted on top of the city. No hard separation between foreground and background. No inset panels, no floating signs, no modern UI, no caption boxes. Cool stone grey, faded red lacquer, muted imperial gold, dry ink brown, aged paper texture, dense fine crosshatching. Horizontal 16:9.
```

### 北京小圖清單

| 檔案名稱 | 放置位置 | 用途 |
|---|---|---|
| `bj-wall.webp` | `assets/hotspot/` | 熱點：紫禁城牆 |
| `bj-envoy.webp` | `assets/hotspot/` | 熱點：外國使節 |
| `bj-woren.webp` | `assets/hotspot/` | 熱點：守舊老臣 |
| `bj-zongli.webp` | `assets/facility/` | 四角：總理衙門 |
| `bj-tongwen.webp` | `assets/facility/` | 四角：同文館 |
| `bj-junji.webp` | `assets/facility/` | 四角：軍機處 |
| `bj-guild.webp` | `assets/facility/` | 四角：會館 |

### 北京小圖 prompts

```text
bj-wall.webp: 19th century steel engraving close-up, Beijing Imperial City wall seen from inside a Qing hutong courtyard, grey brick wall and distant yellow roof edge beyond tiled rooftops, a small guard and sedan chair below for scale, quiet imperial pressure, cool stone grey and muted gold, aged paper texture, dense crosshatching, no labels, horizontal 16:9.
```

```text
bj-envoy.webp: 19th century steel engraving close-up, two Western diplomats in dark frock coats and top hats entering a traditional Qing yamen gate through a narrow Beijing hutong, carrying treaty documents, Qing attendants watching with restrained unease, grey brick walls and red wooden doors, no Western-style office building, aged paper texture, fine crosshatching, horizontal 16:9.
```

```text
bj-woren.webp: 19th century steel engraving close-up, conservative Qing scholar-official seated under a grey-brick corridor in a Beijing yamen courtyard, holding a memorial scroll opposing Western mathematics and astronomy, younger officials listening, red-sealed papers and inkstone on a wooden table, restrained intellectual tension, aged paper texture, fine crosshatching, horizontal 16:9.
```

```text
bj-zongli.webp: 19th century steel engraving, modest Qing yamen office interior, treaty documents, dispatch boxes, maps, inkstones, and clerks copying foreign affairs memorials, traditional courtyard architecture with lattice windows and grey brick walls, the birth of modern diplomacy inside an old bureaucratic shell, no readable text, horizontal 16:9.
```

```text
bj-tongwen.webp: 19th century steel engraving, converted side hall classroom of the Tongwen Guan in Beijing, young banner students at wooden desks, globe, foreign-language primers, simple astronomical instrument, brushes and ink beside Western books, traditional lattice windows and Qing courtyard beams, experimental and fragile atmosphere, no modern classroom elements, horizontal 16:9.
```

```text
bj-junji.webp: 19th century steel engraving, Qing Grand Council-style paperwork scene, senior officials reviewing military dispatches, provincial maps, red-sealed memorials, and stacked files inside a dim traditional office, suggesting central coordination and bureaucratic strain, dark wood, ink grey, aged paper texture, horizontal 16:9.
```

```text
bj-guild.webp: 19th century steel engraving, Beijing provincial guild lodge courtyard in a hutong, traveling scholars with luggage bundles, tea table, lanterns, notice board, quiet political gossip, grey brick courtyard walls and tiled eaves, human-scale and restful, aged paper texture, fine crosshatching, horizontal 16:9.
```

---

## 福州 Fuzhou

城市定位：馬尾船政、閩江水道、羅星塔航標、船塢與學堂、海防夢想與馬江戰敗伏線。

福州不應畫成普通工業碼頭。它的歷史特徵應該是「閩江上的馬尾港」：江面、山勢、羅星塔、船台滑道、近代船政廠房、傳統閩式屋頂與外國技師共處。前景、中景、遠景要沿著江岸自然延伸。

### 福州主場景設計邏輯

建議畫面是一個「站在馬尾港稍高處看閩江、船政廠、羅星塔與江口炮台」的港口全景。主圖要像上海圖一樣看見整個地方的角色：不是一個船台特寫，而是一座海軍城市正在形成。

| 遊戲元素 | 建議畫面位置 | 如何自然融入 | 對應功能 |
|---|---:|---|---|
| `fz-yan` 少年學生 | 前景左側 | 船政學堂外，一名學生拿羅盤、星表，背後是課室窗 | 解鎖「學堂少年」 |
| `fz-french` 法國工程師 | 中景船塢 | 船台旁圖紙桌，法國工程師與華匠、清官圍看 | 解鎖「借法之局」 |
| `fz-battery` 炮台艦影 | 遠景右側 | 羅星塔附近江口、炮台、煙霧中的艦影 | 解鎖「海防之憂」 |
| 1866 福州船政伏線 | 中景船政廠全體 | 半成船殼、船台、工棚、木料與鐵件 | 造船自強 |
| 1874 / 1885 海防伏線 | 右上遠方 | 炮台、遠艦、煙霧、水道壓迫感 | 海防危機與馬尾伏線 |

### 福州主場景 prompt：`assets/city/city-fuzhou.webp`

```text
19th century steel engraving, panoramic city-scale view of Mawei harbour on the Min River near Fuzhou, 1866. The image should feel like a Qing naval-industrial town forming along the river, not a scenic tourist harbour, not a close-up of one dock, and not a generic European shipyard. From a slightly elevated oblique viewpoint, show the Min River, Mawei shipyard district, Fujian hills, river traffic, Luoxing Pagoda / China Tower, and distant coastal defenses in one continuous composition.

Foreground: a continuous muddy Mawei riverbank with timber beams, ropes, iron fittings, coal baskets, small sampans, sailors, shipwrights, and workers carrying materials toward the slipways. A few naval academy students with books, a compass, and rolled charts may appear near a modest Fujian-style school building at the edge of the shipyard, showing education happening beside industry, but they must remain small within the larger scene. Avoid a large foreground desk, oversized open books, or a posed student portrait.

Middle ground, main focal point: the Foochow Arsenal and Mawei dockyard should be the clearest anchor of the image. Show long low workshop sheds, timber storage yards, a modest administrative building, small brick chimneys, several inclined slipways descending into the Min River, scaffolding, pulleys, rope rigging, and one half-assembled wooden steamship hull. French engineers and Qing officials should stand naturally beside one slipway, reviewing plans with Chinese craftsmen, but the shipyard district must dominate, not the meeting table.

River middle ground: traditional Fujian junks, bamboo rafts, small working boats, and a few early steam vessels share the Min River. The river must visually connect the shipyard to the wider harbour, like Shanghai's Huangpu River connects the Bund. Keep river traffic busy but not glamorous; it should feel like a working naval river carrying timber, coal, students, sailors, and warship parts.

Background: humid Fujian hills and white-walled local houses frame the river. Luoxing Pagoda / China Tower appears as a smaller navigational landmark on a hill or river bend, not a giant scenic tower. Low coastal batteries and a few distant dark warship silhouettes sit near the widening river mouth in mist, foreshadowing later sea-defense crises and the Battle of Mawei without turning the scene into a battle painting.

Composition: one continuous harbour panorama with depth: foreground workers and riverbank materials, middle-ground slipways and shipyard district, Min River traffic across the frame, far-background pagoda, batteries, hills, and warship shadows. The viewer's eye should follow riverbank materials and workers into the slipways, then along the Min River toward the pagoda, coastal batteries, and distant ship shadows. The dramatic tension should come from a naval dream being built through labour, study, foreign expertise, and local geography, while the river already points toward future defeat. Avoid theatrical staging, oversized students or engineers, giant foreground documents, cutaway workshops, tourist postcard scenery, bright blue water, or foreground tools that look pasted on top of the harbour. Muted sepia, damp grey-green Fujian hills, restrained dark teal river, warm timber, iron grey, smoke grey, aged paper texture, dense fine crosshatching. Horizontal 16:9, no labels, no modern UI, no caption boxes.
```

### 福州小圖清單

| 檔案名稱 | 放置位置 | 用途 |
|---|---|---|
| `fz-french.webp` | `assets/hotspot/` | 熱點：法國工程師 |
| `fz-yan.webp` | `assets/hotspot/` | 熱點：少年學生 |
| `fz-battery.webp` | `assets/hotspot/` | 熱點：炮台艦影 |
| `fz-zhengju.webp` | `assets/facility/` | 四角：福州船政局 |
| `fz-xuetang.webp` | `assets/facility/` | 四角：船政學堂 |
| `fz-dock.webp` | `assets/facility/` | 四角：馬尾船塢 |
| `fz-inn.webp` | `assets/facility/` | 四角：江岸客棧 |

### 福州小圖 prompts

```text
fz-french.webp: 19th century steel engraving close-up, French engineers and Qing officials inside the working yard of the Foochow Arsenal at Mawei, 1866, ship blueprints spread on a rough table beside a slipway, Chinese craftsmen studying the plans, imported machinery crates and iron parts nearby, humid Min River air, no labels, dense crosshatching, horizontal 16:9.
```

```text
fz-yan.webp: 19th century steel engraving close-up, young Chinese naval student at the Foochow Naval Academy beside the Min River, compass, star table, navigation chart, foreign-language textbook, open lattice window showing shipyard activity outside, thoughtful and hopeful, Fujian tiled roof details, aged paper texture, horizontal 16:9.
```

```text
fz-battery.webp: 19th century steel engraving close-up, Min River mouth near Mawei, Luoxing Pagoda visible on a hill or river bend, low coastal batteries with old cannons, distant modern warship silhouettes in river mist, a Qing officer watching anxiously, foreshadowing Taiwan crisis and Battle of Mawei, deep teal and smoke grey, horizontal 16:9.
```

```text
fz-zhengju.webp: 19th century steel engraving, Foochow Arsenal compound along the Mawei riverbank, long workshop sheds, modest administrative building, timber racks, small brick chimney, workers carrying beams and iron fittings, Qing and Fujian architectural details mixed with early industrial tools, ambitious but unfinished, horizontal 16:9.
```

```text
fz-xuetang.webp: 19th century steel engraving, Foochow Naval Academy side hall near the shipyard, students studying navigation, shipbuilding diagrams, foreign-language books, model steamship, simple astronomical tools, open window toward the Min River and slipway, traditional Fujian roof beams, disciplined and quiet, horizontal 16:9.
```

```text
fz-dock.webp: 19th century steel engraving, Mawei dock and slipway directly connected to the Min River, half-built steamship hull, timber scaffolds, ropes, pulleys, workers on wet river stones, traditional junks nearby for contrast, strong sense of riverbank engineering, aged paper texture, dense crosshatching, horizontal 16:9.
```

```text
fz-inn.webp: 19th century steel engraving, riverside inn or teahouse at Mawei, sailors, craftsmen, naval students, and merchants under a wooden awning, tea cups and luggage, Foochow Arsenal and Min River visible behind them, place of rest and local news, humid Fujian atmosphere, horizontal 16:9.
```
