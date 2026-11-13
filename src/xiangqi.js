export const other=s=>s==='r'?'b':'r';
export function newGame(){const board=Array(90).fill(null);for(const s of ['r','b']){const y=s==='r'?9:0,d=s==='r'?-1:1;[...'rheakaehr'].forEach((p,x)=>board[9*y+x]=s+p);for(const x of [1,7])board[9*(y+2*d)+x]=s+'c';for(const x of [0,2,4,6,8])board[9*(y+3*d)+x]=s+'p';}return {board,turn:'r',winner:null,seen:{[key(board,'r')]:1},quiet:0};}
const key=(b,s)=>b.map(p=>p||'--').join('')+s;
function shape(b,i,j){const p=b[i],q=b[j];if(!p||i===j||p[0]===q?.[0])return false;
const [s,k]=p,x=i%9,y=i/9|0,u=j%9,v=j/9|0,dx=u-x,dy=v-y,a=Math.abs(dx),d=Math.abs(dy),own=y=>s==='r'?y>=5:y<=4, palace=u>=3&&u<=5&&(s==='r'?v>=7:v<=2);
if(k==='a')return palace&&a===1&&d===1;
if(k==='e')return own(v)&&a===2&&d===2&&!b[i+(dy*9+dx)/2];
if(k==='h')return a===2&&d===1&&!b[i+Math.sign(dx)]||a===1&&d===2&&!b[i+9*Math.sign(dy)];
if(k==='p')return !dx&&dy===(s==='r'?-1:1)||!own(y)&&a===1&&!dy;
if(k==='k'&&palace&&a+d===1)return true;
if(dx&&dy)return false;let n=0;const step=dx?Math.sign(dx):9*Math.sign(dy);for(let t=i+step;t!==j;t+=step)if(b[t])n++;
return k==='k'?!dx&&q===other(s)+'k'&&!n:k==='r'?!n:k==='c'&&n===(q?1:0);}
export function checked(b,s){const k=b.indexOf(s+'k');return k<0||b.some((p,i)=>p?.[0]===other(s)&&shape(b,i,k));}
export function legal(b,s,i,j){if(!Number.isInteger(i)||!Number.isInteger(j)||i<0||j<0||i>89||j>89||b[i]?.[0]!==s||b[j]?.[1]==='k'||!shape(b,i,j))return false;const n=b.slice();n[j]=n[i];n[i]=null;return !checked(n,s);}
export function play(g,i,j){if(g.winner||!legal(g.board,g.turn,i,j))return null;const board=g.board.slice(),turn=other(g.turn),quiet=board[j]?0:g.quiet+1;board[j]=board[i];board[i]=null;
const k=key(board,turn),seen={...g.seen,[k]:(g.seen[k]||0)+1};
const has=board.some((p,i)=>p?.[0]===turn&&board.some((_,j)=>legal(board,turn,i,j)));
return {board,turn,quiet,seen,winner:!has?g.turn:seen[k]>=3||quiet>=120?'draw':null,reason:!has?checked(board,turn)?'Chiếu bí':'Hết nước đi':seen[k]>=3?'Lặp thế cờ':quiet>=120?'120 lượt không ăn quân':'',last:[i,j]};}
