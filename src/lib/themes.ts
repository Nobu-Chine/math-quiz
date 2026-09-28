// クイズごとの色と表示ラベル。クイズ画面・ランキング・卒業生リストで共通
// Tailwind のクラス名は文字列を組み立てずに、そのまま書くこと(組み立てるとCSSが生成されない)

export interface Theme {
  label: string; // ランキング等の見出し上に出す学年・教科名
  backgroundClass: string;
  accentClass: string; // 見出しラベルと「もどる」ボタンの文字色
  numberClass: string; // 卒業生リストの順位の文字色
}

export const mathTheme: Theme = {
  label: "6年生",
  backgroundClass: "from-sky-100 via-violet-100 to-rose-100",
  accentClass: "text-violet-500",
  numberClass: "text-violet-400",
};

export const math1Theme: Theme = {
  label: "中学1年 数学",
  backgroundClass: "from-amber-100 via-orange-100 to-rose-100",
  accentClass: "text-amber-600",
  numberClass: "text-amber-500",
};

export const scienceTheme: Theme = {
  label: "中学1年 理科",
  backgroundClass: "from-emerald-100 via-teal-100 to-sky-100",
  accentClass: "text-emerald-600",
  numberClass: "text-emerald-500",
};

export const mapTheme: Theme = {
  label: "沖縄マップクイズ",
  backgroundClass: "from-sky-100 via-cyan-100 to-emerald-100",
  accentClass: "text-sky-600",
  numberClass: "text-sky-500",
};
