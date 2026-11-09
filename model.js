
(async()=>{
const root=document.getElementById('compressor-site'), stage=root.querySelector('.stage'), load=root.querySelector('.load');
try {
const T=await import('./vendor/three.module.js');
const $=s=>root.querySelector(s), buttons=[...root.querySelectorAll('[data-c3-phase]')];
const probe=document.createElement('span');probe.hidden=true;root.append(probe);
function color(expr){probe.style.color=expr;return new T.Color(getComputedStyle(probe).color);}
let bg,fg,low,high,metalColor;
const scene=new T.Scene(), camera=new T.PerspectiveCamera(38,1,.1,100);
const renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
renderer.setClearColor(0,0);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;
const {RoomEnvironment}=await import('./vendor/RoomEnvironment.js');
const pmrem=new T.PMREMGenerator(renderer),studio=new RoomEnvironment();
scene.environment=pmrem.fromScene(studio,.04).texture;studio.dispose();pmrem.dispose();
renderer.domElement.setAttribute('role','img');renderer.domElement.setAttribute('aria-label','可旋转的压缩机三维剖切模型，含真实立体机壳、气缸、活塞、连杆、曲轴和阀片');stage.prepend(renderer.domElement);
const amb=new T.HemisphereLight(0xc7e0ed,0x3b4237,.65);scene.add(amb);
const key=new T.DirectionalLight(0xfff2dd,3.6);key.position.set(5,10,8);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-5;key.shadow.camera.right=5;key.shadow.camera.top=7;key.shadow.camera.bottom=-5;key.shadow.normalBias=.025;key.shadow.radius=3;scene.add(key);
const rim=new T.DirectionalLight(0xc3e2ff,2.8);rim.position.set(-5,4,-6);scene.add(rim);
const fill=new T.DirectionalLight(0xcbdcff,.8);fill.position.set(-4,1,6);scene.add(fill);
const metal=new T.MeshStandardMaterial({metalness:.72,roughness:.3});
const cast=new T.MeshStandardMaterial({metalness:.45,roughness:.68});
const cutMat=new T.MeshStandardMaterial({metalness:.5,roughness:.4,side:T.DoubleSide});
const dark=new T.MeshStandardMaterial({metalness:.45,roughness:.5});
const bright=new T.MeshStandardMaterial({metalness:.8,roughness:.22});
const gasMat=new T.MeshStandardMaterial({transparent:true,opacity:.13,depthWrite:false,roughness:1,side:T.DoubleSide});
const suctionMat=new T.MeshStandardMaterial({roughness:.4,metalness:.18});
const dischargeMat=suctionMat.clone();
const brass=new T.MeshStandardMaterial({color:0xaa8450,metalness:.88,roughness:.28});
// 可复现的细微铸造颗粒，避免均匀塑料表面。
function castTexture(){const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d'),im=x.createImageData(256,256);let seed=20261109;for(let i=0;i<im.data.length;i+=4){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const n=110+(seed>>>24)*.23;im.data[i]=im.data[i+1]=im.data[i+2]=n;im.data[i+3]=255;}x.putImageData(im,0,0);const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(5,5);return t;}
cast.bumpMap=castTexture();cast.bumpScale=.014;cast.roughness=.52;cast.metalness=.45;
const model=new T.Group();scene.add(model);
const fullPieces=new T.Group(),cutPieces=new T.Group();model.add(fullPieces,cutPieces);
function mesh(g,m,parent=model,name=''){const o=new T.Mesh(g,m);o.castShadow=true;o.receiveShadow=true;o.userData.name=name;parent.add(o);return o;}
function cyl(radius,height,x,y,z,material=metal,parent=model,name='',axis='y'){
 const o=mesh(new T.CylinderGeometry(radius,radius,height,64),material,parent,name);o.position.set(x,y,z);if(axis==='z')o.rotation.x=Math.PI/2;if(axis==='x')o.rotation.z=Math.PI/2;return o;
}
function box(w,h,d,x,y,z,mat=cast,parent=model,name=''){const o=mesh(new T.BoxGeometry(w,h,d),mat,parent,name);o.position.set(x,y,z);return o;}
function ring(radius,tube,x,y,z,mat=metal,parent=model,name='',axis='y'){
 const o=mesh(new T.TorusGeometry(radius,tube,12,80),mat,parent,name);o.position.set(x,y,z);if(axis==='y')o.rotation.x=Math.PI/2;if(axis==='x')o.rotation.y=Math.PI/2;return o;
}
function sleeve(inner,outer,bottom,top,parent,material=cast,half=true,name='气缸剖面'){
 const points=[[inner,bottom],[outer,bottom],[outer,top],[inner,top],[inner,bottom]].map(p=>new T.Vector2(...p));
 const start=half?Math.PI/2:0, len=half?Math.PI:Math.PI*2;
 const o=mesh(new T.LatheGeometry(points,80,start,len),material,parent,name);
 if(half)for(const a of [start,start+len]){
  const p=[[inner,bottom],[outer,bottom],[outer,top],[inner,top]].map(([r,y])=>[r*Math.sin(a),y,r*Math.cos(a)]);
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute([...p[0],...p[1],...p[2],...p[0],...p[2],...p[3]],3));geo.computeVertexNormals();mesh(geo,cutMat,parent,name);
 }
 return o;
}
// 底座、脚座、地脚孔与紧固件。
box(3.9,.18,2.5,0,-2.79,0,cast,model,'铸造安装底座');
for(const x of [-1.45,1.45])for(const z of [-.9,.9]){
 box(.65,.36,.56,x,-2.55,z,cast,model,'安装脚座');
 cyl(.115,.06,x,-2.59,z,dark,model,'地脚螺栓孔');ring(.15,.025,x,-2.55,z,bright);
}
for(const x of [-.95,.95])box(.24,.56,1.1,x,-2.32,0,cast,model,'机座支撑肋');
// 圆形曲轴箱：前盖可拆去，保留有厚度的箱体和加工法兰。
const crankcase=new T.Group();model.add(crankcase);crankcase.position.y=-1.1;crankcase.rotation.x=Math.PI/2;
sleeve(1.29,1.48,-.73,.73,crankcase,cast,false,'曲轴箱体');
cyl(1.42,.12,0,-1.1,-.8,cast,model,'曲轴箱后盖','z');
ring(1.39,.065,0,-1.1,.77,bright,model,'曲轴箱法兰','z');
cyl(1.38,.14,0,-1.1,.82,cast,fullPieces,'曲轴箱前盖','z');
cyl(.4,.14,0,-1.1,.96,cast,fullPieces,'前盖主轴承座','z');
ring(.29,.035,0,-1.1,1.04,bright,fullPieces,'轴承端盖密封圈','z');
// 检修油镜、放油螺塞与机型标识，让外壳具有设备细节。
ring(.17,.038,.66,-1.46,.93,bright,fullPieces,'曲轴箱油位观察窗','z');
cyl(.14,.025,.66,-1.46,.93,brass,fullPieces,'油位观察窗','z');
const plug=mesh(new T.CylinderGeometry(.12,.12,.11,6),bright,model,'放油螺塞');plug.rotation.x=Math.PI/2;plug.position.set(.48,-2.24,.86);
const badgeCanvas=document.createElement('canvas');badgeCanvas.width=512;badgeCanvas.height=160;
const badgeCtx=badgeCanvas.getContext('2d');badgeCtx.fillStyle='#192327';badgeCtx.fillRect(0,0,512,160);badgeCtx.fillStyle='#ced7d7';badgeCtx.font='48px monospace';badgeCtx.fillText('PC—01',40,70);badgeCtx.font='19px monospace';badgeCtx.fillText('SINGLE CYLINDER',42,117);
const badgeTexture=new T.CanvasTexture(badgeCanvas);badgeTexture.colorSpace=T.SRGBColorSpace;
const badge=mesh(new T.BoxGeometry(.64,.2,.025),new T.MeshStandardMaterial({map:badgeTexture,metalness:.55,roughness:.45}),fullPieces,'机型标识牌');badge.position.set(-.14,-.48,.91);
for(let i=0;i<10;i++){const a=i*Math.PI/5;cyl(.09,.12,1.37*Math.sin(a),-1.1+1.37*Math.cos(a),.85,bright,model,'前盖紧固螺栓','z');}
// 连续气缸壁、散热片和缸体法兰，剖切时保留后半实体。
for(const [parent,half] of [[cutPieces,true],[fullPieces,false]]){
 sleeve(1.015,1.16,.2,3.74,parent,cast,half,'气缸壁');
 for(let y=.58;y<3.6;y+=.25)sleeve(1.15,1.34,y,y+.06,parent,metal,half,'气缸散热片');
 sleeve(1.02,1.43,.25,.43,parent,cast,half,'缸体安装法兰');
 sleeve(0,1.34,3.74,3.87,parent,bright,half,'阀板');
 sleeve(1.08,1.3,3.87,4.45,parent,cast,half,'缸盖与气腔');
 sleeve(0,1.32,4.45,4.57,parent,cast,half,'缸盖顶盖');
}
// 分开的吸排气腔，避免两侧管路相通。
box(.12,.53,1.13,0,4.15,-.54,cast,cutPieces,'吸排气腔隔板');
box(.12,.53,2.15,0,4.15,0,cast,fullPieces,'吸排气腔隔板');
for(const x of [-.94,.94])for(const z of [-.71,.71]){
 cyl(.065,4.13,x,2.43,z,bright,model,'缸体贯穿螺柱');
 const nut=mesh(new T.CylinderGeometry(.12,.12,.12,6),bright,model,'缸盖螺母');nut.position.set(x,4.64,z);
 cyl(.065,.12,x,4.73,z,metal,model,'螺柱端部');
}
for(let x=-.8;x<.9;x+=.27)box(.055,.06,1.48,x,4.6,-.28,cast,cutPieces,'缸盖加强肋');
// 管路、连接法兰、螺栓和管接头。
function pipe(side,mat,name){
 const pts=[[side*.72,4.16,-.28],[side*1.4,4.16,-.28],[side*1.86,4.02,-.28],[side*2.05,3.59,-.28],[side*2.47,3.59,-.28]].map(p=>new T.Vector3(...p));
 mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),56,.13,16,false),metal,model,name);
 cyl(.27,.11,side*1.27,4.16,-.28,bright,model,name+'连接法兰','x');
 const connector=new T.Group();connector.position.set(side*2.4,3.59,-.28);connector.rotation.z=Math.PI/2;model.add(connector);sleeve(.105,.22,-.14,.14,connector,brass,false,name+'空心管接头');
 for(let i=-2;i<3;i++)ring(.22,.008,side*2.4+i*.04,3.59,-.28,brass,model,name+'螺纹','x');
 ring(.218,.018,side*2.56,3.59,-.28,mat,model,name+'压力侧标记','x');
 for(let i=0;i<4;i++){const a=i*Math.PI/2;cyl(.045,.15,side*1.29,4.16+.205*Math.cos(a),-.28+.205*Math.sin(a),dark,model,'法兰螺栓','x');}
}
pipe(-1,suctionMat,'吸气管：来自蒸发器');pipe(1,dischargeMat,'排气管：通向冷凝器');
// 活塞为有顶盖的空心裙部，销轴贯穿两侧，环槽独立建模。
const piston=new T.Group();model.add(piston);
sleeve(.79,.985,-.86,-.1,piston,bright,false,'活塞裙部');
cyl(.985,.10,0,-.05,0,bright,piston,'活塞顶');
for(const y of [-.17,-.24,-.33]){sleeve(.977,1.0,y,y+.035,piston,dark,false,'活塞环');}
cyl(.14,1.77,0,-.51,0,metal,piston,'活塞销','z');
for(const z of [-.69,.69])cyl(.24,.18,0,-.51,z,bright,piston,'活塞销座','z');
// 曲轴、曲柄臂、曲柄销、轴瓦与后侧皮带轮。
cyl(.22,2.95,0,-1.1,-.34,bright,model,'曲轴主轴','z');
for(const z of [-.71,.71]){ring(.27,.085,0,-1.1,z,dark,model,'主轴承','z');}
const crank=new T.Group();model.add(crank);crank.position.y=-1.1;
for(const z of [-.37,.37]){
 const web=box(.42,1.18,.16,0,.45,z,metal,crank,'曲柄臂');
 cyl(.4,.18,0,-.20,z,metal,crank,'曲轴配重','z');
}
cyl(.165,.94,0,1,0,bright,crank,'曲柄销','z');
const pulley=new T.Group();model.add(pulley);pulley.position.set(0,-1.1,-1.69);
ring(.97,.12,0,0,0,cast,pulley,'传动皮带轮','z');
for(const z of [-.12,.12])ring(.97,.055,0,0,z,bright,pulley,'皮带轮槽','z');
cyl(.29,.38,0,0,0,metal,pulley,'皮带轮轮毂','z');
for(let i=0;i<6;i++){const a=i*Math.PI/3;const spoke=box(.13,.77,.14,Math.sin(a)*.58,Math.cos(a)*.58,0,cast,pulley,'皮带轮辐条');spoke.rotation.z=-a;}
const rod=new T.Group();model.add(rod);
box(.22,2.55,.19,0,1.6,0,metal,rod,'连杆杆身');
box(.085,2.52,.235,0,1.6,0,bright,rod,'连杆加强筋');
ring(.25,.10,0,0,0,metal,rod,'连杆大头','z');ring(.14,.068,0,3.2,0,metal,rod,'连杆小头','z');
for(const x of [-.29,.29]){cyl(.055,.42,x,-.01,0,bright,rod,'连杆大头螺栓');cyl(.075,.08,x,-.22,0,dark,rod,'连杆螺母');}
// 阀片在气缸两侧端口独立启闭：吸气向缸内，排气向缸外。
for(const x of [-.48,.48]){ring(.18,.034,x,3.775,.17,bright,model,'阀门阀座');}
const inletValve=new T.Group(),outletValve=new T.Group();model.add(inletValve,outletValve);
inletValve.position.set(-.48,3.745,-.12);outletValve.position.set(.48,3.88,-.12);
box(.34,.035,.62,0,0,.28,suctionMat,inletValve,'吸气阀片');box(.34,.035,.62,0,0,.28,dischargeMat,outletValve,'排气阀片');
// 透明气体体积和动态颗粒；并非液面或材料零件。
const gas=cyl(.96,1,0,3,0,gasMat,model,'缸内制冷剂蒸气');gas.castShadow=false;gas.receiveShadow=false;
const particleGeo=new T.SphereGeometry(.035,8,6);
const particles=Array.from({length:32},(_,i)=>{const o=mesh(particleGeo,i<16?suctionMat:dischargeMat,model,'制冷剂蒸气流向');o.castShadow=false;return o;});
const flow=new T.Group();model.add(flow);
const inArrows=[],outArrows=[];
for(let i=0;i<3;i++){
 const a=new T.ArrowHelper(new T.Vector3(0,-1,0),new T.Vector3(-.48,3.5-i*.25,.23),.22,0, .075,.06);flow.add(a);inArrows.push(a);
 const b=new T.ArrowHelper(new T.Vector3(0,1,0),new T.Vector3(.48,3.34+i*.25,.23),.22,0,.075,.06);flow.add(b);outArrows.push(b);
}
const ground=new T.Mesh(new T.PlaneGeometry(12,9),new T.ShadowMaterial({opacity:.17}));ground.rotation.x=-Math.PI/2;ground.position.y=-2.9;ground.receiveShadow=true;scene.add(ground);
function theme(){
 bg=color('var(--background)');fg=color('var(--foreground)');low=color('var(--viz-series-1,var(--blue))');high=color('var(--viz-series-2,var(--orange))');
 metal.color.set(0x8c9a9f);cast.color.set(0x29474b);cutMat.color.set(0x929da1);dark.color.set(0x242c31);bright.color.set(0xc4cccf);
 suctionMat.color.copy(low);dischargeMat.color.copy(high);inArrows.forEach(a=>a.setColor(low));outArrows.forEach(a=>a.setColor(high));
 ground.material.opacity=.35;
}
let angle=100,running=false,cut=false,az=.47,elev=.13,zoom=1,last=0,phase=-1,frame=0;
const details=['再膨胀：两阀关闭，活塞下行，余隙内的高压蒸气膨胀降压。','吸气：吸气阀开启，活塞下行，低压蒸气进入气缸。','压缩：两阀关闭，活塞上行，缸内容积减小、压力升高。','排气：排气阀开启，活塞上行，高压蒸气排向冷凝器。'];
function calc(a){const t=a*Math.PI/180,pin=-1.1+Math.cos(t)+Math.sqrt(3.2**2-Math.sin(t)**2),v=.07+(3.1-pin)/2;const k=a<180?(v<.07*4**(1/1.2)?0:1):(v>1.07/4**(1/1.2)?2:3);return {t,pin,v,k,p:k===0?4*(.07/v)**1.2:k===1?1:k===2?(1.07/v)**1.2:4};}
function update(){
 const s=calc(angle),top=s.pin+.51;crank.rotation.z=-s.t;pulley.rotation.z=-s.t;piston.position.y=top;
 const px=Math.sin(s.t),py=-1.1+Math.cos(s.t);rod.position.set(px,py,0);rod.rotation.z=Math.atan2(px,s.pin-py);
 inletValve.rotation.x=s.k===1?.30:0;outletValve.rotation.x=s.k===3?-.30:0;
 const gh=Math.max(.001,3.75-top);gas.scale.y=gh;gas.position.y=top+gh/2;gas.material.color.copy(low).lerp(high,(s.p-1)/3);
 gas.visible=cut;flow.visible=cut;inArrows.forEach(a=>a.visible=s.k===1);outArrows.forEach(a=>a.visible=s.k===3);
 particles.forEach((o,i)=>{o.visible=cut;const r=.83*Math.sqrt((i+.5)/32),a=i*2.39996;o.position.set(r*Math.cos(a),top+.035+((i*.137+angle*.002)%1)*Math.max(.01,gh-.07),r*Math.sin(a));o.material=s.p>2?dischargeMat:suctionMat;});
 fullPieces.visible=!cut;cutPieces.visible=cut;
 $('#c3-cut').checked=cut;$('#view-state').textContent=cut?'内部剖切':'完整外观';
 $('#c3-degrees').value=angle.toFixed(0)+'°';$('#c3-angle').value=angle;
 $('#c3-in').textContent='吸气阀：'+(s.k===1?'开启':'关闭');$('#c3-out').textContent='排气阀：'+(s.k===3?'开启':'关闭');$('#c3-p').textContent='相对缸压：'+s.p.toFixed(2);
 if(phase!==s.k){phase=s.k;buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===phase)));$('#c3-detail').textContent=details[phase];}
}
function cameraUpdate(){const aspect=stage.clientWidth/stage.clientHeight;const r=zoom*Math.max(12.6,6.6/aspect);camera.aspect=aspect;camera.position.set(r*Math.cos(elev)*Math.sin(az),.8+r*Math.sin(elev),r*Math.cos(elev)*Math.cos(az));camera.lookAt(0,.8,0);camera.updateProjectionMatrix();}
function draw(){renderer.render(scene,camera);}
function playUI(){$('#c3-play').textContent=running?'暂停运转':'播放运转';$('#c3-play').setAttribute('aria-pressed',String(running));}
function save(){try{localStorage.setItem('compressor-studio-view',JSON.stringify({angle,cut,az,elev,zoom}));}catch{}}
function restore(p){if(!p||!Number.isFinite(p.angle))return;angle=Math.max(0,Math.min(360,p.angle));cut=p.cut===true;az=Number.isFinite(p.az)?p.az:.47;elev=Number.isFinite(p.elev)?Math.max(-.25,Math.min(1.15,p.elev)):.13;zoom=Number.isFinite(p.zoom)?Math.max(.6,Math.min(1.8,p.zoom)):1;running=false;playUI();update();cameraUpdate();draw();}
$('#c3-play').onclick=()=>{running=!running;if(running)cut=true;last=0;playUI();update();draw();save();};
$('#c3-cut').onchange=()=>{cut=$('#c3-cut').checked;update();draw();save();};
$('#c3-angle').oninput=()=>{running=false;angle=+$('#c3-angle').value;playUI();update();draw();};$('#c3-angle').onchange=save;
buttons.forEach((b,i)=>b.onclick=()=>{angle=[20,100,230,330][i];running=false;cut=true;playUI();update();draw();save();});
$('#c3-view').onchange=()=>{[az,elev]=({oblique:[.47,.13],front:[0,.03],side:[Math.PI/2,.12],rear:[Math.PI,.15]})[$('#c3-view').value];cameraUpdate();draw();save();};
$('#home-view').onclick=()=>{az=.47;elev=.13;zoom=1;$('#c3-view').value='oblique';cameraUpdate();draw();save();};
$('#fullscreen').onclick=async()=>{const el=$('.viewer');try{if(document.fullscreenElement)await document.exitFullscreen();else await el.requestFullscreen();}catch{$('#c3-part').textContent='当前浏览器不支持全屏，可使用滚轮放大模型。';}};
document.addEventListener('fullscreenchange',()=>{$('#fullscreen').setAttribute('aria-label',document.fullscreenElement?'退出全屏':'全屏查看');});
const pointer=new Map();let dragDistance=0,startDistance=0,startZoom=1;
renderer.domElement.addEventListener('pointerdown',e=>{pointer.set(e.pointerId,{x:e.clientX,y:e.clientY});dragDistance=0;renderer.domElement.setPointerCapture(e.pointerId);if(pointer.size===2){const [a,b]=[...pointer.values()];startDistance=Math.hypot(a.x-b.x,a.y-b.y);startZoom=zoom;}});
renderer.domElement.addEventListener('pointermove',e=>{const old=pointer.get(e.pointerId);if(!old)return;const dx=e.clientX-old.x,dy=e.clientY-old.y;dragDistance+=Math.abs(dx)+Math.abs(dy);pointer.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointer.size===2){const[a,b]=[...pointer.values()];zoom=Math.max(.6,Math.min(1.8,startZoom*startDistance/Math.max(1,Math.hypot(a.x-b.x,a.y-b.y))));}else {az-=dx*.008;elev=Math.max(-.25,Math.min(1.15,elev+dy*.007));}cameraUpdate();draw();});
const raycaster=new T.Raycaster();
renderer.domElement.addEventListener('pointerup',e=>{pointer.delete(e.pointerId);if(dragDistance<6){const r=renderer.domElement.getBoundingClientRect();raycaster.setFromCamera(new T.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);const hits=raycaster.intersectObject(model,true).filter(h=>{let o=h.object;while(o){if(!o.visible)return false;o=o.parent;}return h.object.userData.name && h.object!==gas && !particles.includes(h.object);});if(hits[0])$('#c3-part').textContent='部件：'+hits[0].object.userData.name;}save();});
renderer.domElement.addEventListener('pointercancel',e=>pointer.delete(e.pointerId));
let wheelTimer;renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.6,Math.min(1.8,zoom*Math.exp(e.deltaY*.001)));cameraUpdate();draw();clearTimeout(wheelTimer);wheelTimer=setTimeout(save,250);},{passive:false});
new ResizeObserver(()=>{renderer.setSize(stage.clientWidth,stage.clientHeight);cameraUpdate();draw();}).observe(stage);
theme();update();cameraUpdate();try{restore(JSON.parse(localStorage.getItem('compressor-studio-view')));}catch{}draw();load.hidden=true;
root.dataset.ready='true';
function tick(t){frame=requestAnimationFrame(tick);if(running&&!document.hidden){if(last)angle=(angle+Math.min(100,t-last)*.04)%360;update();draw();}last=t;}
requestAnimationFrame(tick);
renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();running=false;playUI();load.hidden=false;load.textContent='三维显示已中断，请重新打开模型。';});
}catch(err){load.hidden=false;load.setAttribute('role','alert');load.textContent='三维模型未能加载，请重新打开。';console.error(err);}
})();
