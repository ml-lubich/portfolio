import { mulberry32 } from "./prng"
import type { ArtifactKind } from "./plan"

/**
 * Hand-authored, self-contained mini apps. No LLM, no network, no sound.
 * Each returns a complete HTML document; the seed only picks hue and a few knobs.
 * Document order is head styles, body markup, then script, which is also the
 * reveal order (skeleton, layout, colours, interactivity).
 */
type P = { h: number; n: (lo: number, hi: number) => number; seed: number }

const doc = (title: string, p: P, css: string, body: string, js = "") =>
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>` +
  `*{box-sizing:border-box;margin:0;padding:0}html,body{height:100%}` +
  `body{--h:${p.h};--a:hsl(var(--h) 90% 62%);--b:hsl(var(--h) 30% 9%);--f:hsl(var(--h) 25% 92%);background:var(--b);color:var(--f);font:12px ui-monospace,Menlo,monospace;display:grid;place-items:center;overflow:hidden}` +
  `${css}</style></head><body>${body}${js ? `<script>${js}</script>` : ""}</body></html>`

const CANVAS = `var c=document.getElementById("c"),x=c.getContext("2d"),W=c.width=innerWidth,H=c.height=innerHeight;`

const gen: Record<ArtifactKind, (p: P) => string> = {
  "generative-art": (p) =>
    doc("art", p, `canvas{position:fixed;inset:0}`, `<canvas id="c"></canvas>`,
      CANVAS + `var f=${p.n(3, 9) / 100},m=${p.n(40, 90)},t=0,ps=[];for(var i=0;i<m;i++)ps.push([Math.random()*W,Math.random()*H]);
x.fillStyle="#000";x.fillRect(0,0,W,H);
function d(){x.fillStyle="rgba(0,0,0,.06)";x.fillRect(0,0,W,H);t+=.01;
for(var i=0;i<m;i++){var q=ps[i],a=Math.sin(q[0]*f*.1+t)*3+Math.cos(q[1]*f*.1-t)*3;
x.strokeStyle="hsl("+(${p.h}+i*3)+" 90% 65%)";x.beginPath();x.moveTo(q[0],q[1]);q[0]+=Math.cos(a)*2;q[1]+=Math.sin(a)*2;x.lineTo(q[0],q[1]);x.stroke();
if(q[0]<0||q[0]>W||q[1]<0||q[1]>H){q[0]=Math.random()*W;q[1]=Math.random()*H}}requestAnimationFrame(d)}d()`),

  snake: (p) =>
    doc("snake", p, `canvas{width:100%;height:100%;image-rendering:pixelated}#s{position:fixed;top:4px;left:8px;color:var(--a)}`,
      `<canvas id="c" width="${p.n(14, 20)}" height="${p.n(10, 14)}"></canvas><div id="s">0</div>`,
      `var c=document.getElementById("c"),x=c.getContext("2d"),W=c.width,H=c.height,sn=[[2,2],[1,2],[0,2]],dr=[1,0],f=[W-3,H-3],sc=0;
function nf(){f=[Math.floor(Math.random()*W),Math.floor(Math.random()*H)]}
function hit(a,b){return sn.some(function(s){return s[0]==a&&s[1]==b})}
function ai(){var h=sn[0],o=[[1,0],[-1,0],[0,1],[0,-1]].filter(function(d){var a=h[0]+d[0],b=h[1]+d[1];return a>=0&&b>=0&&a<W&&b<H&&!hit(a,b)});
if(!o.length){sn=[[2,2],[1,2],[0,2]];dr=[1,0];sc=0;return}
o.sort(function(p,q){return Math.abs(h[0]+p[0]-f[0])+Math.abs(h[1]+p[1]-f[1])-Math.abs(h[0]+q[0]-f[0])-Math.abs(h[1]+q[1]-f[1])});dr=o[0]}
addEventListener("keydown",function(e){var m={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]}[e.key];if(m)dr=m});
setInterval(function(){ai();var h=[sn[0][0]+dr[0],sn[0][1]+dr[1]];sn.unshift(h);if(h[0]==f[0]&&h[1]==f[1]){sc++;nf();document.getElementById("s").textContent=sc}else sn.pop();
x.fillStyle="#0b0d14";x.fillRect(0,0,W,H);x.fillStyle="#ff5d73";x.fillRect(f[0],f[1],1,1);
sn.forEach(function(s,i){x.fillStyle="hsl(${p.h} 85% "+(70-i*2)+"%)";x.fillRect(s[0],s[1],1,1)})},90)`),

  clock: (p) =>
    doc("clock", p, `.f{position:relative;width:min(70vw,70vh);aspect-ratio:1;border:2px solid var(--a);border-radius:50%}
.h{position:absolute;left:50%;bottom:50%;width:2px;background:var(--f);transform-origin:50% 100%}#hh{height:22%}#mm{height:32%}#ss{height:38%;background:var(--a);width:1px}
.d{position:fixed;bottom:6px;font-size:14px;color:var(--a);letter-spacing:.1em}`,
      `<div class="f"><i class="h" id="hh"></i><i class="h" id="mm"></i><i class="h" id="ss"></i></div><div class="d" id="d"></div>`,
      `function t(){var n=new Date,s=n.getSeconds(),m=n.getMinutes()+s/60,h=n.getHours()%12+m/60;
document.getElementById("ss").style.transform="rotate("+s*6+"deg)";document.getElementById("mm").style.transform="rotate("+m*6+"deg)";document.getElementById("hh").style.transform="rotate("+h*30+"deg)";
document.getElementById("d").textContent=n.toTimeString().slice(0,8)}t();setInterval(t,250)`),

  terminal: (p) => {
    const lines = ["$ boot agent-os", "loading modules... ok", "mounting /dev/ideas", "$ ls projects", "portfolio  agents  mlbot  forks", "$ cat vibes.txt", "immaculate", "$ ship --yes", "shipped. nobody was harmed."]
    const start = p.n(0, 3)
    return doc("terminal", p, `body{display:block;padding:8px;background:#06100a;color:#4cff9a}#o{white-space:pre-wrap;line-height:1.5}#o:after{content:"_";animation:b 1s steps(1) infinite}@keyframes b{50%{opacity:0}}`,
      `<div id="o"></div>`,
      `var L=${JSON.stringify(lines)},i=${start},j=0,o=document.getElementById("o"),s="";
setInterval(function(){var l=L[i%L.length];if(j<l.length){s+=l[j++]}else{s+="\\n";j=0;i++;if(s.split("\\n").length>10)s=s.split("\\n").slice(-9).join("\\n")}o.textContent=s},45)`)
  },

  fireworks: (p) =>
    doc("fireworks", p, `canvas{position:fixed;inset:0;cursor:crosshair}`, `<canvas id="c"></canvas>`,
      CANVAS + `var ps=[];function b(a,b2){var h=Math.random()*60+${p.h};for(var i=0;i<${p.n(36, 60)};i++){var an=Math.random()*6.28,v=Math.random()*3+1;ps.push({x:a,y:b2,vx:Math.cos(an)*v,vy:Math.sin(an)*v,l:60,h:h})}}
c.onclick=function(e){b(e.offsetX*W/c.clientWidth,e.offsetY*H/c.clientHeight)};setInterval(function(){b(Math.random()*W,Math.random()*H*.6)},900);b(W/2,H/3);
function d(){x.fillStyle="rgba(0,0,0,.2)";x.fillRect(0,0,W,H);ps=ps.filter(function(q){return q.l>0});ps.forEach(function(q){q.x+=q.vx;q.y+=q.vy;q.vy+=.04;q.l--;x.fillStyle="hsla("+q.h+",95%,65%,"+q.l/60+")";x.fillRect(q.x,q.y,2,2)});requestAnimationFrame(d)}d()`),

  sorting: (p) =>
    doc("sorting", p, `canvas{position:fixed;inset:0;width:100%;height:100%}#n{position:fixed;top:4px;left:8px;color:var(--a)}`,
      `<canvas id="c"></canvas><div id="n"></div>`,
      CANVAS + `var N=${p.n(24, 40)},A,al=["bubble","insertion","selection"],ai=${p.n(0, 2)};
function init(){A=[];for(var i=0;i<N;i++)A.push(i+1);A.sort(function(){return Math.random()-.5});g=run();document.getElementById("n").textContent=al[ai%3]+" sort"}
function*run(){var n=A.length,t;
if(ai%3==0){for(var i=0;i<n;i++)for(var j=0;j<n-i-1;j++){if(A[j]>A[j+1]){t=A[j];A[j]=A[j+1];A[j+1]=t}yield j}}
else if(ai%3==1){for(var i=1;i<n;i++){var j=i;while(j>0&&A[j-1]>A[j]){t=A[j];A[j]=A[j-1];A[j-1]=t;j--;yield j}}}
else{for(var i=0;i<n;i++){var m=i;for(var j=i+1;j<n;j++){if(A[j]<A[m])m=j;yield j}t=A[i];A[i]=A[m];A[m]=t}}}
var g,hot=0;init();
setInterval(function(){for(var k=0;k<3;k++){var r=g.next();if(r.done){ai++;init();return}hot=r.value}
x.fillStyle="#0b0d14";x.fillRect(0,0,W,H);var w=W/N;A.forEach(function(v,i){x.fillStyle=i==hot?"#fff":"hsl(${p.h} 80% "+(30+v/N*40)+"%)";x.fillRect(i*w+1,H-v/N*(H-20),w-2,v/N*(H-20))})},30)`),

  pomodoro: (p) =>
    doc("pomodoro", p, `.r{width:min(66vw,66vh);aspect-ratio:1;border-radius:50%;display:grid;place-items:center;background:conic-gradient(var(--a) calc(var(--p)*1%),hsl(var(--h) 20% 18%) 0)}
.r b{display:grid;place-items:center;width:84%;height:84%;border-radius:50%;background:var(--b);font-size:calc(min(66vw,66vh)/5);font-weight:600}#m{position:fixed;bottom:6px;color:var(--a)}`,
      `<div class="r" id="r" style="--p:0"><b id="t">25:00</b></div><div id="m">focus</div>`,
      `var T=${p.n(5, 25)}*60,s=T,f=true;setInterval(function(){s-=${p.n(20, 40)};if(s<=0){f=!f;T=f?25*60:5*60;s=T;document.getElementById("m").textContent=f?"focus":"break"}
var m=Math.floor(s/60),q=s%60;document.getElementById("t").textContent=(m<10?"0":"")+m+":"+(q<10?"0":"")+q;document.getElementById("r").style.setProperty("--p",100-s/T*100)},200)`),

  palette: (p) =>
    doc("palette", p, `.w{display:flex;width:100%;height:100%}.w div{flex:1;display:flex;align-items:flex-end;justify-content:center;padding-bottom:10px;font-size:8px;letter-spacing:-.04em;overflow:hidden;transition:background .5s;cursor:pointer}`,
      `<div class="w" id="w"></div>`,
      `var w=document.getElementById("w"),k=${p.n(4, 6)};for(var i=0;i<k;i++)w.appendChild(document.createElement("div"));
function hx(h,s,l){l/=100;var a=s*Math.min(l,1-l)/100,f=function(n){var q=(n+h/30)%12;return Math.round(255*(l-a*Math.max(-1,Math.min(q-3,9-q,1)))).toString(16).padStart(2,"0")};return"#"+f(0)+f(8)+f(4)}
function go(){var b=Math.random()*360;Array.prototype.forEach.call(w.children,function(e,i){var c=hx((b+i*${p.n(18, 40)})%360,60+Math.random()*30,35+i*8);e.style.background=c;e.textContent=c;e.style.color=i>2?"#111":"#fff"})}
go();w.onclick=go;setInterval(go,1800)`),

  "bar-dashboard": (p) =>
    doc("dashboard", p, `.g{width:92%;height:84%;display:grid;grid-template-rows:auto 1fr;gap:8px}.k{display:flex;gap:8px}.k div{flex:1;padding:6px;border:1px solid hsl(var(--h) 25% 24%);border-radius:6px}.k b{display:block;font-size:16px;color:var(--a)}
.bars{display:flex;align-items:flex-end;gap:6px;border-bottom:1px solid hsl(var(--h) 25% 30%)}.bars i{flex:1;background:var(--a);border-radius:3px 3px 0 0;transition:height .8s ease;height:10%}`,
      `<div class="g"><div class="k"><div>users<b id="a">0</b></div><div>uptime<b>99.9%</b></div></div><div class="bars" id="b"></div></div>`,
      `var b=document.getElementById("b");for(var i=0;i<${p.n(6, 10)};i++)b.appendChild(document.createElement("i"));
function go(){Array.prototype.forEach.call(b.children,function(e){e.style.height=10+Math.random()*85+"%"});document.getElementById("a").textContent=Math.floor(Math.random()*9000+1000)}go();setInterval(go,1400)`),

  loaders: (p) =>
    doc("loaders", p, `.g{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;place-items:center;width:90%}.g>*{width:28px;height:28px}
.a{border:3px solid hsl(var(--h) 20% 22%);border-top-color:var(--a);border-radius:50%;animation:s 1s linear infinite}
.b{background:radial-gradient(circle,var(--a) 40%,transparent 42%);animation:p 1.2s ease-in-out infinite}
.c{background:linear-gradient(90deg,var(--a) 33%,transparent 0) 0 0/9px 100%;animation:k 1s steps(3) infinite}
.d{border-radius:6px;background:var(--a);animation:r 1.4s ease-in-out infinite}
.e{border:3px dashed var(--a);border-radius:50%;animation:s 3s linear infinite reverse}
.f{background:var(--a);border-radius:50%;animation:u .8s ease-in-out infinite alternate}
@keyframes s{to{transform:rotate(1turn)}}@keyframes p{50%{transform:scale(.4)}}@keyframes k{to{background-position:9px 0}}@keyframes r{50%{transform:rotate(180deg) scale(.5)}}@keyframes u{to{transform:translateY(-12px)}}
@media(prefers-reduced-motion:reduce){.g>*{animation:none}}`,
      `<div class="g"><i class="a"></i><i class="b"></i><i class="c"></i><i class="d"></i><i class="e"></i><i class="f"></i></div>`),

  synth: (p) =>
    doc("synth", p, `.k{display:flex;gap:3px;width:92%;height:70%}.k i{flex:1;background:hsl(var(--h) 20% 88%);border-radius:0 0 5px 5px;transition:background .12s,transform .12s}.k i.on{background:var(--a);transform:translateY(3px)}#l{position:fixed;top:6px;color:var(--a)}`,
      `<div id="l">visual only, sound is off</div><div class="k" id="k"></div>`,
      `var k=document.getElementById("k"),m=[0,2,4,5,7,5,4,2,0,4,7,4,2,5,2,0],r=${p.n(0, 7)},n=${p.n(7, 9)};for(var i=0;i<n;i++){var e=document.createElement("i");e.onmousedown=(function(e){return function(){fl(e)}})(e);k.appendChild(e)}
function fl(e){e.className="on";setTimeout(function(){e.className=""},180)}var s=0;setInterval(function(){fl(k.children[(m[s++%m.length]+r)%n])},260)`),

  "pixel-editor": (p) =>
    doc("pixels", p, `.g{display:grid;grid-template-columns:repeat(12,1fr);width:min(70vw,70vh);aspect-ratio:1;gap:1px;background:hsl(var(--h) 20% 16%)}.g i{background:var(--b);cursor:pointer}.g i.o{background:var(--a)}.g i.q{background:hsl(calc(var(--h) + 150) 85% 60%)}`,
      `<div class="g" id="g"></div>`,
      `var g=document.getElementById("g"),dn=0;for(var i=0;i<144;i++)g.appendChild(document.createElement("i"));
g.onmousedown=function(e){dn=1;pt(e)};addEventListener("mouseup",function(){dn=0});g.onmouseover=function(e){if(dn)pt(e)};function pt(e){if(e.target!==g)e.target.className=e.target.className=="o"?"":"o"}
var s=${p.n(1, 9999)},y=0;function rn(){s=(s*1103515245+12345)&0x7fffffff;return s/0x7fffffff}
setInterval(function(){var r=y%12,t=y++%144>=0;for(var c=0;c<6;c++){var on=rn()>.5;var l=g.children[r*12+c],m=g.children[r*12+11-c];l.className=m.className=on?(rn()>.8?"q":"o"):""}if(y>=12)y=0},220)`),
}

export function generateArtifact(kind: ArtifactKind, seed: number): string {
  const rnd = mulberry32(seed)
  const h = Math.floor(rnd() * 360)
  const n = (lo: number, hi: number) => lo + Math.floor(rnd() * (hi - lo + 1))
  return gen[kind]({ h, n, seed })
}
