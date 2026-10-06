from __future__ import annotations

import re
from dataclasses import asdict, dataclass
from typing import Any


@dataclass
class SEOPageReport:
    title: str
    meta_description: str
    keyword: str
    keyword_in_title: bool
    keyword_in_meta_description: bool
    keyword_density: float
    word_count: int
    score: int

    def as_dict(self) -> dict[str, Any]:
        return asdict(self)


def score_keyword_density(title: str, body: str, keyword: str) -> float:
    """Return keyword density as a percentage of total words in the body."""
    if not keyword or not body:
        return 0.0

    normalized_keyword = keyword.lower().strip()
    body_words = re.findall(r"\b\w+\b", body.lower())
    if not body_words:
        return 0.0

    matches = sum(1 for word in body_words if word == normalized_keyword)
    return round((matches / len(body_words)) * 100, 2)


def analyze_page(title: str, meta_description: str, body: str, keyword: str) -> SEOPageReport:
    """Analyze a page for core SEO signals."""
    normalized_keyword = keyword.strip().lower()
    title_lower = title.lower()
    description_lower = (meta_description or "").lower()

    keyword_in_title = normalized_keyword in title_lower
    keyword_in_meta_description = normalized_keyword in description_lower
    density = score_keyword_density(title, body, keyword)
    word_count = len(re.findall(r"\b\w+\b", body or ""))

    score = 0
    score += 35 if keyword_in_title else 0
    score += 25 if keyword_in_meta_description else 0
    score += 40 if density > 0 and density <= 3.0 else 0

    return SEOPageReport(
        title=title.strip(),
        meta_description=meta_description.strip(),
        keyword=keyword.strip(),
        keyword_in_title=keyword_in_title,
        keyword_in_meta_description=keyword_in_meta_description,
        keyword_density=density,
        word_count=word_count,
        score=min(score, 100),
    )


def suggest_title(headline: str, keyword: str | None = None) -> str:
    """Return a cleaner, keyword-aware title candidate."""
    cleaned = re.sub(r"\s+", " ", headline or "").strip()
    if not cleaned:
        return "Untitled Page"
    if keyword:
        token = keyword.strip()
        if token.lower() not in cleaned.lower():
            return f"{cleaned} | {token}"
    return cleaned
