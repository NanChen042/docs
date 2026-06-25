const https = require('https');
const fs = require('fs');
const path = require('path');

// 批量配置拉取任务
const syncTasks = [
  {
    name: 'lowcode-form-builder (tech_blog)',
    // 按照数组顺序尝试拉取，方便兼容 main 和 master 分支
    urls: [
      'https://raw.githubusercontent.com/NanChen042/lowcode-form-builder/main/tech_blog.md',
      'https://raw.githubusercontent.com/NanChen042/lowcode-form-builder/master/tech_blog.md'
    ],
    dest: path.resolve(__dirname, '../docs/column/web/lowcode-form-builder.md')
  }
];

function fetchFile(urls, dest, name, index = 0) {
  if (index >= urls.length) {
    console.error(`[失败] 无法拉取文档 "${name}"，所有地址尝试均失败。`);
    return;
  }
  const urlStr = urls[index];
  https.get(urlStr, (res) => {
    if (res.statusCode === 200) {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const dir = path.dirname(dest);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(dest, data);
        console.log(`[成功] 已从 ${urlStr} 拉取 "${name}" 并保存本地`);
      });
    } else {
      // 失败则尝试数组中的下一个备用 url
      fetchFile(urls, dest, name, index + 1);
    }
  }).on('error', (e) => {
    console.error(`[网络错误] 拉取 "${name}" 失败: ${e.message}`);
    fetchFile(urls, dest, name, index + 1);
  });
}

// 遍历执行所有任务
syncTasks.forEach(task => {
  fetchFile(task.urls, task.dest, task.name);
});
