// x increases rightward, z increases toward the front gate.
export const limits = { x: 48.8, front: 51, back: -70.8 };
export const start = { x: 0, z: 49, yaw: 0 };
export const buildings = [
  { id: 'a', name: 'Dãy A', x: -34, z: 5, w: 11, d: 55, floors: 3, door: [-24, 8], note: 'Dãy dài bên trái khi nhìn từ cổng vào sân.' },
  { id: 'b', name: 'Nhà hiệu bộ', x: 0, z: -27, w: 50, d: 11, floors: 1, door: [0, -19], note: 'Nhà hiệu bộ và phòng chức năng ở cuối sân theo sơ đồ trường.' },
  { id: 'c', name: 'Dãy C', x: 34, z: 4, w: 11, d: 57, floors: 3, door: [24, 8], note: 'Dãy dài bên phải khi nhìn từ cổng vào sân.' },
];
export const sideGate = { x:50.65, z:buildings[2].z, width:6.5 };
export const eastFence = [[-71,sideGate.z-sideGate.width/2],[sideGate.z+sideGate.width/2,46]];
export const eastRoad = { x:56.30, z:15, w:10*2/3, d:76 };
export const cafe = { x:64.5, z:19 };
export const cafeSeats = [
  {x:0,z:.91,yaw:0,shirt:'#263039',player:true},
  {x:0,z:-.91,yaw:Math.PI,shirt:'#e4ded0',player:true},
  {x:-.96,z:.09,yaw:-Math.PI/2,shirt:'#557584'},
  {x:.96,z:.12,yaw:Math.PI/2,shirt:'#81927a'},
];
export function cafePoint(x,z){return {x:cafe.x-z,z:cafe.z+x};}
export const hall = {x:44.4,z:19,w:7.7,d:16};
export const places = [
  { id: 'yard', name: 'Sân trường', x: -7, z: 11, note: 'Khoảng sân trung tâm nối ba dãy nhà. Từ đây có thể đi vòng qua hai bên để tới sân thể thao.' },
  ...buildings.map(({ id, name, door, note, floors }) => ({ id, name, x: door[0], z: door[1], note: note + (id === 'b' ? '' : ' Sơ đồ trường thể hiện trệt, lầu 1 và lầu 2.') })),
  { id: 'stage', name: 'Sân khấu', x: 0, z: -10.7, note: 'Sân khấu nằm trên trục lối vào, trước nhà hiệu bộ theo sơ đồ trường.' },
  { id: 'sport', name: 'Sân thể thao', x: 3, z: -44, note: 'Sân cỏ hình chữ nhật ở phía sau khu lớp học.' },
  { id: 'side-gate', name: 'Cổng phụ · Khu để xe học sinh', x: 51.4, z: sideGate.z, yaw: -Math.PI/2, note: 'Nhìn từ đường vào trường, nhà xe học sinh ở bên phải, nhà đa năng ở bên trái. Lối xi măng bên trái vòng về cổng chính.' },
  { id: 'cafe', name: 'Cà phê Xanh', ...cafePoint(0,5.9), yaw: Math.PI/2, note: 'Quán nằm đối diện nhà đa năng, bên kia đường. Hai người đánh cờ tướng, hai người ngồi xem.' },
  { id: 'gate', name: 'Cổng trường', x: 0, z: 43, note: 'Điểm vào khu tham quan từ phía đường trước trường. Vị trí cổng được ước lượng theo ảnh vệ tinh.' },
];
export const canopyRows = [-15, -8, 8, 15].map(x => ({ x, z: 11, w: 6.5, d: 21 }));
export const stage = { x: 0, z: -14, w: 14, d: 5 };
export const guard = { x: -6.95, z: 44.0, w: 4.57, d: 3.4 };
export const palms = [-4.9, 4.9].flatMap(x => [29, 33.8, 38.6].map(z => ({x,z,w:2.6,d:2.6})));
export const parking = [{x:-44,z:-2,w:6,d:31},{x:43,z:-10,w:6.2,d:16}];
export const flagBase = { x: 8, z: -15, w: 1.1, d: 1.1 };
export const obstacles = [...buildings, flagBase, stage, guard, ...palms,
  hall,
  ...[sideGate.z-3.25,sideGate.z+3.25].map(z=>({x:sideGate.x,z,w:.64,d:.68})),
  ...eastFence.map(([a,b])=>({x:sideGate.x,z:(a+b)/2,w:.3,d:b-a})),
  ...[sideGate.z-3.25,sideGate.z+3.25].map(z=>({x:sideGate.x-2.65,z,w:2.15,d:.14})),
  ...[
    [0,-2.22,.18,6.2],[-3.05,-.96,2.6,.16],[3.05,-.96,2.6,.16],
    [-.76,.22,.18,4.65],[2.77,.22,.18,.56],
    [.25,2.95,1.28,1.28],
    ...cafeSeats.map(p=>[.25+p.x,2.95+p.z,.53,.53]),
  ].map(([x,z,w,d])=>({...cafePoint(x,z),w,d})),
  ...[12,25,37,44].map((z,i)=>({x:i%2?60.55:51.95,z,w:.5,d:.5})),
  ...[-1,1].flatMap(side=>[
    {x:side===-1?-12:7.32,z:46.64,w:4.65,d:1.82},
    {x:side*16.1,z:47.3,w:3.55,d:1.8},
    ...[19.1,21.1,23.1].map(x=>({x:side*x,z:46.8,w:1.65,d:.58})),
  ]),
  ...[-1,1].map(side=>({x:side*26,z:45.8,w:45.5,d:1.1})),
  {x:2.16,z:46.1,w:2.02,d:.13},{x:-3.16,z:44.81,w:.14,d:1.91},
  ...parking.flatMap(p=>[-1,1].flatMap(a=>[-1,1].map(b=>({x:p.x+a*(p.w/2-.25),z:p.z+b*(p.d/2-.5),w:.25,d:.25})))),
  ...canopyRows.flatMap(row => [-1, 1].flatMap(side => [-9, 0, 9].map(z => ({ x: row.x + side * 3.12, z: row.z + z, w: .18, d: .18 }))))
];
export function blocked(x, z, radius = .38, front = limits.front) {
  const east = z > -22 + radius && z < 51 - radius ? 73 : limits.x;
  return x < -limits.x + radius || x > east - radius || z < limits.back + radius || z > front - radius ||
    obstacles.some(o => Math.abs(x - o.x) < o.w / 2 + radius && Math.abs(z - o.z) < o.d / 2 + radius);
}
export function nearby(x, z) {
  return places.find(place => Math.hypot(place.x - x, place.z - z) < (place.id==='cafe'?8:4.8));
}
export const frontPavement = { height:.907, start:45.8, roadStart:50.475 };
export const sidePavementHeight = .0755;
export function sideStreetHeight(z) {
  const blend=Math.max(0,Math.min(1,(z-43)/(frontPavement.roadStart-43)));
  return sidePavementHeight+(frontPavement.height-sidePavementHeight)*blend;
}
export function groundHeight(x,z) {
  if(z>=frontPavement.start && (x<=51.125 || z>=frontPavement.roadStart))return frontPavement.height;
  if(x>=51.125 && x<=61.375 && z>=-23)return sideStreetHeight(z);
  const slope=Math.max(0,Math.min(1,(z-27)/15));
  const edge=Math.max(0,Math.min(1,(34-Math.abs(x))/9));
  const road=Math.max(0,Math.min(1,(55-z)/4));
  return .84*slope*edge*road;
}
