import { useState, useEffect } from "react";

const E = {
  water: "\uD83D\uDCA7", coffee: "\u2615", meal: "\uD83C\uDF7D", vitamin: "\uD83D\uDC8A", gym: "\uD83C\uDFCB",
  staj: "\uD83D\uDCBC", yangin: "\uD83D\uDD25", aws: "\u2601", dsa: "\uD83E\uDDE0", gcloud: "\u26C5",
  ontime: "\u26A1", completed: "\uD83C\uDFC6", sleep: "\uD83D\uDE34", etkinlik: "\uD83C\uDFA4",
  flame1: "\uD83D\uDD25", star: "\u2728", lehce: "\uD83D\uDDE3", sertifika: "\uD83D\uDCDC",
  ranks: ["\uD83D\uDC23", "\uD83D\uDCBB", "\uD83D\uDE80", "\u26A1", "\uD83C\uDFC6", "\uD83D\uDC51"]
};

const HABITS = [
  { id: "water", emoji: E.water, label: "Su ic", points: 3 },
  { id: "coffee", emoji: E.coffee, label: "Kahve ile basla", points: 2 },
  { id: "meal", emoji: E.meal, label: "Duzgun ogun", points: 3 },
  { id: "vitamin", emoji: E.vitamin, label: "Vitamin al", points: 2 },
  { id: "gym", emoji: E.gym, label: "Gym", points: 5 },
];

const WORK_BLOCKS = [
  { id: "staj", emoji: E.staj, label: "Staj", points: 10, unit: "saat" },
  { id: "yangin", emoji: E.yangin, label: "Yangin Uygulamasi", points: 7, unit: "saat" },
  { id: "aws", emoji: E.aws, label: "AWS", points: 6, unit: "saat" },
  { id: "dsa", emoji: E.dsa, label: "DSA", points: 6, unit: "saat" },
  { id: "gcloud", emoji: E.gcloud, label: "Google Cloud Lab", points: 6, unit: "saat" },
  { id: "lehce", emoji: E.lehce, label: "Dil Ogrenme", points: 6, unit: "saat" },
  { id: "sertifika", emoji: E.sertifika, label: "Sertifika Dersleri", points: 7, unit: "saat" },
];

const BONUS = [
  { id: "ontime", emoji: E.ontime, label: "Zamaninda basladiniz", points: 2 },
  { id: "completed", emoji: E.completed, label: "Istediklerini tamamladin", points: 10 },
  { id: "sleep", emoji: E.sleep, label: "12den once yattin", points: 3 },
  { id: "etkinlik", emoji: E.etkinlik, label: "Etkinlige katildin", points: 8 },
];

const RANKS = [
  { min: 0, max: 600, emoji: E.ranks[0], label: "Baslangic" },
  { min: 601, max: 1100, emoji: E.ranks[1], label: "Junior Dev" },
  { min: 1101, max: 1600, emoji: E.ranks[2], label: "Mid-Level Dev" },
  { min: 1601, max: 2100, emoji: E.ranks[3], label: "Senior Dev" },
  { min: 2101, max: 2600, emoji: E.ranks[4], label: "Tech Lead" },
  { min: 2601, max: Infinity, emoji: E.ranks[5], label: "CEO Modu" },
];

const MONTHLY_GOAL = 2200;

const SEED = {
  "2026-05-20": { habits: { water:true, coffee:true, meal:true, vitamin:true, gym:true }, work: { gcloud:"1.5", dsa:"1", yangin:"1" }, bonus: { ontime:true }, totalPoints: 39 }
};

function getKey(date) {
  if (!date) date = new Date();
  return date.getFullYear() + "-" + String(date.getMonth()+1).padStart(2,"0") + "-" + String(date.getDate()).padStart(2,"0");
}

function calcPoints(data) {
  var p = 0;
  HABITS.forEach(function(h) { if (data.habits && data.habits[h.id]) p += h.points; });
  WORK_BLOCKS.forEach(function(w) { p += (parseFloat((data.work && data.work[w.id]) || 0) || 0) * w.points; });
  BONUS.forEach(function(b) { if (data.bonus && data.bonus[b.id]) p += b.points; });
  return Math.round(p);
}

function getStreak(history) {
  var streak = 0; var today = getKey(); var d = new Date();
  for (var i = 0; i < 365; i++) {
    var key = getKey(d);
    if (history[key] && history[key].totalPoints > 0) streak++;
    else if (key !== today) break;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function getRank(pts) {
  return RANKS.find(function(r) { return pts >= r.min && pts <= r.max; }) || RANKS[0];
}

function loadHistory() {
  try {
    var s = localStorage.getItem("orhan_habits");
    if (s) return Object.assign({}, SEED, JSON.parse(s));
  } catch(e) {}
  return Object.assign({}, SEED);
}

function saveHistory(h) {
  try { localStorage.setItem("orhan_habits", JSON.stringify(h)); } catch(e) {}
}

export default function App() {
  var todayKey = getKey();
  var [history, setHistory] = useState(function() { return loadHistory(); });
  var [saving, setSaving] = useState(false);
  var todayData = history[todayKey] || { habits:{}, work:{}, bonus:{}, totalPoints:0 };

  function update(updated) {
    updated.totalPoints = calcPoints(updated);
    var newH = Object.assign({}, history); newH[todayKey] = updated;
    setHistory(newH); setSaving(true); saveHistory(newH);
    setTimeout(function(){ setSaving(false); }, 600);
  }

  function savePast(key, data) {
    data.totalPoints = calcPoints(data);
    var newH = Object.assign({}, history); newH[key] = data;
    setHistory(newH); saveHistory(newH);
  }

  function toggleHabit(id) {
    var h = Object.assign({}, todayData.habits); h[id] = !h[id];
    update(Object.assign({}, todayData, { habits:h }));
  }
  function setWork(id, val) {
    var w = Object.assign({}, todayData.work); w[id] = val;
    update(Object.assign({}, todayData, { work:w }));
  }
  function toggleBonus(id) {
    var b = Object.assign({}, todayData.bonus); b[id] = !b[id];
    update(Object.assign({}, todayData, { bonus:b }));
  }

  var streak = getStreak(history);
  var flame = streak >= 14 ? E.flame1+E.flame1+E.flame1 : streak >= 7 ? E.flame1+E.flame1 : streak >= 3 ? E.flame1 : E.star;
  var totalPoints = todayData.totalPoints || 0;
  var now = new Date();
  var monthTotal = 0;
  for (var d = 1; d <= 31; d++) {
    var md = new Date(now.getFullYear(), now.getMonth(), d);
    if (md.getMonth() !== now.getMonth()) break;
    monthTotal += (history[getKey(md)] && history[getKey(md)].totalPoints) || 0;
  }
  var week0 = 0, week1 = 0;
  for (var i = 0; i < 7; i++) {
    var d0 = new Date(); d0.setDate(d0.getDate()-i);
    var d1 = new Date(); d1.setDate(d1.getDate()-7-i);
    week0 += (history[getKey(d0)] && history[getKey(d0)].totalPoints) || 0;
    week1 += (history[getKey(d1)] && history[getKey(d1)].totalPoints) || 0;
  }
  var rank = getRank(monthTotal);
  var nextRank = RANKS.find(function(r){ return r.min > monthTotal; });
  var progress = Math.min((monthTotal/MONTHLY_GOAL)*100, 100);
  var todayFmt = new Date().toLocaleDateString("tr-TR", { weekday:"long", day:"numeric", month:"long" });

  return (
    <div style={{ minHeight:"100vh", background:"#0a0a0f", color:"#f0ede8", fontFamily:"monospace", padding:"24px 16px 48px", maxWidth:480, margin:"0 auto" }}>
      <div style={{ marginBottom:24 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
          <div style={{ fontSize:11, letterSpacing:4, color:"#666", textTransform:"uppercase" }}>{todayFmt}</div>
          {saving && <div style={{ fontSize:10, color:"#f59e0b" }}>kaydediliyor...</div>}
        </div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ fontSize:28, fontWeight:700 }}>Orhan<span style={{ color:"#ff4500" }}>.</span></div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:32 }}>{flame}</div>
            <div style={{ fontSize:11, color:"#666", letterSpacing:2 }}>{streak} GUN</div>
          </div>
        </div>
        <div style={{ marginTop:16, background:"#111", borderRadius:12, padding:"16px 20px", border:"1px solid #1e1e2e", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:11, color:"#555", letterSpacing:3, textTransform:"uppercase" }}>Bugun</div>
            <div style={{ fontSize:36, fontWeight:700, color:"#ff4500" }}>{totalPoints}</div>
            <div style={{ fontSize:11, color:"#555" }}>puan</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:11, color:"#555", letterSpacing:3, textTransform:"uppercase" }}>Bu Hafta</div>
            <div style={{ fontSize:24, fontWeight:600 }}>{week0}</div>
            <div style={{ fontSize:11, color:week0>=week1?"#22c55e":"#ef4444" }}>{week1>0?(week0>=week1?"\u25b2 ":"\u25bc ")+"gecen: "+week1:"Ilk hafta!"}</div>
          </div>
        </div>
        <div style={{ marginTop:10, background:"#111", borderRadius:12, padding:"14px 20px", border:"1px solid #1e1e2e" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <div>
              <div style={{ fontSize:11, color:"#555", letterSpacing:3, textTransform:"uppercase", marginBottom:2 }}>Bu Ay</div>
              <div style={{ fontSize:20, fontWeight:700 }}>{rank.emoji} {rank.label}</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:11, color:"#555" }}>hedef</div>
              <div style={{ fontSize:18, fontWeight:700, color:"#ff4500" }}>{monthTotal} <span style={{ color:"#333", fontSize:13 }}>/ {MONTHLY_GOAL}</span></div>
              {nextRank && <div style={{ fontSize:10, color:"#555" }}>{nextRank.emoji} {nextRank.label}: {nextRank.min}</div>}
            </div>
          </div>
          <div style={{ background:"#1a1a2e", borderRadius:6, height:8, overflow:"hidden" }}>
            <div style={{ width:progress+"%", height:"100%", borderRadius:6, background:progress>=100?"#22c55e":progress>=70?"#ff4500":progress>=40?"#f59e0b":"#ef4444" }} />
          </div>
          <div style={{ fontSize:10, color:"#444", marginTop:4, textAlign:"right" }}>{Math.round(progress)}% tamamlandi</div>
        </div>
      </div>

      <Sec title="GUNLUK ALISKANLIKLAR">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {HABITS.map(function(h) {
            var done = !!(todayData.habits && todayData.habits[h.id]);
            return (
              <button key={h.id} onClick={function(){ toggleHabit(h.id); }} style={{ background:done?"#ff4500":"#111", border:done?"1px solid #ff4500":"1px solid #1e1e2e", borderRadius:12, padding:"14px 12px", cursor:"pointer", textAlign:"left", transition:"all 0.15s" }}>
                <div style={{ fontSize:22, marginBottom:4 }}>{h.emoji}</div>
                <div style={{ fontSize:12, color:done?"#fff":"#888", fontWeight:done?600:400 }}>{h.label}</div>
                <div style={{ fontSize:10, color:done?"#ffcdb0":"#444", marginTop:2 }}>+{h.points} puan</div>
              </button>
            );
          })}
        </div>
      </Sec>

      <Sec title="CALISMA BLOKLARI">
        {WORK_BLOCKS.map(function(w) {
          var val = (todayData.work && todayData.work[w.id]) || "";
          var earned = Math.round((parseFloat(val)||0)*w.points);
          return (
            <div key={w.id} style={{ background:"#111", border:"1px solid #1e1e2e", borderRadius:12, padding:"14px 16px", marginBottom:10, display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ fontSize:24 }}>{w.emoji}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600, marginBottom:2 }}>{w.label}</div>
                <div style={{ fontSize:10, color:"#555" }}>{w.points} puan/{w.unit}</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <input type="number" min="0" max="12" step="0.5" value={val} onChange={function(e){ setWork(w.id,e.target.value); }} placeholder="0"
                  style={{ width:52, background:"#0a0a0f", border:"1px solid #2e2e3e", borderRadius:8, color:"#f0ede8", fontSize:16, fontFamily:"inherit", padding:"6px 8px", textAlign:"center" }} />
                <div style={{ fontSize:11, color:earned>0?"#ff4500":"#333", minWidth:40, textAlign:"right" }}>{earned>0?"+"+earned:""}</div>
              </div>
            </div>
          );
        })}
      </Sec>

      <Sec title="BONUS">
        {BONUS.map(function(b) {
          var done = !!(todayData.bonus && todayData.bonus[b.id]);
          return (
            <button key={b.id} onClick={function(){ toggleBonus(b.id); }} style={{ width:"100%", background:"#111", border:done?"1px solid #ff4500":"1px solid #1e1e2e", borderRadius:12, padding:"14px 16px", marginBottom:8, cursor:"pointer", display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ fontSize:20 }}>{b.emoji}</div>
              <div style={{ flex:1, textAlign:"left" }}><div style={{ fontSize:13, color:done?"#f0ede8":"#888", fontWeight:done?600:400 }}>{b.label}</div></div>
              <div style={{ fontSize:12, color:done?"#ff4500":"#333" }}>+{b.points}</div>
              <div style={{ width:20, height:20, borderRadius:6, background:done?"#ff4500":"transparent", border:done?"none":"1px solid #333", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:"#fff" }}>{done?"v":""}</div>
            </button>
          );
        })}
      </Sec>

      <MonthView history={history} todayKey={todayKey} onSaveDay={savePast} />
    </div>
  );
}

function getMonthTotal(history, year, month) {
  var total=0, days=new Date(year,month+1,0).getDate();
  for(var d=1;d<=days;d++) total+=((history[getKey(new Date(year,month,d))]||{}).totalPoints)||0;
  return total;
}

function MonthView(props) {
  var history=props.history, todayKey=props.todayKey, onSaveDay=props.onSaveDay;
  var [selectedDay,setSelectedDay] = useState(null);
  var [editing,setEditing] = useState(false);
  var [editData,setEditData] = useState(null);
  var [viewOffset,setViewOffset] = useState(0);
  var now=new Date();
  var targetDate=new Date(now.getFullYear(),now.getMonth()+viewOffset,1);
  var year=targetDate.getFullYear(), month=targetDate.getMonth();
  var monthName=targetDate.toLocaleDateString("tr-TR",{month:"long",year:"numeric"});
  var offset=(new Date(year,month,1).getDay()+6)%7;
  var daysInMonth=new Date(year,month+1,0).getDate();
  var isCurrentMonth=viewOffset===0;
  var prevDate=new Date(year,month-1,1);
  var prevTotal=getMonthTotal(history,prevDate.getFullYear(),prevDate.getMonth());
  var currTotal=getMonthTotal(history,year,month);
  var diff=currTotal-prevTotal;

  var listDays=[];
  for(var i=0;i<daysInMonth;i++){
    var d=new Date(year,month,i+1), key=getKey(d), pts=(history[key]&&history[key].totalPoints)||0;
    if(pts>0) listDays.push({day:i+1,key:key,pts:pts});
  }
  listDays.reverse();
  var totalMonth=listDays.reduce(function(s,d){return s+d.pts;},0);

  function openEdit(key){
    setSelectedDay(key); setEditing(true);
    setEditData(history[key]?JSON.parse(JSON.stringify(history[key])):{habits:{},work:{},bonus:{},totalPoints:0});
  }
  function saveEdit(){ onSaveDay(selectedDay,editData); setEditing(false); }
  function teh(id){ var h=Object.assign({},editData.habits); h[id]=!h[id]; setEditData(Object.assign({},editData,{habits:h})); }
  function sew(id,val){ var w=Object.assign({},editData.work); w[id]=val; setEditData(Object.assign({},editData,{work:w})); }
  function teb(id){ var b=Object.assign({},editData.bonus); b[id]=!b[id]; setEditData(Object.assign({},editData,{bonus:b})); }

  var cells=[];
  for(var ei=0;ei<offset;ei++) cells.push(<div key={"e"+ei}/>);
  for(var di=0;di<daysInMonth;di++){
    (function(day){
      var d=new Date(year,month,day), key=getKey(d), pts=(history[key]&&history[key].totalPoints)||0;
      var isToday=key===todayKey&&isCurrentMonth, isFuture=isCurrentMonth&&d>now&&key!==todayKey, isSel=selectedDay===key;
      cells.push(
        <div key={key} onClick={function(){if(!isFuture)openEdit(key);}} style={{aspectRatio:"1",borderRadius:8,background:pts>0?"rgba(255,69,0,"+Math.min(0.2+pts/100,1)+")":isFuture?"#0d0d15":"#111",border:isToday?"2px solid #ff4500":isSel?"1px solid #ff6a00":"1px solid #1a1a2e",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:isFuture?"default":"pointer"}}>
          <div style={{fontSize:10,color:isToday?"#ff4500":pts>0?"#fff":"#444",fontWeight:isToday?700:400}}>{day}</div>
          {pts>0&&<div style={{fontSize:7,color:"#ffcdb0"}}>{pts}</div>}
        </div>
      );
    })(di+1);
  }

  return (
    <div style={{marginBottom:28}}>
      <div style={{fontSize:10,letterSpacing:4,color:"#444",textTransform:"uppercase",marginBottom:12,paddingBottom:8,borderBottom:"1px solid #1a1a2e",display:"flex",justifyContent:"space-between"}}>
        <span>AY TAKVIMI</span><span style={{color:"#ff4500"}}>{currTotal} puan</span>
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <button onClick={function(){setViewOffset(function(v){return v-1;});setSelectedDay(null);}} style={{background:"#1a1a2a",border:"1px solid #333",borderRadius:8,padding:"4px 12px",cursor:"pointer",color:"#f0ede8",fontSize:18,lineHeight:1}}>{"<"}</button>
        <div style={{fontSize:13,color:"#888",textTransform:"capitalize"}}>{monthName}</div>
        <button onClick={function(){if(viewOffset<0){setViewOffset(function(v){return v+1;});setSelectedDay(null);}}} style={{background:"#1a1a2a",border:"1px solid #333",borderRadius:8,padding:"4px 12px",cursor:"pointer",color:viewOffset<0?"#f0ede8":"#333",fontSize:18,lineHeight:1}}>{">"}</button>
      </div>
      <div style={{background:"#111",borderRadius:10,padding:"10px 14px",marginBottom:12,border:"1px solid #1e1e2e",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:9,color:"#555",letterSpacing:2,marginBottom:2}}>BU AY</div>
          <div style={{fontSize:20,fontWeight:700,color:"#ff4500"}}>{currTotal}</div>
        </div>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:9,color:"#555",letterSpacing:2,marginBottom:2}}>FARK</div>
          <div style={{fontSize:20,fontWeight:700,color:diff>=0?"#22c55e":"#ef4444"}}>{diff>=0?"+":""}{diff}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:9,color:"#555",letterSpacing:2,marginBottom:2}}>GECEN AY</div>
          <div style={{fontSize:20,fontWeight:700,color:"#888"}}>{prevTotal}</div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:4}}>
        {["Pt","Sa","Ca","Pe","Cu","Ct","Pz"].map(function(d){return <div key={d} style={{fontSize:9,color:"#444",textAlign:"center"}}>{d}</div>;})}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>{cells}</div>

      {selectedDay&&editing&&editData&&(
        <div style={{marginTop:12,background:"#111",borderRadius:12,padding:"16px",border:"1px solid #2e1e0e"}}>
          <div style={{fontSize:11,color:"#ff4500",marginBottom:12}}>{new Date(selectedDay+"T12:00:00").toLocaleDateString("tr-TR",{weekday:"long",day:"numeric",month:"long"}).toUpperCase()}</div>
          <div style={{fontSize:10,color:"#555",marginBottom:8}}>ALISKANLIKLAR</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
            {HABITS.map(function(h){var done=!!(editData.habits&&editData.habits[h.id]);return <button key={h.id} onClick={function(){teh(h.id);}} style={{background:done?"#ff4500":"#1a1a2a",border:done?"1px solid #ff4500":"1px solid #333",borderRadius:8,padding:"6px 10px",cursor:"pointer",color:done?"#fff":"#888",fontSize:11}}>{h.emoji} {h.label}</button>;})}
          </div>
          <div style={{fontSize:10,color:"#555",marginBottom:8}}>CALISMA (SAAT)</div>
          {WORK_BLOCKS.map(function(w){return(
            <div key={w.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <span style={{fontSize:16}}>{w.emoji}</span><span style={{fontSize:12,color:"#888",flex:1}}>{w.label}</span>
              <input type="number" min="0" max="12" step="0.5" value={(editData.work&&editData.work[w.id])||""} onChange={function(e){sew(w.id,e.target.value);}} placeholder="0" style={{width:50,background:"#0a0a0f",border:"1px solid #2e2e3e",borderRadius:6,color:"#f0ede8",fontSize:14,fontFamily:"inherit",padding:"4px 6px",textAlign:"center"}}/>
            </div>
          );})}
          <div style={{fontSize:10,color:"#555",marginBottom:8,marginTop:4}}>BONUS</div>
          {BONUS.map(function(b){var done=!!(editData.bonus&&editData.bonus[b.id]);return <button key={b.id} onClick={function(){teb(b.id);}} style={{display:"block",width:"100%",background:done?"#1a0e00":"#1a1a2a",border:done?"1px solid #ff4500":"1px solid #333",borderRadius:8,padding:"8px 12px",cursor:"pointer",color:done?"#ff4500":"#888",fontSize:11,textAlign:"left",marginBottom:6}}>{b.emoji} {b.label} +{b.points}</button>;})}
          <div style={{display:"flex",gap:8,marginTop:12}}>
            <button onClick={saveEdit} style={{flex:1,background:"#ff4500",border:"none",borderRadius:10,padding:"12px",cursor:"pointer",color:"#fff",fontSize:13,fontWeight:700}}>Kaydet - {calcPoints(editData)} puan</button>
            <button onClick={function(){setEditing(false);}} style={{background:"#1a1a2a",border:"1px solid #333",borderRadius:10,padding:"12px 16px",cursor:"pointer",color:"#888",fontSize:13}}>Iptal</button>
          </div>
        </div>
      )}

      {listDays.length>0&&(
        <div style={{marginTop:16}}>
          <div style={{fontSize:10,letterSpacing:4,color:"#444",textTransform:"uppercase",marginBottom:10}}>GUN LISTESI</div>
          {listDays.map(function(item){return(
            <div key={item.key} onClick={function(){openEdit(item.key);}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",marginBottom:6,background:selectedDay===item.key?"#1a0e00":"#111",border:selectedDay===item.key?"1px solid #ff4500":"1px solid #1e1e2e",borderRadius:10,cursor:"pointer"}}>
              <div style={{fontSize:12,color:"#888"}}>{new Date(item.key+"T12:00:00").toLocaleDateString("tr-TR",{weekday:"short",day:"numeric",month:"short"})}</div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:Math.min(item.pts*1.2,80),height:4,borderRadius:2,background:"rgba(255,69,0,"+Math.min(0.3+item.pts/100,1)+")"}}/>
                <div style={{fontSize:13,fontWeight:700,color:"#ff4500",minWidth:30,textAlign:"right"}}>{item.pts}</div>
              </div>
            </div>
          );})}
        </div>
      )}
    </div>
  );
}

function Sec(props) {
  return (
    <div style={{marginBottom:28}}>
      <div style={{fontSize:10,letterSpacing:4,color:"#444",textTransform:"uppercase",marginBottom:12,paddingBottom:8,borderBottom:"1px solid #1a1a2e"}}>{props.title}</div>
      {props.children}
    </div>
  );
}
