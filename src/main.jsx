import CafeClub,{request} from './CafeClub';
import { createCampusAudio } from './campusAudio';
import { Avatar, characters } from './Avatar';
import React, { Component, useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, AudioLines, Compass, Footprints, Gamepad2, GraduationCap, LocateFixed, Map, MapPin, ScanLine, UsersRound, Volume2, VolumeX, X } from 'lucide-react';
import Scene from './Scene';
import { buildings, cafe, canopyRows, eastFence, eastRoad, hall, sideGate, guard, nearby, parking, places, stage, start } from './campus';
import './style.css';

const controls = ['w','a','s','d','arrowup','arrowleft','arrowdown','arrowright','shift'];
const neutral = () => ({x:0,y:0});
const fallback = <div className="no-webgl">Không thể mở cảnh 3D. Hãy bật tăng tốc đồ họa hoặc thử một trình duyệt hỗ trợ WebGL 2.</div>;

class SceneBoundary extends Component {
  state = { failed:false };
  static getDerivedStateFromError() { return { failed:true }; }
  render() { return this.state.failed ? fallback : this.props.children; }
}

function CampusMap({ position, full = false, onSelect }) {
  return <svg className="campus-map" viewBox="-56 -77 136 132" role="img" aria-label="Sơ đồ khuôn viên, cổng ở phía dưới">
    <defs><pattern id={full?'grid-full':'grid-small'} width="8" height="8" patternUnits="userSpaceOnUse"><path d="M 8 0 L 0 0 0 8" fill="none" stroke="#627971" strokeWidth=".23" opacity=".45"/></pattern></defs>
    <rect x="-56" y="-77" width="136" height="132" rx="5" fill="#243a34"/>
    <rect x="-56" y="-77" width="136" height="132" fill={full?'url(#grid-full)':'url(#grid-small)'}/>
    <rect x="-49" y="-71" width="98" height="117" rx="2" fill="#3b5643" stroke="#678373" strokeWidth=".5"/>
    <path d="M-28-21H28V40H-28Z" fill="#6b6650"/>
    <path d={`M${eastRoad.x}-22V51`} stroke="#74867e" strokeWidth={eastRoad.w} opacity=".52"/>
    {eastFence.map(([a,b])=><line key={a} x1={sideGate.x} x2={sideGate.x} y1={a} y2={b} stroke="#b4ae8a" strokeWidth=".7"/>)}
    <rect x={cafe.x-4.5} y={cafe.z-4} width="8" height="8" rx="1" fill="#7eaa8e"/>
    <rect x={hall.x-hall.w/2} y={hall.z-hall.d/2} width={hall.w} height={hall.d} rx="1" fill="#c6a483"/>
    <path d="M-56 51H56" stroke="#74867e" strokeWidth="3" opacity=".45"/>
    <rect x="-15.5" y="-69" width="39" height="30" rx="2" fill="#9d6b56"/>
    <rect x="-13.5" y="-67" width="35" height="26" rx="1" fill="#537d59" stroke="#a3b189" strokeWidth=".4"/>
    <path d="M4-67V-41" stroke="#a3b189" strokeWidth=".4"/>
    <circle cx="4" cy="-54" r="4" fill="none" stroke="#a3b189" strokeWidth=".4"/>
    {buildings.map(b=><g key={b.id}>
      <rect x={b.x-b.w/2} y={b.z-b.d/2} width={b.w} height={b.d} rx="1" fill="#bc7960" stroke="#f0ad86" strokeWidth=".55"/>
      <text x={b.x} y={b.z+1.6} textAnchor="middle" fontSize="5" fill="#fff6e1">{b.id==='b'?'HIỆU BỘ':b.id.toUpperCase()}</text>
    </g>)}
    {[...canopyRows,...parking,stage,guard].map(o=><rect key={o.x+','+o.z} x={o.x-o.w/2} y={o.z-o.d/2} width={o.w} height={o.d} rx=".8" fill={o===stage?'#c29870':'#7e9a89'}/>)}
    {[-1,1].flatMap(s=>Array.from({length:8},(_,i)=><circle key={s+','+i} cx={s*45} cy={36-i*13} r="2" fill="#789769"/>))}
    <path d="M-49 46H-3M3 46H49" stroke="#b4ae8a" strokeWidth="1"/>
    {full && places.map(place=><g key={place.id} className="map-marker" role="button" tabIndex="0" aria-label={place.name}
      onClick={()=>onSelect(place)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(place);}}}>
      <circle cx={place.x} cy={place.z} r="4.4" fill="#1c332d" stroke="#e4b96e" strokeWidth=".5"/>
      <circle cx={place.x} cy={place.z} r="1.25" fill="#f9cf86"/>
    </g>)}
    <g pointerEvents="none" transform={'translate('+position.x+' '+position.z+') rotate('+(position.yaw*180/Math.PI)+')'}>
      <circle r="4.7" fill="#eaffb2" opacity=".17"/>
      <path d="M0-3.9 2.65 2.8 0 1.5-2.65 2.8Z" fill="#eaffb2" stroke="#20352c" strokeWidth=".42"/>
    </g>
  </svg>;
}

function Joystick({ state }) {
  const pointer=useRef(null);
  const [offset,setOffset]=useState(neutral);
  function move(e) {
    const bounds=e.currentTarget.getBoundingClientRect();
    let x=(e.clientX-bounds.left-bounds.width/2)/32;
    let y=(e.clientY-bounds.top-bounds.height/2)/32;
    const mag=Math.max(1,Math.hypot(x,y));
    x/=mag;y/=mag;
    state.current.stick={x,y};setOffset({x,y});
  }
  function stop(e) {
    if(pointer.current!==e.pointerId)return;
    pointer.current=null;state.current.stick=neutral();setOffset(neutral());
  }
  return <div className="joystick" aria-label="Kéo cần để di chuyển"
    onPointerDown={e=>{if(pointer.current!==null)return;pointer.current=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);move(e);}}
    onPointerMove={e=>{if(pointer.current===e.pointerId)move(e);}} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop}>
    <ArrowUp className="joy-up"/><ArrowDown className="joy-down"/><ArrowLeft className="joy-left"/><ArrowRight className="joy-right"/>
    <span style={{transform:'translate('+offset.x*29+'px,'+offset.y*29+'px)'}}><Footprints size={20}/></span>
  </div>;
}

const cafeMenu=[{name:'Cà phê đen đá',price:15000},{name:'Cà phê sữa đá',price:20000},{name:'Trà tắc',price:15000}];
const vnd=new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'});

function App() {
  const [sound,setSound]=useState(null);
  const [audible,setAudible]=useState(true);
  useEffect(()=>{
    const engine=createCampusAudio();
    engine.mute(false);
    setSound(engine);
    const unlock=()=>engine.unlock();
    window.addEventListener('pointerdown',unlock);
    window.addEventListener('keydown',unlock);
    return ()=>{
      window.removeEventListener('pointerdown',unlock);
      window.removeEventListener('keydown',unlock);
      engine.dispose();
    };
  },[]);
  const [order,setOrder]=useState(null);
  const [mode,setMode]=useState('TPS');
  const [person,setPerson]=useState(characters[0]);
  const [club,setClub]=useState(null);
  const [clubError,setClubError]=useState('');
  const loaded=useRef(null);
  const [candidate,setCandidate]=useState(characters[0]);
  const [angle,setAngle]=useState(-.63);
  const [panel,setPanel]=useState(null);
  const [selected,setSelected]=useState(null);
  const [near,setNear]=useState(null);
  const [position,setPosition]=useState(start);
  const [visited,setVisited]=useState([]);
  const scene=useRef(null), drag=useRef(null), activePanel=useRef(null);
  const state=useRef({...start,pitch:0,keys:new Set(),stick:neutral(),paused:false});

  const showPanel=useCallback(name=>{
    activePanel.current=name;
    state.current.paused=Boolean(name);
    state.current.keys.clear();
    state.current.stick=neutral();
    setPanel(name);
    if(name && document.pointerLockElement)document.exitPointerLock?.();
  },[]);
  const select=useCallback(place=>{
    setSelected(place);
    setVisited(old=>old.includes(place.id)?old:[...old,place.id]);
    setOrder(null);
    showPanel('place');
  },[showPanel]);
  const jump=useCallback(place=>{
    const point=place??start;
    Object.assign(state.current,{x:point.x,z:point.z,yaw:point.yaw??0,pitch:0});
    setPosition({...point,yaw:point.yaw??0});
    showPanel(null);
  },[showPanel]);

  useEffect(()=>{
    const id=setInterval(()=>{
      const {x,z,yaw}=state.current;
      setPosition(last=>last.x===x&&last.z===z&&last.yaw===yaw?last:{x,z,yaw});
    },80);
    return ()=>clearInterval(id);
  },[]);
  useEffect(()=>{
    function down(e){
      const key=e.key.toLowerCase();
      if(key!=='escape' && e.target.closest?.('input,textarea,[contenteditable]'))return;
      if(e.target.closest?.('button,[role=button]') && (key==='enter'||key===' '))return;
      if(controls.includes(key)&&!activePanel.current){e.preventDefault();state.current.keys.add(key);}
      if(e.repeat||e.ctrlKey||e.metaKey||e.altKey)return;
      if(key==='escape')showPanel(null);
      if(key==='m')showPanel(activePanel.current==='map'?null:'map');
      if(key==='v'&&!activePanel.current)setMode(m=>m==='TPS'?'FPS':'TPS');
      if(key==='e'&&!activePanel.current){ const {x,z}=state.current; const place=nearby(x,z); if(place)select(place); }
    }
    function up(e){state.current.keys.delete(e.key.toLowerCase());}
    function clear(){state.current.keys.clear();state.current.stick=neutral();drag.current=null;}
    function look(e){
      if(document.pointerLockElement!==scene.current||state.current.paused)return;
      turn(e.movementX,e.movementY);
    }
    window.addEventListener('keydown',down);window.addEventListener('keyup',up);
    window.addEventListener('blur',clear);document.addEventListener('mousemove',look);
    return ()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',clear);document.removeEventListener('mousemove',look);};
  },[select,showPanel]);

  function turn(dx,dy){
    state.current.yaw+=dx*.005;
    state.current.pitch=Math.max(-.63,Math.min(.53,state.current.pitch-dy*.004));
  }
  function pointerDown(e){
    if(e.button!==0||drag.current||state.current.paused)return;
    drag.current={id:e.pointerId,x:e.clientX,y:e.clientY};
  }
  function pointerMove(e){
    const d=drag.current;
    if(d?.id!==e.pointerId||document.pointerLockElement||state.current.paused)return;
    turn(e.clientX-d.x,e.clientY-d.y);d.x=e.clientX;d.y=e.clientY;
  }
  function pointerEnd(e){if(drag.current?.id===e.pointerId)drag.current=null;}
  function lockMouse(){
    if(!window.matchMedia('(pointer:fine)').matches)return;
    try { scene.current.requestPointerLock?.()?.catch?.(()=>{}); } catch { /* Drag remains available. */ }
  }
  const refreshClub=useCallback(async()=>{
    try{
      const next=await request('state?join='+(panel==='club'?1:0));
      setClub(next);
      if(!next.user){loaded.current=null;return;}
      if(loaded.current!==next.user.id){
        loaded.current=next.user.id;
        const saved=characters.find(c=>c.id===next.user.avatar);
        if(saved)setPerson(saved);
      }
    }catch(e){if(panel==='club')setClubError(e.message);}
  },[panel]);
  useEffect(()=>{
    refreshClub();
    if(panel!=='club')return;
    const timer=setInterval(refreshClub,1600);
    return ()=>clearInterval(timer);
  },[panel,refreshClub]);
  function applyAvatar(){
    setPerson(candidate);setMode('TPS');showPanel(null);
    if(club?.user)request('avatar',{avatar:candidate.id}).catch(e=>setClubError(e.message));
  }
  const zone=near?.name ?? (position.z < -34 ? 'Khu thể thao' : 'Khuôn viên trường');

  return <main className="app">
    <header className="topbar">
      <div className="brand"><div className="crest"><GraduationCap size={24}/></div>
        <div><h1>THPT LỘC NINH</h1><div className="brand-sub">VIRTUAL CAMPUS 3D</div></div>
      </div>
      <div className="header-actions">
        <button className="header-button" aria-label="Âm thanh" title={audible?'Tắt âm thanh':'Bật âm thanh'} aria-pressed={audible}
          onClick={()=>{sound?.mute(audible);sound?.unlock();setAudible(!audible);}}>{audible?<Volume2 size={17}/>:<VolumeX size={17}/>}</button>
        <button className="header-button" onClick={()=>{setCandidate(person);setAngle(-.63);showPanel('characters');}} aria-label="Chọn nhân vật"><UsersRound size={18}/><span>Nhân vật</span></button>
        <span className="prototype"><i/> Mô phỏng</span>
        <button className="header-button" onClick={()=>showPanel('help')} aria-label="Hướng dẫn điều khiển"><Gamepad2 size={18}/><span>Điều khiển</span></button>
        <button className="header-button map-button" onClick={()=>showPanel('map')}><Map size={17}/><span>Bản đồ</span><kbd>M</kbd></button>
      </div>
    </header>

    <section className="experience" aria-label="Khu tham quan 3D">
      <div className="scene" ref={scene} onPointerDown={pointerDown} onPointerMove={pointerMove}
        onPointerUp={pointerEnd} onPointerCancel={pointerEnd} onPointerLeave={pointerEnd} onDoubleClick={lockMouse}>
        <SceneBoundary><Canvas shadows dpr={[1,1.5]} camera={{ fov:58, near:.08, far:220, position:[0,6,40] }} fallback={fallback}>
          <Scene sound={sound} person={person} state={state} mode={mode} clubMatch={club?.match} onNear={setNear} onSelect={select}/>
        </Canvas></SceneBoundary>
      </div>
      <div className="scene-vignette"/>
      <div className="overview">
        <div className="location"><div className="location-icon"><MapPin size={19}/></div><div><small>ĐANG THAM QUAN</small><strong>{zone}</strong></div></div>
        <div className="progress"><Compass size={16}/><span>Đã khám phá</span><b>{visited.length}/{places.length}</b></div>
      </div>
      <aside className="minimap">
        <button className="mini-button" aria-label="Mở bản đồ toàn trường" onClick={()=>showPanel('map')}>
          <div className="mini-heading"><span><Compass size={14}/> SƠ ĐỒ</span><ScanLine size={15}/></div>
          <CampusMap position={position}/>
        </button>
        <div className="mini-caption"><span className="you-dot"/> Vị trí của bạn</div>
      </aside>
      {mode==='FPS'&&!panel&&<div className="reticle" aria-hidden="true"/>}
      <div className="bottom-left">
        <Joystick state={state}/>
        <div className="desktop-hint"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd><span>Di chuyển</span><i/><span>Kéo để xoay</span></div>
      </div>
      {near&&!panel&&<button className="interact" onClick={()=>select(near)}><kbd>E</kbd><span>Khám phá {near.name.toLowerCase()}</span></button>}
      <div className="bottom-right">
        <button className="reset" onClick={()=>jump()} title="Về điểm xuất phát" aria-label="Về điểm xuất phát"><LocateFixed size={19}/></button>
        <div className="mode-switch" aria-label="Góc nhìn">
          {['TPS','FPS'].map(m=><button key={m} aria-pressed={mode===m} className={mode===m?'active':''} onClick={()=>setMode(m)}>{m}</button>)}
        </div>
      </div>
    </section>

    <footer><span><AudioLines size={14}/> THAM QUAN TỰ DO</span><span>Mô phỏng theo ảnh và sơ đồ trường</span></footer>
    {panel&&<div className="overlay" onClick={()=>showPanel(null)}>
      <section className={'dialog '+(panel==='club'?'club-dialog':panel==='map'||panel==='characters'?'wide':'')} role="dialog" aria-modal="true"
        aria-label={panel==='club'?'Cà phê Xanh trực tuyến':panel==='characters'?'Chọn nhân vật':panel==='map'?'Bản đồ toàn trường':panel==='help'?'Hướng dẫn điều khiển':selected?.name}
        onClick={e=>e.stopPropagation()}>
        <button autoFocus className="close" onClick={()=>showPanel(null)} aria-label="Đóng"><X size={20}/></button>
        {panel==='club'&&<CafeClub data={club} refresh={refreshClub} error={clubError} setError={setClubError}/>}
        {panel==='characters'&&<>
          <h2>Chọn nhân vật</h2>
          <div className="character-picker">
            <div className="character-view">
              <SceneBoundary><Canvas frameloop="demand" dpr={[1,1.5]} camera={{position:[0,0,3.18],fov:36}} fallback={fallback}>
                <color attach="background" args={['#29433d']}/>
                <hemisphereLight args={['#fff5e7','#85738d',2.4]}/>
                <directionalLight position={[-3,3,4]} intensity={2.3}/>
                <group position={[0,-.85,0]} rotation={[0,Math.PI+angle,0]}><Avatar person={candidate}/></group>
              </Canvas></SceneBoundary>
              <div className="character-turn">
                <button className="header-button" aria-label="Xoay trái" onClick={()=>setAngle(a=>a-.55)}><ArrowLeft size={16}/></button>
                <button className="header-button" aria-label="Xoay phải" onClick={()=>setAngle(a=>a+.55)}><ArrowRight size={16}/></button>
              </div>
            </div>
            <div className="character-options">
              {characters.map(c=><button className="character-option" key={c.id} aria-pressed={candidate===c} onClick={()=>setCandidate(c)}>
                <strong>{c.name} <small>{c.height.toFixed(2).replace('.',',')} m</small></strong>
                <span>{c.outfit}</span>
              </button>)}
              <button className="header-button map-button" onClick={applyAvatar}>Dùng nhân vật này</button>
            </div>
          </div>
        </>}
        {panel==='map'&&<>
          <div className="dialog-kicker"><Map size={15}/> SƠ ĐỒ KHUÔN VIÊN</div>
          <h2>Bản đồ toàn trường</h2>
          <div className="full-map">
            <CampusMap position={position} full onSelect={select}/>
            <div className="place-list">{places.map(place=><button key={place.id} onClick={()=>select(place)}><MapPin size={15}/>{place.name}{visited.includes(place.id)&&<span aria-label="Đã khám phá">✓</span>}</button>)}</div>
          </div>
        </>}
        {panel==='help'&&<>
          <div className="dialog-kicker"><Gamepad2 size={16}/> THAO TÁC</div><h2>Điều khiển</h2>
          <dl className="guide"><dt>Di chuyển</dt><dd>WASD, phím mũi tên hoặc joystick</dd>
          <dt>Xoay góc nhìn</dt><dd>Kéo trên cảnh 3D. Nhấp đúp trên máy tính để khóa chuột, nhấn Esc để thoát.</dd>
          <dt>Chạy nhanh</dt><dd>Giữ Shift</dd>
          <dt>Đổi góc nhìn</dt><dd>Nhấn V hoặc chọn TPS / FPS</dd>
          <dt>Khám phá điểm</dt><dd>Nhấn E khi tới gần hoặc chạm vào dấu vàng</dd>
          <dt>Mở bản đồ</dt><dd>Nhấn M hoặc chạm sơ đồ nhỏ</dd></dl>
        </>}
        {panel==='place'&&selected&&<>
          <div className="dialog-kicker"><MapPin size={15}/> ĐIỂM THAM QUAN</div>
          <h2>{selected.name}</h2><p>{selected.note}</p>
          {selected.id==='cafe'&&near?.id==='cafe'&&<section className="cafe-menu" aria-label="Menu mô phỏng">
            <button className="header-button map-button" onClick={()=>{setClubError('');showPanel('club');}}>Vào quán trực tuyến · Chat và chơi cờ</button>
            <strong>Gọi món · Mô phỏng</strong>
            {cafeMenu.map(item=><button key={item.name} className="header-button" onClick={()=>setOrder(item)}>{item.name} <span>{vnd.format(item.price)}</span></button>)}
            {order&&<p role="status">Đã gọi {order.name.toLowerCase()} · {vnd.format(order.price)}</p>}
          </section>}
          <div className="place-actions"><button className="header-button" onClick={()=>showPanel('map')}><Map size={16}/> Bản đồ</button>
          <button className="header-button map-button" onClick={()=>jump(selected)}>Đến vị trí <ArrowRight size={16}/></button></div>
        </>}
      </section>
    </div>}
  </main>;
}

createRoot(document.getElementById('root')).render(<App/>);