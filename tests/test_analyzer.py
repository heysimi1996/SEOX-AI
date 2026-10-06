from seox_ai.analyzer import analyze_page, score_keyword_density, suggest_title


def test_keyword_density_is_calculated():
    body = "seo seo seo software tools for seo marketing"
    assert score_keyword_density("SEO guide", body, "seo") == 50.0


def test_analyze_page_flags_keyword_placement():
    report = analyze_page(
        title="SEO Guide for Growth",
        meta_description="Learn SEO strategy for growth.",
        body="This guide explains SEO strategy and growth for teams.",
        keyword="seo",
    )

    assert report.keyword_in_title is True
    assert report.keyword_in_meta_description is True
    assert report.score >= 35


def test_suggest_title_adds_keyword_when_missing():
    title = suggest_title("Growth marketing strategy", "seo")
    assert "seo" in title.lower()
