# 开发规范和规则

- VitePress部署优化规则：1.光标文件路径使用/docs/前缀确保构建时正确解析 2.配置代码分割manualChunks减少包体积警告 3.添加环境变量语法高亮支持解决env语言警告 4.使用NODE_OPTIONS增加内存限制优化构建性能 5.配置chunkSizeWarningLimit=1000提高警告阈值
