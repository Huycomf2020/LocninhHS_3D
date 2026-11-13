import React from 'react';
import { useLoader } from '@react-three/fiber';
import * as T from 'three';
import crest from './assets/school-crest.jpg';

export const characters = [
  { id:'student-girl', name:'Học sinh nữ', height:1.55, female:true, student:true, shirt:'#fffaf0', pants:'#faf7ee', outfit:'Áo dài trắng · logo tay trái' },
  { id:'student-boy', name:'Học sinh nam', height:1.70, student:true, shirt:'#fffdf7', pants:'#25334b', outfit:'Sơ mi trắng, quần xanh đậm · logo tay trái' },
  { id:'teacher-woman', name:'Giáo viên nữ', height:1.55, female:true, shirt:'#df82a5', pants:'#f9e6e6', outfit:'Áo dài hồng' },
  { id:'teacher-man', name:'Giáo viên nam', height:1.70, shirt:'#c2dbe6', pants:'#202126', outfit:'Sơ mi xanh nhạt, quần tây đen' },
];
for(const [base,key,label,shirt] of [
 ['teacher-woman','peach','Cam đào','#edaa88'],['teacher-woman','lilac','Tím nhạt','#bda0dc'],
 ['teacher-man','white','Trắng','#faf3e7'],['teacher-man','sage','Xanh lá nhạt','#a8c3a6'],
]){
 const original=characters.find(p=>p.id===base);
 characters.push({...original,id:base+'-'+key,name:original.name+' · '+label,shirt,
   outfit:original.female?'Áo dài '+label.toLowerCase():'Sơ mi '+label.toLowerCase()+', quần tây đen'});
}


function Oval({ at, size, color, rotation }) {
  return <mesh position={at} scale={size} rotation={rotation} castShadow>
    <sphereGeometry args={[1,18,12]}/><meshStandardMaterial color={color} roughness={.82}/>
  </mesh>;
}

function Fabric({ at, radii, length, color, depth = .68, rotation }) {
  return <mesh position={at} rotation={rotation} scale={[1,1,depth]} castShadow>
    <cylinderGeometry args={[...radii,length,20]}/><meshStandardMaterial color={color} roughness={.9}/>
  </mesh>;
}

const blackHair='#211b1b';
const skin='#c9916f';
const dark='#282325';

function Crest() {
  const map=useLoader(T.TextureLoader,crest);
  map.colorSpace=T.SRGBColorSpace;
  map.anisotropy=8;
  return <mesh position={[-.058,-.086,-.022]} rotation={[0,-1.03,0]}>
    <circleGeometry args={[.031,28]}/><meshBasicMaterial map={map} polygonOffset polygonOffsetFactor={-1}/>
  </mesh>;
}

function Head({ person }) {
  return <>
    {person.female&&<Oval at={[0,1.404,.072]} size={[.097,person.student?.153:.109,.064]} color={blackHair}/>}
    <Oval at={[0,1.561,0]} size={[.089,.111,.081]} color={skin}/>
    <Oval at={[0,1.628,.014]} size={[.094,.072,.082]} color={blackHair}/>
    <Oval at={[person.student?-.027:.024,1.634,-.052]} size={[.067,.035,.049]} rotation={[0,0,.26]} color={blackHair}/>
    {[-1,1].map(side=><React.Fragment key={side}>
      <Oval at={[side*.087,1.558,.002]} size={[.014,.025,.016]} color={skin}/>
      <Oval at={[side*.034,1.57,-.076]} size={[.020,.009,.007]} color="#f5e7dc"/>
      <Oval at={[side*.034,1.57,-.083]} size={[.009,.009,.004]} color="#322626"/>
      <Oval at={[side*.035,1.595,-.077]} size={[.022,.004,.004]} rotation={[0,0,-side*.1]} color={blackHair}/>
    </React.Fragment>)}
    <Oval at={[0,1.544,-.078]} size={[.015,.018,.022]} color={skin}/>
    <Oval at={[0,1.514,-.071]} size={[.022,.004,.004]} color="#914e49"/>
    <Fabric at={[0,1.447,0]} radii={[.038,.042]} length={.093} color={skin} depth={.86}/>
  </>;
}

function TunicTail({ at, color, pivot }) {
  return <group position={at} ref={pivot}>
    <mesh position={[0,-.276,0]} scale={[1,1,.14]} castShadow>
      <cylinderGeometry args={[.123,.164,.558,24]}/><meshStandardMaterial color={color} roughness={.89}/>
    </mesh>
  </group>;
}

// Facing -Z. Anatomical left is -X.
export function Avatar({ person, legs, arms, tails }) {
  const {female,student,shirt,pants}=person;
  return <group scale={person.height/1.70}>
    <Head person={person}/>
    <Oval at={[0,1.30,0]} size={[female?.166:.19,.112,.09]} color={shirt}/>
    <Fabric at={[0,1.197,0]} radii={[female?.155:.174,female?.116:.143]} length={.27} color={shirt}/>
    <Fabric at={[0,1.013,0]} radii={[female?.118:.145,.145]} length={.135} color={female?shirt:pants}/>
    <Fabric at={[0,1.402,0]} radii={[.048,.057]} length={.055} color={shirt} depth={.9}/>
    {!female&&<>
      <Oval at={[0,1.203,-.095]} size={[.005,.14,.004]} color="#b8c2be"/>
      {[1.13,1.21,1.29,1.35].map(y=><Oval key={y} at={[0,y,-.102]} size={[.006,.006,.004]} color="#f7f4e9"/>)}
      {[-1,1].map(side=><Oval key={side} at={[side*.028,1.37,-.061]} size={[.025,.037,.014]} rotation={[0,0,-side*.44]} color="#e9f0ee"/>)}
    </>}
    {female&&[-1,1].map((side,i)=><TunicTail key={side} at={[0,.99,side*.075]} color={shirt} pivot={tails?.[i]}/>)}
    {[-1,1].map((side,i)=><React.Fragment key={side}>
      <group position={[side*(female?.149:.172),1.345,0]} rotation={[0,0,side*.16]} ref={arms?.[i]}>
        <Oval at={[0,-.031,0]} size={[.058,.073,.057]} color={shirt}/>
        <Fabric at={[0,-.103,0]} radii={[.052,.041]} length={.174} color={shirt} depth={.94}/>
        <Fabric at={[0,-.264,0]} radii={[.040,.028]} length={.161} color={!female&&student?skin:shirt} depth={.92}/>
        <Oval at={[0,-.362,-.004]} size={[.029,.059,.023]} color={skin}/>
        {student&&side===-1&&<Crest/>}
      </group>
      <group position={[side*.073,.986,0]} ref={legs?.[i]}>
        <Fabric at={[0,-.242,0]} radii={[.074,.061]} length={.48} color={pants} depth={.96}/>
        <Fabric at={[0,-.679,0]} radii={[.061,female?.065:.047]} length={.409} color={pants} depth={.93}/>
        <Oval at={[0,-.941,-.035]} size={[.058,.045,.104]} color={student?'#252b31':dark}/>
      </group>
    </React.Fragment>)}
  </group>;
}
