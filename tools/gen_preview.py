#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
微言字体 - 本地预览图生成器

读取 data/fonts.json，对每条含本地字体源文件（src 字段，或 fonts/<id>.<ext>）的条目，
用 PIL 把统一短语「人微言轻-微言大义」渲染为 PNG，输出到 entry["preview"] 指定路径。

用法:
    python tools/gen_preview.py
    python tools/gen_preview.py --text "自定义预览文字"
    python tools/gen_preview.py --data data/fonts.json --root .

说明:
    - 字体二进制不进 git，仅用于本地生成预览图。
    - src 为本地字体路径（绝对或相对仓库根），提交时保留无妨（仅本机可用）。
    - 真实下载链接由夸克网盘提供，写进 fonts.json 的 quark 字段。
"""

import argparse
import json
import os

from PIL import Image, ImageDraw, ImageFont

DEFAULT_TEXT = "人微言轻-微言大义"
MAX_W = 1000          # 预览文字最大宽度（px），超出则自动缩小字号
PAD = 60              # 边距
FONT_SIZE = 220       # 初始字号
CAPTION_SIZE = 40     # 底部字体名标注字号
EXTS = (".ttf", ".otf", ".ttc", ".woff", ".woff2")


def load_font(path, size):
    if path.lower().endswith(".ttc"):
        return ImageFont.truetype(path, size, index=0)
    return ImageFont.truetype(path, size)


def resolve_src(entry, root):
    src = entry.get("src")
    if src:
        return src if os.path.isabs(src) else os.path.join(root, src)
    # 退路：fonts/<id>.<ext>
    base = os.path.join(root, "fonts", entry["id"])
    for ext in EXTS:
        if os.path.exists(base + ext):
            return base + ext
    return None


def generate(entry, root, text):
    src = resolve_src(entry, root)
    if not src or not os.path.exists(src):
        print(f"[skip] {entry.get('id')}: 未找到本地字体源 ({src})")
        return False

    out = entry.get("preview") or os.path.join("previews", entry["id"] + ".png")
    out = out if os.path.isabs(out) else os.path.join(root, out)
    os.makedirs(os.path.dirname(out), exist_ok=True)

    # 自适应字号：先按初始字号测量，超出 MAX_W 则等比缩小
    size = FONT_SIZE
    font = load_font(src, size)
    bbox = font.getbbox(text)
    w = bbox[2] - bbox[0]
    if w > MAX_W:
        size = max(40, int(size * MAX_W / w))
        font = load_font(src, size)
        bbox = font.getbbox(text)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]

    cap = entry.get("name", "")
    cap_h = (CAPTION_SIZE + 16) if cap else 0
    img_w = text_w + PAD * 2
    img_h = text_h + PAD * 2 + cap_h

    img = Image.new("RGB", (img_w, img_h), "#ffffff")
    d = ImageDraw.Draw(img)
    # 以左上角对齐文字真实边界，避免多余留白
    d.text((PAD - bbox[0], PAD - bbox[1]), text, font=font, fill="#1a1a1a")

    if cap:
        try:
            cfont = load_font(src, CAPTION_SIZE)
        except Exception:
            cfont = ImageFont.load_default()
        d.text((PAD, PAD + text_h + 12), cap, font=cfont, fill="#888888")

    img.save(out, "PNG")
    print(f"[ok]   {entry.get('id')} -> {os.path.relpath(out, root)}")
    return True


def main():
    ap = argparse.ArgumentParser(description="微言字体预览图生成器")
    ap.add_argument("--data", default=None, help="字体清单 JSON 路径")
    ap.add_argument("--root", default=None, help="仓库根目录")
    ap.add_argument("--text", default=DEFAULT_TEXT, help="预览文字")
    args = ap.parse_args()

    root = args.root or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_path = args.data or os.path.join(root, "data", "fonts.json")
    if not os.path.exists(data_path):
        print(f"字体清单不存在: {data_path}")
        return

    with open(data_path, encoding="utf-8") as f:
        data = json.load(f)

    print(f"读取 {len(data)} 条字体，生成预览图（文字：{args.text}）")
    ok = 0
    for e in data:
        ok += 1 if generate(e, root, args.text) else 0
    print(f"完成：成功 {ok} / 共 {len(data)}")


if __name__ == "__main__":
    main()
