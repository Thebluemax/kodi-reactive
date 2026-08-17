#!/usr/bin/env python3
"""Generate addons.xml and addons.xml.md5 for a Kodi add-on repository.

Scans a directory for sub-directories that contain an addon.xml, merges every
<addon> element into a single <addons> document and writes the matching md5
checksum next to it. This is the standard xbmc.addon.repository index format
(see https://github.com/xbmc/repo-scripts and
https://github.com/drinfernoo/repository.example).

Usage:
    python3 ops/addons_xml_generator.py --path gh-pages
    python3 ops/addons_xml_generator.py --path gh-pages --addon webinterface.reaktive
"""

from __future__ import annotations

import hashlib
import sys
import xml.etree.ElementTree as ET
from argparse import ArgumentParser
from pathlib import Path

ADDONS_XML = "addons.xml"
ADDONS_MD5 = "addons.xml.md5"
XML_HEADER = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'


def discover_addon_dirs(root: Path, only: list[str]) -> list[Path]:
    """Return the add-on directories to index, sorted by add-on id."""
    candidates = sorted(p for p in root.iterdir() if p.is_dir() and (p / "addon.xml").is_file())
    if only:
        wanted = set(only)
        candidates = [p for p in candidates if p.name in wanted]
        missing = wanted - {p.name for p in candidates}
        if missing:
            raise SystemExit(f"error: no addon.xml found for: {', '.join(sorted(missing))}")
    return candidates


def read_addon(addon_dir: Path) -> ET.Element:
    """Parse an addon.xml and validate it against its containing directory."""
    path = addon_dir / "addon.xml"
    try:
        element = ET.parse(path).getroot()
    except ET.ParseError as exc:
        raise SystemExit(f"error: {path} is not valid XML: {exc}") from exc

    if element.tag != "addon":
        raise SystemExit(f"error: {path} root element is <{element.tag}>, expected <addon>")

    addon_id = element.get("id")
    version = element.get("version")
    if not addon_id or not version:
        raise SystemExit(f"error: {path} is missing the id or version attribute")
    if addon_id != addon_dir.name:
        raise SystemExit(
            f"error: {path} declares id='{addon_id}' but lives in '{addon_dir.name}'. "
            "Kodi resolves zips as <datadir>/<id>/<id>-<version>.zip, so both must match."
        )

    expected_zip = addon_dir / f"{addon_id}-{version}.zip"
    if not expected_zip.is_file():
        print(f"warning: {expected_zip.name} is missing, Kodi will not be able to install {addon_id}")

    return element


def build_addons_xml(addon_dirs: list[Path]) -> str:
    """Serialise the merged <addons> document."""
    lines = [XML_HEADER, "<addons>"]
    for addon_dir in addon_dirs:
        element = read_addon(addon_dir)
        body = ET.tostring(element, encoding="unicode").strip()
        lines.extend(f"    {line}" for line in body.splitlines())
        print(f"indexed {element.get('id')} {element.get('version')}")
    lines.append("</addons>")
    return "\n".join(lines) + "\n"


def write_if_changed(path: Path, content: str) -> bool:
    """Write content only when it differs, so unchanged runs stay a no-op for git."""
    if path.is_file() and path.read_text(encoding="utf-8") == content:
        print(f"{path.name} unchanged")
        return False
    path.write_text(content, encoding="utf-8")
    print(f"wrote {path.name}")
    return True


def main(argv: list[str] | None = None) -> int:
    parser = ArgumentParser(description="Generate addons.xml and addons.xml.md5 for a Kodi repository.")
    parser.add_argument(
        "--path",
        default=".",
        type=Path,
        help="Directory holding the published add-on folders (default: current directory).",
    )
    parser.add_argument(
        "--addon",
        action="append",
        default=[],
        metavar="ID",
        help="Restrict the index to this add-on id. Repeatable.",
    )
    args = parser.parse_args(argv)

    root: Path = args.path.resolve()
    if not root.is_dir():
        raise SystemExit(f"error: {root} is not a directory")

    addon_dirs = discover_addon_dirs(root, args.addon)
    if not addon_dirs:
        raise SystemExit(f"error: no add-on directories with an addon.xml found in {root}")

    addons_xml = build_addons_xml(addon_dirs)
    write_if_changed(root / ADDONS_XML, addons_xml)

    checksum = hashlib.md5(addons_xml.encode("utf-8")).hexdigest()
    write_if_changed(root / ADDONS_MD5, f"{checksum}\n")

    return 0


if __name__ == "__main__":
    sys.exit(main())
