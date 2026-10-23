# 微言字体

收集开源与免费商用字体的静态站点。统一用「**人微言轻-微言大义**」渲染预览图，字体文件走夸克网盘分发。

## 目录结构

```
微言字体/
├── index.html            # 主页面
├── assets/
│   ├── css/style.css
│   └── js/app.js         # 载入 fonts.json，渲染 + 筛选 + 搜索
├── data/
│   └── fonts.json        # 字体清单（驱动整个页面）
├── previews/             # 预览图 PNG（进 git）
├── tools/
│   └── gen_preview.py    # 本地预览图生成器（PIL）
├── fonts/                # 本地字体源文件（不进 git）
├── .gitignore
└── README.md
```

## 新增一款字体的工作流

1. 把字体文件放到本地任意路径（推荐 `fonts/`，该目录已被 gitignore）
2. 在 `data/fonts.json` 追加一条记录，`src` 指向本地字体文件
3. 运行预览图生成：
   ```bash
   python tools/gen_preview.py
   ```
4. 字体文件打包上传夸克网盘，把分享链接填进 `quark` 字段（`src` 可留可删）
5. `git add previews/ data/fonts.json && git commit && git push`，Pages 自动更新

> 如果字体文件按 `fonts/<id>.<ext>` 命名，`src` 字段可以省略，脚本会自动找到。

## 本地预览

页面通过 fetch 加载 JSON，不能用 `file://` 直接打开，需起本地服务：

```bash
python -m http.server 8080
# 浏览器打开 http://localhost:8080
```

## 部署

GitHub Pages，与 wei8 同模式：仓库 Settings → Pages → 分支 main / 根目录。

## fonts.json 字段说明

| 字段 | 说明 |
| --- | --- |
| `id` | 唯一标识，同时决定预览图文件名 |
| `name` | 显示名称（也是预览图底部的标注文字） |
| `style` | 风格：`serif` 衬线 / `sans` 无衬线 / `handwritten` 手写 / `mono` 等宽 / `decorative` 装饰 |
| `scene` | 用途（数组）：`title` 标题 / `body` 正文 / `code` 代码 / `poster` 海报 / `logo` Logo / `ui` UI |
| `license` | 协议短标（如 OFL），显示为绿色徽章 |
| `licenseNote` | 协议说明（悬停可见） |
| `desc` | 简介 |
| `src` | 本地字体文件路径（仅用于生成预览图，不参与页面展示） |
| `preview` | 预览图相对路径 |
| `quark` | 夸克网盘分享链接；含「待补充」字样时按钮置灰 |

## 设计决策

- **字体二进制不进 git**：体积大、部分协议限制再分发，只走夸克网盘。
- **预览图本地生成**：规避 GitHub Pages 无法实时渲染大字体文件的问题（MengLizhi/free-font 项目踩过的坑），预览图体积小、加载快、跨字体可比。
- **分类 = 风格 + 用途**：参考 100font / 猫啃网的成熟分类范式。
- **预览文字统一**「人微言轻-微言大义」：呼应项目名，且保证跨字体视觉效果可直接对比。
