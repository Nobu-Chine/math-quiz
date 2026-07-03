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
    ['正方形',4], ['長方形',2], ['正三角形',3], ['二等辺三角形',1],
    ['正五角形',5], ['正六角形',6], ['ひし形',2]
  ];
  const [name,axis] = shapes[randInt(0,shapes.length-1)];
  return {text:`${name}の対称の軸は 何本？`, type:'numeric', answer:axis,
    explain:`${name}には対称の軸が${axis}本あります`, category:'対称な図形'};
}

function g6_letterEq(){
  const type = randInt(0,2);
  let x,a,b,text,explain;
  if(type===0){
    x=randInt(1,20); a=randInt(1,20); b=x+a;
    text=`x + ${a} = ${b} のとき、xの値は？`;
    explain=`x = ${b} − ${a} = ${x}`;
  } else if(type===1){
    x=randInt(1,20); a=randInt(1,x); b=x-a;
    text=`x − ${a} = ${b} のとき、xの値は？`;
    explain=`x = ${b} + ${a} = ${x}`;
  } else {
    a=randInt(2,9); x=randInt(2,12); b=a*x;
    text=`${a} × x = ${b} のとき、xの値は？`;
    explain=`x = ${b} ÷ ${a} = ${x}`;
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
  return {text:`${n1}/${d1} × ${n2}/${d2} = ?`, type:'choice', answer:correct,
    choices:shuffle([...choices]),
    explain:`分子どうし・分母どうしをかけて ${n1}×${n2}=${num}、${d1}×${d2}=${den} → ${correct}`,
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
  return {text:`${n1}/${d1} ÷ ${n2}/${d2} = ?`, type:'choice', answer:correct,
    choices:shuffle([...choices]),
    explain:`わる数の逆数をかける: ${n1}/${d1} × ${d2}/${n2} = ${num}/${den} = ${correct}`,
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
  return {text:`${whole}と${n1}/${d1} × ${n2}/${d2} = ?（仮分数で答えよう）`, type:'choice', answer:correct,
    choices:shuffle([...choices]),
    explain:`帯分数を仮分数に直すと ${impNum}/${d1}。あとは分数どうしのかけ算: ${impNum}×${n2}=${num}、${d1}×${d2}=${den} → ${correct}`,
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
  return {text:`${opText} = ?`, type:'choice', answer:correct,
    choices:shuffle([...choices]),
    explain: isDiv
      ? `わる数の逆数をかける: ${whole} × ${d}/${n} = ${num}/${den} = ${correct}`
      : `整数を分数として考える: ${whole}/1 × ${n}/${d} = ${num}/${den} = ${correct}`,
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
    explain:`最大公約数${gg}で割って ${a/gg}:${b/gg}`, category:'比'};
}

function g6_scale(){
  const real=randInt(2,50)*10;
  const scaleDenom = [100,500,1000,2000][randInt(0,3)];
  const realCm = real*100;
  const ans = Math.round((realCm/scaleDenom)*10)/10;
  return {text:`実際の長さが${real}mの道を、1/${scaleDenom}の縮図でかくと 何cmになる？`, type:'numeric',
    answer:ans, tolerance:0.05,
    explain:`${real}m = ${realCm}cm。${realCm} ÷ ${scaleDenom} = ${ans}cm`, category:'拡大図と縮図'};
}

function g6_circleArea(){
  const r=randInt(2,15);
  const ans=Math.round(r*r*3.14*100)/100;
  return {text:`半径${r}cmの円の面積は？(円周率3.14・小数第2位まで)`, type:'numeric',
    answer:ans, tolerance:0.05,
    explain:`半径×半径×3.14 = ${r}×${r}×3.14 = ${ans}cm²`, category:'円の面積'};
}

function g6_volume(){
  if(Math.random()<0.5){
    const a=randInt(2,12), b=randInt(2,12), c=randInt(2,12);
    const ans=a*b*c;
    return {text:`たて${a}cm、よこ${b}cm、高さ${c}cmの直方体の体積は？`, type:'numeric',
      answer:ans, explain:`たて×よこ×高さ = ${a}×${b}×${c} = ${ans}cm³`, category:'角柱と円柱の体積'};
  } else {
    const r=randInt(2,8), h=randInt(3,15);
    const ans=Math.round(r*r*3.14*h*100)/100;
    return {text:`底面の半径${r}cm、高さ${h}cmの円柱の体積は？(円周率3.14)`, type:'numeric',
      answer:ans, tolerance:0.05,
      explain:`底面積×高さ = (${r}×${r}×3.14)×${h} = ${ans}cm³`, category:'角柱と円柱の体積'};
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
      answer:y2, explain:`比例定数は ${y1}÷${x1}=${k}。y=${k}×${x2}=${y2}`, category:'比例と反比例'};
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
      answer:y2, explain:`きまった数は ${x1}×${y1}=${k}。y=${k}÷${x2}=${y2}`, category:'比例と反比例'};
  }
}

function g6_permCombo(){
  if(Math.random()<0.5){
    const n=randInt(3,4);
    let ans=1; for(let i=1;i<=n;i++) ans*=i;
    return {text:`${n}人を1列に並べる方法は 何通り？`, type:'numeric', answer:ans,
      explain:`${n}×${n-1}×…×1 = ${ans}通り`, category:'並べ方と組み合わせ方'};
  } else {
    const n=randInt(4,7);
    const ans = n*(n-1)/2;
    return {text:`${n}人の中から2人を選ぶ方法は 何通り？`, type:'numeric', answer:ans,
      explain:`${n}×${n-1}÷2 = ${ans}通り`, category:'並べ方と組み合わせ方'};
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
    explain:`合計${total} ÷ ${count}個 = ${ans}`, category:'データの調べ方'};
}

const G6_POOL = [g6_symmetry, g6_letterEq, g6_fracMul, g6_fracDiv,
  g6_fracMulMixed, g6_intFracMul, g6_ratio,
  g6_scale, g6_circleArea, g6_volume, g6_proportion, g6_permCombo, g6_average];
function genG6(){ return G6_POOL[randInt(0,G6_POOL.length-1)](); }

// このアプリで実際に使う一覧(6年生・13カテゴリ)
export const CATEGORIES = [
  '対称な図形', '文字と式', '分数のかけ算', '分数のわり算', '比',
  '拡大図と縮図', '円の面積', '角柱と円柱の体積', '比例と反比例',
  '並べ方と組み合わせ方', 'データの調べ方'
];

// 1問生成する(現状は6年生固定。将来学年を増やすならここを差し替え)
export function generateQuestion() {
  return genG6();
}

// 複数問まとめて生成
export function generateQuiz(count = 10) {
  return Array.from({ length: count }, () => generateQuestion());
}
