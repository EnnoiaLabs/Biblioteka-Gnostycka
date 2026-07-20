#!/usr/bin/env python3
"""Release guard for Gnostic Library / Biblioteka Gnozy.

Uses VERSION.json as the source of truth, validates every distributed text file,
and can prepare the next patch release without touching application behaviour.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import sys
import tempfile
import zipfile
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VERSION_FILE = ROOT / "VERSION.json"
REQUIRED = [
    "VERSION.json", "CHANGELOG.md", "PUBLIC_CHANGELOG.md", "index.html", "app.js", "styles.css",
    "manifest.webmanifest", "sw.js", "library.json", "books/index.json", "package.json", "package-lock.json",
    "books/pistis-sophia/polish-translations.js",
    "app-content.js",
    "book-loader.js",
    "coptic-config.js",
    "coptic-text-tools.js",
    "interlinear-engine.js",
    "coptic-lookup.js",
    "dictionary-engine.js",
    "citation-engine.js",
    "reader-engine.js",
    "changelog-fallback.js",
    "storage.js",
    "changelog-tools.js",
    "tools/check-book-data.js",
    "tools/check-pwa.js",
    "tools/check-performance.js",
    "performance-budgets.json",
    "tools/check-release-assets.js",
    "tools/check-pistis-translation.js",
    "tools/release.py",
    "release-exclusions.json",
    "tests/smoke.test.js",
    "tests/browser-smoke.js",
]
TEXT_SUFFIXES = {".html", ".js", ".css", ".json", ".md", ".webmanifest"}
VERSION_RE = re.compile(r"^##\s+(\d+\.\d+\.\d+)\s+-", re.MULTILINE)


class ReleaseError(RuntimeError):
    pass


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def write(path: Path, content: str) -> None:
    path.write_text(content, encoding="utf-8", newline="\n")


def metadata() -> dict:
    try:
        data = json.loads(read(VERSION_FILE))
    except (OSError, json.JSONDecodeError) as exc:
        raise ReleaseError(f"Nie można odczytać VERSION.json: {exc}") from exc
    if not re.fullmatch(r"\d+\.\d+\.\d+", str(data.get("version", ""))):
        raise ReleaseError("VERSION.json nie zawiera poprawnego numeru X.Y.Z")
    return data


def patch_version(version: str) -> str:
    major, minor, patch = map(int, version.split("."))
    return f"{major}.{minor}.{patch + 1}"


def changelog_versions() -> list[str]:
    return VERSION_RE.findall(read(ROOT / "CHANGELOG.md"))


def validate_continuity(versions: list[str], limit: int = 25) -> list[str]:
    errors: list[str] = []
    seen: set[str] = set()
    for version in versions:
        if version in seen:
            errors.append(f"CHANGELOG: powtórzona wersja {version}")
        seen.add(version)
    for newer, older in zip(versions[:limit], versions[1:limit]):
        n = tuple(map(int, newer.split(".")))
        o = tuple(map(int, older.split(".")))
        if n[:2] == o[:2] and n[2] != o[2] + 1:
            errors.append(f"CHANGELOG: luka między {newer} i {older}")
    return errors


def check() -> None:
    data = metadata()
    version = data["version"]
    errors: list[str] = []

    for relative in REQUIRED:
        if not (ROOT / relative).is_file():
            errors.append(f"Brak wymaganego pliku: {relative}")

    for path in ROOT.rglob("*"):
        if path.is_file() and path.suffix.lower() in TEXT_SUFFIXES:
            try:
                content = read(path)
            except UnicodeDecodeError:
                errors.append(f"Plik nie jest poprawnym UTF-8: {path.relative_to(ROOT)}")
                continue
            if "\ufffd" in content:
                errors.append(f"Znak zastępczy Unicode w: {path.relative_to(ROOT)}")

    app = read(ROOT / "app.js")
    index = read(ROOT / "index.html")
    sw = read(ROOT / "sw.js")
    changelog = read(ROOT / "CHANGELOG.md")
    public_changelog = read(ROOT / "PUBLIC_CHANGELOG.md")
    library = read(ROOT / "library.json")
    books_index = read(ROOT / "books/index.json")
    package = read(ROOT / "package.json")
    package_lock = read(ROOT / "package-lock.json")
    checks = {
        "app.js / libraryMeta": rf'\bversion:\s*"{re.escape(version)}"',
        "sw.js / cache PWA": rf'CACHE_NAME\s*=\s*"[^"\n]*v{re.escape(version)}"',
        "index.html / manifest": rf'manifest\.webmanifest\?v={re.escape(version)}',
        "index.html / book-loader.js": rf'book-loader\.js\?v={re.escape(version)}',
        "CHANGELOG / pierwsza wersja": rf'^##\s+{re.escape(version)}\s+-',
        "library.json": rf'"version"\s*:\s*"{re.escape(version)}"',
        "books/index.json": rf'"version"\s*:\s*"{re.escape(version)}"',
        "package.json": rf'"version"\s*:\s*"{re.escape(version)}"',
        "package-lock.json": rf'"version"\s*:\s*"{re.escape(version)}"',
    }
    sources = [app, sw, index, index, changelog, library, books_index, package, package_lock]
    for (label, pattern), source in zip(checks.items(), sources):
        if not re.search(pattern, source, re.MULTILINE):
            errors.append(f"Niezgodny numer wersji: {label} (oczekiwano {version})")

    versions = changelog_versions()
    if not versions or versions[0] != version:
        errors.append("Pierwszy wpis CHANGELOG.md nie odpowiada VERSION.json")
    errors.extend(validate_continuity(versions))
    public_versions = VERSION_RE.findall(public_changelog)
    if not public_versions:
        errors.append("PUBLIC_CHANGELOG.md nie zawiera żadnej wersji publicznej")
    elif data.get("latestPublicVersion") != public_versions[0]:
        errors.append("VERSION.json / latestPublicVersion nie odpowiada pierwszej wersji publicznej")
    if data.get("releaseType") not in {"public", "technical"}:
        errors.append("VERSION.json / releaseType musi mieć wartość public albo technical")
    missing_public_versions = sorted(set(public_versions) - set(versions))
    if missing_public_versions:
        errors.append("Historia publiczna wskazuje wersje spoza archiwum technicznego: " + ", ".join(missing_public_versions))

    shell_match = re.search(r"const APP_SHELL = \[(.*?)\];", sw, re.DOTALL)
    if not shell_match:
        errors.append("sw.js: nie znaleziono listy APP_SHELL")
    else:
        for item in re.findall(r'"\.\/([^"?#]+)', shell_match.group(1)):
            if item and not (ROOT / item).exists():
                errors.append(f"sw.js APP_SHELL wskazuje brakujący plik: {item}")

    book_checker = ROOT / "tools/check-book-data.js"
    if book_checker.is_file():
        try:
            result = subprocess.run(
                ["node", str(book_checker)],
                cwd=ROOT,
                capture_output=True,
                text=True,
                check=False,
            )
            if result.returncode != 0:
                errors.append("Dane książek:\n" + (result.stderr or result.stdout).strip())
        except OSError as exc:
            errors.append(f"Nie można uruchomić kontroli danych książek: {exc}")

    pwa_checker = ROOT / "tools/check-pwa.js"
    if pwa_checker.is_file():
        try:
            result = subprocess.run(
                ["node", str(pwa_checker)],
                cwd=ROOT,
                capture_output=True,
                text=True,
                check=False,
            )
            if result.returncode != 0:
                errors.append("PWA i tryb offline:\n" + (result.stderr or result.stdout).strip())
        except OSError as exc:
            errors.append(f"Nie można uruchomić kontroli PWA: {exc}")

    performance_checker = ROOT / "tools/check-performance.js"
    if performance_checker.is_file():
        try:
            result = subprocess.run(
                ["node", str(performance_checker)], cwd=ROOT,
                capture_output=True, text=True, check=False,
            )
            if result.returncode != 0:
                errors.append("Budżet wydajności:\n" + (result.stderr or result.stdout).strip())
        except OSError as exc:
            errors.append(f"Nie można uruchomić kontroli wydajności: {exc}")

    asset_checker = ROOT / "tools/check-release-assets.js"
    if asset_checker.is_file():
        try:
            result = subprocess.run(
                ["node", str(asset_checker)], cwd=ROOT,
                capture_output=True, text=True, check=False,
            )
            if result.returncode != 0:
                errors.append("Zasoby paczki:\n" + (result.stderr or result.stdout).strip())
        except OSError as exc:
            errors.append(f"Nie można uruchomić kontroli zasobów paczki: {exc}")

    translation_checker = ROOT / "tools/check-pistis-translation.js"
    if translation_checker.is_file():
        try:
            result = subprocess.run(
                ["node", str(translation_checker)], cwd=ROOT,
                capture_output=True, text=True, check=False,
            )
            if result.returncode != 0:
                errors.append("Kompletność tłumaczenia Pistis Sophii:\n" + (result.stderr or result.stdout).strip())
        except OSError as exc:
            errors.append(f"Nie można uruchomić Strażnika kompletności tłumaczenia: {exc}")

    test_files = sorted((ROOT / "tests").glob("*.test.js"))
    if not test_files:
        errors.append("Brak testów JavaScript w katalogu tests")
    else:
        try:
            result = subprocess.run(
                ["node", "--test", *(str(path) for path in test_files)],
                cwd=ROOT,
                capture_output=True,
                text=True,
                check=False,
            )
            if result.returncode != 0:
                errors.append("Testy JavaScript:\n" + (result.stdout + result.stderr).strip())
        except OSError as exc:
            errors.append(f"Nie można uruchomić testów JavaScript: {exc}")

    if errors:
        print("\nKONTROLA WYDANIA: NIEPOWODZENIE\n")
        for error in errors:
            print(f"[X] {error}")
        raise SystemExit(1)

    print(f"KONTROLA WYDANIA: OK — wersja {version}")
    print(f"[OK] wymagane pliki: {len(REQUIRED)}")
    print(f"[OK] UTF-8 i brak znaków zastępczych")
    print("[OK] Strażnik kompletności tłumaczenia: 255/255 stron")
    print(f"[OK] numer wersji i cache PWA")
    print(f"[OK] ciągłość CHANGELOG ({min(25, len(versions))} najnowszych wpisów)")
    print(f"[OK] publiczna historia zmian ({len(public_versions)} kamieni milowych)")
    print(f"[OK] struktura danych książek")
    print(f"[OK] manifest PWA i kompletność cache offline")
    print(f"[OK] budżety rozmiaru zasobów startowych")
    print(f"[OK] nieużywane zasoby źródłowe wyłączone z paczki")
    test_file_label = "plik" if len(test_files) == 1 else "pliki"
    print(f"[OK] pełny zestaw testów JavaScript ({len(test_files)} {test_file_label})")


def replace_once(text: str, pattern: str, replacement: str, label: str) -> str:
    result, count = re.subn(pattern, replacement, text, count=1, flags=re.MULTILINE)
    if count != 1:
        raise ReleaseError(f"Nie udało się zaktualizować: {label}")
    return result


def write_reproducible_zip(target: Path, files: list[Path]) -> None:
    with zipfile.ZipFile(target, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as bundle:
        for path in sorted(files, key=lambda item: item.relative_to(ROOT).as_posix()):
            relative = path.relative_to(ROOT).as_posix()
            info = zipfile.ZipInfo(relative, date_time=(1980, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.create_system = 3
            info.external_attr = 0o100644 << 16
            bundle.writestr(info, path.read_bytes(), compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)


def packaged_files() -> tuple[list[Path], set[str]]:
    excluded_parts = {".git", "dist", "node_modules", "__pycache__"}
    exclusions_data = json.loads(read(ROOT / "release-exclusions.json"))
    excluded_files = set(exclusions_data.get("unusedSourceAssets", []))
    files = [
        path for path in ROOT.rglob("*")
        if path.is_file()
        and not excluded_parts.intersection(path.relative_to(ROOT).parts)
        and path.relative_to(ROOT).as_posix() not in excluded_files
        and path.suffix.lower() != ".pyc"
        and path.name not in {".DS_Store"}
    ]
    return files, excluded_files


def audit() -> None:
    check()
    files, excluded_files = packaged_files()
    with tempfile.TemporaryDirectory(prefix="gnostyk-release-audit-") as directory:
        first = Path(directory) / "audit-a.zip"
        second = Path(directory) / "audit-b.zip"
        write_reproducible_zip(first, files)
        write_reproducible_zip(second, files)
        first_digest = hashlib.sha256(first.read_bytes()).hexdigest()
        second_digest = hashlib.sha256(second.read_bytes()).hexdigest()
        if first_digest != second_digest:
            raise ReleaseError("Audyt: dwa identyczne pakowania dały różne sumy SHA-256")
        with zipfile.ZipFile(first, "r") as bundle:
            broken = bundle.testzip()
            archived_names = set(bundle.namelist())
        if broken:
            raise ReleaseError(f"Audyt: uszkodzony plik w ZIP: {broken}")
        missing = sorted(set(REQUIRED) - archived_names)
        leaked = sorted(excluded_files & archived_names)
        if missing:
            raise ReleaseError("Audyt: brak wymaganych plików: " + ", ".join(missing))
        if leaked:
            raise ReleaseError("Audyt: wyłączone pliki trafiły do ZIP: " + ", ".join(leaked))

    print("\nAUDYT KOŃCOWY: OK")
    print(f"[OK] dwa deterministyczne pakowania: {first_digest}")
    print(f"[OK] komplet wymaganych plików: {len(REQUIRED)}")
    print(f"[OK] wyłączone zasoby poza ZIP: {len(excluded_files)}")
    print(f"[OK] kandydat gotowy do testu Chromium i decyzji publikacyjnej")


def prepare(args: argparse.Namespace) -> None:
    check()
    data = metadata()
    old = data["version"]
    new = args.version or patch_version(old)
    if tuple(map(int, new.split("."))) <= tuple(map(int, old.split("."))):
        raise ReleaseError(f"Nowa wersja {new} musi być wyższa niż {old}")

    pl_points = args.pl or ["Dodano automatyczną kontrolę jakości i procesu wydawania wersji."]
    en_points = args.en or ["Added automated quality checks and a repeatable release workflow."]
    entry = (
        f"## {new} - {args.title_pl}\n\n### PL\n"
        + "\n".join(f"- {point}" for point in pl_points)
        + "\n\n### EN\n"
        + "\n".join(f"- {point}" for point in en_points)
        + "\n\n"
    )

    changelog_path = ROOT / "CHANGELOG.md"
    changelog = read(changelog_path)
    changelog = replace_once(changelog, r"\A# Changelog\s*\n", "# Changelog\n\n" + entry, "CHANGELOG")
    write(changelog_path, changelog)

    if args.release_type == "public":
        public_path = ROOT / "PUBLIC_CHANGELOG.md"
        public_changelog = read(public_path)
        public_entry = (
            f"## {new} - {args.title_pl}\n\n### PL\n"
            + "\n".join(f"- {point}" for point in pl_points)
            + "\n\n### EN\n"
            + "\n".join(f"- {point}" for point in en_points)
            + "\n\n"
        )
        public_changelog = replace_once(
            public_changelog,
            r"\A# Publiczna historia zmian / Public change history\s*\n",
            "# Publiczna historia zmian / Public change history\n\n" + public_entry,
            "PUBLIC_CHANGELOG",
        )
        write(public_path, public_changelog)

    data["version"] = new
    data["date"] = date.today().isoformat()
    data["currentWork"] = args.slug
    data["releaseType"] = args.release_type
    if args.release_type == "public":
        data["latestPublicVersion"] = new
    write(VERSION_FILE, json.dumps(data, ensure_ascii=False, indent=2) + "\n")

    for relative in ("library.json", "books/index.json", "package.json", "package-lock.json"):
        path = ROOT / relative
        payload = json.loads(read(path))
        if relative == "library.json":
            payload["version"] = new
            payload.setdefault("library", {})["version"] = new
            payload["library"]["updated"] = date.today().isoformat()
        elif relative == "books/index.json":
            payload["version"] = new
        elif relative == "package.json":
            payload["version"] = new
        else:
            payload["version"] = new
            payload.setdefault("packages", {}).setdefault("", {})["version"] = new
        write(path, json.dumps(payload, ensure_ascii=False, indent=2) + "\n")

    index_path = ROOT / "index.html"
    index = read(index_path)
    # Technical version locations and visible current-version spans.
    index = index.replace(f"?v={old}", f"?v={new}")
    index = re.sub(r'(<span class="inline-library-version">)' + re.escape(old) + r'(</span>)', rf"\g<1>{new}\g<2>", index)
    index = re.sub(r'(<span id="libraryVersion(?:FooterHome|Footer)?">)' + re.escape(old) + r'(</span>)', rf"\g<1>{new}\g<2>", index)
    if args.release_type == "public":
        recent_li = (
            f'<li><strong>{new}</strong><span data-i18n-en="{args.title_en}" '
            f'data-i18n-pl="{args.title_pl}">{args.title_pl}</span></li>'
        )
        index = replace_once(index, r'(<ul id="homeRecentUpdates">)', rf"\1{recent_li}", "Ostatnie zmiany")
        # Keep exactly the three newest public fallback items.
        index = re.sub(r'(<ul id="homeRecentUpdates">)((?:<li>.*?</li>){3})<li>.*?</li>', r"\1\2", index, count=1)
    write(index_path, index)

    app_path = ROOT / "app.js"
    app = read(app_path)
    app = replace_once(app, rf'(\bversion:\s*"){re.escape(old)}("\s*,)', rf"\g<1>{new}\2", "app.js libraryMeta")
    write(app_path, app)

    fallback_path = ROOT / "changelog-fallback.js"
    public_changelog = read(ROOT / "PUBLIC_CHANGELOG.md")
    write(fallback_path, f"window.GNOSTYK_FALLBACK_CHANGELOG = {json.dumps(public_changelog, ensure_ascii=False)};\n")

    sw_path = ROOT / "sw.js"
    sw = read(sw_path)
    sw = replace_once(sw, rf'(CACHE_NAME\s*=\s*"[^"\n]*v){re.escape(old)}(";)', rf"\g<1>{new}\2", "cache PWA")
    write(sw_path, sw)

    print(f"\nPrzygotowano wersję {new}. Uruchamiam kontrolę końcową...\n")
    check()
    print("\nNastępnie wykonaj test ręczny według RELEASE_CHECKLIST.md.")


def package(args: argparse.Namespace) -> None:
    check()
    data = metadata()
    version = data["version"]
    slug = re.sub(r"[^a-z0-9]+", "-", str(data.get("currentWork") or "release").lower()).strip("-") or "release"
    output_dir = Path(args.output).resolve() if args.output else ROOT / "dist"
    output_dir.mkdir(parents=True, exist_ok=True)
    archive = output_dir / f"pistis-sophia-app-v{version}-{slug}.zip"
    temporary_archive = archive.with_suffix(archive.suffix + ".tmp")
    files, excluded_files = packaged_files()
    try:
        write_reproducible_zip(temporary_archive, files)

        with zipfile.ZipFile(temporary_archive, "r") as bundle:
            broken_file = bundle.testzip()
            archived_names = set(bundle.namelist())
        if broken_file:
            raise ReleaseError(f"Uszkodzony plik w ZIP: {broken_file}")
        missing_required = [relative for relative in REQUIRED if relative not in archived_names]
        if missing_required:
            raise ReleaseError("ZIP nie zawiera wymaganych plików: " + ", ".join(missing_required))
        temporary_archive.replace(archive)
    finally:
        temporary_archive.unlink(missing_ok=True)

    digest = hashlib.sha256(archive.read_bytes()).hexdigest()
    checksum = archive.with_suffix(archive.suffix + ".sha256")
    write(checksum, f"{digest}  {archive.name}\n")
    manifest = archive.with_suffix(archive.suffix + ".release.json")
    manifest_data = {
        "schemaVersion": 1,
        "version": version,
        "date": data.get("date"),
        "currentWork": data.get("currentWork"),
        "releaseType": data.get("releaseType"),
        "latestPublicVersion": data.get("latestPublicVersion"),
        "archive": archive.name,
        "sha256": digest,
        "fileCount": len(files),
        "requiredFiles": sorted(REQUIRED),
        "excludedFiles": sorted(excluded_files),
    }
    write(manifest, json.dumps(manifest_data, ensure_ascii=False, indent=2) + "\n")
    print(f"\nPAKIET WYDANIA: OK")
    print(f"[OK] ZIP: {archive}")
    print(f"[OK] SHA-256: {digest}")
    print(f"[OK] pliki w archiwum: {len(files)}")
    print(f"[OK] integralność ZIP i komplet wymaganych plików")
    print(f"[OK] manifest: {manifest}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Kontrola i przygotowanie wydania Biblioteki Gnozy")
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("check", help="sprawdź gotowość aktualnej wersji")
    sub.add_parser("audit", help="wykonaj końcowy audyt deterministyczności i zawartości ZIP")
    package_parser = sub.add_parser("package", help="sprawdź i utwórz ZIP oraz sumę SHA-256")
    package_parser.add_argument("--output", help="katalog wynikowy; domyślnie ./dist")
    release = sub.add_parser("prepare", help="przygotuj kolejną wersję patch")
    release.add_argument("--version", help="numer X.Y.Z; domyślnie kolejny patch")
    release.add_argument("--title-pl", required=True, help="krótki polski tytuł wydania")
    release.add_argument("--title-en", required=True, help="krótki angielski tytuł wydania")
    release.add_argument("--slug", default="release-workflow", help="techniczna nazwa zakresu prac")
    release.add_argument("--release-type", choices=("public", "technical"), default="technical", help="czy wpis ma być widoczny w aplikacji")
    release.add_argument("--pl", action="append", help="punkt changelogu PL; można powtórzyć")
    release.add_argument("--en", action="append", help="punkt changelogu EN; można powtórzyć")
    args = parser.parse_args()
    try:
        if args.command == "check":
            check()
        elif args.command == "audit":
            audit()
        elif args.command == "package":
            package(args)
        else:
            prepare(args)
    except ReleaseError as exc:
        print(f"BŁĄD: {exc}", file=sys.stderr)
        raise SystemExit(1) from exc


if __name__ == "__main__":
    main()
