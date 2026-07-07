import json
import re
import sys
from datetime import date
from pathlib import Path


APP_DIR = Path(__file__).resolve().parents[1]

PAGE_FROM = 48
PAGE_TO = 80

TERMS = [
    {
        "en": ["First Mystery"],
        "pl": ["Pierwsze Misterium", "Pierwszego Misterium", "Pierwszemu Misterium", "Pierwszym Misterium"],
        "label": "First Mystery -> Pierwsze Misterium",
    },
    {
        "en": ["Light of lights"],
        "pl": ["Światłość Światłości", "Światłości Światłości"],
        "label": "Light of lights -> Światłość Światłości",
    },
    {
        "en": ["Self-willed"],
        "pl": ["Samowoln"],
        "label": "Self-willed -> Samowolny",
    },
    {
        "en": ["lion-faced power"],
        "pl": ["lwim obliczu", "obliczu lwa"],
        "label": "lion-faced power -> moc o lwim obliczu",
    },
    {
        "en": ["repentance", "repentances"],
        "pl": ["pokut", "pokuc"],
        "label": "repentance -> pokuta",
    },
    {
        "en": ["Treasury of the Light"],
        "pl": ["Skarbiec Światłości", "Skarbca Światłości", "Skarbcem Światłości", "Skarbcu Światłości"],
        "label": "Treasury of the Light -> Skarbiec Światłości",
    },
    {
        "en": ["aeon", "æon", "aeons", "æons"],
        "pl": ["eon"],
        "label": "aeon/æon -> eon",
    },
]


def normalize(text):
    return re.sub(r"\s+", " ", text or "").strip()


def read_data_pages():
    text = (APP_DIR / "data.js").read_text(encoding="utf-8")
    payload = re.sub(r"^\s*window\.PISTIS_SOPHIA_DATA\s*=\s*", "", text).rstrip(";\n ")
    return json.loads(payload)


def read_polish_translations():
    text = (APP_DIR / "app.js").read_text(encoding="utf-8")
    start = text.index("const polishTranslations = {")
    end = text.index("\n};", start)
    block = text[start:end]
    entries = {}
    for match in re.finditer(r"\n\s*(\d+):\s*`(.*?)`\s*,?", block, re.S):
        entries[int(match.group(1))] = match.group(2).replace("\\`", "`")
    override_marker = "Object.assign(polishTranslations, {"
    if override_marker in text:
        start = text.index(override_marker)
        end = text.index("\n});", start)
        block = text[start:end]
        for match in re.finditer(r"\n\s*(\d+):\s*`(.*?)`\s*,?", block, re.S):
            entries[int(match.group(1))] = match.group(2).replace("\\`", "`")
    return entries


def count_any(text, needles):
    low = text.lower()
    return sum(low.count(needle.lower()) for needle in needles)


def manuscript_refs(text):
    return sorted(set(re.findall(r"\|(\d{1,3})\.?", text)))


def chapter_numbers(text, lang):
    if lang == "pl":
        return sorted(set(int(n) for n in re.findall(r"ROZDZIAŁ\s+(\d+)", text, re.I)))
    return sorted(set(int(n) for n in re.findall(r"CHAPTER\s+(\d+)", text, re.I)))


def audit_page(page, en, pl):
    en_norm = normalize(en)
    pl_norm = normalize(pl)
    ratio = round(len(pl_norm) / len(en_norm), 2) if en_norm else None
    issues = []

    if not pl_norm:
        issues.append("brak polskiej warstwy")
    elif ratio is not None and ratio < 0.55:
        issues.append("możliwy skrót")
    elif ratio is not None and ratio > 1.9:
        issues.append("możliwe rozbudowanie")

    en_refs = manuscript_refs(en)
    pl_refs = manuscript_refs(pl)
    missing_refs = [ref for ref in en_refs if ref not in pl_refs]
    if missing_refs:
        issues.append("brak znaczników Schw.-Pet. w PL: " + ", ".join(missing_refs))

    en_chapters = chapter_numbers(en, "en")
    pl_chapters = chapter_numbers(pl, "pl")
    missing_chapters = [str(num) for num in en_chapters if num not in pl_chapters]
    if missing_chapters:
        issues.append("brak nagłówka rozdziału w PL: " + ", ".join(missing_chapters))

    term_flags = []
    for term in TERMS:
        en_count = count_any(en, term["en"])
        pl_count = count_any(pl, term["pl"])
        if en_count and not pl_count:
            term_flags.append(term["label"])
    if term_flags:
        issues.append("sprawdzić terminologię: " + "; ".join(term_flags))

    if not issues:
        issues.append("OK")

    return {
        "page": page,
        "en_len": len(en_norm),
        "pl_len": len(pl_norm),
        "ratio": ratio,
        "en_refs": en_refs,
        "pl_refs": pl_refs,
        "en_chapters": en_chapters,
        "pl_chapters": pl_chapters,
        "issues": issues,
        "en_preview": en_norm[:420],
        "pl_preview": pl_norm[:420],
    }


def main():
    page_from = int(sys.argv[1]) if len(sys.argv) > 1 else PAGE_FROM
    page_to = int(sys.argv[2]) if len(sys.argv) > 2 else PAGE_TO
    out_md = APP_DIR / f"PISTIS_PAGE_AUDIT_{page_from}_{page_to}.md"
    out_json = APP_DIR / f"pistis-page-audit-{page_from}-{page_to}.json"

    data = read_data_pages()
    translations = read_polish_translations()
    source_pages = {item["page"]: item["text"] for item in data["pages"]}

    rows = []
    for page in range(page_from, page_to + 1):
        rows.append(audit_page(page, source_pages.get(page, ""), translations.get(page, "")))

    issue_counts = {}
    for row in rows:
        for issue in row["issues"]:
            key = issue.split(":")[0]
            issue_counts[key] = issue_counts.get(key, 0) + 1

    payload = {
        "generated": str(date.today()),
        "range": [page_from, page_to],
        "issue_counts": issue_counts,
        "pages": rows,
    }
    out_json.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    lines = []
    lines.append(f"# Audyt strona-po-stronie: Mead {page_from}-{page_to}")
    lines.append("")
    lines.append(f"Data raportu: {payload['generated']}")
    lines.append("")
    lines.append("## Podsumowanie")
    lines.append("")
    lines.append(f"- Zakres: Mead s. {page_from}-{page_to}.")
    lines.append(f"- Liczba sprawdzonych stron: {len(rows)}.")
    lines.append(f"- Strony bez automatycznych uwag: {sum(1 for row in rows if row['issues'] == ['OK'])}.")
    flagged = [row for row in rows if row["issues"] != ["OK"]]
    lines.append(f"- Strony z uwagami automatycznymi: {len(flagged)}.")
    lines.append("")
    lines.append("## Tabela audytu")
    lines.append("")
    lines.append("| Mead s. | PL/EN | EN znaczniki | PL znaczniki | Rozdziały EN/PL | Uwagi |")
    lines.append("|---:|---:|---|---|---|---|")
    for row in rows:
        en_refs = ", ".join(row["en_refs"]) or "-"
        pl_refs = ", ".join(row["pl_refs"]) or "-"
        chapters = f"{','.join(map(str, row['en_chapters'])) or '-'} / {','.join(map(str, row['pl_chapters'])) or '-'}"
        issues = "; ".join(row["issues"])
        lines.append(f"| {row['page']} | {row['ratio']} | {en_refs} | {pl_refs} | {chapters} | {issues} |")
    lines.append("")
    lines.append("## Miejsca do ręcznej kontroli")
    lines.append("")
    for row in flagged:
        lines.append(f"### Mead s. {row['page']}")
        lines.append("")
        lines.append(f"- Uwagi: {'; '.join(row['issues'])}.")
        lines.append(f"- EN: {row['en_preview']}")
        lines.append(f"- PL: {row['pl_preview']}")
        lines.append("")
    lines.append("## Wniosek")
    lines.append("")
    lines.append(
        "Automatyczny audyt nie zastępuje redakcji, ale dobrze wskazuje priorytety. "
        "Najpierw trzeba ręcznie przejrzeć strony ze znacznikami Schw.-Pet. obecnymi w EN, a nieobecnymi w PL, "
        "potem strony z brakującymi nagłówkami rozdziałów i dopiero później niuanse terminologiczne."
    )
    out_md.write_text("\n".join(lines), encoding="utf-8")
    print(out_md)


if __name__ == "__main__":
    main()
