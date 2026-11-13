import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {randomBytes,scryptSync,timingSafeEqual,randomUUID} from 'node:crypto';
import {newGame,play,other} from './src/xiangqi.js';
const dir=path.resolve(process.env.LN3D_DATA||'.ln3d-data');fs.mkdirSync(dir,{recursive:true});
const file=path.join(dir,'accounts.json');
const users=new Map(fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):[]);
function save(){fs.writeFileSync(file+'.tmp',JSON.stringify([...users]),{mode:0o600});fs.renameSync(file+'.tmp',file);}
const sessions=new Map(),online=new Map(),invites=new Map(),games=new Map(),rates=new Map(),chat=[];
const pub=u=>({id:u.id,name:u.name,avatar:u.avatar});
const fail=(status,message)=>{throw Object.assign(Error(message),{status});};
const active=id=>[...games.values()].find(g=>!g.state.winner&&[g.r,g.b].includes(id));
const cookie=(value,age)=>'ln3d='+value+'; Path=/; HttpOnly; SameSite=Strict; Max-Age='+age+(process.env.LN3D_SECURE==='1'?'; Secure':'');
function trim(){
 const n=Date.now();for(const [k,t] of online)if(n-t>12000)online.delete(k);
 for(const [k,v] of invites)if(n-v.at>60000)invites.delete(k);
 for(const [k,v] of sessions)if(n>v.until)sessions.delete(k);
 for(const [k,v] of games)if(n-v.at>(v.state.winner?3600000:86400000))games.delete(k);
 for(const [k,v] of rates)if(n-v.at>60000)rates.delete(k);
 while(chat.length&&(chat.length>100||n-chat[0].at>3600000))chat.shift();
}
setInterval(trim,10000).unref();
function rate(k,max){const n=Date.now(),v=rates.get(k)||{at:n,count:0};if(n-v.at>60000){v.at=n;v.count=0;}rates.set(k,v);if(++v.count>max)fail(429,'Vui lòng chờ rồi thử lại.');}
async function api(req,res,url){
 const route=url.pathname.slice(5), now=Date.now();
 const token=req.headers.cookie?.match(/(?:^|; )ln3d=([a-f0-9]{64})(?:;|$)/)?.[1],session=sessions.get(token);
 const u=session?.until>now?users.get(session.id):null;
 if(req.method==='GET'&&route==='state'){
  if(!u)return {user:null};
  trim();if(url.searchParams.get('join')==='1')online.set(u.id,now);
  const g=active(u.id)||[...games.values()].reverse().find(g=>[g.r,g.b].includes(u.id));
  return {user:pub(u),online:[...online.keys()].map(id=>({...pub(users.get(id)),busy:!!active(id)})),chat,invites:[...invites.values()].filter(i=>i.to===u.id),match:g?{...g,state:{...g.state,seen:undefined},red:pub(users.get(g.r)),black:pub(users.get(g.b))}:null};
 }
 if(req.method!=='POST')fail(405,'Thao tác không hợp lệ.');
 const origin=req.headers.origin;
 if(origin&&(process.env.LN3D_ORIGIN?origin!==process.env.LN3D_ORIGIN:new URL(origin).host!==req.headers.host))fail(403,'Nguồn truy cập không hợp lệ.');
 let raw='';for await(const part of req){raw+=part;if(raw.length>4096)fail(413,'Dữ liệu quá dài.');}
 let d;try{d=JSON.parse(raw)||{};}catch{fail(400,'Dữ liệu không hợp lệ.');}
 if(route==='auth'){
  rate('auth:'+req.socket.remoteAddress,12);
  const name=typeof d.name==='string'?d.name.normalize('NFKC').trim():'', id=name.toLowerCase();
  if(name.length<3||name.length>28||!/^[\p{L}\p{N} _.-]+$/u.test(name)||typeof d.password!=='string'||d.password.length<8||d.password.length>128)fail(400,'Tên 3–28 ký tự, mật khẩu 8–128 ký tự.');
  let user=users.get(id);
  if(d.register===true){
   if(user)fail(409,'Tên đã được dùng.');if(users.size>=5000)fail(503,'Đã đạt giới hạn tài khoản.');
   const salt=randomBytes(16).toString('hex');user={id,name,salt,hash:scryptSync(d.password,salt,64).toString('hex'),avatar:null};users.set(id,user);
   try{save();}catch(e){users.delete(id);throw e;}
  }else if(!user||!timingSafeEqual(scryptSync(d.password,user.salt,64),Buffer.from(user.hash,'hex')))fail(401,'Tên hoặc mật khẩu chưa đúng.');
  if(token)sessions.delete(token);const key=randomBytes(32).toString('hex');sessions.set(key,{id,until:now+86400000});
  res.setHeader('Set-Cookie',cookie(key,86400));return {};
 }
 if(!u)fail(401,'Hãy đăng nhập.');
 const id=u.id;
 if(route==='logout'){sessions.delete(token);online.delete(id);res.setHeader('Set-Cookie',cookie('',0));return {};}
 if(route==='avatar'){if(typeof d.avatar!=='string'||!/^[-a-z0-9]{1,48}$/.test(d.avatar))fail(400,'Mẫu không hợp lệ.');u.avatar=d.avatar;save();return {};}
 if(route==='chat'){rate('chat:'+id,12);const text=typeof d.text==='string'?d.text.trim().slice(0,240):'';if(!text)fail(400,'Hãy nhập tin nhắn.');chat.push({id:randomUUID(),name:u.name,text,at:now});trim();return {};}
 if(route==='invite'){
  rate('invite:'+id,6);trim();if(d.to===id||!online.has(d.to)||active(id)||active(d.to))fail(409,'Người chơi chưa sẵn sàng.');
  if([...invites.values()].some(i=>i.from===id&&i.to===d.to))fail(409,'Đã gửi lời mời.');
  const i={id:randomUUID(),from:id,name:u.name,to:d.to,at:now};invites.set(i.id,i);return {};
 }
 if(route==='answer'){
  const i=invites.get(d.id);if(!i||i.to!==id||now-i.at>60000)fail(404,'Lời mời đã hết hạn.');invites.delete(i.id);
  if(d.accept===true){if(active(id)||active(i.from))fail(409,'Một người đang chơi.');const g={id:randomUUID(),r:i.from,b:id,rev:0,state:newGame(),at:now};games.set(g.id,g);
  for(const [k,v] of invites)if([g.r,g.b].includes(v.from)||[g.r,g.b].includes(v.to))invites.delete(k);}return {};
 }
 if(route==='move'||route==='resign'){
  const g=games.get(d.id),side=g?.r===id?'r':g?.b===id?'b':null;
  if(!side||g.state.winner||g.rev!==d.rev)fail(409,'Ván cờ đã thay đổi.');
  if(route==='resign')g.state={...g.state,winner:other(side),reason:'Xin thua'};
  else{if(g.state.turn!==side)fail(409,'Chưa đến lượt bạn.');const next=play(g.state,d.from,d.to);if(!next)fail(400,'Nước đi không hợp lệ.');g.state=next;}
  g.rev++;g.at=now;return {};
 }
 fail(404,'Không tìm thấy.');
}
const root=path.resolve('dist'),types={'.js':'text/javascript','.css':'text/css','.html':'text/html; charset=utf-8','.jpg':'image/jpeg','.wav':'audio/wav'};
http.createServer(async(req,res)=>{try{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname.startsWith('/api/')){res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(await api(req,res,url)));return;}
 const target=path.resolve(root,'.'+(url.pathname==='/'?'/index.html':url.pathname));
 if(!target.startsWith(root+path.sep))fail(404,'Không tìm thấy.');
 const data=await fs.promises.readFile(target);
 res.setHeader('Content-Type',types[path.extname(target)]||'application/octet-stream');res.end(data);
 }catch(e){const status=e.status||(e.code==='ENOENT'?404:500);if(status===500)console.error(e);res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify({error:status===500?'Lỗi máy chủ.':e.message}));}
}).listen(Number(process.env.PORT||4174),process.env.HOST||'127.0.0.1',()=>console.log('LN3d · http://127.0.0.1:'+(process.env.PORT||4174)));
