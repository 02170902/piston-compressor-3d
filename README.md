# 活塞式制冷压缩机 · 三维机械实验室

独立的三维互动网站，展示压缩机完整外观及剖切运转过程。支持旋转、缩放、全屏、部件名称点选，以及再膨胀、吸气、压缩、排气四个过程。

在线访问：[打开三维压缩机网站](https://02170902.github.io/piston-compressor-3d/)

## GitHub Pages

将本目录文件上传到仓库的 `main` 分支后，在 **Settings → Pages** 中选择 **Deploy from a branch → main → /(root)** 并保存。根目录包含 `.nojekyll`，使用静态文件直接发布。

## 本地查看

```sh
python -m http.server 8767 --bind 127.0.0.1
```

访问 `http://127.0.0.1:8767/`。请通过 HTTP 打开，浏览器才能加载三维 JavaScript 模块。

所有三维依赖随网站放在 `vendor/` 内，运行时不依赖外部 CDN。Three.js 0.160.1 的许可证位于 `vendor/THREE-LICENSE.txt`。

## 模型说明

依据通用单缸往复式结构建模，不对应特定厂牌尺寸。余隙比 7%、排吸压力比 4、多变指数 1.2 为教学设定；忽略阀门压降、阀片惯性和泄漏，阀片升程和气流为放大示意，非实测数据。
