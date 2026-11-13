import schoolCrest from './assets/school-crest.jpg';
import { Avatar, characters } from './Avatar';
import React, { useMemo, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as T from 'three';
import { blocked, buildings, cafe, cafeSeats, canopyRows, eastFence, eastRoad, hall, sideGate, flagBase, frontPavement, sideStreetHeight, groundHeight, guard, nearby, palms, parking, places, stage } from './campus';

function Box({ at, size, color, rotation, cast = true }) {
  return <mesh position={at} rotation={rotation} castShadow={cast} receiveShadow>
    <boxGeometry args={size}/><meshStandardMaterial color={color} roughness={.86}/>
  </mesh>;
}

function Roof({ w, d, height }) {
  const slope = w > d ? d : w;
  const angle = Math.atan2(1.9, slope / 2);
  const length = Math.hypot(slope / 2, 1.9);
  return <group position={[0, height, 0]} rotation={[0, w > d ? 0 : Math.PI / 2, 0]}>
    {[-1, 1].map(s => <Box key={s} at={[0, .88, s * slope / 4]} rotation={[s * angle, 0, 0]} size={[Math.max(w,d)+.9, .23, length+.7]} color={s === 1 ? '#bd6047' : '#a94735'}/>)}
    <Box at={[0, 1.86, 0]} size={[Math.max(w,d)+1, .21, .35]} color="#dc805e"/>
  </group>;
}

function WindowRow({ count, side }) {
  const parts = [
    { offset: 0, y: 1.84, z: .045, size: [2.36,1.57,.12], color: '#f7e7c9' },
    { offset: 0, y: 1.84, z: .12, size: [2.13,1.32,.07], color: '#345e60', highlight: '#6a9592' },
    { offset: 0, y: 1.84, z: .17, size: [.08,1.32,.05], color: '#bbd0c0' },
    { offset: 1.65, y: 1.65, z: .13, size: [.19,2.94,.26], color: '#efd3ad' },
  ];
  return parts.map(part => <instancedMesh key={part.z} args={[undefined,undefined,count]} receiveShadow ref={mesh => {
    if (!mesh) return;
    const matrix = new T.Matrix4();
    const color = new T.Color();
    for (let i=0; i<count; i++) {
      matrix.makeTranslation((i-(count-1)/2)*3.45+part.offset,part.y,side*part.z);
      mesh.setMatrixAt(i,matrix);
      mesh.setColorAt(i,color.set(part.highlight && i%4===0 ? part.highlight : part.color));
    }
    mesh.instanceMatrix.needsUpdate=true;
    mesh.instanceColor.needsUpdate=true;
    mesh.computeBoundingSphere();
  }}>
    <boxGeometry args={part.size}/><meshStandardMaterial roughness={.86}/>
  </instancedMesh>);
}

function School({ data }) {
  const { x, z, w, d, floors } = data;
  const longX = w > d;
  const span = Math.max(w,d), depth = Math.min(w,d), h = floors * 3.15;
  const count = Math.floor(span / 3.45);
  return <group position={[x,0,z]} rotation={[0,longX ? 0 : Math.PI/2,0]}>
    <Box at={[0,h/2,0]} size={[span,h,depth]} color="#e7c398"/>
    <Roof w={span} d={depth} height={h}/>
    {Array.from({length:floors}, (_,f) => <group key={f} position={[0,f*3.15,0]}>
      <Box at={[0,.14,0]} size={[span+.45,.28,depth+.6]} color="#f3dec0"/>
      {[-1,1].map(s => <group key={s}>
        <Box at={[0,.92,s*(depth/2+.105)]} size={[span-.15,.16,.2]} color="#ad755b" cast={false}/>
        <group position={[0,0,s*depth/2]}>
          <WindowRow count={count} side={s}/>
        </group>
      </group>)}
    </group>)}
  </group>;
}

const trees = [
  ...Array.from({length:9},(_,i)=>[-46,37-i*11]),
  ...Array.from({length:9},(_,i)=>[46,37-i*11]),
  ...[-39,-29,-18,18,29,39].map(x=>[x,40]),
  [-21,23],[21,23],[-20,-12],[20,-12],[-16,1],[20,2],[-23,-40],[26,-42],[-30,-60],[34,-58]
];
const leaves = ['#5c884c','#759847','#426c40','#678f52'];
function Trees() {
  return trees.map(([x,z],i) => {
    const size = 1 + (i%5)*.12;
    return <group key={i} position={[x,0,z]} scale={size}>
      <mesh position={[0,1.2,0]} castShadow><cylinderGeometry args={[.14,.24,2.4,7]}/><meshStandardMaterial color="#785342"/></mesh>
      {[[0,3,0,1.85],[-.85,2.68,.37,1.23],[.82,3.25,-.39,1.25]].map(([a,b,c,r],j) =>
        <mesh key={j} position={[a,b,c]} castShadow receiveShadow><icosahedronGeometry args={[r,1]}/><meshStandardMaterial color={leaves[(i+j)%4]} flatShading/></mesh>)}
    </group>;
  });
}

const blue = '#285987';

function Sign({ text, at, width, height, back = false, turn = 0, theme = 'blue' }) {
  const texture = useMemo(() => {
    const canvas=document.createElement('canvas');
    canvas.height=256;
    canvas.width=Math.min(3072, Math.round(256*width/height));
    const ctx=canvas.getContext('2d');
    const lines=Array.isArray(text)?text:[text];
    const stone=theme==='stone', banner=theme==='banner';
    const gradient=ctx.createLinearGradient(0,0,canvas.width,canvas.height);
    gradient.addColorStop(0,theme==='direction'?'#0638b6':banner?'#1267ad':'#103b73');
    gradient.addColorStop(1,theme==='direction'?'#062f9f':banner?'#b75c88':'#214c7d');
    if(!stone){
      ctx.fillStyle=gradient;ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.strokeStyle=banner?'#e9d7ef':'#e0bd72';ctx.lineWidth=3;ctx.strokeRect(9,9,canvas.width-18,canvas.height-18);
    }
    ctx.textAlign='center';ctx.textBaseline='middle';
    const size=stone?50:Math.min(119,174/lines.length);
    ctx.font=stone?'italic bold 50px Georgia':'bold '+size+'px Arial';
    const row=stone?51:size*1.22;
    lines.forEach((line,i)=>{
      const y=133+(i-(lines.length-1)/2)*row;
      if(stone){ctx.strokeStyle='#ddd1b2';ctx.lineWidth=4;ctx.strokeText(line,canvas.width/2,y,canvas.width-15);}
      ctx.fillStyle=stone?'#823629':theme==='direction'?'#ffffff':banner?'#fff7f8':'#ffe39a';
      ctx.fillText(line,canvas.width/2,y,canvas.width-45);
    });
    const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;
    return map;
  },[text,width,height,theme]);
  return <mesh position={at} rotation={[0,back?Math.PI:turn,0]}>
    <planeGeometry args={[width,height]}/><meshBasicMaterial map={texture} transparent={theme==='stone'} depthWrite={theme!=='stone'} toneMapped={false}/>
  </mesh>;
}

function GateRoof() {
  const geometry = useMemo(()=>{
    const roof = new T.BufferGeometry();
    const vertices=[], uvs=[];
    const add=(points,coords)=>{
      for(const i of points.length===4?[0,1,2,0,2,3]:[0,1,2]){
        vertices.push(...points[i]);uvs.push(...coords[i]);
      }
    };
    const a=[-4.65,4.77,1.42], b=[4.65,4.77,1.42], c=[4.65,4.77,-1.42], d=[-4.65,4.77,-1.42];
    const l=[-3.55,5.46,0], r=[3.55,5.46,0];
    add([a,b,r,l],[[0,0],[1,0],[.88,1],[.12,1]]);
    add([c,d,l,r],[[0,0],[1,0],[.88,1],[.12,1]]);
    add([b,c,r],[[0,0],[.31,0],[.155,1]]);
    add([d,a,l],[[0,0],[.31,0],[.155,1]]);
    roof.setAttribute('position',new T.Float32BufferAttribute(vertices,3));
    roof.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));
    roof.computeVertexNormals();
    return roof;
  },[]);
  const tile = useMemo(()=>{
    const canvas=document.createElement('canvas');
    canvas.width=1024; canvas.height=256;
    const ctx=canvas.getContext('2d');
    const tones=['#a26d51','#865c43','#9a6c4d','#90614a','#a77e59','#6b5040','#ad8263'];
    ctx.fillStyle='#745040';ctx.fillRect(0,0,1024,256);
    for(let row=0;row<11;row++)for(let col=-1;col<50;col++){
      const x=col*22+(row%2)*9,y=row*23.3;
      ctx.fillStyle=tones[(col*31+row*37+row*col+140)%tones.length];
      ctx.fillRect(x,y,21,21);
      ctx.fillStyle='#f6cc9f56';ctx.fillRect(x+4,y+1,3,19);
      ctx.fillStyle='#30231e9a';ctx.fillRect(x+17,y,3,21);
      ctx.fillRect(x,y+18,21,3);
    }
    const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=8;
    return texture;
  },[]);
  return <>
    <Box at={[0,4.70,0]} size={[9.12,.17,2.64]} color="#bda989"/>
    <Box at={[0,4.57,0]} size={[8.85,.11,2.42]} color="#e5cfad"/>
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial map={tile} side={T.DoubleSide} roughness={.96}/>
    </mesh>
    <Box at={[0,5.46,0]} size={[7.16,.095,.13]} color="#80563f"/>
  </>;
}

function Ironwork({ width, at, rotation, dense = false }) {
  const count=Math.round(width/(dense?.15:.23));
  const steel='#3288ae', panel=dense?.19:.41;
  return <group position={at} rotation={rotation}>
    <Box at={[0,panel/2,0]} size={[width,panel,.085]} color={steel}/>
    {[.07,1.65].map(y=><Box key={y} at={[0,y,0]} size={[width,.065,.09]} color={steel}/>)}
    {[-1,1].map(side=><Box key={side} at={[side*(width/2-.035),.86,0]} size={[.075,1.72,.09]} color={steel}/>)}
    {Array.from({length:count},(_,i)=><Box key={i} at={[(i+.5)*width/count-width/2,(1.67+panel)/2,0]} size={[.034,1.67-panel,.04]} color={steel} cast={false}/>)}
    {!dense&&Array.from({length:5},(_,i)=><Box key={i} at={[(i-2)*width/5,panel/2,.046]} size={[width/6,.25,.025]} color="#2f5875" cast={false}/>)}
    {dense&&[.54,.91,1.24].map(y=><Box key={y} at={[0,y,0]} size={[width,.038,.055]} color={steel} cast={false}/>)}
  </group>;
}

function GateWindow({ at, turn = 0, width = 1.44, height = 1.24, door = false }) {
  return <group position={at} rotation={[0,turn,0]}>
    <Box at={[0,0,0]} size={[width,height,.075]} color="#536267"/>
    <Box at={[0,door?.20:0,.043]} size={[width-.12,door?height-.49:height-.12,.018]} color="#323b3d"/>
    {[-.44,-.22,0,.22,.44].map(x=><Box key={x} at={[x*width,0,.058]} size={[.034,height,.028]} color="#8a9290" cast={false}/>)}
    {[-.44,-.22,0,.22,.44].map(y=><Box key={y} at={[0,y*height,.06]} size={[width,.035,.026]} color="#8a9290" cast={false}/>)}
    {door&&<Box at={[0,-height/2+.15,.073]} size={[width-.08,.31,.03]} color="#647c86"/>}
  </group>;
}

function RestoredBanner({ at }) {
  const crest=useLoader(T.TextureLoader,schoolCrest);
  const map=useMemo(()=>{
    const canvas=document.createElement('canvas');
    canvas.width=1536;canvas.height=348;
    const ctx=canvas.getContext('2d');
    const bg=ctx.createLinearGradient(0,225,1536,70);
    bg.addColorStop(0,'#0676bd');bg.addColorStop(.48,'#32aed8');bg.addColorStop(.76,'#c984d1');bg.addColorStop(1,'#f3a2c7');
    ctx.fillStyle=bg;ctx.fillRect(0,0,1536,348);
    ctx.strokeStyle='#ffffff39';ctx.lineWidth=3;
    for(let i=0;i<9;i++){
      const x=245+i*124,y=273+i%2*24;
      ctx.save();ctx.translate(x,y);ctx.rotate(i%2?.32:-.34);
      ctx.strokeRect(-18,-13,36,26);ctx.beginPath();ctx.moveTo(-12,0);ctx.lineTo(12,0);ctx.stroke();ctx.restore();
    }
    ctx.save();ctx.beginPath();ctx.arc(124,85,61,0,Math.PI*2);ctx.clip();ctx.drawImage(crest.image,63,24,122,122);ctx.restore();
    // Redraw the small graduation illustrations in their original positions.
    function graduate(x,y,scale,raised){
      ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
      ctx.fillStyle='#243452';ctx.beginPath();ctx.moveTo(-23,14);ctx.lineTo(-36,83);ctx.lineTo(33,83);ctx.lineTo(22,14);ctx.fill();
      ctx.fillStyle='#f4c563';ctx.beginPath();ctx.moveTo(-19,17);ctx.lineTo(0,51);ctx.lineTo(20,17);ctx.lineTo(0,34);ctx.fill();
      ctx.fillStyle='#edc39e';ctx.beginPath();ctx.ellipse(0,0,13,17,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#203149';ctx.beginPath();ctx.moveTo(-23,-14);ctx.lineTo(0,-24);ctx.lineTo(23,-14);ctx.lineTo(0,-5);ctx.closePath();ctx.fill();
      if(raised){ctx.strokeStyle='#243452';ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(-19,35);ctx.lineTo(-42,18);ctx.lineTo(-50,-3);ctx.stroke();ctx.fillStyle='#ffe5a0';ctx.fillRect(-61,-21,25,12);}
      ctx.restore();
    }
    [61,104,149,190].forEach((x,i)=>graduate(x,216+i%2*18,.8,false));
    graduate(1383,164,1.85,true);
    ctx.font='900 83px Arial';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.strokeStyle='#243a7966';ctx.lineWidth=5;
    ['XÂY CHẤT LƯỢNG','NHẬN NIỀM TIN'].forEach((line,i)=>{
      const y=117+i*108;
      ctx.strokeText(line,755,y,990);ctx.fillStyle='#ffffff';ctx.fillText(line,755,y,990);
    });
    const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;
    return map;
  },[crest]);
  return <mesh position={at}><planeGeometry args={[5.38,1.22]}/><meshBasicMaterial map={map} toneMapped={false}/></mesh>;
}

function SecurityGuard() {
  return <group position={[.99,0,.64]}>
    <Box at={[0,1.08,0]} size={[.37,.49,.19]} color="#749fbf"/>
    <Box at={[0,.82,0]} size={[.35,.08,.20]} color="#262d39"/>
    {[-1,1].map(side=><group key={side}>
      <Box at={[side*.088,.42,0]} size={[.155,.82,.17]} color="#23344b"/>
      <Box at={[side*.088,.065,.045]} size={[.153,.11,.245]} color="#23252a"/>
      <Box at={[side*.224,1.105,0]} size={[.106,.34,.145]} color="#749fbf"/>
      <Box at={[side*.226,.895,0]} size={[.082,.12,.097]} color="#bb825f"/>
      <Box at={[side*.112,1.335,.012]} size={[.10,.027,.142]} color="#253c57"/>
    </group>)}
    <mesh position={[0,1.48,0]} scale={[.092,.112,.088]} castShadow><sphereGeometry args={[1,20,14]}/><meshStandardMaterial color="#bf8b66"/></mesh>
    <Box at={[0,1.583,.004]} size={[.193,.072,.174]} color="#293d58"/>
    <Box at={[0,1.558,.084]} size={[.189,.021,.116]} color="#233144"/>
    <Box at={[0,1.585,.094]} size={[.042,.037,.011]} color="#d3b46d"/>
    {[-.032,.032].map(x=><Box key={x} at={[x,1.49,.081]} size={[.017,.009,.016]} color="#2e261f"/>)}
  </group>;
}

function Guardhouse() {
  return <group position={[guard.x,0,guard.z]}>
    <Box at={[0,1.28,-guard.d/2+.10]} size={[guard.w,2.56,.20]} color="#e2d4b6"/>
    {[-1,1].map(side=><Box key={side} at={[side*(guard.w/2-.095),1.28,0]} size={[.19,2.56,guard.d]} color="#e2d4b6"/>)}
    <Box at={[-.91,1.28,guard.d/2-.09]} size={[2.75,2.56,.18]} color="#e2d4b6"/>
    <Box at={[1.96,1.28,guard.d/2-.09]} size={[.65,2.56,.18]} color="#e2d4b6"/>
    <Box at={[1.06,2.36,guard.d/2-.09]} size={[1.19,.4,.18]} color="#e2d4b6"/>
    <Box at={[1.06,.045,guard.d/2]} size={[1.19,.09,.27]} color="#948473"/>
    <Box at={[1.06,2.155,guard.d/2+.015]} size={[1.27,.095,.11]} color="#466579"/>
    {[.46,1.65].map(x=><Box key={x} at={[x,1.10,guard.d/2+.015]} size={[.09,2.16,.11]} color="#466579"/>)}
    <group position={[1.62,0,guard.d/2-.02]} rotation={[0,-1.39,0]}>
      <GateWindow at={[-.52,1.09,0]} width={1.03} height={2.08} door/>
      <Box at={[-.91,1.03,.10]} size={[.08,.034,.04]} color="#ccbc8d"/>
    </group>
    <Box at={[0,.022,0]} size={[guard.w,.044,guard.d]} color="#aa9a82"/>
    <pointLight position={[.2,1.95,.7]} color="#ffdec0" intensity={1.4} distance={4}/>
    <SecurityGuard/>
    <Box at={[0,.12,0]} size={[guard.w+.035,.24,guard.d+.035]} color="#6d5f50"/>
    {[{y:2.60,w:.67,d:.69,h:.22},{y:2.73,w:.87,d:.85,h:.095},{y:2.82,w:.99,d:.95,h:.08}].map(tier=>
      <Box key={tier.y} at={[0,tier.y,0]} size={[guard.w+tier.w,tier.h,guard.d+tier.d]} color="#ead8b7"/>)}
    <Box at={[2.8,2.47,1.41]} size={[1.65,.15,.92]} color="#d9c09b"/>
    <GateWindow at={[-.37,1.27,guard.d/2+.03]}/>
    <GateWindow at={[.43,1.29,-guard.d/2-.03]} turn={Math.PI} width={1.56}/>
    <GateWindow at={[-guard.w/2-.03,1.33,.39]} turn={-Math.PI/2} width={.92} height={1.18}/>
    <GateWindow at={[-guard.w/2-.03,1.06,-.73]} turn={-Math.PI/2} width={.79} height={2.07} door/>
    <GateWindow at={[guard.w/2+.03,1.20,.58]} turn={Math.PI/2} width={.74} height={1.10}/>
    <RestoredBanner at={[0,3.48,guard.d/2+.05]}/>
  </group>;
}

function Beam({ from, to, radius = .032, color = '#4385ad' }) {
  const a=new T.Vector3(...from), b=new T.Vector3(...to);
  const axis=b.clone().sub(a);
  const rotation=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),axis.clone().normalize());
  return <mesh position={a.lerp(b,.5)} quaternion={rotation} castShadow>
    <cylinderGeometry args={[radius,radius,axis.length(),8]}/><meshStandardMaterial color={color} roughness={.66}/>
  </mesh>;
}

function Swing({ x, z }) {
  return <group position={[x,0,z]}>
    <Box at={[0,.06,0]} size={[3.85,.12,2.25]} color="#a45f4b"/>
    {[-1,1].flatMap(side=>[-1,1].map(depth=><Beam key={side+','+depth}
      from={[side*1.62,.13,depth*.79]} to={[side*1.36,2.16,0]} radius={.047}/>))}
    <Beam from={[-1.52,2.16,0]} to={[1.52,2.16,0]} radius={.054}/>
    {[-.83,.83].flatMap(side=>[-.22,.21].map(depth=><Beam key={side+','+depth} from={[side,2.13,0]} to={[side,.68,depth]} radius={.018}/>))}
    {[0,1,2,3,4].map(i=><Box key={i} at={[0,.64,-.22+i*.105]} size={[1.89,.057,.076]} color="#5299c1"/>)}
    {[0,1,2,3].map(i=><Box key={i} at={[0,.74+i*.093,-.245-i*.018]} size={[1.89,.058,.055]} color="#4c91b8"/>)}
  </group>;
}

function StoneBench({ x, z }) {
  return <group position={[x,0,z]}>
    <Box at={[0,.51,0]} size={[1.65,.105,.48]} color="#d1c4a3"/>
    <Box at={[0,.79,-.22]} rotation={[-.15,0,0]} size={[1.65,.33,.093]} color="#d1c4a3"/>
    {[-.59,.59].map(a=><group key={a}>
      <Box at={[a,.25,0]} size={[.19,.49,.39]} color="#b4a78a"/>
      <Box at={[a,.65,-.22]} size={[.12,.28,.11]} color="#b4a78a"/>
    </group>)}
  </group>;
}

function engravedStone() {
  const canvas=document.createElement('canvas');
  canvas.width=canvas.height=512;
  const ctx=canvas.getContext('2d');
  ctx.fillStyle='#988e7d';ctx.fillRect(0,0,512,512);
  for(let i=0;i<5200;i++){
    const x=(i*197)%512,y=(i*113+Math.floor(i/512)*71)%512;
    ctx.fillStyle=i%2?'#3b342c22':'#d8c9ad33';ctx.fillRect(x,y,2+i%5,1+i%3);
  }
  const relief=document.createElement('canvas');
  relief.width=relief.height=512;
  const cut=relief.getContext('2d');
  cut.fillStyle='#aaa';cut.fillRect(0,0,512,512);
  for(const c of [ctx,cut]){
    c.font='italic bold 58px Georgia';c.textAlign='center';c.textBaseline='middle';
    ['Mỗi ngày','Trường','tốt lên','0,1%'].forEach((line,i)=>{
      const y=183+i*62;
      if(c===ctx){
        c.fillStyle='#c7b7a1';c.fillText(line,257,y+2,335);
        c.fillStyle='#692f2a';c.fillText(line,256,y,335);
      }else{c.fillStyle='#323232';c.fillText(line,256,y,335);}
    });
  }
  const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;
  return {map,bumpMap:new T.CanvasTexture(relief)};
}

function Rock({ at, size, seed, color, engraved = false }) {
  const surface=useMemo(()=>engraved?engravedStone():null,[engraved]);
  const geometry=useMemo(()=>{
    const shape=new T.IcosahedronGeometry(1,3);
    const points=shape.attributes.position;
    for(let i=0;i<points.count;i++){
      const x=points.getX(i), y=points.getY(i), z=points.getZ(i);
      const r=1+.09*Math.sin(13*x+6*z+seed)*Math.cos(9*y-7*z)+.05*Math.cos(11*y+4*x);
      points.setXYZ(i,x*r,Math.max(-.79,y*r),z*r);
    }
    points.needsUpdate=true;
    shape.computeVertexNormals();
    if(engraved){
      const uv=shape.attributes.uv;
      for(let i=0;i<points.count;i++){
        const x=points.getX(i),y=points.getY(i),z=points.getZ(i);
        uv.setXY(i,z>.27?.5+x*.48:.035,.5+y*.48);
      }
      uv.needsUpdate=true;
    }
    return shape;
  },[seed,engraved]);
  return <mesh position={at} scale={size} geometry={geometry} castShadow receiveShadow>
    <meshStandardMaterial color={engraved?'#ffffff':color} {...surface} bumpScale={.035} roughness={1} flatShading/>
  </mesh>;
}

function RockGarden({ x, z, right }) {
  return <group position={[x,0,z]}>
    <Box at={[0,.12,0]} size={[4.65,.24,1.82]} color="#9c4d3b"/>
    <Box at={[0,.248,0]} size={[4.47,.025,1.64]} color="#514436"/>
    <Rock at={[0,.92,0]} size={[.73,.87,.52]} seed={right?1:4} color="#9c9380" engraved={right}/>
    <Rock at={[-.73,.37,.28]} size={[.43,.24,.31]} seed={3} color="#7d7b6d"/>
    <Rock at={[.64,.41,.21]} size={[.38,.28,.39]} seed={5} color="#847d6d"/>
    {[-1.84,-1.32,1.12,1.66].map((a,i)=><mesh key={a} position={[a,.49,-.23]} scale={[.49,.40,.45]} castShadow>
      <icosahedronGeometry args={[1,1]}/><meshStandardMaterial color={i%2?'#6e8145':'#495f37'} flatShading/>
    </mesh>)}
  </group>;
}

function SlopedSurface({ left, right, start, end, kind }) {
  const {geometry, map}=useMemo(()=>{
    const geometry=new T.PlaneGeometry(right-left,end-start,Math.ceil((right-left)/.65),Math.ceil((end-start)/.65));
    geometry.rotateX(-Math.PI/2);
    const points=geometry.attributes.position;
    for(let i=0;i<points.count;i++){
      const x=points.getX(i)+(right+left)/2,z=points.getZ(i)+(start+end)/2;
      points.setXYZ(i,x,groundHeight(x,z)+.029,z);
    }
    geometry.computeVertexNormals();
    const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
    const ctx=canvas.getContext('2d');
    ctx.fillStyle=kind==='grass'?'#468831':'#d5b796';ctx.fillRect(0,0,256,256);
    for(let i=0;i<6800;i++){
      const x=(i*137)%256,y=(i*81+Math.floor(i/256)*57)%256;
      ctx.fillStyle=kind==='grass'?['#7caf45','#346b2e','#539238','#64a63d'][i%4]:['#f0d5b95c','#80624b30','#fff2d059'][i%3];
      ctx.fillRect(x,y,kind==='grass'?1:2,1+i%5);
    }
    if(kind!=='grass'){
      ctx.strokeStyle='#896e5680';
      for(let a=0;a<256;a+=64){ctx.beginPath();ctx.moveTo(a,0);ctx.lineTo(a,256);ctx.stroke();}
      for(let a=0;a<256;a+=64){ctx.beginPath();ctx.moveTo(0,a);ctx.lineTo(256,a);ctx.stroke();}
    }
    const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;
    map.wrapS=map.wrapT=T.RepeatWrapping;
    map.repeat.set((right-left)/3,(end-start)/3);map.anisotropy=8;
    return {geometry,map};
  },[left,right,start,end,kind]);
  return <mesh geometry={geometry} receiveShadow><meshStandardMaterial map={map} roughness={.96}/></mesh>;
}

function EntryLandscape() {
  return <>
    <SlopedSurface left={-3.35} right={3.35} start={27} end={46} kind="paving"/>
    {[-1,1].map(side=><React.Fragment key={side}>
      <SlopedSurface left={side===-1?-22:3.35} right={side===-1?-3.35:22} start={27} end={39.5} kind="grass"/>
      <SlopedSurface left={side===-1?-27:3.35} right={side===-1?-3.35:27} start={39.5} end={46} kind="paving"/>
    </React.Fragment>)}
  </>;
}

const skyClock=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Ho_Chi_Minh',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
function LiveSky() {
  const sky=useRef(), sun=useRef(), fill=useRef(), fog=useRef(), last=useRef(-1);
  const uniforms=useMemo(()=>({ top:{value:new T.Color()}, horizon:{value:new T.Color()}, daylight:{value:1}, cloudTime:{value:0} }),[]);
  useFrame(({clock,camera})=>{
    if(!sky.current)return;
    sky.current.position.copy(camera.position);
    uniforms.cloudTime.value=clock.elapsedTime;
    const now=Date.now();
    if(now-last.current<1000)return;
    last.current=now;
    const [h,m,s]=skyClock.format(now).split(':').map(Number);
    const angle=Math.PI*(h+m/60+s/3600-6)/12;
    const elevation=Math.sin(angle);
    const day=T.MathUtils.smoothstep(elevation,-.22,.31);
    const twilight=Math.max(0,1-Math.abs(elevation)*4);
    uniforms.daylight.value=day;
    uniforms.top.value.set('#101e44').lerp(new T.Color('#2580d4'),day);
    uniforms.horizon.value.set('#434e70').lerp(new T.Color('#c6eaff'),day).lerp(new T.Color('#f6b587'),twilight*.39);
    fog.current.color.copy(uniforms.horizon.value);
    fill.current.intensity=.70+day*1.43;
    sun.current.intensity=.12+2.18*day;
    sun.current.color.set('#fff5df').lerp(new T.Color('#ffb27b'),twilight*.54);
    sun.current.position.set(-62*Math.cos(angle),Math.max(12,68*elevation),34);
  });
  return <>
    <fog ref={fog} attach="fog" args={['#c6eaff',85,185]}/>
    <hemisphereLight ref={fill} args={['#e8f5ff','#91a077',1.6]}/>
    <directionalLight ref={sun} castShadow position={[-39,60,30]} shadow-mapSize={[2048,2048]} shadow-camera-left={-64} shadow-camera-right={64}
      shadow-camera-top={70} shadow-camera-bottom={-70} shadow-camera-far={170} shadow-normalBias={.12}/>
    <mesh ref={sky} frustumCulled={false}>
      <sphereGeometry args={[195,32,20]}/>
      <shaderMaterial side={T.BackSide} depthWrite={false} uniforms={uniforms}
        vertexShader={`varying vec3 direction; void main(){direction=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`}
        fragmentShader={`varying vec3 direction;
          uniform vec3 top,horizon;uniform float daylight,cloudTime;
          float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
          float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
          return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);}
          void main(){vec3 d=normalize(direction);vec3 c=mix(horizon,top,smoothstep(0.,.82,d.y));
          vec2 uv=d.xz/(max(.05,d.y)+.21)*3.6+vec2(cloudTime*.009,0.);
          float cloud=n(uv)*.57+n(uv*2.1)*.27+n(uv*4.3)*.11+n(uv*8.5)*.05;
          c=mix(c,mix(horizon,vec3(.98,.99,1.),.87),smoothstep(.58,.78,cloud)*smoothstep(.035,.24,d.y)*(.22+.70*daylight));
          gl_FragColor=vec4(c,1.);
          #include <colorspace_fragment>
          }`}/>
    </mesh>
  </>;
}

function EntrancePaths() {
  return <>
    {[-1,1].map(side=><group key={side}>
      <Box at={[side*47.1,.027,1]} size={[3.4,.054,78]} color="#a9a18d" cast={false}/>
      {[8.2,11.3,14.4].map(x=><group key={x} position={[side*x,groundHeight(side*x,32.8),32.8]}>
        <Rock at={[0,.21,0]} size={[.54,.23,.51]} color="#7d7154" seed={x}/>
        <mesh position={[0,.67,0]} scale={[.65,.43,.55]} castShadow>
          <icosahedronGeometry args={[1,1]}/><meshStandardMaterial color="#557444" flatShading/>
        </mesh>
      </group>)}
    </group>)}
    <group position={[-3.75,groundHeight(-3.75,38.9),38.9]}>
      <Box at={[-.64,.61,0]} size={[.04,1.22,.04]} color="#b4b5af"/>
      <Box at={[.64,.61,0]} size={[.04,1.22,.04]} color="#b4b5af"/>
      <Sign text={['LỐI ĐI ĐẾN','HẦM XE GIÁO VIÊN','←']} theme="direction" at={[0,1.1,.02]} width={1.52} height={1.08}/>
    </group>
  </>;
}

function Entrance() {
  return <group position={[0,.84,0]}>
    {Array.from({length:12},(_,i)=><Box key={i} at={[1.06,.069,46+i*.38]} size={[99.9,.01,.021]} color="#796d5e" cast={false}/>)}

    <group position={[0,0,45.8]}>
      {[-1,1].map(side=><group key={side}>
        <Box at={[side*3.64,2.23,0]} size={[.87,4.46,1.06]} color="#f1e6d1"/>
        <Box at={[side*3.64,.77,0]} size={[.94,1.54,1.12]} color="#a75036"/>
        <Box at={[side*3.64,1.55,0]} size={[.98,.075,1.16]} color="#dfc8a3"/>
        <Box at={[side*3.64,3.63,0]} size={[1.07,.16,1.22]} color="#c6ab89"/>
        <Box at={[side*3.64,3.74,0]} size={[.98,.10,1.14]} color="#e4cba9"/>
        <Box at={[side*3.64,4.13,0]} size={[.79,.69,1.05]} color="#c3a581"/>
        {[3.95,4.14,4.33].map(y=><Box key={y} at={[side*3.64,y,.533]} size={[.76,.016,.009]} color="#a88e72" cast={false}/>)}
        <Box at={[side*3.62,4.45,.592]} size={[.32,.18,.10]} color="#292928"/>
        <Box at={[side*3.62,4.445,.649]} size={[.25,.114,.018]} color="#d8cdb7"/>
        <Box at={[side*25.3,.30,-.11]} size={[42.2,.60,.4]} color="#c9b18b"/>
        <Box at={[side*25.3,1.50,-.11]} size={[42.2,.095,.07]} color={blue}/>
        {Array.from({length:26},(_,i)=><Box key={i} at={[side*(4.65+i*.39),1.18,-.11]} size={[.043,1.16,.06]} color={blue} cast={false}/>)}
        {Array.from({length:12},(_,i)=><Box key={i} at={[side*(15+i*2.75),1.16,-.11]} size={[.10,1.16,.1]} color={blue} cast={false}/>)}
        {[10.7,17.5,25.7,35].map(x=><group key={x} position={[side*x,0,-.11]}>
          <Box at={[0,1.04,0]} size={[.29,2.08,.36]} color="#c1ac8b"/>
          <Box at={[0,2.09,0]} size={[.43,.13,.49]} color="#e3c7a4"/>
        </group>)}
      </group>)}
      <Box at={[0,4.25,0]} size={[7.4,.72,1.08]} color="#c7ad8e"/>
      <Sign text="TRƯỜNG TRUNG HỌC PHỔ THÔNG LỘC NINH" at={[0,4.25,.555]} width={6.30} height={.59}/>
      <Sign text="HIỀN TÀI LÀ NGUYÊN KHÍ QUỐC GIA" at={[0,4.25,-.555]} width={6.28} height={.59} back/>
      <Box at={[0,3.25,.25]} size={[6.38,.61,.22]} color="#446982"/>
      <Box at={[0,3.26,.369]} size={[4.01,.51,.02]} color="#282b2d"/>
      {[-1,1].map(side=><Box key={side} at={[side*2.62,3.24,.371]} size={[1.13,.52,.019]} color="#688da1"/>)}
      <Ironwork width={2.02} at={[2.16,0,.30]}/>
      <Ironwork width={1.91} at={[-3.16,0,-.99]} rotation={[0,Math.PI/2,0]}/>
      <GateRoof/>
    </group>
    <Guardhouse/>
    <Ironwork width={1.14} at={[-4.68,0,46.02]} dense/>
    {[-1,1].map(side=><group key={side}>
      <RockGarden x={side===-1?-12.0:7.32} z={46.64} right={side===1}/>
      <Swing x={side*16.1} z={47.3}/>
      {[19.1,21.1,23.1].map(x=><StoneBench key={x} x={side*x} z={46.8}/>)}
    </group>)}
  </group>;
}

function Courtyard() {
  return <>
    {canopyRows.map(row=><group key={row.x} position={[row.x,0,row.z]}>
      {Array.from({length:10},(_,i)=>{
        const angle=(i-4.5)*Math.PI/12;
        return <Box key={i} at={[3.22*Math.sin(angle),2.65+1.13*Math.cos(angle),0]}
          rotation={[0,0,-Math.atan(.35*Math.tan(angle))]} size={[.88*Math.cos(angle)+.025,.08,row.d]} color={i%2?'#9bb6b0':'#abc3ba'}/>;
      })}
      {[-1,1].flatMap(side=>[-9,0,9].map(z=><Box key={side+','+z} at={[side*3.12,1.55,z]} size={[.12,3.1,.12]} color="#546866"/>))}
    </group>)}
    <Box at={[stage.x,.49,stage.z]} size={[stage.w,.98,stage.d]} color="#b87958"/>
    {[0,1,2].map(i=><Box key={i} at={[0,.13+i*.13,-10.9-i*.38]} size={[7,.26+i*.26,1.4]} color="#d5bb99"/>)}
    <Box at={[0,2,-16.4]} size={[12,2.9,.16]} color="#ddd5ba"/>
    <Box at={[0,3.75,-14.9]} size={[14,.17,4]} color="#77998c"/>
    <Sign text="SÂN KHẤU · THPT LỘC NINH" at={[0,3.5,-12.9]} width={8} height={.57}/>
    {parking.map((p,i)=><group key={p.z} position={[p.x,0,p.z]}>
      <Box at={[0,2.85,0]} size={[p.w,.16,p.d]} rotation={[0,0,.045]} color={i===1?'#af604c':'#a9bcb3'}/>
      {[-1,1].flatMap(a=>[-1,1].map(b=><Box key={a+','+b} at={[a*(p.w/2-.25),1.4,b*(p.d/2-.5)]} size={[.2,2.8,.2]} color="#62776b"/>))}
    </group>)}
    {palms.map(({x,z})=><group key={x+','+z} position={[x,groundHeight(x,z),z]}>
      <mesh position={[0,.12,0]} receiveShadow><cylinderGeometry args={[1.3,1.3,.24,14]}/><meshStandardMaterial color={blue}/></mesh>
      <mesh position={[0,2.83,0]} castShadow><cylinderGeometry args={[.15,.29,5.5,8]}/><meshStandardMaterial color="#868074"/></mesh>
      {Array.from({length:8},(_,i)=><group key={i} rotation={[0,i*Math.PI/4,0]} position={[0,5.5,0]}>
        <mesh position={[.98,.2,0]} rotation={[0,0,.17]} scale={[1.32,.14,.38]} castShadow><sphereGeometry args={[1,8,4]}/><meshStandardMaterial color={i%2?'#5f884f':'#3d693f'} flatShading/></mesh>
        <mesh position={[2,-.05,0]} rotation={[0,0,-.44]} scale={[.82,.09,.27]}><sphereGeometry args={[1,7,4]}/><meshStandardMaterial color="#4d7545" flatShading/></mesh>
      </group>)}
    </group>)}
    {[19,24,31,36].map((z,j)=><group key={z} position={[0,4.65,z]}>
      <Box at={[0,0,0]} size={[11,.018,.018]} color="#6e6b55" cast={false}/>
      {Array.from({length:12},(_,i)=><mesh key={i} position={[i*.9-4.95,-.23,0]} rotation={[0,0,Math.PI]} scale={[.3,.43,1]}>
        <circleGeometry args={[1,3,Math.PI/2]}/><meshStandardMaterial color={['#d35444','#eabf44','#517fba','#74a96a','#cb829b'][(i+j)%5]} side={T.DoubleSide}/>
      </mesh>)}
    </group>)}
    <Box at={[flagBase.x,.2,flagBase.z]} size={[1.1,.4,1.1]} color="#bd9f7c"/>
    <Box at={[flagBase.x,3.4,flagBase.z]} size={[.11,6.8,.11]} color="#e7e3cd"/>
    <Box at={[flagBase.x+.61,6.32,flagBase.z]} size={[1.2,.75,.045]} color="#bb3636"/>
  </>;
}

function RoadSurface({left,right,from,to,height,color}) {
  const geometry=useMemo(()=>{
    const mesh=new T.PlaneGeometry(right-left,to-from,1,Math.ceil((to-from)/.25));
    mesh.rotateX(-Math.PI/2);
    const positions=mesh.attributes.position;
    for(let i=0;i<positions.count;i++){
      const x=positions.getX(i)+(left+right)/2;
      const z=positions.getZ(i)+(from+to)/2;
      positions.setXYZ(i,x,height(z),z);
    }
    mesh.computeVertexNormals();
    return mesh;
  },[left,right,from,to,height]);
  return <mesh geometry={geometry} receiveShadow><meshStandardMaterial color={color} roughness={.98}/></mesh>;
}

const frontStreetHeight=()=>frontPavement.height;

function SideStreet({match}) {
  return <>
    <RoadSurface left={52.775} right={59.725} from={-23} to={frontPavement.roadStart} height={sideStreetHeight} color="#4e5352"/>
    {[51.95,60.55].map(x=><RoadSurface key={x} left={x-.825} right={x+.825} from={-23} to={frontPavement.roadStart} height={sideStreetHeight} color="#bba18c"/>)}
    <Box at={[57.3,.455,50.5]} size={[8.15,.90,.09]} color="#4e5352"/>
    <Box at={[49.65,.046,sideGate.z]} size={[6,.08,6.3]} color="#c4ae94"/>
    <Box at={[49.57,.053,23.2]} size={[1.82,.083,43]} color="#c9beb0" cast={false}/>
    <SlopedSurface left={3.35} right={50.48} start={42.4} end={44.2} kind="paving"/>
    {eastFence.map(([a,b])=><group key={a}>
      <Box at={[sideGate.x,.27,(a+b)/2]} size={[.3,.54,b-a]} color="#cabb9d"/>
      <Box at={[sideGate.x,1.41,(a+b)/2]} size={[.08,.085,b-a]} color="#5d6665"/>
      {Array.from({length:Math.floor((b-a)/.84)},(_,i)=>a+.42+i*.84).map(z=><Box key={z} at={[sideGate.x,.99,z]} size={[.055,.97,.055]} color="#5d6665" cast={false}/>)}
    </group>)}
    {[sideGate.z-3.25,sideGate.z+3.25].map(z=><group key={z} position={[sideGate.x,0,z]}>
      <Box at={[0,.95,0]} size={[.64,1.90,.68]} color="#dfcca6"/>
      <Box at={[0,1.94,0]} size={[.77,.15,.81]} color="#8d816a"/>
      <Ironwork width={2.15} at={[-2.65,0,0]}/><Box at={[-.75,.89,0]} size={[1.54,.065,.09]} color="#356488"/>
    </group>)}
    <Sign text={['CỔNG PHỤ','KHU ĐỂ XE HỌC SINH']} at={[sideGate.x+.37,1.36,sideGate.z+3.25]} width={.60} height={.41} turn={Math.PI/2}/>
    <group position={[hall.x,0,hall.z]}>
      <Box at={[0,1.92,0]} size={[hall.w,3.84,hall.d]} color="#e5d1ae"/>
      <Roof w={hall.w} d={hall.d} height={3.84}/>
      <Box at={[hall.w/2+.025,1.01,0]} size={[.065,2.02,2.15]} color="#48686a"/>
      {[-5.5,-3.3,3.3,5.5].map(z=><Box key={z} at={[hall.w/2+.036,2.33,z]} size={[.077,.92,1.46]} color="#658487"/>)}
      <Sign text="NHÀ ĐA NĂNG" at={[hall.w/2+.05,3.06,0]} width={3.35} height={.43} turn={Math.PI/2}/>
    </group>
    {[-16,-14.65,-13.3,-11.95,-10.6,-9.25].map((z,i)=><Bike key={z} at={[42.5,0,z]} color={['#ab453d','#3a647b','#365649'][i%3]}/>)}
    <Sign text="NHÀ XE HỌC SINH" at={[46.27,2.59,-10]} width={3.55} height={.41} turn={Math.PI/2}/>
    {[12,25,37,44].map((z,i)=><group key={z} position={[i%2?60.55:51.95,0,z]}>
      <Beam from={[0,0,0]} to={[.18,4.6,.15]} radius={.22} color="#735745"/>
      {[[0,4.8,0],[-.9,4.3,.6],[.8,5.1,-.45]].map(([x,y,k],j)=><mesh key={j} position={[x,y,k]} castShadow scale={[1.6,1.3,1.48]}><icosahedronGeometry args={[1,1]}/><meshStandardMaterial color={['#466e3f','#567943','#678c4a'][j]} flatShading/></mesh>)}
    </group>)}
    <Cafe match={match}/>
  </>;
}

function Bike({at,color}) {
  return <group position={at} rotation={[0,Math.PI/2,0]}>
    {[-.53,.53].map(x=><mesh key={x} position={[x,.275,0]}><torusGeometry args={[.245,.035,7,16]}/><meshStandardMaterial color="#282b30"/></mesh>)}
    {[[[-.53,.275,0],[.05,.36,0]],[[.05,.36,0],[-.18,.67,0]],[[-.18,.67,0],[-.53,.275,0]],[[-.18,.67,0],[.37,.65,0]],[[.37,.65,0],[.05,.36,0]],[[.53,.275,0],[.33,.86,0]]].map(([from,to],i)=><Beam key={i} from={from} to={to} color={color} radius={.021}/>)}
    <Box at={[-.17,.70,0]} size={[.24,.055,.115]} color="#303031"/>
    <Box at={[.33,.86,0]} size={[.06,.045,.31]} color="#545656"/>
  </group>;
}

function ChessTable({live}) {
  const moving=useRef();
  useFrame(({clock})=>{
    const progress=(clock.elapsedTime%10)/10;
    const t=T.MathUtils.smoothstep(progress,.29,.47)-T.MathUtils.smoothstep(progress,.77,.95);
    if(!moving.current)return;
    moving.current.position.z=.226-.17*t;
    moving.current.position.y=.814+.055*Math.sin(t*Math.PI);
  });
  const board=useMemo(()=>{
    const c=document.createElement('canvas');c.width=c.height=512;
    const ctx=c.getContext('2d');ctx.fillStyle='#d6a66a';ctx.fillRect(0,0,512,512);
    ctx.strokeStyle='#69391e';ctx.lineWidth=3;
    const line=(a,b,x,y)=>{ctx.beginPath();ctx.moveTo(a,b);ctx.lineTo(x,y);ctx.stroke();};
    for(let i=0;i<10;i++)line(48,40+i*48,464,40+i*48);
    for(let i=0;i<9;i++){const x=48+i*52;line(x,40,x,i===0||i===8?472:232);line(x,280,x,472);}
    for(const y of [40,376]){line(204,y,308,y+96);line(308,y,204,y+96);}
    ctx.font='22px serif';ctx.textAlign='center';ctx.fillStyle='#69391e';ctx.fillText('楚河       漢界',256,264);
    const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;return tex;
  },[]);
  const token=(x,z,side,kind,ref)=> <group key={x+','+z} position={[x,.814,z]} ref={ref}>
    <mesh><cylinderGeometry args={[.032,.032,.026,14]}/><meshStandardMaterial color={side?'#e3bc83':'#eee2bd'}/></mesh>
    <mesh position={[0,.014,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.009+kind*.003,.021,14]}/><meshBasicMaterial color={side?'#432f22':'#9c2c21'}/></mesh>
  </group>;
  return <>
    <Box at={[0,.36,0]} size={[.085,.72,.085]} color="#3e4543"/>
    <mesh position={[0,.742,0]} castShadow><cylinderGeometry args={[.64,.64,.066,32]}/><meshStandardMaterial color="#594535"/></mesh>
    <mesh position={[0,.777,0]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[.91,.91]}/><meshStandardMaterial map={board}/></mesh>
    {!live&&<>
    {[-1,1].flatMap(side=>[-.36,-.27,-.18,-.09,0,.09,.18,.27,.36].map((x,i)=>token(x,side*.36,side>0,i%3)))}
    {[-1,1].flatMap(side=>[-.36,-.18,0,.18,.36].filter(x=>x!==0||side<0).map((x,i)=>token(x,side*.226,side>0,i%3)))}
    {token(0,.226,true,1,moving)}
    </>}
    {live?.board.map((p,i)=>p&&token((i%9-4)*.092,(Math.floor(i/9)-4.5)*.08,p[0]==='r',0))}
  </>;
}

function SeatedMan({ at, yaw, shirt, player }) {
  const arm=useRef();
  useFrame(({clock})=>{if(player)arm.current.rotation.x=-.28-.56*Math.sin(Math.PI*T.MathUtils.smoothstep(clock.elapsedTime%10,2,6));});
  return <group position={at} rotation={[0,yaw,0]}>
    <Box at={[0,.40,.04]} size={[.53,.065,.49]} color="#323838"/>
    <Box at={[0,.67,.27]} size={[.51,.38,.043]} color="#333838"/>
    {[-.24,.24].flatMap(x=>[-.18,.28].map(z=><Beam key={x+','+z} from={[x,.02,z]} to={[x,.61,z*.9]} radius={.018} color="#9aaba9"/>))}
    <mesh position={[0,.72,.02]} rotation={[-.11,0,0]} scale={[.205,.27,.113]} castShadow><sphereGeometry args={[1,16,12]}/><meshStandardMaterial color={shirt}/></mesh>
    <mesh position={[0,1.05,-.042]} scale={[.094,.123,.088]} castShadow><sphereGeometry args={[1,16,12]}/><meshStandardMaterial color="#c18d69"/></mesh>
    <mesh position={[0,1.121,-.023]} scale={[.098,.073,.087]}><sphereGeometry args={[1,16,10]}/><meshStandardMaterial color="#292527"/></mesh>
    {[-1,1].map(side=><group key={side}>
      <Box at={[side*.09,.45,-.10]} size={[.145,.15,.34]} color="#2b3440"/>
      <Box at={[side*.09,.22,-.28]} size={[.13,.34,.13]} color="#2b3440"/>
      <Box at={[side*.09,.065,-.33]} size={[.142,.09,.23]} color="#292929"/>
      <group ref={side===1?arm:null} position={[side*.184,.855,0]} rotation={[-.25,0,0]}>
        <Beam from={[0,0,0]} to={[side*.049,-.157,-.08]} radius={.059} color={shirt}/>
        <Beam from={[side*.049,-.157,-.08]} to={[side*.021,-.148,player?-.31:-.20]} radius={.037} color="#c18d69"/>
      </group>
    </group>)}
  </group>;
}

function Cafe({match}) {
  return <group position={[cafe.x,0,cafe.z]} rotation={[0,-Math.PI/2,0]}>
    <Box at={[0,.024,0]} size={[9,.067,8.7]} color="#b2a58e"/>
    <Box at={[0,1.33,-2.22]} size={[6.2,2.66,.18]} color="#77a59a"/>
    {[-3.05,3.05].map(x=><Box key={x} at={[x,1.32,-.96]} size={[.16,2.64,2.6]} color="#78a89a"/>)}
    <Box at={[-.76,.49,.22]} size={[4.65,.98,.16]} color="#83ae9e"/>
    <Box at={[2.77,.49,.22]} size={[.56,.98,.16]} color="#83ae9e"/>
    <Box at={[0,2.42,.22]} size={[6.2,.45,.14]} color="#83ae9e"/>
    <Box at={[-.76,1.01,.31]} size={[4.65,.12,.62]} color="#594b3e"/>
    {Array.from({length:27},(_,i)=><Box key={i} at={[i*.17-2.97,.49,.309]} size={[.025,.95,.024]} color="#618e80" cast={false}/>)}
    <Box at={[0,2.76,-1]} size={[6.55,.14,3.05]} rotation={[-.08,0,0]} color="#4e796f"/>
    <Box at={[0,2.34,1.2]} size={[6.4,.09,1.85]} rotation={[-.12,0,0]} color="#85a89b"/>
    <Sign text="CÀ PHÊ XANH" at={[0,2.68,2.11]} width={3.22} height={.46}/>
    <Box at={[.82,1.24,-.17]} size={[.68,.39,.39]} color="#a9afb0"/>
    <Box at={[.82,1.25,.031]} size={[.53,.24,.021]} color="#3d4447"/>
    <group position={[.25,0,2.95]}>
      <Beam from={[1.48,.06,-.19]} to={[1.48,2.76,-.19]} radius={.045} color="#79664d"/>
      <mesh position={[.19,2.50,.02]} rotation={[0,Math.PI/8,0]} castShadow>
        <coneGeometry args={[2.07,.40,8]}/><meshStandardMaterial color="#876a67" side={T.DoubleSide}/>
      </mesh>
      <ChessTable live={match?.state}/>
      {cafeSeats.map(p=><SeatedMan key={p.shirt} at={[p.x,0,p.z]} yaw={p.yaw} shirt={match&&p.player?(characters.find(c=>c.id===(p.z>0?match.red:match.black).avatar)?.shirt||p.shirt):p.shirt} player={p.player&&!match}/>)}
    </group>
  </group>;
}

function Grounds({match}) {
  const tiles = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const colors = ['#dcc6a6','#d6bd9c','#e0cbaa','#d9c3a4','#ddc8aa'];
    for(let y=0;y<8;y++) for(let x=0;x<9;x++) {
      ctx.fillStyle=colors[(x*13+y*7+x*y)%colors.length];
      ctx.fillRect(x*32-(y%2)*16,y*32,31,31);
    }
    const texture = new T.CanvasTexture(canvas);
    texture.colorSpace=T.SRGBColorSpace;
    texture.wrapS=texture.wrapT=T.RepeatWrapping;
    texture.repeat.set(6,7);
    texture.anisotropy=8;
    return texture;
  }, []);
  return <>
    <Box at={[0,-.31,0]} size={[330,.45,300]} color="#809360" cast={false}/>
    <Box at={[0,-.13,-12]} size={[104,.22,122]} color="#8b9c60" cast={false}/>
    <mesh position={[0,.005,8]} rotation={[-Math.PI/2,0,0]} receiveShadow>
      <planeGeometry args={[58,66]}/><meshStandardMaterial map={tiles}/>
    </mesh>
    <RoadSurface left={-49} right={51.125} from={frontPavement.start} to={frontPavement.roadStart} height={frontStreetHeight} color="#aa9581"/>
    <Box at={[0,frontPavement.height-.49,55]} size={[190,.98,9.05]} color="#707876" cast={false}/>
    {Array.from({length:25},(_,i)=><Box key={i} at={[(i-12)*6,frontPavement.height+.008,55]} size={[2.8,.015,.14]} color="#dbca9a" cast={false}/>)}
    <Box at={[-49,.62,-12]} size={[.3,1.24,117]} color="#bfa68a"/>
    <SideStreet match={match}/>
    <Box at={[0,.62,-71]} size={[98,1.24,.3]} color="#bfa68a"/>
    <EntryLandscape/>
    <EntrancePaths/>
    <Entrance/>
    <Box at={[4,.02,-54]} size={[39,.06,30]} color="#a76953"/>
    <Box at={[4,.063,-54]} size={[35,.04,26]} color="#5b8758"/>
    {[-16,16].map(x=><Box key={x} at={[4+x,.09,-54]} size={[.12,.02,23]} color="#ece6cf" cast={false}/>)}
    {[-11.5,11.5].map(z=><Box key={z} at={[4,.09,-54+z]} size={[32,.02,.12]} color="#ece6cf" cast={false}/>)}
    <Box at={[4,.09,-54]} size={[.12,.02,23]} color="#ece6cf" cast={false}/>
    <mesh position={[4,.105,-54]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[3.8,3.91,48]}/><meshBasicMaterial color="#ece6cf"/></mesh>
    <Courtyard/>
    <Trees/>
  </>;
}

function Marker({ place, onSelect }) {
  const mark = useRef();
  useFrame(({ clock }) => { mark.current.position.y = 1.48 + Math.sin(clock.elapsedTime * 2 + place.x)*.16; mark.current.rotation.y += .012; });
  return <group position={[place.x,groundHeight(place.x,place.z),place.z]} onClick={event=>{ if(event.delta < 5){event.stopPropagation();onSelect(place);} }}>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,.046,0]}><ringGeometry args={[.68,.85,32]}/><meshBasicMaterial color="#fdf1ad"/></mesh>
    <group ref={mark}>
      <mesh><octahedronGeometry args={[.48]}/><meshStandardMaterial color="#ffde76" emissive="#9d6a15" emissiveIntensity={.6}/></mesh>
      <mesh visible={false}><sphereGeometry args={[.85,8,6]}/><meshBasicMaterial/></mesh>
    </group>
  </group>;
}

function Player({ state, mode, onNear, person, sound }) {
  const avatar = useRef(), last = useRef('');
  const legs = [useRef(),useRef()], arms = [useRef(),useRef()], tails = [useRef(),useRef()];
  const target = useMemo(()=>new T.Vector3(),[]);
  const eye = useMemo(()=>new T.Vector3(),[]);
  useFrame(({camera,clock}, elapsed) => {
    const s = state.current, dt = Math.min(elapsed,.04);
    const forward = +(s.keys.has('w') || s.keys.has('arrowup')) - +(s.keys.has('s') || s.keys.has('arrowdown')) - s.stick.y;
    const strafe = +(s.keys.has('d') || s.keys.has('arrowright')) - +(s.keys.has('a') || s.keys.has('arrowleft')) + s.stick.x;
    const mag = Math.max(1,Math.hypot(forward,strafe));
    const speed = (s.keys.has('shift') ? 11 : 6)*dt;
    const dx = (Math.sin(s.yaw)*forward + Math.cos(s.yaw)*strafe)/mag*speed;
    const dz = (-Math.cos(s.yaw)*forward + Math.sin(s.yaw)*strafe)/mag*speed;
    const priorX=s.x, priorZ=s.z;
    if (!s.paused) {
      if(!blocked(s.x+dx,s.z)) s.x+=dx;
      if(!blocked(s.x,s.z+dz)) s.z+=dz;
    }
    const place = nearby(s.x,s.z);
    if((place?.id || '') !== last.current) { last.current=place?.id || ''; onNear(place); }
    avatar.current.visible = mode==='TPS';
    const floor=groundHeight(s.x,s.z);
    avatar.current.position.set(s.x,floor,s.z);
    const moved = Math.hypot(s.x-priorX,s.z-priorZ);
    sound?.update(s.x,s.z,moved);
    const walking = moved>.001;
    if(walking) avatar.current.rotation.y = Math.atan2(-dx,-dz);
    const swing=walking?Math.sin(clock.elapsedTime*12):0;
    for(let i=0;i<2;i++){
      const phase=i===0?swing:-swing;
      legs[i].current.rotation.x=phase*(person.female?.29:.43);
      arms[i].current.rotation.x=-phase*.31;
      if(tails[i].current) tails[i].current.rotation.x=phase*.17+(walking?.06:0);
    }
    const fx=Math.sin(s.yaw), fz=-Math.cos(s.yaw);
    if (mode === 'FPS') {
      const eyeHeight=person.height-.12;
      camera.position.set(s.x,floor+eyeHeight,s.z);
      target.set(s.x+fx,floor+eyeHeight+Math.tan(s.pitch),s.z+fz);
    } else {
      let distance=8.6;
      for(let step=.5;step<8.7;step+=.5) {
        if(blocked(s.x-fx*step,s.z-fz*step,.18,62)){distance=Math.max(.6,step-.5);break;}
      }
      const entrance = Math.max(0, Math.min(1, (s.z - 37) / 11));
      eye.set(s.x-fx*distance, groundHeight(s.x-fx*distance,s.z-fz*distance)+2.1+distance*(.48-.20*entrance-s.pitch*.48), s.z-fz*distance);
      camera.position.copy(eye);
      target.set(s.x+fx*7,floor+2.1+s.pitch*10,s.z+fz*7);
    }
    camera.lookAt(target);
  });
  return <group ref={avatar}><Avatar person={person} legs={legs} arms={arms} tails={tails}/></group>;
}

export default function Scene({ state, mode, onNear, onSelect, person, sound, clubMatch }) {
  return <>
    <LiveSky/>
    <Grounds match={clubMatch}/>
    {buildings.map(data=><School key={data.id} data={data}/>)}
    {places.map(place=><Marker key={place.id} place={place} onSelect={onSelect}/>)}
    <Player state={state} mode={mode} onNear={onNear} person={person} sound={sound}/>
  </>;
}