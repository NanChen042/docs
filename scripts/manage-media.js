#!/usr/bin/env node

/**
 * 媒体文件管理脚本
 * 用于在两次提交之间管理媒体文件的包含/排除
 */

const fs = require('fs');
const path = require('path');

const GITIGNORE_PATH = '.gitignore';

// 媒体文件规则
const MEDIA_RULES = [
  '',
  '# ========================================',
  '# 媒体文件 (第二次提交时移除这些规则)',
  '# ========================================',
  '',
  '# 视频文件',
  '*.mp4',
  '*.avi',
  '*.mov',
  '*.wmv',
  '*.flv',
  '*.webm',
  '*.mkv',
  '',
  '# 音频文件',
  '*.mp3',
  '*.m4a',
  '*.wav',
  '*.aac',
  '*.ogg',
  '*.wma',
  '',
  '# 图片文件 (保留小的图标，排除大的图片)',
  'docs/column/cjx/assets/**/*.jpg',
  'docs/column/cjx/assets/**/*.jpeg',
  'docs/column/cjx/assets/**/*.png',
  'docs/column/cjx/assets/**/*.gif',
  'docs/column/cjx/assets/**/*.bmp',
  'docs/column/cjx/assets/**/*.tiff',
  'docs/column/cjx/assets/**/*.webp',
  '',
  '# 保留小图标文件',
  '!docs/public/icon/**',
  '!docs/public/*.ico',
  '!docs/public/*.png'
];

function readGitignore() {
  if (!fs.existsSync(GITIGNORE_PATH)) {
    return [];
  }
  return fs.readFileSync(GITIGNORE_PATH, 'utf8').split('\n');
}

function writeGitignore(lines) {
  fs.writeFileSync(GITIGNORE_PATH, lines.join('\n'));
}

function excludeMedia() {
  console.log('🚫 排除媒体文件...');
  
  let lines = readGitignore();
  
  // 移除现有的媒体规则
  const startIndex = lines.findIndex(line => line.includes('媒体文件'));
  if (startIndex !== -1) {
    const endIndex = lines.findIndex((line, index) => 
      index > startIndex && line.trim() === '' && 
      !line.includes('#') && !line.includes('*')
    );
    lines.splice(startIndex - 1, endIndex - startIndex + 2);
  }
  
  // 添加媒体规则
  lines = lines.concat(MEDIA_RULES);
  
  writeGitignore(lines);
  console.log('✅ 媒体文件已排除');
}

function includeMedia() {
  console.log('✅ 包含媒体文件...');
  
  let lines = readGitignore();
  
  // 移除媒体规则
  const startIndex = lines.findIndex(line => line.includes('媒体文件'));
  if (startIndex !== -1) {
    let endIndex = lines.length;
    for (let i = startIndex; i < lines.length; i++) {
      if (lines[i].trim() === '' && i > startIndex + 5) {
        endIndex = i;
        break;
      }
    }
    lines.splice(startIndex - 1, endIndex - startIndex + 1);
  }
  
  writeGitignore(lines);
  console.log('✅ 媒体文件已包含');
}

function showHelp() {
  console.log(`
📦 媒体文件管理脚本

用法:
  node scripts/manage-media.js <command>

命令:
  exclude    排除媒体文件 (第一次提交前使用)
  include    包含媒体文件 (第二次提交前使用)
  help       显示帮助信息

示例:
  # 第一次提交前
  node scripts/manage-media.js exclude
  git add .
  git commit -m "feat: 初始化项目结构和代码"
  
  # 第二次提交前
  node scripts/manage-media.js include
  git add .
  git commit -m "feat: 添加项目媒体文件"
`);
}

// 主函数
function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'exclude':
      excludeMedia();
      break;
    case 'include':
      includeMedia();
      break;
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
    default:
      console.log('❌ 未知命令:', command);
      showHelp();
      process.exit(1);
  }
}

if (require.main === module) {
  main();
}
