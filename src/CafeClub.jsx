import React,{useEffect,useState} from 'react';
import {checked,legal} from './xiangqi';

export async function request(route,data){
 const res=await fetch('/api/'+route,data===undefined?{}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
 if(!res.headers.get('Content-Type')?.includes('json'))throw Error('Hãy đóng trang này, mở Mo-demo.cmd trong thư mục LN3d và dùng tab mới được mở tự động.');
 const result=await res.json();if(!res.ok)throw Error(result.error);return result;
}
const glyph={r:{k:'帥',a:'仕',e:'相',h:'傌',r:'俥',c:'炮',p:'兵'},b:{k:'將',a:'士',e:'象',h:'馬',r:'車',c:'砲',p:'卒'}};
const labels={k:'Tướng',a:'Sĩ',e:'Tượng',h:'Mã',r:'Xe',c:'Pháo',p:'Tốt'};
export default function CafeClub({data,refresh,error,setError}){
 const [selected,pick]=useState(null),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false),[text,setText]=useState('');
 const user=data?.user, match=data?.match, game=match?.state, side=match?.r===user?.id?'r':'b';
 useEffect(()=>pick(null),[match?.id,match?.rev]);
 const myTurn=game&&!game.winner&&game.turn===side;
 async function act(route,payload,msg=''){
  if(busy)return false;
  setBusy(true);setError('');setNotice('');
  try{await request(route,payload);await refresh();setNotice(msg);return true;}catch(e){setError(e.message);return false;}finally{setBusy(false);}
 }
 return <div className="club">
  <h2>Cà phê Xanh trực tuyến</h2>
  {error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
  {!user?<form className="club-form" onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget);act('auth',{name:f.get('name'),password:f.get('password'),register:e.nativeEvent.submitter?.value==='new'});}}>
    <label>Tên đăng nhập<input name="name" placeholder="Ví dụ: HuyLocNinh" aria-describedby="login-name-help" autoComplete="username" minLength="3" maxLength="28" required/></label>
    <small id="login-name-help">Dùng biệt danh từ 3 đến 28 ký tự. Nếu lần đầu vào quán, chọn Tạo tài khoản.</small>
    <label>Mật khẩu<input name="password" type="password" placeholder="Ít nhất 8 ký tự" autoComplete="current-password" minLength="8" maxLength="128" required/></label>
    <div className="place-actions"><button className="header-button map-button" disabled={busy}>Đăng nhập</button><button className="header-button" disabled={busy} value="new">Tạo tài khoản</button></div>
  </form>:<>
    <div className="seat-row"><strong>{user.name}</strong><button className="header-button" disabled={busy} onClick={()=>act('logout',{})}>Đăng xuất</button></div>
    <div className="club-columns">
      <div>
        <h3>Người trong quán</h3>
        {data.online.filter(p=>p.id!==user.id).map(p=><div className="seat-row" key={p.id}><span>{p.name}</span><button className="header-button" disabled={busy||p.busy||!!(game&&!game.winner)} onClick={()=>act('invite',{to:p.id},'Đã gửi lời mời.')}>{p.busy?'Đang chơi':'Mời đấu'}</button></div>)}
        {data.invites.map(i=><div key={i.id}><p>{i.name} mời bạn chơi cờ.</p><div className="place-actions"><button className="header-button map-button" disabled={busy} onClick={()=>act('answer',{id:i.id,accept:true})}>Vào bàn</button><button className="header-button" disabled={busy} onClick={()=>act('answer',{id:i.id,accept:false})}>Từ chối</button></div></div>)}
        <h3>Chat trong quán</h3>
        <div className="club-messages" role="log">{data.chat.map(m=><div key={m.id}><b>{m.name}</b> {m.text}</div>)}</div>
        <form className="club-chat" onSubmit={async e=>{e.preventDefault();if(await act('chat',{text}))setText('');}}>
          <input aria-label="Tin nhắn" placeholder="Nhắn trong quán…" value={text} onChange={e=>setText(e.target.value)} required maxLength={240}/>
          <button className="header-button map-button" disabled={busy}>Gửi</button>
        </form>
      </div>
      {game&&<div className="xiangqi">
        <div className="seat-row"><span>Đỏ · {match.red.name}</span><span>Đen · {match.black.name}</span></div>
        <p aria-live="polite">{game.winner?(game.winner==='draw'?'Hòa':(game.winner==='r'?match.red.name:match.black.name)+' thắng')+' · '+game.reason:(myTurn?'Đến lượt bạn':'Lượt đối thủ')+(checked(game.board,game.turn)?' · Chiếu tướng!':'')}</p>
        <div className="xiangqi-board">
          <svg viewBox="0 0 360 400" preserveAspectRatio="none" aria-hidden="true">
            {Array.from({length:10},(_,i)=><path key={'h'+i} d={'M20 '+(20+i*40)+'H340'}/>)}
            {Array.from({length:9},(_,i)=><path key={'v'+i} d={'M'+(20+i*40)+' 20V'+(i===0||i===8?380:180)+' M'+(20+i*40)+' 220V380'}/>)}
            <path d="M140 20L220 100M220 20L140 100M140 300L220 380M220 300L140 380"/>
            <text x="180" y="206" textAnchor="middle">SỞ HÀ · HÁN GIỚI</text>
          </svg>
          {Array.from({length:90},(_,i)=>{
            const j=side==='r'?i:89-i,p=game.board[j],target=myTurn&&selected!==null&&legal(game.board,side,selected,j);
            return <button key={j} className={'chess-point '+(selected===j?'picked ':'')+(target?'target ':'')+(game.last?.includes(j)?'last':'')}
              aria-label={(p?(p[0]==='r'?'Đỏ ':'Đen ')+labels[p[1]]:'Ô trống')+' '+(j%9+1)+','+(Math.floor(j/9)+1)}
              onClick={()=>{if(!myTurn||busy)return;if(p?.[0]===side)pick(selected===j?null:j);else if(target)act('move',{id:match.id,rev:match.rev,from:selected,to:j});}}>
              {p&&<span className={p[0]}>{glyph[p[0]][p[1]]}</span>}
            </button>;
          })}
        </div>
        {game.winner&&game.winner!=='draw'&&<p>Hóa đơn mô phỏng · {game.winner==='r'?match.black.name:match.red.name} trả 20.000 đ tiền cà phê.</p>}
        {!game.winner&&<button className="header-button" disabled={busy} onClick={()=>{if(confirm('Xin thua và nhận hóa đơn mô phỏng?'))act('resign',{id:match.id,rev:match.rev});}}>Xin thua</button>}
      </div>}
    </div>
  </>}
 </div>;
}
