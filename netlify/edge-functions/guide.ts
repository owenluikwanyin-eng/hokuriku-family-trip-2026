export default async (_req: Request, context: { next: () => Promise<Response> }) => {
  const response = await context.next();
  const type = response.headers.get("content-type") || "";
  if (!type.includes("text/html")) return response;

  let html = await response.text();
  if (html.includes("data-tour-guide-injected")) return new Response(html, response);

  const css = `
  <style data-tour-guide-injected>
  @media(min-width:901px){.daygrid{grid-template-columns:1.05fr .75fr 1.2fr!important;align-items:start}}
  .guidecol{border:1px solid #d9e6f2;background:linear-gradient(180deg,#f9fcff,#f5f9fd);border-radius:17px;padding:13px}
  .guidetitle{display:flex;align-items:center;gap:7px;font-size:18px;font-weight:900;margin:0 0 10px}
  .guidecard{background:#fff;border:1px solid var(--line);border-radius:14px;padding:12px;margin-top:9px}
  .guidecard h4{margin:0 0 6px;font-size:15px}.guidecard p{margin:5px 0;color:#3f5468;font-size:13px;line-height:1.62}
  .guidecard .listen{margin-top:7px;padding:7px 9px;border-radius:10px;background:#eef6ff;color:#315e99;font-size:12px;font-weight:750}
  .guide-source{margin-top:7px;font-size:10.5px;color:#7c8d9f}.guide-source a{color:#607e9a;text-decoration:none}.guide-source a:hover{text-decoration:underline}
  @media(max-width:900px){.guidecol{margin-top:0}}
  </style>`;

  const script = `<script data-tour-guide-injected>
  (()=>{
    const guides=[
      [
        {t:'金澤｜加賀「百萬石」城下町',a:'大家第一晚去到金澤，可以先記住一個背景：呢座城市係江戶時代加賀藩嘅中心。前田家長期經營金澤，令茶道、能樂、金箔、漆器、陶瓷等文化特別興盛。金澤又避過近代大型戰災，所以今日仍保留到好多城下町格局同傳統文化。',b:'去到站前其實已經係一個好好嘅「開場」。之後幾日見到嘅九谷燒、加賀料理同工藝，都同呢段加賀文化脈絡有關。',u:'https://visitkanazawa.jp/en/feature/detail_639.html'},
        {t:'金澤站｜鼓門與もてなしドーム',a:'兼六園口最搶眼嘅鼓門高約13.7米，造型取材自金澤傳統能樂使用嘅「鼓」。後面巨大玻璃屋頂叫「もてなしドーム」，概念係北陸多雨雪，金澤就好似為旅客撐起一把大傘，代表「款待」。',b:'夜晚鼓門會亮燈，所以第一晚食飯前後順路影相最啱。留意兩條木柱唔係單純裝飾，而係用現代建築語言去講金澤嘅傳統表演文化。',u:'https://visitkanazawa.jp/en/spot/detail_10050.html'}
      ],
      [
        {t:'兼六園｜點解叫「兼六」？',a:'兼六園係日本三名園之一，原本係加賀藩前田家嘅大名庭園，由歷代藩主逐步營造。個名「兼六」係指一個完美庭園同時具備六種本來好難兼得嘅條件：宏大、幽邃、人力、蒼古、水泉同眺望。庭園約11.4公頃，1874年先正式向公眾開放。',b:'行入去唔好只當係「靚花園」。霞ヶ池、石橋、松樹同高低地形都係精心設計，用行路角度不斷改變景色。見到唐崎松時，可以想像北陸冬天會用雪吊保護樹枝。',u:'https://visitkanazawa.jp/en/itineraries/detail_82.html'},
        {t:'千里濱｜點解架車真係可以喺沙灘行？',a:'千里濱なぎさドライブウェイ大約8公里，係日本極少數、亦係世界罕見可以讓一般車輛沿海邊行駛嘅天然沙灘。秘密唔係沙特別硬，而係砂粒大小非常平均，大約0.2毫米；吸咗適量海水之後，砂粒之間會變得非常緊密，所以連私家車、電單車甚至巴士都可以行。',b:'呢段海岸亦面對侵蝕問題。去到如果見到沙面偏白、鬆散，就唔好駛入去；高浪時即使天晴亦可能封路。',u:'https://www.city.hakui.lg.jp/kankou/kankoushisetsu/3168.html'},
        {t:'雨晴海岸｜萬葉、義經與立山連峰',a:'雨晴最出名係「海越しの立山連峰」：由富山灣望過去，海面後面直接升起3,000米級高山，呢種海山同框景觀相當罕有。早喺8世紀，萬葉歌人大伴家持已經歌詠呢一帶。',b:'「雨晴」個名仲有源義經傳說：義經一行逃往奧州途中遇上驟雨，據說曾喺「義經岩」下面避雨等天晴。你哋去到可以搵女岩、義經岩，再望吓遠方立山連峰有冇好似浮喺海面上。',u:'https://www.takaoka.or.jp/feature/detail_68.html'},
        {t:'宇奈月溫泉｜同黑部水力開發一齊誕生',a:'宇奈月溫泉唔係幾百年前自然形成嘅古老溫泉街；佢係1923年正式開湯。當時黑部川正展開大規模水力發電開發，原本叫「桃原」嘅無人台地亦同步規劃成溫泉地。溫泉水由約7公里上游嘅黑薙溫泉引過嚟。',b:'泉水係無色透明、弱鹼性單純泉，源頭溫度約90°C。你哋住一泊二食，其實正好可以體驗一個同近代工程史連住嘅溫泉鄉。',u:'https://www.unazuki-onsen.com/about'}
      ],
      [
        {t:'黑部峽谷｜本來唔係為遊客而建嘅鐵路',a:'黑部峽谷係黑部川長年侵蝕形成嘅巨大V字谷。黑部川由北阿爾卑斯山區落到日本海，流域高低差接近3,000米，水量大、坡度急，所以20世紀初開始成為重要水力發電開發地。',b:'小火車最初其實係工程鐵路。1923年開始鋪設宇奈月至猫又一段，1926年開始行車，用嚟搬運發電工程物資；1953年先正式成為地方鐵路營業。換句話講，你今日坐嘅觀光車，本身係日本近代能源開發歷史嘅一部分。',u:'https://www.kurotetu.co.jp/about_kurobe/'},
        {t:'2026特別路段｜宇奈月 ↔ 猫又',a:'因地震復修工程，2026年9月30日前只行宇奈月至猫又往返；10月1日先恢復全線去欅平。你哋9月28日搭車，所以會係猫又折返。呢個反而幾特別：今年官方容許乘客喺平時一般唔落客嘅猫又站短暫下車。',b:'出宇奈月後第一段會見到鮮紅色新山彥橋；列車聲會喺溫泉街同峽谷之間回響，亦係「山彥」個名嘅由來。',u:'https://www.kurotetu.co.jp/en/route_guide/'}
      ],
      [
        {t:'白馬岩岳｜由滑雪山變成四季山岳度假區',a:'白馬岩岳原本以冬季滑雪為核心，營運公司成立於1985年，近年逐步發展成四季山岳度假區。山頂大約1,289米，位置正對白馬三山，可以一口氣望到北阿爾卑斯、白馬村同北信群山。',b:'上到HAKUBA MOUNTAIN HARBOR時，可以特別望白馬岳、杓子岳、白馬鑓ヶ岳。相比純登山，岩岳最大價值係長輩唔需要長時間爬山，都可以用纜車快速去到高位睇完整山景。',u:'https://www.vill.hakuba.nagano.jp/recommendation/summergondra/'},
        {t:'大出公園｜一張「白馬明信片」',a:'大出公園最經典嘅構圖係：前面姬川清流、中間大出吊橋同茅葺屋古民家，後面就係白馬連峰。呢個組合令大出公園成為白馬村最具代表性嘅觀景點之一。',b:'呢度唔係大型主題公園，反而係保留農村、河流同高山同框嘅地方。你哋去到可以行去展望位置慢慢睇，9月底未必係紅葉最盛，但山村氣氛同白馬連峰仍然係重點。',u:'https://www.vill.hakuba.nagano.jp/spots/ooide-park/'}
      ],
      [
        {t:'上高地｜日本近代登山文化嘅代表地',a:'上高地位於中部山岳國立公園，標高約1,500米。19世紀末，英國傳教士Walter Weston喺日本登山，1891年攀登槍岳；佢1896年出版英文遊記，令「日本阿爾卑斯」逐漸廣為海外所知，後來亦協助推動日本近代登山文化。',b:'上高地1928年已被列為名勝及天然紀念物，1934年納入中部山岳國立公園。今日限制私家車直接駛入，正正係為咗保護呢個高山谷地。',u:'https://www.kamikochi.org/basicinfo/historyculture'},
        {t:'大正池｜一場火山爆發造出嘅湖',a:'大正池唔係古老天然湖。1915年燒岳爆發，火山泥流堵塞梓川，短時間內形成咗大正池。早期湖面仲比而家大，甚至曾用船運送建造上高地帝國酒店嘅物資。',b:'如果你哋由大正池開始行，望到燒岳時可以想像：眼前呢個平靜湖面，其實就係活火山活動直接改變河谷地貌嘅結果。',u:'https://www.kamikochi.org/basicinfo/nature'},
        {t:'河童橋｜芥川龍之介都寫過呢度',a:'河童橋係上高地最具代表性地標，木製吊橋橫跨梓川。向上游望係穗高連峰同明神岳，向下游就望到燒岳。1927年芥川龍之介小說《河童》亦借用上高地同河童橋作背景，令呢個名字更加深入人心。',b:'行到橋中央時記得前後兩邊都望：上游係典型「日本阿爾卑斯」畫面，下游就係形成大正池嘅活火山燒岳。',u:'https://www.kamikochi.org/tw/spot/kappa-bridge'}
      ],
      [
        {t:'山中溫泉｜1,300年溫泉史',a:'山中溫泉相傳已有約1,300年歷史。傳說奈良時代高僧行基喺呢度發現溫泉；之後雖然曾因戰亂衰落，但慢慢再發展成加賀代表性溫泉鄉。江戶時代俳聖松尾芭蕉亦非常鍾意山中溫泉，仲寫詩讚賞泉水。',b:'鎮中心「菊の湯」所在地一直係傳統共同浴場核心。附近鶴仙溪、山中漆器同溫泉街，其實係自然、工藝同湯治文化一齊發展出嚟。',u:'https://visitkaga.jp/en/discover-kaga/onsen/yamanaka-onsen'},
        {t:'九谷燒｜五彩背後有近400年故事',a:'九谷燒起源可以追溯到約400年前。江戶初期，大聖寺藩主前田利治喺九谷一帶發現陶石後，引入有田燒技術開窯。早期作品今日稱為「古九谷」，最具代表性係綠、黃、紫、深藍、紅五色構成嘅「五彩」。',b:'古九谷生產不足半世紀就突然停止，原因至今仍有討論；到19世紀先迎來「再興九谷」。所以買九谷燒時，可以留意唔同窯元用色差異：唔係所有九谷都係同一種花紋，而係幾百年來演變出好多流派。',u:'https://visitkaga.jp/en/discover-kaga/crafts/kutani-yaki-porcelain'}
      ]
    ];
    const days=[...document.querySelectorAll('.day')];
    days.forEach((day,i)=>{
      const grid=day.querySelector('.daygrid'); if(!grid||grid.querySelector('.guidecol')||!guides[i]) return;
      const col=document.createElement('div'); col.className='guidecol';
      col.innerHTML='<div class="guidetitle">🎙️ 導遊介紹</div>'+guides[i].map(x=>'<div class="guidecard"><h4>'+x.t+'</h4><p>'+x.a+'</p><p>'+x.b+'</p><div class="listen">👀 到場可以留意：'+x.t.split('｜').pop()+'</div><div class="guide-source">資料：<a href="'+x.u+'" target="_blank" rel="noopener">官方資料</a></div></div>').join('');
      grid.appendChild(col);
    });
    const chips=document.querySelector('.chips'); if(chips&&!chips.textContent.includes('導遊講解')){const s=document.createElement('span');s.className='chip';s.textContent='🎙️ 導遊講解';chips.appendChild(s)}
  })();
  </script>`;

  html = html.replace("</head>", css + "</head>").replace("</body>", script + "</body>");
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(html, { status: response.status, statusText: response.statusText, headers });
};

export const config = { path: ["/", "/index.html"] };
