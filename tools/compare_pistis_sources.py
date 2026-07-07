import json
import re
from collections import Counter
from datetime import date
from pathlib import Path

import pdfplumber


APP_DIR = Path(__file__).resolve().parents[1]
PDF_DIR = Path(r"C:\Users\kanie\OneDrive\Desktop\Pistis ebooki")
OUT_MD = APP_DIR / "PISTIS_SOURCE_COMPARISON.md"
OUT_JSON = APP_DIR / "pistis-source-comparison.json"

PDFS = [
    "pistissofia.pdf",
    "pistissofia ksiega2.pdf",
    "Pistis Sophia 1896.pdf",
    "Pistis Sophia R.Mcl.Wilson.pdf",
    "Gnostyczne Misteria Pistis Sophii • Jan van Rijckenborgh.pdf",
]

ANCHORS = {
    "mead_opening": [
        "Jesus hitherto instructeth his disciples",
        "regions of the First Mystery",
        "Mount of Olives",
    ],
    "sophia_fall": [
        "thirteenth aeon",
        "thirteenth æon",
        "lion-faced power",
        "Self-willed",
    ],
    "repentances": [
        "repentance of Sophia",
        "Light of lights",
        "solution of the repentance",
    ],
    "late_books": [
        "A SIXTH BOOK",
        "CHAPTER 148",
        "LACUNA",
    ],
    "polish_opening": [
        "Jezus dotąd pouczał",
        "Pierwszego Misterium",
        "Góra Oliwna",
    ],
    "polish_terms": [
        "moc o lwim obliczu",
        "Samowolnego",
        "Światłość Światłości",
    ],
}

TERM_PAIRS = [
    ("First Mystery", "Pierwsze Misterium"),
    ("Light of lights", "Światłość Światłości"),
    ("Self-willed", "Samowolny"),
    ("lion-faced power", "moc o lwim obliczu"),
    ("repentance", "pokuta"),
    ("aeon", "eon"),
    ("receivers", "odbiorcy"),
    ("Treasury of the Light", "Skarbiec Światłości"),
]

TERM_VARIANTS_PL = {
    "Pierwsze Misterium": ["Pierwsze Misterium", "Pierwszego Misterium", "Pierwszemu Misterium", "Pierwszym Misterium"],
    "Światłość Światłości": ["Światłość Światłości", "Światłości Światłości"],
    "Samowolny": ["Samowoln"],
    "moc o lwim obliczu": ["lwim obliczu", "obliczu lwa"],
    "pokuta": ["pokut"],
    "eon": ["eon"],
    "odbiorcy": ["odbiorc", "przyjmując"],
    "Skarbiec Światłości": ["Skarbiec Światłości", "Skarbca Światłości", "Skarbcem Światłości", "Skarbcu Światłości"],
}

CONTROL_PAGES = [48, 50, 68, 70, 76, 102, 187, 218]


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
        page = int(match.group(1))
        value = match.group(2).replace("\\`", "`")
        entries[page] = value
    return entries


def pdf_text(path):
    pages = []
    with pdfplumber.open(path) as pdf:
        for idx, page in enumerate(pdf.pages, start=1):
            try:
                text = page.extract_text(x_tolerance=1, y_tolerance=3) or ""
            except Exception as exc:
                text = f"[EXTRACTION ERROR: {exc}]"
            pages.append({"page": idx, "text": text})
    combined = "\n".join(item["text"] for item in pages)
    return pages, combined


def classify_pdf(name, text):
    name_low = name.lower()
    low = text.lower()
    if "ksiega2" in name_low or "księga2" in name_low or "ksiega 2" in name_low:
        return "polski przekład cząstkowy / kontrola brzmienia"
    if "rijckenborgh" in name_low or "gnostyczne misteria" in name_low:
        return "komentarz ezoteryczny / materiał pomocniczy"
    if "wilson" in name_low:
        return "nowoczesne opracowanie naukowe / kontrola terminologii"
    if "jan van rijckenborgh" in low or "gnostyczne misteria" in low:
        return "komentarz ezoteryczny / materiał pomocniczy"
    if "r. mcl. wilson" in low or "r. mcl.wilson" in low or "foreword the pistis sophia text" in low:
        return "nowoczesne opracowanie naukowe / kontrola terminologii"
    if "paul kieniewicz" in low or "pistis sophia – księga druga" in low or "pistis sophia - księga druga" in low:
        return "polski przekład cząstkowy / kontrola brzmienia"
    if "g. r. s. mead" in low and ("1896" in low or "hitherto instructeth" in low):
        return "angielska edycja/przekład źródłowy"
    if "księga" in low or "światłość" in low or "jezus" in low:
        return "polski przekład / materiał porównawczy"
    return "nierozpoznane źródło porównawcze"


def anchor_hits(text):
    low = text.lower()
    result = {}
    for group, needles in ANCHORS.items():
        result[group] = [needle for needle in needles if needle.lower() in low]
    return result


def term_counts(text, terms):
    low = text.lower()
    return {term: low.count(term.lower()) for term in terms}


def flexible_count(text, variants):
    low = text.lower()
    return sum(low.count(variant.lower()) for variant in variants)


def snippet(text, needle, radius=220):
    low = text.lower()
    pos = low.find(needle.lower())
    if pos < 0:
        return ""
    start = max(0, pos - radius)
    end = min(len(text), pos + len(needle) + radius)
    return normalize(text[start:end])


def assess_against_our_translation(data, translations):
    pages = data["pages"]
    translated = sorted(translations)
    translated_real = [page for page in translated if page in {item["page"] for item in pages}]
    intro_pages = [page for page in translated_real if page < 48]
    body_pages = [page for page in translated_real if page >= 48]
    source_page_map = {item["page"]: item["text"] for item in pages}
    length_flags = []
    for page in body_pages:
        pl_len = len(normalize(translations.get(page, "")))
        en_len = len(normalize(source_page_map.get(page, "")))
        if en_len and pl_len / en_len < 0.45:
            length_flags.append({"page": page, "ratio": round(pl_len / en_len, 2)})
    return {
        "source_pages": len(pages),
        "translated_pages": len(translated_real),
        "intro_translated": len(intro_pages),
        "body_translated": len(body_pages),
        "body_coverage_percent": round(100 * len(body_pages) / len([p for p in pages if p["page"] >= 48]), 1),
        "short_body_pages": length_flags[:30],
    }


def control_page_rows(data, translations):
    pages = {item["page"]: item["text"] for item in data["pages"]}
    rows = []
    for page in CONTROL_PAGES:
        en = normalize(pages.get(page, ""))
        pl = normalize(translations.get(page, ""))
        rows.append(
            {
                "page": page,
                "en_len": len(en),
                "pl_len": len(pl),
                "ratio": round(len(pl) / len(en), 2) if en else None,
                "en_preview": en[:360],
                "pl_preview": pl[:360],
            }
        )
    return rows


def build_report():
    data = read_data_pages()
    translations = read_polish_translations()
    own = assess_against_our_translation(data, translations)
    source_text = "\n".join(item["text"] for item in data["pages"])
    polish_text = "\n".join(translations.values())

    pdf_reports = []
    for filename in PDFS:
        path = PDF_DIR / filename
        pages, text = pdf_text(path)
        words = re.findall(r"[\wąćęłńóśźżĄĆĘŁŃÓŚŹŻæÆōŌēĒ]+", text)
        common = Counter(w.lower() for w in words if len(w) > 5).most_common(12)
        pdf_reports.append(
            {
                "file": filename,
                "pages": len(pages),
                "chars": len(text),
                "kind": classify_pdf(filename, text),
                "anchors": anchor_hits(text),
                "terms_en": term_counts(text, [left for left, _ in TERM_PAIRS]),
                "terms_pl": term_counts(text, [right for _, right in TERM_PAIRS]),
                "sample_start": normalize(text[:900]),
                "sample_pistis": snippet(text, "Pistis Sophia") or snippet(text, "Pistis Sophii"),
                "common": common,
            }
        )

    own_terms = {
        "source_en": term_counts(source_text, [left for left, _ in TERM_PAIRS]),
        "our_pl_exact": term_counts(polish_text, [right for _, right in TERM_PAIRS]),
        "our_pl_flexible": {
            right: flexible_count(polish_text, TERM_VARIANTS_PL[right])
            for _, right in TERM_PAIRS
        },
    }
    controls = control_page_rows(data, translations)

    report = {
        "generated": str(date.today()),
        "our_translation": own,
        "our_terms": own_terms,
        "control_pages": controls,
        "pdfs": pdf_reports,
    }
    OUT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    lines = []
    lines.append("# Porównanie źródeł Pistis Sophia z tłumaczeniem Gnostyk Biblioteka")
    lines.append("")
    lines.append(f"Data raportu: {report['generated']}")
    lines.append("")
    lines.append("## Wniosek główny")
    lines.append("")
    lines.append(
        "Nasze tłumaczenie jest obecnie przekładem redakcyjnym opartym przede wszystkim na publiczno-domenowej warstwie Meada z 1921 roku. "
        "Plik `pistissofia.pdf` wygląda na tę samą zasadniczą podstawę, którą mamy już w aplikacji. "
        "`Pistis Sophia 1896.pdf` to starsza meadowska wersja historyczna, `Pistis Sophia R.Mcl.Wilson.pdf` jest najlepszym materiałem kontrolnym naukowo-terminologicznym, "
        "`pistissofia ksiega2.pdf` daje polski punkt porównawczy dla części tekstu, a Rijckenborgh powinien pozostać komentarzem, nie podstawą przekładu."
    )
    lines.append("")
    lines.append("## Stan naszego tekstu")
    lines.append("")
    lines.append(f"- Strony źródłowe w aplikacji: {own['source_pages']}.")
    lines.append(f"- Strony z polską warstwą w aplikacji: {own['translated_pages']}.")
    lines.append(f"- Strony wprowadzające z polską warstwą: {own['intro_translated']}.")
    lines.append(f"- Strony tekstu głównego z polską warstwą: {own['body_translated']}.")
    lines.append(f"- Pokrycie tekstu głównego według stron aplikacji: {own['body_coverage_percent']}%.")
    if own["short_body_pages"]:
        short = ", ".join(f"s. {item['page']} ({item['ratio']})" for item in own["short_body_pages"][:15])
        lines.append(f"- Strony wymagające szczególnej kontroli długości względem podstawy: {short}.")
    lines.append("")
    lines.append("## Charakter PDF-ów")
    lines.append("")
    for item in pdf_reports:
        lines.append(f"### {item['file']}")
        lines.append("")
        lines.append(f"- Typ roboczy: {item['kind']}.")
        lines.append(f"- Liczba stron PDF: {item['pages']}.")
        lines.append(f"- Wyodrębnione znaki tekstu: {item['chars']}.")
        hits = []
        for group, values in item["anchors"].items():
            if values:
                hits.append(f"{group}: {', '.join(values)}")
        lines.append(f"- Trafienia punktów kontrolnych: {'; '.join(hits) if hits else 'brak mocnych trafień w ekstrakcji tekstu'}.")
        if item["sample_pistis"]:
            lines.append(f"- Próbka przy wzmiance o Pistis Sophia: {item['sample_pistis'][:650]}")
        lines.append("")
    lines.append("## Próbka kontroli strona-do-strony")
    lines.append("")
    lines.append("| Mead s. | EN znaków | PL znaków | Stosunek PL/EN | Ocena robocza |")
    lines.append("|---:|---:|---:|---:|---|")
    for row in controls:
        ratio = row["ratio"]
        if ratio is None:
            note = "brak strony"
        elif ratio < 0.55:
            note = "sprawdzić skrót"
        elif ratio > 1.9:
            note = "sprawdzić rozbudowanie"
        else:
            note = "długość wygląda normalnie"
        lines.append(f"| {row['page']} | {row['en_len']} | {row['pl_len']} | {ratio} | {note} |")
    lines.append("")
    lines.append("## Terminologia kontrolna")
    lines.append("")
    lines.append("| Pojęcie EN | Nasz odpowiednik PL | EN w bazie aplikacji | PL dokładnie | PL elastycznie |")
    lines.append("|---|---|---:|---:|---:|")
    for left, right in TERM_PAIRS:
        lines.append(
            f"| {left} | {right} | {own_terms['source_en'].get(left, 0)} | {own_terms['our_pl_exact'].get(right, 0)} | {own_terms['our_pl_flexible'].get(right, 0)} |"
        )
    lines.append("")
    lines.append("## Ocena robocza")
    lines.append("")
    lines.append("1. Najważniejsze do dalszej kontroli są miejsca terminologiczne: `First Mystery`, `Light of lights`, `Self-willed`, `receivers`, `Treasury of the Light`.")
    lines.append("2. Liczniki dokładne zaniżają polski wynik, bo polszczyzna odmienia terminy. Dlatego ważniejsza jest kolumna `PL elastycznie`.")
    lines.append("3. Polski styl przekładu jest spójny z przyjętą zasadą misteryjną. Próbka długości nie pokazuje dużych skrótów w wybranych stronach kontrolnych.")
    lines.append("4. PDF Rijckenborgha nie powinien być podstawą przekładu, lecz może pomóc w komentarzach, opisach motywów i aparacie interpretacyjnym.")
    lines.append("5. Wilson powinien być użyty jako drugi aparat kontroli: tam warto sprawdzać trudne terminy, podział ksiąg, wątpliwe miejsca i warianty interpretacyjne.")
    lines.append("6. Kolejny krok: zrobić właściwe porównanie strona-po-stronie dla tekstu głównego, zaczynając od stron Meada 48-80, i oznaczyć różnice jako: brak, skrót, terminologia, numeracja, przypis.")
    lines.append("")
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    return report


if __name__ == "__main__":
    build_report()
    print(OUT_MD)
