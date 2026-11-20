"""
Convert images for a project into optimized WebP (two widths) and register them.

    python3 tools/images.py <slug> path/to/image1.png [path/to/image2.jpg ...]

Creates assets/img/works/<slug>/<name>-<width>.webp and updates src/images.json.
<name> is the file name without extension. Requires Pillow: pip install pillow
"""
import json, os, sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
slug, files = sys.argv[1], sys.argv[2:]
meta_path = os.path.join(ROOT, 'src', 'images.json')
meta = json.load(open(meta_path))
out = os.path.join(ROOT, 'assets', 'img', 'works', slug)
os.makedirs(out, exist_ok=True)
for f in files:
    name = os.path.splitext(os.path.basename(f))[0]
    im = Image.open(f).convert('RGB')
    w, h = im.size
    big = min(1600, w)
    sizes = [big, big // 2]
    for sw in sizes:
        im.resize((sw, round(h * sw / w)), Image.LANCZOS).save(os.path.join(out, f'{name}-{sw}.webp'), 'WEBP', quality=80, method=6)
    meta[f'{slug}/{name}'] = {'w': big, 'h': round(h * big / w), 'sizes': sizes}
    print(f'{slug}/{name}', sizes)
json.dump(meta, open(meta_path, 'w'), indent=0)
