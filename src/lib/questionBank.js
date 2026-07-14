// questionBank.js
// 6年生 算数ふくしゅうクイズの問題生成ロジック
// (Claude.aiのArtifactsで作った math_review_game.html から移植・動作確認済み)
// 1〜5年生の生成関数も残してあるので、将来「学年を選べる」機能を復活させたい時にも使えます。

function randInt(min,max){return Math.floor(Math.random()*(max-min+1))+min;}
function gcd(a,b){a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b];}return a||1;}
function shuffle(arr){
  const a=[...arr];
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

// ---------- 学年ごとの問題生成 ----------
function genG1(){
  const op = Math.random()<0.5 ? '+' : '-';
  let a,b,ans;
  if(op==='+'){
    a=randInt(1,9); b=randInt(1,9); ans=a+b;
  } else {
    a=randInt(2,18); b=randInt(1,Math.min(a,9));
    if(b>a)[a,b]=[b,a];
    ans=a-b;
  }
  return {text:`${a} ${op} ${b} = ?`, type:'numeric', answer:ans,
    explain:`${a} ${op} ${b} = ${ans} だよ`};
}

function genG2(){
  if(Math.random()<0.6){
    const a=randInt(2,9), b=randInt(2,9);
    return {text:`${a} × ${b} = ?`, type:'numeric', answer:a*b,
      explain:`九九で ${a}×${b} = ${a*b}`};
  } else {
    const op = Math.random()<0.5 ? '+' : '-';
    let a=randInt(10,99), b=randInt(10,99);
    if(op==='-' && b>a) [a,b]=[b,a];
    const ans = op==='+' ? a+b : a-b;
    return {text:`${a} ${op} ${b} = ?`, type:'numeric', answer:ans,
      explain:`${a} ${op} ${b} = ${ans}`};
  }
}

function genG3(){
  if(Math.random()<0.5){
    const b=randInt(2,9), c=randInt(2,9), a=b*c;
    return {text:`${a} ÷ ${b} = ?`, type:'numeric', answer:c,
      explain:`${b} × ${c} = ${a} なので ${a} ÷ ${b} = ${c}`};
  } else {
    const a=randInt(11,99), b=randInt(2,9);
    return {text:`${a} × ${b} = ?`, type:'numeric', answer:a*b,
      explain:`${a} × ${b} = ${a*b}`};
  }
}

function g4_mixedParen(depth){
  depth = depth || 0;
  if(depth>10) return g4_rectArea();
  const a=randInt(2,9), b=randInt(2,9), c=randInt(2,9);
  const ans=(a+b)*c;
  return {text:`(${a} + ${b}) × ${c} = ?`, type:'numeric', answer:ans,
    explain:`かっこの中を先に: ${a}+${b}=${a+b} → ${a+b}×${c}=${ans}`};
}

function g4_mixedOrder(depth){
  depth = depth || 0;
  if(depth>10) return g4_rectArea();
  const a=randInt(10,50), b=randInt(2,9), c=randInt(2,9);
  const ans = a - b*c;
  if(ans<0) return g4_mixedOrder(depth+1);
  return {text:`${a} − ${b} × ${c} = ?`, type:'numeric', answer:ans,
    explain:`かけ算を先に: ${b}×${c}=${b*c} → ${a}−${b*c}=${ans}`};
}

function g4_angle(){
  const a=randInt(30,110);
  let b=randInt(20,150-a);
  if(b<20) b=20;
  const c=180-a-b;
  return {text:`三角形の3つの角のうち、2つが${a}°と${b}°です。残りの角は何度？`, type:'numeric',
    answer:c, explain:`三角形の内角の和は180°。180 − ${a} − ${b} = ${c}度`};
}

function g4_estimate(){
  const num=randInt(100,999);
  const rounded = Math.round(num/10)*10;
  return {text:`${num}を四捨五入して、十の位までの概数にすると？`, type:'numeric',
    answer:rounded, explain:`一の位を四捨五入して ${rounded}`};
}

function g4_rectArea(){
  const a=randInt(3,30), b=randInt(3,30);
  return {text:`たて${a}cm、よこ${b}cmの長方形の面積は？`, type:'numeric',
    answer:a*b, explain:`たて×よこ = ${a}×${b} = ${a*b}cm²`};
}

function g4_fracSameDenom(){
  const d=randInt(3,9);
  const n1=randInt(1,d-1), n2=randInt(1,d-1);
  const sum=n1+n2;
  const g=gcd(sum,d);
  const sn=sum/g, sd=d/g;
  const correct = sd===1 ? `${sn}` : `${sn}/${sd}`;
  const choices=new Set([correct]);
  let tries=0;
  while(choices.size<4 && tries<25){
    tries++;
    const dn=sum+randInt(-2,2);
    if(dn<=0) continue;
    const gg=gcd(dn,d);
    choices.add(d/gg===1 ? `${dn/gg}` : `${dn/gg}/${d/gg}`);
  }
  return {text:`${n1}/${d} + ${n2}/${d} = ?`, type:'choice', answer:correct,
    choices:shuffle([...choices]),
    explain:`分母はそのまま、分子だけたす: ${n1}+${n2}=${sum} → ${sum}/${d} = ${correct}`};
}

const G4_POOL = [g4_mixedParen, g4_mixedOrder, g4_angle, g4_estimate, g4_rectArea, g4_fracSameDenom];
function genG4(){ return G4_POOL[randInt(0,G4_POOL.length-1)](); }

// ---- 5年生の単元 ----
function g5_decimal(){
  const x=randInt(10,99)/10, y0=randInt(10,99)/10;
  const op = Math.random()<0.5 ? '+' : '-';
  let a=x,b=y0;
  if(op==='-' && b>a) [a,b]=[b,a];
  const ans = Math.round((op==='+'? a+b : a-b)*10)/10;
  return {text:`${a.toFixed(1)} ${op} ${b.toFixed(1)} = ?`, type:'numeric',
    answer:ans, tolerance:0.05,
    explain:`${a.toFixed(1)} ${op} ${b.toFixed(1)} = ${ans}`};
}

function g5_fracAddDiffDenom(depth){
  depth = depth || 0;
  if(depth>10) return g5_decimal();
  const d1=randInt(2,6), d2=randInt(2,6);
  if(d1===d2) return g5_fracAddDiffDenom(depth+1);
  const n1=randInt(1,d1-1), n2=randInt(1,d2-1);
  const lcm = d1*d2/gcd(d1,d2);
  const num = n1*(lcm/d1) + n2*(lcm/d2);
  const g=gcd(num,lcm);
  const sn=num/g, sd=lcm/g;
  const correct = sd===1 ? `${sn}` : `${sn}/${sd}`;
  const choices=new Set([correct]);
  let tries=0;
  while(choices.size<4 && tries<25){
    tries++;
    const dn=num+randInt(-3,3);
    if(dn<=0) continue;
    const gg=gcd(dn,lcm);
    const t = lcm/gg===1 ? `${dn/gg}` : `${dn/gg}/${lcm/gg}`;
    choices.add(t);
  }
  return {text:`${n1}/${d1} + ${n2}/${d2} = ?（通分してね）`, type:'choice', answer:correct,
    choices:shuffle([...choices]),
    explain:`通分すると分母は${lcm}。${n1}/${d1}=${n1*(lcm/d1)}/${lcm}、${n2}/${d2}=${n2*(lcm/d2)}/${lcm} を足して ${sn}/${sd}`};
}

function g5_percent(){
  const a=randInt(2,10)*10;
  const pct=randInt(1,9)*10;
  const part=a*pct/100;
  return {text:`${a}人のうち ${part}人は 何%？`, type:'numeric', answer:pct,
    explain:`${part} ÷ ${a} × 100 = ${pct}%`};
}

function g5_unitRate(){
  // 単位量あたりの大きさ(例:混み具合・速さの前段)
  const people=randInt(20,90);
  const area=randInt(2,9);
  const ans = Math.round((people/area)*10)/10;
  return {text:`${area}㎡の部屋に${people}人います。1㎡あたり 何人？（小数第1位まで）`, type:'numeric',
    answer:ans, tolerance:0.05,
    explain:`人数 ÷ 面積 = ${people} ÷ ${area} = ${ans}人`};
}

function g5_triangleArea(){
  // 三角形・平行四辺形の面積(5年図形)
  if(Math.random()<0.5){
    const base=randInt(4,20), height=randInt(3,15);
    const ans = Math.round((base*height/2)*10)/10;
    return {text:`底辺${base}cm、高さ${height}cmの三角形の面積は？`, type:'numeric', answer:ans, tolerance:0.05,
      explain:`底辺×高さ÷2 = ${base}×${height}÷2 = ${ans}cm²`};
  } else {
    const base=randInt(4,20), height=randInt(3,15);
    const ans = base*height;
    return {text:`底辺${base}cm、高さ${height}cmの平行四辺形の面積は？`, type:'numeric', answer:ans,
      explain:`底辺×高さ = ${base}×${height} = ${ans}cm²`};
  }
}

const G5_POOL = [g5_decimal, g5_fracAddDiffDenom, g5_percent, g5_unitRate, g5_triangleArea];
function genG5(){ return G5_POOL[randInt(0,G5_POOL.length-1)](); }

// ---- 6年生の単元(画像のカリキュラムに対応) ----
function g6_symmetry(){
  const shapes = [
    ['正方形',4,'たてと よこの真ん中を通る線が2本、さらに対角線が2本。折るとぴったり重なる線が全部で4本'],
    ['長方形',2,'たてと よこの真ん中を通る線の2本だけ。対角線で折ると形がずれるので軸にならない'],
    ['正三角形',3,'それぞれの頂点から向かい合う辺の真ん中を通る線が3本'],
    ['二等辺三角形',1,'頂点(とがった角)から底辺の真ん中に引いた線の1本だけ'],
    ['正五角形',5,'頂点の数と同じだけ、頂点から向かい合う辺の真ん中に線を引ける。5本'],
    ['正六角形',6,'向かい合う頂点どうしを結ぶ線が3本、向かい合う辺の真ん中どうしを結ぶ線が3本、合わせて6本'],
    ['ひし形',2,'2本の対角線が対称の軸(たて・よこの真ん中を通る線は軸にならない)']
  ];
  const [name,axis,reason] = shapes[randInt(0,shapes.length-1)];
  return {text:`${name}の対称の軸は 何本？`, type:'numeric', answer:axis,
    explain:`対称の軸とは、折るとぴったり重なる折り目の線のこと。${name}の場合: ${reason}。だから対称の軸は${axis}本`, category:'対称な図形'};
}

function g6_letterEq(){
  const type = randInt(0,2);
  let x,a,b,text,explain;
  if(type===0){
    x=randInt(1,20); a=randInt(1,20); b=x+a;
    text=`x + ${a} = ${b} のとき、xの値は？`;
    explain=`「x に ${a} をたすと ${b}」なので、逆にたどるには ${b} から ${a} を引けばよい。x = ${b} − ${a} = ${x}`;
  } else if(type===1){
    x=randInt(1,20); a=randInt(1,x); b=x-a;
    text=`x − ${a} = ${b} のとき、xの値は？`;
    explain=`「x から ${a} を引くと ${b}」なので、逆にたどるには ${b} に ${a} をたせばよい。x = ${b} + ${a} = ${x}`;
  } else {
    a=randInt(2,9); x=randInt(2,12); b=a*x;
    text=`${a} × x = ${b} のとき、xの値は？`;
    explain=`「x に ${a} をかけると ${b}」なので、逆にたどるには ${b} を ${a} で割ればよい。x = ${b} ÷ ${a} = ${x}`;
  }
  return {text, type:'numeric', answer:x, explain, category:'文字と式'};
}

function g6_fracMul(){
  const n1=randInt(1,8), d1=randInt(2,9), n2=randInt(1,8), d2=randInt(2,9);
  const num=n1*n2, den=d1*d2;
  const g=gcd(num,den);
  const sn=num/g, sd=den/g;
  const correct = sd===1 ? `${sn}` : `${sn}/${sd}`;
  const choices=new Set([correct]);
  let tries=0;
  while(choices.size<4 && tries<25){
    tries++;
    const dn=num+randInt(-3,3), dd=den+randInt(-2,2);
    if(dn<=0||dd<=0) continue;
    const gg=gcd(dn,dd);
    const t = dd/gg===1 ? `${dn/gg}` : `${dn/gg}/${dd/gg}`;
    choices.add(t);
  }
  const needsSimplify = g>1;
  return {text:`${n1}/${d1} × ${n2}/${d2} = ?`, type:'choice', answer:correct,
    choices:shuffle([...choices]),
    explain:`分数どうしのかけ算は「分子どうし」「分母どうし」を別々にかける。${n1}×${n2}=${num}、${d1}×${d2}=${den} なので ${num}/${den}${needsSimplify ? `。これを最大公約数${g}で約分すると ${correct}` : `(これ以上約分できないので、そのまま ${correct})`}`,
    category:'分数のかけ算'};
}

function g6_fracDiv(){
  const n1=randInt(1,8), d1=randInt(2,9), n2=randInt(1,8), d2=randInt(2,9);
  const num=n1*d2, den=d1*n2;
  const g=gcd(num,den);
  const sn=num/g, sd=den/g;
  const correct = sd===1 ? `${sn}` : `${sn}/${sd}`;
  const choices=new Set([correct]);
  let tries=0;
  while(choices.size<4 && tries<25){
    tries++;
    const dn=num+randInt(-3,3), dd=den+randInt(-2,2);
    if(dn<=0||dd<=0) continue;
    const gg=gcd(dn,dd);
    const t = dd/gg===1 ? `${dn/gg}` : `${dn/gg}/${dd/gg}`;
    choices.add(t);
  }
  const needsSimplify2 = g>1;
  return {text:`${n1}/${d1} ÷ ${n2}/${d2} = ?`, type:'choice', answer:correct,
    choices:shuffle([...choices]),
    explain:`分数のわり算は、わる数(${n2}/${d2})をひっくり返して(逆数にして)かけ算にする。${n1}/${d1} ÷ ${n2}/${d2} → ${n1}/${d1} × ${d2}/${n2} = ${num}/${den}${needsSimplify2 ? `。約分すると ${correct}` : ``}`,
    category:'分数のわり算'};
}

function fracToText(sn, sd){
  return sd===1 ? `${sn}` : `${sn}/${sd}`;
}

function g6_fracMulMixed(){
  // 帯分数 × 真分数 (例: 1と2/3 × 3/4)
  const whole=randInt(1,3), d1=randInt(2,7), n1=randInt(1,d1-1);
  const impNum = whole*d1+n1; // 仮分数の分子
  const n2=randInt(1,8), d2=randInt(2,9);
  const num=impNum*n2, den=d1*d2;
  const g=gcd(num,den);
  const sn=num/g, sd=den/g;
  const correct = fracToText(sn,sd);
  const choices=new Set([correct]);
  let tries=0;
  while(choices.size<4 && tries<25){
    tries++;
    const dn=num+randInt(-3,3), dd=den+randInt(-2,2);
    if(dn<=0||dd<=0) continue;
    const gg=gcd(dn,dd);
    choices.add(fracToText(dn/gg, dd/gg));
  }
  const needsSimplify3 = g>1;
  return {text:`${whole}と${n1}/${d1} × ${n2}/${d2} = ?（仮分数で答えよう）`, type:'choice', answer:correct,
    choices:shuffle([...choices]),
    explain:`帯分数はそのままかけ算できないので、まず仮分数に直す。「整数×分母+分子」で ${whole}×${d1}+${n1}=${impNum}、つまり ${whole}と${n1}/${d1} = ${impNum}/${d1}。あとは分数どうしのかけ算: ${impNum}×${n2}=${num}、${d1}×${d2}=${den} で ${num}/${den}${needsSimplify3 ? `。約分すると ${correct}` : ``}`,
    category:'分数のかけ算'};
}

function g6_intFracMul(){
  // 整数 × 分数 or 分数 × 整数
  const whole=randInt(2,9);
  const n=randInt(1,8), d=randInt(2,9);
  const isDiv = Math.random()<0.5;
  let num, den, opText;
  if(isDiv){
    // whole ÷ (n/d) = whole × d/n
    num = whole*d; den = n; opText = `${whole} ÷ ${n}/${d}`;
  } else {
    num = whole*n; den = d; opText = `${whole} × ${n}/${d}`;
  }
  const g=gcd(num,den);
  const sn=num/g, sd=den/g;
  const correct = fracToText(sn,sd);
  const choices=new Set([correct]);
  let tries=0;
  while(choices.size<4 && tries<25){
    tries++;
    const dn=num+randInt(-3,3), dd=den+randInt(-2,2);
    if(dn<=0||dd<=0) continue;
    const gg=gcd(dn,dd);
    choices.add(fracToText(dn/gg, dd/gg));
  }
  const needsSimplify4 = g>1;
  return {text:`${opText} = ?`, type:'choice', answer:correct,
    choices:shuffle([...choices]),
    explain: isDiv
      ? `整数も ${whole}/1 という分数として考えられる。わる数(${n}/${d})を逆数にしてかけ算にする: ${whole} ÷ ${n}/${d} → ${whole} × ${d}/${n} = ${num}/${den}${needsSimplify4 ? `。約分すると ${correct}` : ``}`
      : `整数を ${whole}/1 という分数として考えると、あとは分数どうしのかけ算と同じ: ${whole}/1 × ${n}/${d} = ${num}/${den}${needsSimplify4 ? `。約分すると ${correct}` : ``}`,
    category: isDiv ? '分数のわり算' : '分数のかけ算'};
}

function g6_ratio(){
  const g=randInt(2,6);
  const a=randInt(2,9)*g, b=randInt(2,9)*g;
  const gg=gcd(a,b);
  const correct = `${a/gg}:${b/gg}`;
  const choices=new Set([correct]);
  let tries=0;
  while(choices.size<4 && tries<25){
    tries++;
    const x=a/gg+randInt(-2,2), y=b/gg+randInt(-2,2);
    if(x<=0||y<=0) continue;
    choices.add(`${x}:${y}`);
  }
  return {text:`${a} : ${b} を簡単にすると？`, type:'choice', answer:correct,
    choices:shuffle([...choices]),
    explain:`比を簡単にするときは、両方の数を同じ数で割る。${a}と${b}の最大公約数は${gg}なので、両方を${gg}で割ると ${a}÷${gg}=${a/gg}、${b}÷${gg}=${b/gg}。だから ${a/gg}:${b/gg}`, category:'比'};
}

function g6_scale(){
  const real=randInt(2,50)*10;
  const scaleDenom = [100,500,1000,2000][randInt(0,3)];
  const realCm = real*100;
  const ans = Math.round((realCm/scaleDenom)*10)/10;
  return {text:`実際の長さが${real}mの道を、1/${scaleDenom}の縮図でかくと 何cmになる？`, type:'numeric',
    answer:ans, tolerance:0.05,
    explain:`縮図は実際の長さを一定の割合で小さくした図。「1/${scaleDenom}の縮図」は実際の長さを${scaleDenom}で割るという意味。まず単位をそろえるために ${real}m を cm に直すと ${realCm}cm。それを ${scaleDenom} で割って ${realCm} ÷ ${scaleDenom} = ${ans}cm`, category:'拡大図と縮図'};
}

function g6_circleArea(){
  const r=randInt(2,15);
  const ans=Math.round(r*r*3.14*100)/100;
  return {text:`半径${r}cmの円の面積は？(円周率3.14・小数第2位まで)`, type:'numeric',
    answer:ans, tolerance:0.05,
    explain:`円の面積は「半径×半径×円周率」という公式で求める。半径が${r}cmなので、${r}×${r}×3.14 = ${ans}cm²`, category:'円の面積'};
}

function g6_volume(){
  if(Math.random()<0.5){
    const a=randInt(2,12), b=randInt(2,12), c=randInt(2,12);
    const ans=a*b*c;
    return {text:`たて${a}cm、よこ${b}cm、高さ${c}cmの直方体の体積は？`, type:'numeric',
      answer:ans, explain:`角柱の体積は「底面積×高さ」で求められる。直方体の底面積は たて×よこ = ${a}×${b}=${a*b}cm²。これに高さ${c}cmをかけて ${a*b}×${c} = ${ans}cm³`, category:'角柱と円柱の体積'};
  } else {
    const r=randInt(2,8), h=randInt(3,15);
    const baseArea=Math.round(r*r*3.14*100)/100;
    const ans=Math.round(r*r*3.14*h*100)/100;
    return {text:`底面の半径${r}cm、高さ${h}cmの円柱の体積は？(円周率3.14)`, type:'numeric',
      answer:ans, tolerance:0.05,
      explain:`円柱の体積も「底面積×高さ」で求める。底面は円なので、底面積は 半径×半径×3.14 = ${r}×${r}×3.14 = ${baseArea}cm²。これに高さ${h}cmをかけて ${baseArea}×${h} = ${ans}cm³`, category:'角柱と円柱の体積'};
  }
}

function g6_proportion(){
  if(Math.random()<0.5){
    const k=randInt(2,9);
    const x1=randInt(1,9);
    const y1=k*x1;
    let x2=randInt(1,12);
    while(x2===x1) x2=randInt(1,12);
    const y2=k*x2;
    return {text:`yはxに比例していて、x=${x1}のときy=${y1}です。x=${x2}のときyはいくつ？`, type:'numeric',
      answer:y2, explain:`「yはxに比例する」とは、xがどんな値でも y÷x がいつも同じ数(比例定数)になるということ。まず比例定数を求めると ${y1}÷${x1}=${k}。この${k}は変わらないので、x=${x2}のときも y=${k}×${x2}=${y2}`, category:'比例と反比例'};
  } else {
    const k=randInt(12,60);
    const divisors=[];
    for(let i=1;i<=k;i++) if(k%i===0) divisors.push(i);
    const x1=divisors[randInt(0,divisors.length-1)];
    const y1=k/x1;
    let x2=divisors[randInt(0,divisors.length-1)];
    let tries=0;
    while(x2===x1 && tries<10){x2=divisors[randInt(0,divisors.length-1)]; tries++;}
    const y2=k/x2;
    return {text:`yはxに反比例していて、x=${x1}のときy=${y1}です。x=${x2}のときyはいくつ？`, type:'numeric',
      answer:y2, explain:`「yはxに反比例する」とは、xがどんな値でも x×y がいつも同じ数(きまった数)になるということ。まずきまった数を求めると ${x1}×${y1}=${k}。この${k}は変わらないので、x=${x2}のときは y=${k}÷${x2}=${y2}`, category:'比例と反比例'};
  }
}

function g6_permCombo(){
  if(Math.random()<0.5){
    const n=randInt(3,4);
    let ans=1; for(let i=1;i<=n;i++) ans*=i;
    return {text:`${n}人を1列に並べる方法は 何通り？`, type:'numeric', answer:ans,
      explain:`1番目に並ぶ人は${n}通り。2番目は1番目の人を除いた${n-1}通り…というように、選べる人数が1人ずつ減っていく。だから ${n}×${n-1}×…×1 = ${ans}通り`, category:'並べ方と組み合わせ方'};
  } else {
    const n=randInt(4,7);
    const ans = n*(n-1)/2;
    return {text:`${n}人の中から2人を選ぶ方法は 何通り？`, type:'numeric', answer:ans,
      explain:`「並べ方」と違って「組み合わせ」は順番を区別しない(AさんBさんを選ぶのも、BさんAさんを選ぶのも同じ)。1人目の選び方は${n}通り、2人目は${n-1}通りで ${n}×${n-1}通りだが、これは同じ組が2回ずつ数えられているので2で割る。${n}×${n-1}÷2 = ${ans}通り`, category:'並べ方と組み合わせ方'};
  }
}

function g6_average(){
  const count=randInt(4,6);
  const nums=[];
  for(let i=0;i<count;i++) nums.push(randInt(1,20));
  const sum=nums.reduce((a,b)=>a+b,0);
  const rem = sum % count;
  if(rem!==0) nums[count-1]+= (count-rem);
  const total=nums.reduce((a,b)=>a+b,0);
  const ans= total/count;
  return {text:`${nums.join('、')} の平均は？`, type:'numeric', answer:ans,
    explain:`平均は「全部を足してから、個数で割る」と求められる。まず全部たすと ${nums.join('+')} = ${total}。データは${count}個あるので、${total} ÷ ${count} = ${ans}`, category:'データの調べ方'};
}

function g6_pointSymmetry(){
  const dist = randInt(3,20);
  return {text:`点対称な図形で、対称の中心Oから点Aまでの距離が${dist}cmです。点Aに対応する点Bまでの距離は何cm？`, type:'numeric', answer:dist,
    explain:`点対称な図形では、対応する2つの点は対称の中心Oを通る直線上にあり、Oからの距離が等しくなる。だから点Bまでの距離も${dist}cm`, category:'対称な図形'};
}

function g6_surfaceArea(){
  if(Math.random()<0.5){
    const a=randInt(2,10), b=randInt(2,10), c=randInt(2,10);
    const ans = 2*(a*b+b*c+c*a);
    return {text:`たて${a}cm、よこ${b}cm、高さ${c}cmの直方体の表面積は？`, type:'numeric', answer:ans,
      explain:`直方体には合同な面が2つずつ3組ある。たて×よこ=${a*b}cm²、よこ×高さ=${b*c}cm²、たて×高さ=${c*a}cm²。これらを2倍ずつして全部たすと (${a*b}+${b*c}+${c*a})×2 = ${ans}cm²`, category:'角柱と円柱の体積'};
  } else {
    const r=randInt(2,8), h=randInt(3,15);
    const baseArea=Math.round(r*r*3.14*100)/100;
    const sideArea=Math.round(2*r*3.14*h*100)/100;
    const ans=Math.round((r*r*3.14*2 + 2*r*3.14*h)*100)/100;
    return {text:`底面の半径${r}cm、高さ${h}cmの円柱の表面積は？(円周率3.14)`, type:'numeric', answer:ans, tolerance:0.1,
      explain:`円柱の表面積は「底面積×2 + 側面積」で求める。底面積は 半径×半径×3.14 = ${r}×${r}×3.14 = ${baseArea}cm²。側面積は「底面の周の長さ×高さ」= (2×${r}×3.14)×${h} = ${sideArea}cm²。合わせて ${baseArea}×2 + ${sideArea} = ${ans}cm²`, category:'角柱と円柱の体積'};
  }
}

function g6_median(){
  const count = [5,7][randInt(0,1)];
  const nums=[];
  for(let i=0;i<count;i++) nums.push(randInt(1,30));
  const sorted=[...nums].sort((a,b)=>a-b);
  const middleIdx = Math.floor(count/2);
  const median = sorted[middleIdx];
  return {text:`${nums.join('、')} の中央値は？`, type:'numeric', answer:median,
    explain:`中央値は、データを小さい順に並べたときのちょうど真ん中の値。小さい順に並べると ${sorted.join('、')} となり、真ん中(${middleIdx+1}番目)の値は ${median}`, category:'データの調べ方'};
}

function g6_mode(){
  const modeVal = randInt(1,20);
  const others = new Set();
  while(others.size<4){
    const v = randInt(1,20);
    if(v!==modeVal) others.add(v);
  }
  const nums = shuffle([modeVal, modeVal, modeVal, ...others]);
  return {text:`${nums.join('、')} の最頻値は？`, type:'numeric', answer:modeVal,
    explain:`最頻値は、データの中で最も多く出てくる値。${modeVal}が3回出てきていて、他の数字は1回ずつなので、最頻値は${modeVal}`, category:'データの調べ方'};
}

function g6_fracDecimalMul(){
  const decNum = randInt(1,9);
  const n2=randInt(1,8), d2=randInt(2,9);
  const num = decNum*n2, den = 10*d2;
  const g = gcd(num, den);
  const sn = num/g, sd = den/g;
  const correct = fracToText(sn, sd);
  const decText = (decNum/10).toString();
  const choices=new Set([correct]);
  let tries=0;
  while(choices.size<4 && tries<25){
    tries++;
    const dn=num+randInt(-3,3), dd=den+randInt(-2,2);
    if(dn<=0||dd<=0) continue;
    const gg=gcd(dn,dd);
    choices.add(fracToText(dn/gg, dd/gg));
  }
  const needsSimplify5 = g>1;
  return {text:`${decText} × ${n2}/${d2} = ?`, type:'choice', answer:correct,
    choices:shuffle([...choices]),
    explain:`小数はまず分数になおしてから計算する。${decText} = ${decNum}/10。あとは分数どうしのかけ算: ${decNum}/10 × ${n2}/${d2} = ${num}/${den}${needsSimplify5 ? `。約分すると ${correct}` : ``}`,
    category:'分数と小数の混じった計算'};
}

function g6_fracDecimalAdd(){
  const fracDenOptions=[2,5,10];
  const fracDen = fracDenOptions[randInt(0,2)];
  const fracNum = randInt(1, fracDen-1);
  const scale = 10/fracDen;
  const fracNumIn10 = fracNum*scale;
  let decNum = randInt(1,9);
  while(decNum === fracNumIn10) decNum = randInt(1,9);
  const isAdd = decNum < fracNumIn10 ? true : Math.random()<0.5;
  const resultNum = isAdd ? decNum + fracNumIn10 : decNum - fracNumIn10;
  const opText = isAdd ? '+' : '−';
  const g = gcd(resultNum, 10);
  const sn = resultNum/g, sd = 10/g;
  const correct = fracToText(sn, sd);
  const decText = (decNum/10).toString();
  const fracText = fracToText(fracNum, fracDen);
  const choices=new Set([correct]);
  let tries=0;
  while(choices.size<4 && tries<25){
    tries++;
    const dn=resultNum+randInt(-3,3);
    if(dn<=0) continue;
    const gg=gcd(dn,10);
    choices.add(fracToText(dn/gg, 10/gg));
  }
  const needsSimplify6 = g>1;
  return {text:`${decText} ${opText} ${fracText} = ?`, type:'choice', answer:correct,
    choices:shuffle([...choices]),
    explain:`小数と分数を計算するときは、分母をそろえる。${decText} = ${decNum}/10、${fracText} = ${fracNumIn10}/10 なので、${decNum}/10 ${opText} ${fracNumIn10}/10 = ${resultNum}/10${needsSimplify6 ? `。約分すると ${correct}` : ``}`,
    category:'分数と小数の混じった計算'};
}

function g6_unitConvert(){
  const conversions = [
    {from:'km', to:'m', factor:1000},
    {from:'m', to:'cm', factor:100},
    {from:'kg', to:'g', factor:1000},
    {from:'L', to:'mL', factor:1000},
    {from:'m', to:'km', factor:0.001},
    {from:'cm', to:'m', factor:0.01},
    {from:'g', to:'kg', factor:0.001},
    {from:'mL', to:'L', factor:0.001},
  ];
  const c = conversions[randInt(0,conversions.length-1)];
  let value, ans;
  if(c.factor>=1){
    value = randInt(1,20);
    ans = value*c.factor;
  } else {
    const base = Math.round(1/c.factor);
    value = randInt(1,20)*base;
    ans = value*c.factor;
  }
  const divisor = c.factor>=1 ? c.factor : Math.round(1/c.factor);
  return {text:`${value}${c.from} は 何${c.to}？`, type:'numeric', answer:Math.round(ans*1000)/1000,
    explain:`${c.from}を${c.to}になおすには、${c.factor>=1?`${divisor}をかける`:`${divisor}で割る`}。${value} ${c.factor>=1?'×':'÷'} ${divisor} = ${ans}`, category:'単位と概数'};
}

function g6_roundedRange(){
  const roundUnit = [10,100][randInt(0,1)];
  const half = roundUnit/2;
  const base = randInt(2,20)*roundUnit;
  const lower = base - half;
  const upper = base + half;
  const correct = `${lower}以上${upper}未満`;
  const choices = new Set([correct]);
  choices.add(`${lower}以上${upper+roundUnit}未満`);
  choices.add(`${lower-roundUnit}以上${upper}未満`);
  choices.add(`${base}以上${upper}未満`);
  const placeText = roundUnit===10 ? '十の位' : '百の位';
  return {text:`${placeText}までの概数にすると${base}になる整数の範囲を表そう`, type:'choice', answer:correct,
    choices:shuffle([...choices]),
    explain:`${placeText}までの概数にして${base}になるのは、${base}より${half}小さい数(${lower})以上、${base}より${half}大きい数(${upper})未満の範囲。四捨五入で考えると、${lower}は切り上がって${base}になり、${upper}は次の概数に切り上がってしまうので含まれない。だから「${correct}」`, category:'単位と概数'};
}

function g6_speed(){
  const type = randInt(0,2);
  if(type===0){
    const speed = randInt(2,12)*10;
    const time = randInt(2,6);
    const distance = speed*time;
    return {text:`${distance}mの道のりを${time}秒で走ると、速さは秒速何m？`, type:'numeric', answer:speed,
      explain:`速さは「道のり÷時間」で求める。${distance} ÷ ${time} = ${speed}。だから秒速${speed}m`, category:'速さ'};
  } else if(type===1){
    const speed = randInt(2,20);
    const time = randInt(2,10);
    const distance = speed*time;
    return {text:`分速${speed}mで${time}分歩くと、進む道のりは何m？`, type:'numeric', answer:distance,
      explain:`道のりは「速さ×時間」で求める。${speed} × ${time} = ${distance}。だから${distance}m`, category:'速さ'};
  } else {
    const speed = randInt(2,15);
    const time = randInt(2,10);
    const distance = speed*time;
    return {text:`時速${speed}kmで走ると、${distance}km進むのにかかる時間は何時間？`, type:'numeric', answer:time,
      explain:`時間は「道のり÷速さ」で求める。${distance} ÷ ${speed} = ${time}。だから${time}時間`, category:'速さ'};
  }
}

function g6_speedUnitConvert(){
  const base = randInt(1,20);
  const ans = base*60;
  if(Math.random()<0.5){
    return {text:`秒速${base}mは、分速何m？`, type:'numeric', answer:ans,
      explain:`秒速を分速になおすには60をかける(1分=60秒だから、1分間に進む距離は60倍になる)。${base} × 60 = ${ans}。だから分速${ans}m`, category:'速さ'};
  } else {
    return {text:`分速${base}mは、時速何m？`, type:'numeric', answer:ans,
      explain:`分速を時速になおすには60をかける(1時間=60分だから、1時間に進む距離は60倍になる)。${base} × 60 = ${ans}。だから時速${ans}m`, category:'速さ'};
  }
}

const G6_POOL = [g6_symmetry, g6_pointSymmetry, g6_letterEq, g6_fracMul, g6_fracDiv,
  g6_fracMulMixed, g6_intFracMul, g6_ratio,
  g6_scale, g6_circleArea, g6_volume, g6_surfaceArea, g6_proportion, g6_permCombo, g6_average,
  g6_median, g6_mode, g6_fracDecimalMul, g6_fracDecimalAdd,
  g6_unitConvert, g6_roundedRange, g6_speed, g6_speedUnitConvert];
function genG6(){ return G6_POOL[randInt(0,G6_POOL.length-1)](); }

// このアプリで実際に使う一覧(6年生・14カテゴリ)
export const CATEGORIES = [
  '対称な図形', '文字と式', '分数のかけ算', '分数のわり算', '比',
  '拡大図と縮図', '円の面積', '角柱と円柱の体積', '比例と反比例',
  '並べ方と組み合わせ方', 'データの調べ方',
  '分数と小数の混じった計算', '単位と概数', '速さ'
];

// 1問生成する(現状は6年生固定。将来学年を増やすならここを差し替え)
export function generateQuestion() {
  return genG6();
}

// 複数問まとめて生成
export function generateQuiz(count = 10) {
  return Array.from({ length: count }, () => generateQuestion());
}
