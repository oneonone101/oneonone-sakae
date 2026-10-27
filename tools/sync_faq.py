"""src/<page>.main.html の FAQ（<details>）から、src/<page>.head.html の FAQPage 構造化データを作り直す。
使い方: python3 tools/sync_faq.py
"""
import html, json, pathlib, re
ROOT = pathlib.Path(__file__).resolve().parent.parent
for head in sorted((ROOT / "src").glob("*.head.html")):
    page = head.name.split(".")[0]
    main = (ROOT / "src" / f"{page}.main.html").read_text(encoding="utf-8")
    qa = []
    for m in re.finditer(r"<details[^>]*>\s*<summary>(.*?)</summary>\s*<p>(.*?)</p>\s*</details>", main, re.S):
        clean = lambda s: html.unescape(re.sub(r"<[^>]+>", "", re.sub(r'<span class="(?:pv-only|chk)">.*?</span>', "", s, flags=re.S))).strip()
        qa.append({"@type": "Question", "name": clean(m.group(1)),
                   "acceptedAnswer": {"@type": "Answer", "text": clean(m.group(2))}})
    if not qa:
        continue
    data = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": qa}
    head.write_text('<script type="application/ld+json">\n' + json.dumps(data, ensure_ascii=False, indent=1) + "\n</script>\n", encoding="utf-8")
    print(page, len(qa), "questions")
