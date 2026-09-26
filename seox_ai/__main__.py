from __future__ import annotations

import argparse
import json

from .analyzer import analyze_page, suggest_title


def main() -> None:
    parser = argparse.ArgumentParser(description="Analyze an SEO page for keyword alignment.")
    parser.add_argument("--title", default="", help="Page title")
    parser.add_argument("--description", default="", help="Meta description")
    parser.add_argument("--body", default="", help="Page body text")
    parser.add_argument("--keyword", required=True, help="Target keyword")
    args = parser.parse_args()

    report = analyze_page(args.title, args.description, args.body, args.keyword)
    print(json.dumps({**report.as_dict(), "suggested_title": suggest_title(args.title, args.keyword)}, indent=2))


if __name__ == "__main__":
    main()
