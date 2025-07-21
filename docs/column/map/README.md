# 地图组件使用说明

## 安装依赖

本地图组件基于腾讯位置服务SDK开发，使用前需要安装相关依赖：

```bash
npm install @tencent/tmap-jsapi-for-vue3
```

## 配置API密钥

1. 前往[腾讯位置服务开发平台](https://lbs.qq.com/)申请开发者账号
2. 创建应用并获取API密钥
3. 在组件中配置API密钥：

```vue
<template>
  <tlbs-map
    api-key="YOUR_API_KEY"
    :center="center"
    :zoom="zoom"
    @map_inited="onMapInited"
  >
    <!-- 组件内容 -->
  </tlbs-map>
</template>
```

## 当前问题排查

如果地图未正常显示，请检查以下问题：

1. 确认已安装腾讯位置服务SDK
2. 确认API密钥正确且有效
3. 检查网络连接是否正常
4. 查看控制台是否有相关错误信息

## 功能说明

### 基础功能

- 地图显示与缩放
- 标记点添加与管理
- 位置搜索
- 周边POI查询
- 用户定位

### 高级功能

- 自定义地图样式
- 路径规划
- 地理编码与逆地理编码
- 绘制工具

## 常见问题

### 1. 为什么地图加载失败？

可能原因：
- API密钥无效或受限
- SDK未正确安装
- 网络连接问题

解决方案：
- 更新API密钥并确认权限
- 重新安装SDK
- 检查网络连接

### 2. 为什么某些功能无法使用？

可能原因：
- 功能依赖的API未开通
- 功能需要额外权限
- 功能需要高级版本的SDK

解决方案：
- 确认API权限配置
- 升级SDK版本

## 联系支持

如有任何问题，请联系管理员或参考[腾讯位置服务开发文档](https://lbs.qq.com/webApi/javascriptGL/glGuide/glBasic)。 
