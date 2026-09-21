(() => {
  const trip = [
    {day:'Day 1',date:'2026-09-26',place:'金澤',lat:36.5613,lon:136.6562,note:'抵達金澤後以站前散步、晚餐為主。'},
    {day:'Day 2',date:'2026-09-27',place:'雨晴海岸',lat:36.8152,lon:137.0342,note:'海岸能見度好受雲量及降雨影響；亦要留意千里濱封路資訊。'},
    {day:'Day 3',date:'2026-09-28',place:'宇奈月／黑部峽谷',lat:36.8164,lon:137.5848,note:'峽谷天氣可比平地涼，落雨時記得帶薄外套及防水層。'},
    {day:'Day 4',date:'2026-09-29',place:'白馬',lat:36.6982,lon:137.8619,note:'白馬岩岳最受低雲、霧同強風影響；上山前再查纜車運行。'},
    {day:'Day 5',date:'2026-09-30',place:'上高地',lat:36.2490,lon:137.6331,note:'標高約1,500米，早晚明顯較凍；山區天氣變化快。'},
    {day:'Day 6',date:'2026-10-01',place:'山中溫泉／小松',lat:36.2460,lon:136.3710,note:'以九谷燒購物及前往小松機場為主，雨天影響相對較小。'}
  ];
  const hoursWanted = [8,11,14,17,20];
  let lastFetched = 0;

  function injectStyle(){
    if(document.querySelector('style[data-live-weather-style]')) return;
    const style=document.createElement('style');
    style.setAttribute('data-live-weather-style','');
    style.textContent=[
      '.weather-section .head{display:flex;align-items:center;justify-content:space-between;gap:12px}',
      '.weather-live{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--muted);font-weight:700}',
      '.weather-dot{width:9px;height:9px;border-radius:50%;background:#2ba66a;box-shadow:0 0 0 4px rgba(43,166,106,.12)}',
      '.weather-refresh{border:1px solid var(--line);background:#fff;color:var(--ink);border-radius:10px;padding:7px 10px;font-weight:800;cursor:pointer}',
      '.weather-refresh:disabled{opacity:.55;cursor:wait}',
      '.weather-status{display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center;margin-bottom:12px;color:var(--muted);font-size:12px}',
      '.weather-status strong{color:var(--ink)}',
      '.weather-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}',
      '.weather-card{border:1px solid var(--line);border-radius:17px;padding:14px;background:linear-gradient(180deg,#fff,#f8fbff)}',
      '.weather-card-top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}',
      '.weather-card h4{margin:0;font-size:16px}.weather-card .place{display:block;color:var(--muted);font-size:12px;font-weight:700;margin-top:2px}',
      '.weather-icon{font-size:31px;line-height:1}',
      '.weather-desc{font-size:13px;font-weight:850;margin:9px 0 7px}',
      '.weather-metrics{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:10px}',
      '.weather-pill{background:#eef5ff;color:#315e99;border-radius:999px;padding:5px 8px;font-size:11px;font-weight:800}',
      '.weather-hours{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}',
      '.weather-hour{background:#fff;border:1px solid var(--line);border-radius:11px;padding:7px 4px;text-align:center;min-width:0}',
      '.weather-hour b,.weather-hour strong,.weather-hour small{display:block}.weather-hour b{font-size:11px;color:var(--muted)}.weather-hour span{display:block;font-size:19px;margin:2px 0}.weather-hour strong{font-size:12px}.weather-hour small{font-size:9.5px;color:#557086;margin-top:2px;white-space:nowrap}',
      '.weather-note{margin-top:10px;padding:9px 10px;border-radius:11px;background:#fff8e9;color:#6a572b;font-size:11px;line-height:1.45}',
      '.weather-unavailable{padding:16px;border:1px dashed var(--line);border-radius:13px;color:var(--muted);font-size:13px;background:#fff}',
      '.weather-source{margin-top:12px;color:var(--muted);font-size:11px;line-height:1.5}.weather-source a{color:#4d6f91}',
      '@media(max-width:900px){.weather-grid{grid-template-columns:1fr}}',
      '@media(max-width:520px){.weather-section .head{align-items:flex-start}.weather-live{flex-wrap:wrap;justify-content:flex-end}.weather-hours{gap:4px}.weather-hour{padding:6px 2px}}'
    ].join('');
    document.head.appendChild(style);
  }

  function icon(code){
    if(code===0)return '☀️';
    if(code===1||code===2)return '🌤️';
    if(code===3)return '☁️';
    if(code===45||code===48)return '🌫️';
    if(code>=51&&code<=57)return '🌦️';
    if(code>=61&&code<=67)return '🌧️';
    if(code>=71&&code<=77)return '🌨️';
    if(code>=80&&code<=82)return '🌦️';
    if(code>=85&&code<=86)return '🌨️';
    if(code>=95)return '⛈️';
    return '🌥️';
  }

  function desc(code){
    const map={0:'晴朗',1:'大致晴朗',2:'部分多雲',3:'多雲',45:'有霧',48:'霧／霜霧',51:'微雨',53:'毛毛雨',55:'較密毛毛雨',61:'小雨',63:'中雨',65:'大雨',66:'凍雨',67:'較強凍雨',71:'小雪',73:'中雪',75:'大雪',77:'雪粒',80:'短暫驟雨',81:'驟雨',82:'強驟雨',85:'陣雪',86:'強陣雪',95:'雷暴',96:'雷暴伴冰雹',99:'強雷暴伴冰雹'};
    return map[code]||'天氣變化';
  }

  function fnum(v,d){
    const n=Number(v);
    return Number.isFinite(n)?n.toFixed(d||0):'—';
  }

  function jstNow(){
    return new Intl.DateTimeFormat('zh-HK',{timeZone:'Asia/Tokyo',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date());
  }

  function nextUpdateText(){
    const d=new Date(Date.now()+3600000);
    return new Intl.DateTimeFormat('zh-HK',{timeZone:'Asia/Tokyo',hour:'2-digit',minute:'2-digit',hour12:false}).format(d);
  }

  function createSection(){
    injectStyle();
    if(document.getElementById('weather')) return;
    const section=document.createElement('section');
    section.id='weather';
    section.className='card weather-section';
    section.innerHTML='<div class="head"><span>🌦️ 旅程天氣預報</span><div class="weather-live"><span class="weather-dot"></span><span>每60分鐘自動更新</span><button class="weather-refresh" id="weatherRefresh" type="button">↻ 立即更新</button></div></div><div class="body"><div class="weather-status" id="weatherStatus"><strong>正在取得最新預報…</strong></div><div class="weather-grid" id="weatherGrid"></div><div class="weather-source">資料來源：<a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo</a>。網站每次開啟會即時重新取得資料，其後每60分鐘再次查詢最新可用預報。山區（白馬、上高地、黑部）天氣可以短時間內改變，出發當朝仍應再確認纜車、鐵路及巴士運行情況。</div></div>';
    const overview=document.getElementById('overview');
    if(overview) overview.insertAdjacentElement('afterend',section);
    else document.querySelector('.wrap')?.prepend(section);

    const nav=document.querySelector('.navrow');
    if(nav&&!nav.querySelector('a[href="#weather"]')){
      const a=document.createElement('a');
      a.href='#weather';
      a.textContent='🌦️ 天氣';
      const first=nav.querySelector('a[href="#overview"]');
      if(first) first.insertAdjacentElement('afterend',a); else nav.prepend(a);
    }
    const chips=document.querySelector('.chips');
    if(chips&&!chips.textContent.includes('每小時天氣')){
      const s=document.createElement('span');
      s.className='chip';
      s.textContent='🌦️ 每小時天氣';
      chips.appendChild(s);
    }
    const btn=document.getElementById('weatherRefresh');
    if(btn) btn.addEventListener('click',function(){loadWeather(true);});
  }

  function renderOne(item,data){
    const di=data&&data.daily&&data.daily.time?data.daily.time.indexOf(item.date):-1;
    if(di<0){
      return '<article class="weather-card"><div class="weather-card-top"><div><h4>'+item.day+'｜'+item.date.slice(5).replace('-','/')+'</h4><span class="place">'+item.place+'</span></div><span class="weather-icon">🗓️</span></div><div class="weather-unavailable">呢一日暫時未有可用預報，可能尚未進入預報範圍，或者日期已經過去。網站下一次更新會自動再查。</div></article>';
    }
    const code=data.daily.weather_code[di];
    const max=data.daily.temperature_2m_max[di];
    const min=data.daily.temperature_2m_min[di];
    const rain=data.daily.precipitation_probability_max[di];
    const gust=data.daily.wind_gusts_10m_max[di];
    const hourly=hoursWanted.map(function(h){
      const key=item.date+'T'+String(h).padStart(2,'0')+':00';
      const hi=data.hourly.time.indexOf(key);
      if(hi<0)return '';
      const hc=data.hourly.weather_code[hi];
      const t=data.hourly.temperature_2m[hi];
      const p=data.hourly.precipitation_probability[hi];
      return '<div class="weather-hour"><b>'+String(h).padStart(2,'0')+':00</b><span>'+icon(hc)+'</span><strong>'+fnum(t)+'°</strong><small>雨 '+fnum(p)+'%</small></div>';
    }).join('');
    return '<article class="weather-card"><div class="weather-card-top"><div><h4>'+item.day+'｜'+item.date.slice(5).replace('-','/')+'</h4><span class="place">'+item.place+'</span></div><span class="weather-icon">'+icon(code)+'</span></div><div class="weather-desc">'+desc(code)+'</div><div class="weather-metrics"><span class="weather-pill">🌡️ '+fnum(min)+'–'+fnum(max)+'°C</span><span class="weather-pill">☔ 最高降雨 '+fnum(rain)+'%</span><span class="weather-pill">💨 陣風 '+fnum(gust)+' km/h</span></div><div class="weather-hours">'+hourly+'</div><div class="weather-note">💡 '+item.note+'</div></article>';
  }

  async function loadWeather(manual){
    createSection();
    const btn=document.getElementById('weatherRefresh');
    const status=document.getElementById('weatherStatus');
    const grid=document.getElementById('weatherGrid');
    if(btn){btn.disabled=true;btn.textContent='更新中…';}
    if(status)status.innerHTML='<strong>正在取得最新預報…</strong>';
    try{
      const lat=trip.map(function(x){return x.lat;}).join(',');
      const lon=trip.map(function(x){return x.lon;}).join(',');
      const q=new URLSearchParams({
        latitude:lat,
        longitude:lon,
        timezone:'Asia/Tokyo',
        forecast_days:'16',
        daily:'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_gusts_10m_max',
        hourly:'temperature_2m,precipitation_probability,weather_code,wind_speed_10m',
        temperature_unit:'celsius',
        wind_speed_unit:'kmh'
      });
      const r=await fetch('https://api.open-meteo.com/v1/forecast?'+q.toString(),{cache:'no-store'});
      if(!r.ok)throw new Error('HTTP '+r.status);
      const raw=await r.json();
      const data=Array.isArray(raw)?raw:[raw];
      if(grid)grid.innerHTML=trip.map(function(x,i){return renderOne(x,data[i]);}).join('');
      lastFetched=Date.now();
      if(status)status.innerHTML='<strong>最後更新（日本時間）：'+jstNow()+'</strong><span>｜下一次自動更新：約 '+nextUpdateText()+'</span><span>｜'+(manual?'手動更新完成':'已載入最新可用預報')+'</span>';
    }catch(e){
      if(status)status.innerHTML='<strong>暫時未能連接天氣服務。</strong><span>請稍後按「立即更新」重試。</span>';
      if(grid&&!grid.children.length)grid.innerHTML='<div class="weather-unavailable">天氣資料暫時載入失敗；其他行程內容不受影響。</div>';
    }finally{
      if(btn){btn.disabled=false;btn.textContent='↻ 立即更新';}
    }
  }

  function init(){
    createSection();
    loadWeather(false);
    setInterval(function(){loadWeather(false);},60*60*1000);
    document.addEventListener('visibilitychange',function(){
      if(document.visibilityState==='visible' && Date.now()-lastFetched>55*60*1000) loadWeather(false);
    });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();