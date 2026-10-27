from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
root=Path.cwd()
class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.ids=[]; self.refs=[]
    def handle_starttag(self, tag, attrs):
        attrs=dict(attrs)
        if "id" in attrs:self.ids.append(attrs["id"])
        for key in ("href","src"):
            if attrs.get(key):self.refs.append(attrs[key])
pages={}
for filename in ("index.html","it.html","creative.html"):
    p=Page();p.feed((root/filename).read_text(encoding="utf-8-sig"));pages[filename]=p
errors=[]
for name,p in pages.items():
    if len(p.ids)!=len(set(p.ids)):errors.append(f"{name}: duplicate ids")
    for ref in p.refs:
        url=urlsplit(ref)
        if url.scheme or url.netloc:continue
        target=url.path or name
        if not (root/target).exists():errors.append(f"{name}: missing {target}")
        if url.fragment and target in pages and url.fragment not in pages[target].ids:errors.append(f"{name}: missing anchor {ref}")
assert not errors, errors
print("PASS: three pages, local assets, internal links, fragment targets, and unique IDs.")
