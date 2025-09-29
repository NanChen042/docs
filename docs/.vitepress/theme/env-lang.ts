// 环境变量文件语法高亮支持
// 解决 "The language 'env' is not loaded" 警告

export const envLanguageSupport = {
  // 注册环境变量文件语法高亮
  register() {
    if (typeof window !== 'undefined' && window.Prism) {
      // 定义 .env 文件的语法规则
      window.Prism.languages.env = {
        'comment': {
          pattern: /#.*/,
          greedy: true
        },
        'variable': {
          pattern: /^[A-Z_][A-Z0-9_]*(?=\s*=)/m,
          alias: 'constant'
        },
        'value': {
          pattern: /=.*/,
          inside: {
            'string': {
              pattern: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/,
              greedy: true
            },
            'number': /\b\d+(?:\.\d+)?\b/,
            'boolean': /\b(?:true|false)\b/i
          }
        },
        'operator': /=/
      };

      // 为常见的环境变量文件扩展名注册语言
      window.Prism.languages.dotenv = window.Prism.languages.env;
      window.Prism.languages.environment = window.Prism.languages.env;
    }
  }
};
