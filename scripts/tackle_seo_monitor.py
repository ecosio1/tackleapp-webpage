#!/usr/bin/env python3
"""
Tackle App SEO Monitor
Pulls GA4 analytics and Google Search Console data for tackleapp.ai.
Outputs Discord-friendly markdown for delivery via openclaw message tool.

Usage:
    python3 tackle_seo_monitor.py --mode daily
    python3 tackle_seo_monitor.py --mode weekly --days 30
    python3 tackle_seo_monitor.py --mode daily --json
"""

# Suppress warnings BEFORE any other imports
import warnings
warnings.filterwarnings("ignore")  # Blanket suppress all warnings
import os
os.environ["PYTHONWARNINGS"] = "ignore"
# Also suppress urllib3 NotOpenSSLWarning specifically via environment
os.environ["PYTHONDONTWRITEBYTECODE"] = "1"
import urllib3
urllib3.disable_warnings()

import argparse
import json
import sys
from datetime import datetime, timedelta
from pathlib import Path

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
SERVICE_ACCOUNT_FILE = os.path.expanduser("~/Desktop/tackle-seo-service-account.json")
GA4_PROPERTY_ID = "530051551"
SEARCH_CONSOLE_SITE = "sc-domain:tackleapp.ai"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def date_str(dt):
    """Return YYYY-MM-DD string."""
    return dt.strftime("%Y-%m-%d")


def pct(num, denom):
    """Safe percentage."""
    if denom == 0:
        return 0.0
    return round((num / denom) * 100, 2)


def fmt_ctr(value):
    """Format CTR as percentage string."""
    return f"{round(value * 100, 2)}%"


def fmt_position(value):
    """Format average position to 1 decimal."""
    return round(value, 1)


def delta_arrow(current, previous):
    """Return a +/- string showing change."""
    diff = current - previous
    if diff > 0:
        return f"+{diff}"
    elif diff < 0:
        return str(diff)
    return "0"


def delta_pct(current, previous):
    """Return percentage change string."""
    if previous == 0:
        if current == 0:
            return "0%"
        return "+100%"
    change = ((current - previous) / previous) * 100
    sign = "+" if change > 0 else ""
    return f"{sign}{round(change, 1)}%"


# ---------------------------------------------------------------------------
# GA4 Client
# ---------------------------------------------------------------------------

class GA4Client:
    def __init__(self, service_account_path, property_id, quiet=False):
        self.property_id = property_id
        self.quiet = quiet
        self.client = None
        self.error = None
        try:
            from google.analytics.data_v1beta import BetaAnalyticsDataClient
            from google.analytics.data_v1beta.types import (
                RunReportRequest,
                DateRange,
                Dimension,
                Metric,
                OrderBy,
            )
            from google.oauth2 import service_account as sa

            credentials = sa.Credentials.from_service_account_file(
                service_account_path,
                scopes=["https://www.googleapis.com/auth/analytics.readonly"],
            )
            self.client = BetaAnalyticsDataClient(credentials=credentials)
            self._types = {
                "RunReportRequest": RunReportRequest,
                "DateRange": DateRange,
                "Dimension": Dimension,
                "Metric": Metric,
                "OrderBy": OrderBy,
            }
        except Exception as e:
            self.error = str(e)
            if not quiet:
                print(f"[WARN] GA4 init failed: {e}", file=sys.stderr)

    def _run_report(self, start_date, end_date, dimensions, metrics, order_by=None, limit=10):
        """Run a GA4 report and return rows as list of dicts."""
        if not self.client:
            return []

        T = self._types
        dim_objects = [T["Dimension"](name=d) for d in dimensions]
        met_objects = [T["Metric"](name=m) for m in metrics]

        request_kwargs = {
            "property": f"properties/{self.property_id}",
            "date_ranges": [T["DateRange"](start_date=start_date, end_date=end_date)],
            "dimensions": dim_objects,
            "metrics": met_objects,
            "limit": limit,
        }

        if order_by:
            request_kwargs["order_bys"] = order_by

        request = T["RunReportRequest"](**request_kwargs)
        response = self.client.run_report(request)

        rows = []
        for row in response.rows:
            entry = {}
            for i, dim in enumerate(dimensions):
                entry[dim] = row.dimension_values[i].value
            for i, met in enumerate(metrics):
                val = row.metric_values[i].value
                try:
                    entry[met] = int(val)
                except ValueError:
                    try:
                        entry[met] = float(val)
                    except ValueError:
                        entry[met] = val
            rows.append(entry)
        return rows

    def get_summary(self, start_date, end_date):
        """Get sessions, users, pageviews totals."""
        if not self.client:
            return None
        try:
            T = self._types
            request = T["RunReportRequest"](
                property=f"properties/{self.property_id}",
                date_ranges=[T["DateRange"](start_date=start_date, end_date=end_date)],
                metrics=[
                    T["Metric"](name="sessions"),
                    T["Metric"](name="totalUsers"),
                    T["Metric"](name="screenPageViews"),
                    T["Metric"](name="averageSessionDuration"),
                    T["Metric"](name="bounceRate"),
                ],
            )
            response = self.client.run_report(request)
            if not response.rows:
                return {"sessions": 0, "users": 0, "pageviews": 0, "avg_session_duration": 0, "bounce_rate": 0}

            row = response.rows[0]
            return {
                "sessions": int(row.metric_values[0].value),
                "users": int(row.metric_values[1].value),
                "pageviews": int(row.metric_values[2].value),
                "avg_session_duration": round(float(row.metric_values[3].value), 1),
                "bounce_rate": round(float(row.metric_values[4].value) * 100, 1),
            }
        except Exception as e:
            if not self.quiet:
                print(f"[WARN] GA4 summary failed: {e}", file=sys.stderr)
            return None

    def get_top_pages(self, start_date, end_date, limit=5):
        """Top pages by sessions."""
        try:
            T = self._types
            order = [T["OrderBy"](
                metric=T["OrderBy"].MetricOrderBy(metric_name="sessions"),
                desc=True,
            )]
            return self._run_report(
                start_date, end_date,
                dimensions=["pagePath"],
                metrics=["sessions", "screenPageViews", "totalUsers"],
                order_by=order,
                limit=limit,
            )
        except Exception as e:
            if not self.quiet:
                print(f"[WARN] GA4 top pages failed: {e}", file=sys.stderr)
            return []

    def get_top_blog_posts(self, start_date, end_date, limit=10):
        """Top blog posts by organic sessions."""
        try:
            T = self._types
            from google.analytics.data_v1beta.types import FilterExpression, Filter

            order = [T["OrderBy"](
                metric=T["OrderBy"].MetricOrderBy(metric_name="sessions"),
                desc=True,
            )]

            request = T["RunReportRequest"](
                property=f"properties/{self.property_id}",
                date_ranges=[T["DateRange"](start_date=start_date, end_date=end_date)],
                dimensions=[T["Dimension"](name="pagePath")],
                metrics=[
                    T["Metric"](name="sessions"),
                    T["Metric"](name="screenPageViews"),
                    T["Metric"](name="totalUsers"),
                ],
                dimension_filter=FilterExpression(
                    filter=Filter(
                        field_name="pagePath",
                        string_filter=Filter.StringFilter(
                            match_type=Filter.StringFilter.MatchType.CONTAINS,
                            value="/blog",
                        ),
                    )
                ),
                order_bys=order,
                limit=limit,
            )
            response = self.client.run_report(request)
            rows = []
            for row in response.rows:
                rows.append({
                    "pagePath": row.dimension_values[0].value,
                    "sessions": int(row.metric_values[0].value),
                    "screenPageViews": int(row.metric_values[1].value),
                    "totalUsers": int(row.metric_values[2].value),
                })
            return rows
        except Exception as e:
            if not self.quiet:
                print(f"[WARN] GA4 blog posts failed: {e}", file=sys.stderr)
            return []


# ---------------------------------------------------------------------------
# Search Console Client
# ---------------------------------------------------------------------------

class SearchConsoleClient:
    def __init__(self, service_account_path, site_url, quiet=False):
        self.site_url = site_url
        self.quiet = quiet
        self.service = None
        self.error = None
        try:
            from google.oauth2 import service_account as sa
            from googleapiclient.discovery import build

            credentials = sa.Credentials.from_service_account_file(
                service_account_path,
                scopes=["https://www.googleapis.com/auth/webmasters.readonly"],
            )
            self.service = build("searchconsole", "v1", credentials=credentials)
        except Exception as e:
            self.error = str(e)
            if not quiet:
                print(f"[WARN] Search Console init failed: {e}", file=sys.stderr)

    def _query(self, start_date, end_date, dimensions, row_limit=100):
        """Run a Search Console query."""
        if not self.service:
            return []
        try:
            body = {
                "startDate": start_date,
                "endDate": end_date,
                "dimensions": dimensions,
                "rowLimit": row_limit,
            }
            response = self.service.searchanalytics().query(
                siteUrl=self.site_url, body=body
            ).execute()
            return response.get("rows", [])
        except Exception as e:
            if not self.quiet:
                print(f"[WARN] Search Console query failed: {e}", file=sys.stderr)
            return []

    def get_top_keywords(self, start_date, end_date, limit=15):
        """Top keywords by impressions."""
        rows = self._query(start_date, end_date, ["query"], row_limit=limit)
        results = []
        for row in rows:
            results.append({
                "keyword": row["keys"][0],
                "clicks": int(row.get("clicks", 0)),
                "impressions": int(row.get("impressions", 0)),
                "ctr": row.get("ctr", 0),
                "position": row.get("position", 0),
            })
        # Sort by impressions desc
        results.sort(key=lambda x: x["impressions"], reverse=True)
        return results[:limit]

    def get_top_pages(self, start_date, end_date, limit=10):
        """Top pages by impressions."""
        rows = self._query(start_date, end_date, ["page"], row_limit=limit)
        results = []
        for row in rows:
            results.append({
                "page": row["keys"][0],
                "clicks": int(row.get("clicks", 0)),
                "impressions": int(row.get("impressions", 0)),
                "ctr": row.get("ctr", 0),
                "position": row.get("position", 0),
            })
        results.sort(key=lambda x: x["impressions"], reverse=True)
        return results[:limit]

    def get_all_keywords(self, start_date, end_date, limit=500):
        """Get all keywords for a date range (for comparison)."""
        rows = self._query(start_date, end_date, ["query"], row_limit=limit)
        results = {}
        for row in rows:
            kw = row["keys"][0]
            results[kw] = {
                "clicks": int(row.get("clicks", 0)),
                "impressions": int(row.get("impressions", 0)),
                "ctr": row.get("ctr", 0),
                "position": row.get("position", 0),
            }
        return results

    def get_indexed_pages_count(self, start_date, end_date):
        """Approximate indexed pages count from pages that got impressions."""
        rows = self._query(start_date, end_date, ["page"], row_limit=1000)
        return len(rows)


# ---------------------------------------------------------------------------
# Report Generators
# ---------------------------------------------------------------------------

def generate_daily_report(ga4, gsc, days, today):
    """Generate the daily snapshot report."""
    end = today - timedelta(days=1)  # Yesterday (data delay)
    start = end - timedelta(days=days - 1)
    start_str = date_str(start)
    end_str = date_str(end)

    # For new keywords detection
    recent_start = end - timedelta(days=2)  # Last 3 days
    prev_kw_start = recent_start - timedelta(days=7)
    prev_kw_end = recent_start - timedelta(days=1)

    report = []
    data = {}  # for JSON output

    report.append(f"# Tackle App SEO Report -- Daily Snapshot")
    report.append(f"**Period:** {start_str} to {end_str} ({days} days)")
    report.append(f"**Generated:** {date_str(today)}")
    report.append("")

    # --- GA4 Summary ---
    report.append("## GA4 Traffic Summary")
    ga4_summary = ga4.get_summary(start_str, end_str)
    if ga4_summary:
        data["ga4_summary"] = ga4_summary
        report.append(f"- **Sessions:** {ga4_summary['sessions']:,}")
        report.append(f"- **Users:** {ga4_summary['users']:,}")
        report.append(f"- **Pageviews:** {ga4_summary['pageviews']:,}")
        report.append(f"- **Avg Session Duration:** {ga4_summary['avg_session_duration']}s")
        report.append(f"- **Bounce Rate:** {ga4_summary['bounce_rate']}%")
    elif ga4.error:
        report.append(f"- GA4 unavailable: {ga4.error}")
    else:
        report.append("- No GA4 data available for this period")
    report.append("")

    # --- Top Pages (GA4) ---
    report.append("## Top 5 Pages by Sessions (GA4)")
    top_pages = ga4.get_top_pages(start_str, end_str, limit=5)
    data["ga4_top_pages"] = top_pages
    if top_pages:
        for i, page in enumerate(top_pages, 1):
            report.append(
                f"- **{i}.** `{page['pagePath']}` -- "
                f"{page['sessions']} sessions, "
                f"{page['screenPageViews']} views, "
                f"{page['totalUsers']} users"
            )
    else:
        report.append("- No page data available")
    report.append("")

    # --- Search Console: Top Keywords ---
    report.append("## Top 15 Keywords by Impressions (Search Console)")
    top_keywords = gsc.get_top_keywords(start_str, end_str, limit=15)
    data["gsc_top_keywords"] = top_keywords
    if top_keywords:
        for i, kw in enumerate(top_keywords, 1):
            report.append(
                f"- **{i}.** \"{kw['keyword']}\" -- "
                f"{kw['impressions']:,} impr, "
                f"{kw['clicks']} clicks, "
                f"CTR {fmt_ctr(kw['ctr'])}, "
                f"pos {fmt_position(kw['position'])}"
            )
    elif gsc.error:
        report.append(f"- Search Console unavailable: {gsc.error}")
    else:
        report.append("- No keyword data available")
    report.append("")

    # --- Search Console: Top Pages ---
    report.append("## Top 10 Pages by Impressions (Search Console)")
    gsc_pages = gsc.get_top_pages(start_str, end_str, limit=10)
    data["gsc_top_pages"] = gsc_pages
    if gsc_pages:
        for i, page in enumerate(gsc_pages, 1):
            # Shorten the URL for readability
            display_url = page["page"].replace("https://tackleapp.ai", "")
            if not display_url:
                display_url = "/"
            report.append(
                f"- **{i}.** `{display_url}` -- "
                f"{page['impressions']:,} impr, "
                f"{page['clicks']} clicks, "
                f"CTR {fmt_ctr(page['ctr'])}, "
                f"pos {fmt_position(page['position'])}"
            )
    else:
        report.append("- No page data available")
    report.append("")

    # --- New Keywords ---
    report.append("## New Keywords Detected")
    recent_kws = gsc.get_all_keywords(date_str(recent_start), end_str, limit=500)
    prev_kws = gsc.get_all_keywords(date_str(prev_kw_start), date_str(prev_kw_end), limit=500)
    new_keywords = []
    for kw in recent_kws:
        if kw not in prev_kws:
            new_keywords.append({"keyword": kw, **recent_kws[kw]})
    new_keywords.sort(key=lambda x: x["impressions"], reverse=True)
    data["new_keywords"] = new_keywords[:20]
    if new_keywords:
        for kw in new_keywords[:20]:
            report.append(
                f"- \"{kw['keyword']}\" -- "
                f"{kw['impressions']} impr, "
                f"{kw['clicks']} clicks, "
                f"pos {fmt_position(kw['position'])}"
            )
    else:
        report.append("- No new keywords detected in the last 3 days")
    report.append("")

    # --- Ranking Changes ---
    report.append("## Ranking Changes (3+ positions)")
    current_kws = gsc.get_all_keywords(start_str, end_str, limit=500)
    prev_period_start = start - timedelta(days=days)
    prev_period_end = start - timedelta(days=1)
    prev_period_kws = gsc.get_all_keywords(date_str(prev_period_start), date_str(prev_period_end), limit=500)

    ranking_changes = []
    for kw in current_kws:
        if kw in prev_period_kws:
            curr_pos = current_kws[kw]["position"]
            prev_pos = prev_period_kws[kw]["position"]
            diff = prev_pos - curr_pos  # positive = improved (lower position number = better)
            if abs(diff) >= 3:
                ranking_changes.append({
                    "keyword": kw,
                    "current_position": fmt_position(curr_pos),
                    "previous_position": fmt_position(prev_pos),
                    "change": round(diff, 1),
                    "impressions": current_kws[kw]["impressions"],
                })

    ranking_changes.sort(key=lambda x: abs(x["change"]), reverse=True)
    data["ranking_changes"] = ranking_changes[:20]

    improved = [r for r in ranking_changes if r["change"] > 0]
    declined = [r for r in ranking_changes if r["change"] < 0]

    if improved:
        report.append("**Improved:**")
        for r in improved[:10]:
            report.append(
                f"- \"{r['keyword']}\" -- "
                f"pos {r['previous_position']} -> {r['current_position']} "
                f"(+{r['change']} positions, {r['impressions']} impr)"
            )
    if declined:
        report.append("**Declined:**")
        for r in declined[:10]:
            report.append(
                f"- \"{r['keyword']}\" -- "
                f"pos {r['previous_position']} -> {r['current_position']} "
                f"({r['change']} positions, {r['impressions']} impr)"
            )
    if not improved and not declined:
        report.append("- No significant ranking changes detected")
    report.append("")

    # --- Actionable Recommendations ---
    report.append("## Actionable Recommendations")
    recommendations = generate_recommendations(current_kws, gsc_pages)
    data["recommendations"] = recommendations
    if recommendations:
        for rec in recommendations:
            report.append(f"- {rec}")
    else:
        report.append("- No specific recommendations at this time")
    report.append("")

    return "\n".join(report), data


def generate_weekly_report(ga4, gsc, days, today):
    """Generate the weekly rollup with trends."""
    # First get the daily report content
    daily_text, data = generate_daily_report(ga4, gsc, days, today)

    end = today - timedelta(days=1)
    start = end - timedelta(days=days - 1)
    start_str = date_str(start)
    end_str = date_str(end)

    # Previous period for comparison
    prev_end = start - timedelta(days=1)
    prev_start = prev_end - timedelta(days=days - 1)
    prev_start_str = date_str(prev_start)
    prev_end_str = date_str(prev_end)

    extra = []

    # --- Week-over-Week Comparison ---
    extra.append("## Week-over-Week Comparison")
    current_summary = ga4.get_summary(start_str, end_str)
    prev_summary = ga4.get_summary(prev_start_str, prev_end_str)

    if current_summary and prev_summary:
        data["wow_comparison"] = {
            "current": current_summary,
            "previous": prev_summary,
        }
        for metric_key, label in [
            ("sessions", "Sessions"),
            ("users", "Users"),
            ("pageviews", "Pageviews"),
        ]:
            curr_val = current_summary[metric_key]
            prev_val = prev_summary[metric_key]
            change = delta_pct(curr_val, prev_val)
            extra.append(f"- **{label}:** {curr_val:,} (prev: {prev_val:,}, {change})")
    else:
        extra.append("- Comparison data unavailable")
    extra.append("")

    # --- Keywords Gained/Lost ---
    extra.append("## Keywords Gained / Lost")
    current_kws = gsc.get_all_keywords(start_str, end_str, limit=500)
    prev_kws = gsc.get_all_keywords(prev_start_str, prev_end_str, limit=500)

    gained = [kw for kw in current_kws if kw not in prev_kws]
    lost = [kw for kw in prev_kws if kw not in current_kws]

    gained_data = [{"keyword": kw, **current_kws[kw]} for kw in gained]
    gained_data.sort(key=lambda x: x["impressions"], reverse=True)

    lost_data = [{"keyword": kw, **prev_kws[kw]} for kw in lost]
    lost_data.sort(key=lambda x: x["impressions"], reverse=True)

    data["keywords_gained"] = gained_data[:15]
    data["keywords_lost"] = lost_data[:15]

    if gained_data:
        extra.append(f"**Gained ({len(gained_data)} keywords):**")
        for kw in gained_data[:10]:
            extra.append(f"- \"{kw['keyword']}\" -- {kw['impressions']} impr, pos {fmt_position(kw['position'])}")
    else:
        extra.append("**Gained:** None")

    if lost_data:
        extra.append(f"**Lost ({len(lost_data)} keywords):**")
        for kw in lost_data[:10]:
            extra.append(f"- \"{kw['keyword']}\" -- was {kw['impressions']} impr, pos {fmt_position(kw['position'])}")
    else:
        extra.append("**Lost:** None")
    extra.append("")

    # --- Content Gap Analysis ---
    extra.append("## Content Gap Analysis")
    extra.append("*Keywords with impressions but no dedicated blog post:*")
    blog_keywords = identify_content_gaps(current_kws, gsc)
    data["content_gaps"] = blog_keywords[:10]
    if blog_keywords:
        for gap in blog_keywords[:10]:
            extra.append(
                f"- \"{gap['keyword']}\" -- "
                f"{gap['impressions']} impr, "
                f"pos {fmt_position(gap['position'])} -- "
                f"**potential blog topic**"
            )
    else:
        extra.append("- No obvious content gaps detected")
    extra.append("")

    # --- Top Blog Posts ---
    extra.append("## Top Blog Posts by Organic Traffic")
    blog_posts = ga4.get_top_blog_posts(start_str, end_str, limit=10)
    data["top_blog_posts"] = blog_posts
    if blog_posts:
        for i, post in enumerate(blog_posts, 1):
            extra.append(
                f"- **{i}.** `{post['pagePath']}` -- "
                f"{post['sessions']} sessions, "
                f"{post['screenPageViews']} views"
            )
    else:
        extra.append("- No blog post data available")
    extra.append("")

    # --- SEO Health Score ---
    extra.append("## SEO Health Score")
    health = calculate_seo_health(current_kws, gsc, start_str, end_str)
    data["seo_health"] = health
    extra.append(f"- **Overall Score:** {health['score']}/100")
    extra.append(f"- **Indexed Pages (with impressions):** {health['indexed_pages']}")
    extra.append(f"- **Average Position:** {health['avg_position']}")
    extra.append(f"- **Average CTR:** {health['avg_ctr']}")
    extra.append(f"- **Total Keywords Tracked:** {health['total_keywords']}")
    extra.append("")
    if health.get("notes"):
        for note in health["notes"]:
            extra.append(f"  - {note}")
        extra.append("")

    # Insert weekly sections before recommendations in the daily report
    # Find the recommendations section and insert before it
    lines = daily_text.split("\n")
    insert_idx = None
    for i, line in enumerate(lines):
        if line.startswith("## Actionable Recommendations"):
            insert_idx = i
            break

    if insert_idx is not None:
        # Replace the title
        lines[0] = "# Tackle App SEO Report -- Weekly Rollup"
        final_lines = lines[:insert_idx] + extra + lines[insert_idx:]
        return "\n".join(final_lines), data
    else:
        return daily_text + "\n" + "\n".join(extra), data


def generate_recommendations(keywords, pages):
    """Generate actionable SEO recommendations."""
    recs = []

    for kw_data in (keywords if isinstance(keywords, list) else []):
        pass  # handled below

    # Work with dict format from get_all_keywords
    if isinstance(keywords, dict):
        for kw, stats in keywords.items():
            pos = stats["position"]
            impressions = stats["impressions"]
            clicks = stats["clicks"]
            ctr = stats["ctr"]

            # Page 2 opportunities (positions 11-20)
            if 10 < pos <= 20 and impressions >= 10:
                recs.append(
                    f"**Page 2 opportunity:** \"{kw}\" is at position {fmt_position(pos)} "
                    f"with {impressions} impressions -- optimize content to push to page 1"
                )

            # High impressions, zero or very low CTR
            if impressions >= 50 and ctr < 0.01:
                recs.append(
                    f"**Low CTR alert:** \"{kw}\" has {impressions} impressions but "
                    f"CTR is only {fmt_ctr(ctr)} -- improve meta title and description"
                )

            # Position 1-3 with low CTR (should be getting more clicks)
            if pos <= 3 and impressions >= 20 and ctr < 0.05:
                recs.append(
                    f"**Underperforming #1-3:** \"{kw}\" is at position {fmt_position(pos)} "
                    f"but CTR is only {fmt_ctr(ctr)} -- review SERP snippet, add structured data"
                )

            # High clicks keyword - protect it
            if clicks >= 10 and pos <= 5:
                recs.append(
                    f"**Protect top performer:** \"{kw}\" drives {clicks} clicks at "
                    f"position {fmt_position(pos)} -- keep content fresh and monitor"
                )

    # Deduplicate and limit
    seen = set()
    unique_recs = []
    for r in recs:
        key = r[:80]
        if key not in seen:
            seen.add(key)
            unique_recs.append(r)

    return unique_recs[:10]


def identify_content_gaps(keywords, gsc):
    """Find keywords with impressions that don't have a dedicated blog post."""
    gaps = []
    # Simple heuristic: keywords with decent impressions at positions > 10
    # that contain actionable topic words
    if isinstance(keywords, dict):
        for kw, stats in keywords.items():
            # Skip branded queries
            if "tackle" in kw.lower() or "tackleapp" in kw.lower():
                continue
            # Keywords with impressions but poor rankings suggest content gap
            if stats["impressions"] >= 5 and stats["position"] > 8:
                gaps.append({
                    "keyword": kw,
                    "impressions": stats["impressions"],
                    "position": stats["position"],
                    "clicks": stats["clicks"],
                })
    gaps.sort(key=lambda x: x["impressions"], reverse=True)
    return gaps


def calculate_seo_health(keywords, gsc, start_date, end_date):
    """Calculate an SEO health score (0-100)."""
    notes = []
    score = 50  # Start at baseline

    indexed_pages = gsc.get_indexed_pages_count(start_date, end_date)
    total_keywords = len(keywords) if isinstance(keywords, dict) else 0

    # Average position and CTR
    positions = []
    ctrs = []
    if isinstance(keywords, dict):
        for kw, stats in keywords.items():
            positions.append(stats["position"])
            ctrs.append(stats["ctr"])

    avg_position = round(sum(positions) / len(positions), 1) if positions else 0
    avg_ctr = round((sum(ctrs) / len(ctrs)) * 100, 2) if ctrs else 0

    # Scoring components
    # Indexed pages (max 15 points)
    if indexed_pages >= 50:
        score += 15
        notes.append("Good page coverage (50+ pages with impressions)")
    elif indexed_pages >= 20:
        score += 10
        notes.append("Moderate page coverage")
    elif indexed_pages >= 5:
        score += 5
        notes.append("Low page coverage -- consider creating more content")
    else:
        notes.append("Very low page coverage -- prioritize content creation")

    # Average position (max 15 points)
    if avg_position > 0:
        if avg_position <= 10:
            score += 15
            notes.append(f"Strong average position ({avg_position})")
        elif avg_position <= 20:
            score += 10
            notes.append(f"Average position ({avg_position}) -- room to improve")
        elif avg_position <= 40:
            score += 5
            notes.append(f"Weak average position ({avg_position}) -- needs work")
        else:
            notes.append(f"Poor average position ({avg_position}) -- major improvement needed")

    # CTR (max 10 points)
    if avg_ctr >= 5:
        score += 10
        notes.append(f"Healthy CTR ({avg_ctr}%)")
    elif avg_ctr >= 2:
        score += 5
        notes.append(f"Moderate CTR ({avg_ctr}%) -- optimize meta descriptions")
    elif avg_ctr > 0:
        score += 2
        notes.append(f"Low CTR ({avg_ctr}%) -- review titles and descriptions")

    # Keyword diversity (max 10 points)
    if total_keywords >= 100:
        score += 10
        notes.append(f"Good keyword diversity ({total_keywords} keywords)")
    elif total_keywords >= 30:
        score += 5
        notes.append(f"Moderate keyword diversity ({total_keywords} keywords)")
    elif total_keywords > 0:
        score += 2
        notes.append(f"Low keyword diversity ({total_keywords} keywords)")

    # Cap at 100
    score = min(score, 100)

    return {
        "score": score,
        "indexed_pages": indexed_pages,
        "avg_position": avg_position,
        "avg_ctr": f"{avg_ctr}%",
        "total_keywords": total_keywords,
        "notes": notes,
    }


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Tackle App SEO Monitor -- GA4 + Search Console reporting"
    )
    parser.add_argument(
        "--mode",
        choices=["daily", "weekly"],
        default="daily",
        help="Report mode: daily snapshot or weekly rollup (default: daily)",
    )
    parser.add_argument(
        "--days",
        type=int,
        default=None,
        help="Number of days to look back (default: 7 for daily, 30 for weekly)",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        dest="json_output",
        help="Output in JSON format",
    )
    parser.add_argument(
        "--quiet",
        action="store_true",
        help="Suppress warnings",
    )

    args = parser.parse_args()

    # Set default days based on mode
    if args.days is None:
        args.days = 7 if args.mode == "daily" else 30

    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)

    # Validate service account file
    if not Path(SERVICE_ACCOUNT_FILE).exists():
        print(f"[ERROR] Service account file not found: {SERVICE_ACCOUNT_FILE}", file=sys.stderr)
        sys.exit(1)

    # Initialize clients
    ga4 = GA4Client(SERVICE_ACCOUNT_FILE, GA4_PROPERTY_ID, quiet=args.quiet)
    gsc = SearchConsoleClient(SERVICE_ACCOUNT_FILE, SEARCH_CONSOLE_SITE, quiet=args.quiet)

    # Check if both failed
    if ga4.error and gsc.error:
        print("[ERROR] Both GA4 and Search Console failed to initialize.", file=sys.stderr)
        print(f"  GA4: {ga4.error}", file=sys.stderr)
        print(f"  GSC: {gsc.error}", file=sys.stderr)
        sys.exit(1)

    # Generate report
    if args.mode == "daily":
        report_text, report_data = generate_daily_report(ga4, gsc, args.days, today)
    else:
        report_text, report_data = generate_weekly_report(ga4, gsc, args.days, today)

    # Output
    if args.json_output:
        report_data["mode"] = args.mode
        report_data["days"] = args.days
        report_data["generated"] = date_str(today)
        print(json.dumps(report_data, indent=2, default=str))
    else:
        print(report_text)


if __name__ == "__main__":
    main()
