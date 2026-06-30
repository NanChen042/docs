const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'docs/nav/data.ts');
let content = fs.readFileSync(dataPath, 'utf-8');

// Simplification mappings
const mappings = {
  'TypeScript 演练场': 'TypeScript',
  '图贴士（原工具之家）': '图贴士',
  ' CSS Grid Generator': 'CSS Grid',
  'SASS/LESS => CSS': 'SASS/LESS',
  'Tailwind CSS': 'Tailwind',
  'TailwindCSS': 'Tailwind',
  '中国色, 中国传统色, 色名, 色谱, 中国色名综览': '中国色',
  'Neumorphism.io': 'Neumorphism',
  'CSS Inspiration': 'CSS Insp.',
  'iconfont-阿里巴巴矢量图标库': 'Iconfont',
  'L7·蚂蚁地理空间数据可视化': 'AntV L7',
  'AI咖 - AI提示词管理平台': 'AI咖',
  'v0 by Vercel': 'v0',
  'Google AI Studio': 'AI Studio',
  'Firebase Studio': 'Firebase',
  'Apache ECharts': 'ECharts'
};

// Regex to find title: '...' and inject tag: '...', right after it, if it doesn't exist
content = content.replace(/title:\s*'([^']+)',/g, (match, title) => {
  const shortTitle = mappings[title] || title;
  return `${match}\n        tag: '${shortTitle}',`;
});

fs.writeFileSync(dataPath, content, 'utf-8');
console.log('Successfully added tag fields to data.ts');
