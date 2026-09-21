export default async (_req: Request, context: { next: () => Promise<Response> }) => {
  const response = await context.next();
  const type = response.headers.get("content-type") || "";
  if (!type.includes("text/html")) return response;

  let html = await response.text();
  if (html.includes("data-opening-hours-injected")) return new Response(html, response);

  const css = [
    '<style data-opening-hours-injected>',
    '.hours-wrap{margin-top:14px;padding-top:14px;border-top:1px solid var(--line)}',
    '.hours-title{font-size:18px;font-weight:900;margin:0 0 10px;display:flex;align-items:center;gap:7px}',
    '.hours-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}',
    '.hours-card{border:1px solid var(--line);border-radius:15px;padding:12px;background:linear-gradient(180deg,#fff,#fbfdff)}',
    '.hours-card h4{margin:0 0 5px;font-size:15px}',
    '.hours-time{font-size:14px;font-weight:900;color:#244f7c;margin:4px 0}',
    '.hours-note{font-size:12px;line-height:1.5;color:#506579;margin-top:5px}',
    '.hours-status{display:inline-block;margin-top:7px;padding:4px 7px;border-radius:999px;background:#edf8f1;color:#287153;font-size:10.5px;font-weight:850}',
    '.hours-status.warn{background:#fff5e5;color:#8b5e1b}',
    '.hours-source{margin-top:7px;font-size:10.5px;color:#7b8b9b}.hours-source a{color:#607e9a;text-decoration:none}.hours-source a:hover{text-decoration:underline}',
    '.hours-foot{margin-top:9px;color:var(--muted);font-size:11px;line-height:1.5}',
    '@media(max-width:900px){.hours-grid{grid-template-columns:1fr}}',
    '</style>'
  ].join('');

  const script = [
    '<script data-opening-hours-injected>',
    '(()=>{',
    'const days=[',
    JSON.stringify([
      [
        {n:'金澤站 鼓門・もてなしドーム',t:'戶外可隨時觀看｜鼓門亮燈：日落～00:00',note:'第一晚抵達後最方便。夜晚影相唔受商場關門影響。',status:'9/26 可去',url:'https://www.kanazawa-kankoukyoukai.or.jp/spot/detail_10050.html'},
        {n:'金沢百番街「あんと」',t:'購物 08:30–20:00｜餐飲 11:00–22:00',note:'個別店舖可能有自己營業時間；你哋第一晚食飯同買手信都夠時間。',status:'9/26 正常營業',url:'https://www.100bangai.co.jp/info/'},
        {n:'金沢フォーラス',t:'物販 10:00–20:00｜餐飲 11:00–22:00',note:'目前官方標示為調整後營業時間；個別店舖可再查。',status:'9/26 可去',url:'https://www.forus.co.jp/kanazawa'}
      ],
      [
        {n:'兼六園',t:'07:00–18:00｜最終入園 17:30',note:'3/1–10/15 使用呢個時段；另有 05:00–06:45 早朝免費入園。全年無休。',status:'9/27 星期日正常開園',url:'https://kenrokuen.or.jp/information/'},
        {n:'千里濱なぎさドライブウェイ',t:'無固定開放鐘數｜按海浪、風勢隨時封閉',note:'官方特別提醒西風及高浪會令車道臨時封閉；出發當朝一定要再查通行狀態。',status:'天氣／海況決定',warn:true,url:'https://www.city.hakui.lg.jp/kankou/kankoushisetsu/3168.html'},
        {n:'雨晴海岸',t:'海岸本身無閘門｜道の駅 雨晴 09:00–17:00',note:'道之驛官方註明營業時間會隨季節變動、最長可到19:00；展望 deck、洗手間等部分區域24小時可用。',status:'9/27 可去',url:'https://michinoeki-amaharashi.jp/'}
      ],
      [
        {n:'黑部峽谷小火車｜宇奈月 ↔ 猫又',t:'9/4–9/30：首班 08:17｜尾班宇奈月出發 14:56',note:'最後一班猫又16:10開、16:56返到宇奈月。你哋可考慮 09:00出發 → 09:44猫又 → 10:09返程 → 10:59宇奈月。',status:'9/28 正常屬部分區間營運期',url:'https://www.kurotetu.co.jp/timetable/'},
        {n:'猫又站停留',t:'約20分鐘',note:'2026年9月30日前係特別折返站，官方設置展望位置及臨時洗手間。',status:'9/28 可以落車短暫停留',url:'https://www.kurotetu.co.jp/spot_jyousya/'}
      ],
      [
        {n:'白馬岩岳 Mountain Resort',t:'08:30–17:00｜Gondola 最後下山 16:50',note:'2026 Green Season 為4/23–11/15；山頂活動受天氣、強風影響，有機會臨時停駛。',status:'9/29 正常季節營業',url:'https://iwatake-mountain-resort.com/green'},
        {n:'5線 South Lift／白馬ヒトトキノモリ',t:'09:00–16:30｜往ヒトトキノモリ最終 16:00',note:'如果你哋去山頂後再落ヒトトキノモリ，記得留意16:00最後前往時段。',status:'9/29 可搭',url:'https://iwatake-mountain-resort.com/hakuba_hitotoki-no_mori'},
        {n:'大出公園',t:'24小時開放｜免費',note:'戶外公園無售票閘門；建議有日光時去，山景同吊橋會最好睇。',status:'9/29 全天可去',url:'https://www.hakuba.com/zh/experiences/park/oide-park/'}
      ],
      [
        {n:'沢渡 → 上高地 Shuttle Bus',t:'2026營運期 4/17–11/15｜最遲沢渡出發 16:20',note:'05:00、05:30屬指定日先有嘅早班；一般班次由官方始發日曆決定。你哋中午前到沢渡基本上唔會受早班限制。',status:'9/30 有營運',url:'https://www.alpico.co.jp/traffic/local/kamikochi/sawando/'},
        {n:'上高地 → 沢渡 Shuttle Bus',t:'最遲上高地出發 17:30',note:'上高地巴士總站售票設施約06:00–17:30；唔好將回程壓到最後一班。',status:'建議16:00前離開核心區',warn:true,url:'https://www.alpico.co.jp/traffic/local/kamikochi/sawando/'},
        {n:'大正池・田代池・河童橋',t:'戶外自然景點無售票閘門',note:'上高地整個旅遊季約4月中至11月中開放；實際遊覽時間應跟巴士／的士交通時段，而唔係留到夜晚。',status:'9/30 可步行遊覽',url:'https://www.kamikochi.org/tw/'}
      ],
      [
        {n:'山中溫泉・菊の湯',t:'06:45–22:00',note:'第2、第4個星期二休息；你哋入住係9/30星期三，所以唔撞定休日。臨時維修除外。',status:'9/30 晚上可浸',url:'https://www.yamanaka-spa.or.jp/highlights/experience'},
        {n:'鶴仙溪・こおろぎ橋・あやとりはし',t:'戶外散步區｜無固定售票時間',note:'溪谷步道約1.3km；建議日照時間行，落雨後石路可能較滑。',status:'9/30傍晚／10/1早上可行',url:'https://www.yamanaka-spa.or.jp/highlights/landmark'},
        {n:'九谷満月',t:'08:00–17:00｜全年無休',note:'如果主要目的係買九谷燒，呢間最方便。陶藝體驗最終受付約15:30。',status:'10/1 星期四正常營業',url:'https://www.mangetsu.co.jp/access'},
        {n:'九谷焼窯跡展示館',t:'09:00–17:00｜最終入館 16:30',note:'星期二休館（公眾假期除外）。10/1係星期四，所以可以去。',status:'10/1 正常開館',url:'https://visitkaga.jp/kutani-kamaato/access.html'},
        {n:'小松機場 Terminal',t:'06:25–22:15',note:'你哋15:20航班，建議12:30–13:00左右已完成還車並到機場。',status:'10/1 正常開館',url:'https://www.komatsuairport.jp/faq/q77.html'}
      ]
    ]),
    '];',
    'const els=[...document.querySelectorAll(".day")];',
    'els.forEach((day,i)=>{',
    ' if(!days[i]||day.querySelector(".hours-wrap")) return;',
    ' const body=day.querySelector(".daybody"); if(!body) return;',
    ' const wrap=document.createElement("div"); wrap.className="hours-wrap";',
    ' wrap.innerHTML="<div class=\"hours-title\">🕒 景點開放／交通時間</div><div class=\"hours-grid\">"+days[i].map(x=>"<div class=\"hours-card\"><h4>"+x.n+"</h4><div class=\"hours-time\">"+x.t+"</div><div class=\"hours-note\">"+x.note+"</div><span class=\"hours-status "+(x.warn?"warn":"")+"\">"+x.status+"</span><div class=\"hours-source\">官方資料：<a href=\""+x.url+"\" target=\"_blank\" rel=\"noopener\">查看最新資訊</a></div></div>").join("")+"</div><div class=\"hours-foot\">※ 已按你 2026/9/26–10/1 嘅實際日期整理。遇到強風、大雨、海浪、維修或臨時交通管制時，戶外景點同交通工具仍可能即日更改；出發前一晚及當朝再睇網站最新狀態。</div>";',
    ' const grid=body.querySelector(".daygrid"); if(grid) grid.insertAdjacentElement("afterend",wrap); else body.prepend(wrap);',
    '});',
    '})();',
    '</script>'
  ].join('');

  html = html.replace("</head>", css + "</head>").replace("</body>", script + "</body>");
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(html, { status: response.status, statusText: response.statusText, headers });
};

export const config = { path: ["/", "/index.html"] };
