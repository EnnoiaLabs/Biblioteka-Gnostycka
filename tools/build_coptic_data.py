import html
import json
import re
import ssl
import urllib.request
from datetime import date
from html.parser import HTMLParser
from pathlib import Path


APP_DIR = Path(__file__).resolve().parents[1]
BASE_URL = "https://marcion.sourceforge.net/gnosis/"
BOOKS = [
    ("book-1", "Księga I", "pistis-sophia-book-1.html"),
    ("book-2", "Księga II", "pistis-sophia-book-2.html"),
    ("book-3", "Księga III", "pistis-sophia-book-3.html"),
    ("book-4", "Księga IV", "pistis-sophia-book-4.html"),
    ("postscript", "Dopisek", "pistis-sophia-postscript.html"),
]


class TableTextParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.in_td = False
        self.current_cell = []
        self.cells = []

    def handle_starttag(self, tag, attrs):
        if tag.lower() == "td":
            self.in_td = True
            self.current_cell = []

    def handle_endtag(self, tag):
        if tag.lower() == "td" and self.in_td:
            text = normalize("".join(self.current_cell))
            self.cells.append(text)
            self.current_cell = []
            self.in_td = False

    def handle_data(self, data):
        if self.in_td:
            self.current_cell.append(data)


def normalize(text):
    text = html.unescape(text or "")
    text = text.replace("\u00a0", " ")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def fetch(url):
    context = ssl._create_unverified_context()
    with urllib.request.urlopen(url, context=context, timeout=60) as response:
        return response.read().decode("utf-8", "replace")


def parse_book(book_id, title, filename):
    parser = TableTextParser()
    url = BASE_URL + filename
    parser.feed(fetch(url))
    entries = []
    for index in range(0, len(parser.cells) - 1, 2):
        marker = parser.cells[index]
        text = parser.cells[index + 1]
        match = re.fullmatch(r"\((\d+)/(\d+)\)", marker)
        if not match or not text:
            continue
        entries.append(
            {
                "book": book_id,
                "bookTitle": title,
                "page": int(match.group(1)),
                "line": int(match.group(2)),
                "ref": f"{match.group(1)}/{match.group(2)}",
                "text": text,
            }
        )
    return {
        "id": book_id,
        "title": title,
        "sourceUrl": url,
        "lineCount": len(entries),
        "entries": entries,
    }


def main():
    books = [parse_book(*book) for book in BOOKS]
    pages = {}
    for book in books:
        for entry in book["entries"]:
            key = str(entry["page"])
            pages.setdefault(key, []).append(entry)

    payload = {
        "meta": {
            "title": "Pistis Sophia - tekst koptyjski",
            "status": "warstwa robocza Unicode",
            "generated": str(date.today()),
            "source": "Marcion, cyfrowa transkrypcja Unicode edycji Schwartze/Petermann",
            "sourceIndex": BASE_URL + "pistis-sophia.html",
            "note": "Tekst starożytny i edycje XIX-wieczne są publiczno-domenowe; cyfrowa transkrypcja została oznaczona źródłowo jako Marcion/Milan Konvicka.",
            "books": [
                {
                    "id": book["id"],
                    "title": book["title"],
                    "sourceUrl": book["sourceUrl"],
                    "lineCount": book["lineCount"],
                }
                for book in books
            ],
        },
        "pages": pages,
    }

    output = "window.PISTIS_SOPHIA_COPTIC = "
    output += json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    output += ";\n"
    (APP_DIR / "coptic-data.js").write_text(output, encoding="utf-8")
    print(APP_DIR / "coptic-data.js")
    print(sum(book["lineCount"] for book in books), "lines")


if __name__ == "__main__":
    main()
