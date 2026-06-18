# 3.1 地域流派本地打开说明

本文件夹是“3.1 地域流派”板块的源码入口。该板块使用 Vite 运行，并依赖 `china.geojson` 等本地数据资源，因此不建议直接双击 `index.html` 打开源码页面。

## 推荐打开方式

在当前文件夹中双击：

```text
启动当前网页.cmd
```

脚本会自动启动本地服务，并在浏览器中打开页面。  
如果需要直接查看某个乐器，也可以使用对应脚本：

```text
启动鼓乐可视化.cmd
启动笛流派可视化.cmd
启动琴流派可视化.cmd
启动埙地图可视化.cmd
```

## 命令行打开方式

如果使用终端，请在当前目录运行：

```bash
npm install
npm run dev
```

然后根据终端提示打开本地地址，通常类似：

```text
http://localhost:5173/
```

## 乐器参数

统一入口为：

```text
index.html?instrument=sheng
index.html?instrument=gu
index.html?instrument=di
index.html?instrument=qin
index.html?instrument=xun
```

前面页面跳转到本板块时，应使用：

```html
../3.1地域流派/index.html?instrument=sheng
```

## 构建与部署

生成静态部署文件：

```bash
npm run build
```

构建结果会输出到：

```text
dist/
```

如果 GitHub Pages 不配置 Actions 自动构建，应部署 `dist` 中的内容。源码根目录依赖 Vite，本身不能作为纯静态页面直接双击运行。

## 常见问题

如果出现 `127.0.0.1 refused to connect`，通常说明本地服务没有启动。请重新双击 `启动当前网页.cmd`，或在终端运行 `npm run dev`。

如果地图不显示或数据加载失败，请确认是通过本地服务打开，而不是直接双击 `index.html`。

如果页面在线部署后乱码或资源缺失，请优先检查是否已经重新运行 `npm run build`，以及 `dist` 中是否包含数据和静态资源。
