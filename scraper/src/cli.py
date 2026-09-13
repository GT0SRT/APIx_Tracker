"""
Command-line interface for the AndroMatrix APIx Scraper Engine.
Features Rich console styling, real-time logging, and flexible route selection.
"""

import argparse
import asyncio
import sys
from typing import List, Dict, Any, Tuple
from rich.console import Console
from rich.table import Table
from rich.panel import Panel

from .config import (
    CORE_ROUTES,
    CORE_HORIZONS,
    ROUTE_BY_CODE,
    get_all_45_days_horizons,
    BACKEND_API_URL,
)
from .pipeline import ScrapingPipeline

# Force UTF-8 on Windows consoles to print currency symbols without error
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

console = Console()


def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="AndroMatrix APIx Scraper - Real-Time Indian Domestic Airfare Price Engine"
    )
    parser.add_argument(
        "--routes",
        type=str,
        default="top15",
        help="Target routes: 'top15' (default 15 demo routes), 'top5', 'DEL-BOM', or comma-separated pairs",
    )
    parser.add_argument(
        "--horizons",
        type=str,
        default="1,7,15,30,45",
        help="Lead-time booking horizons in days (e.g. '1,7,15,30,45')",
    )
    parser.add_argument(
        "--full-45-days",
        action="store_true",
        help="Scrape all 45 days (T+1 through T+45)",
    )
    parser.add_argument(
        "--portal",
        type=str,
        default="google_flights",
        choices=["google_flights", "easemytrip"],
        help="Scraping portal provider (default: google_flights)",
    )
    parser.add_argument(
        "--concurrency",
        type=int,
        default=3,
        help="Number of concurrent route/date scrapers (default: 3)",
    )
    parser.add_argument(
        "--no-ingest",
        action="store_true",
        help="Skip transmitting observations to the backend REST API",
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        default=None,
        help="Custom directory path to save JSON/CSV files",
    )
    return parser.parse_args()


def resolve_routes(routes_arg: str) -> List[Dict[str, any]]:
    arg = routes_arg.strip().lower()
    if arg in ("top15", "all", "default"):
        return CORE_ROUTES
    elif arg == "top5":
        return CORE_ROUTES[:5]
    else:
        # Parse comma-separated list like "DEL-BOM,DEL-BLR"
        selected = []
        codes = [c.strip().upper() for c in routes_arg.split(",") if c.strip()]
        for code in codes:
            if code in ROUTE_BY_CODE:
                selected.append(ROUTE_BY_CODE[code])
            else:
                # Dynamically construct route if not in core list
                parts = code.split("-")
                if len(parts) == 2:
                    selected.append({
                        "route_code": code,
                        "origin": parts[0],
                        "destination": parts[1],
                        "weight": 0.05,
                        "distance_km": 1100,
                    })
        return selected if selected else CORE_ROUTES[:5]


def resolve_horizons(args: argparse.Namespace) -> List[Tuple[str, int]]:
    if args.full_45_days:
        return get_all_45_days_horizons()

    days = []
    for part in args.horizons.split(","):
        part = part.strip().replace("T+", "").replace("t+", "")
        if part.isdigit():
            days.append(int(part))
    if not days:
        return CORE_HORIZONS
    return [(f"T+{d}", d) for d in sorted(days)]


async def main_async():
    args = parse_arguments()

    selected_routes = resolve_routes(args.routes)
    selected_horizons = resolve_horizons(args)

    banner_text = (
        f"[bold cyan]AndroMatrix APIx Scraper Engine[/bold cyan]\n"
        f"[dim]Smart India Hackathon 2026 · Problem Statement SIH26056[/dim]\n\n"
        f"[bold white]Routes ({len(selected_routes)}):[/bold white] {', '.join(r['route_code'] for r in selected_routes)}\n"
        f"[bold white]Horizons ({len(selected_horizons)}):[/bold white] {', '.join(h[0] for h in selected_horizons)}\n"
        f"[bold white]Portal Engine:[/bold white] {args.portal.upper()}\n"
        f"[bold white]Backend API:[/bold white] {BACKEND_API_URL} ({'Ingestion Disabled' if args.no_ingest else 'Active'})\n"
        f"[bold white]Concurrency:[/bold white] {args.concurrency} parallel workers"
    )

    console.print(Panel(banner_text, title="✈ [bold green]APIx Automated Ingestion[/bold green]", border_style="cyan"))

    pipeline = ScrapingPipeline(
        portal_name=args.portal,
        concurrency=args.concurrency,
        data_dir=args.output_dir,
    )

    observations, summary = await pipeline.run(
        routes=selected_routes,
        horizons=selected_horizons,
        ingest_to_backend=not args.no_ingest,
    )

    if not observations:
        console.print("[bold red]Scraper finished with 0 observations.[/bold red]")
        return

    # Print summary table of observations
    table = Table(
        title=f"Sample Cleaned Fare Observations (Showing {min(10, len(observations))} of {len(observations)})",
        border_style="dim",
    )
    table.add_column("Route", style="cyan", justify="center")
    table.add_column("Airline", style="magenta")
    table.add_column("Flight No", style="bold")
    table.add_column("Window", style="yellow", justify="center")
    table.add_column("Base Fare", style="green", justify="right")
    table.add_column("Taxes (UDF+Fuel+GST)", style="blue", justify="right")
    table.add_column("Total Fare", style="bold white", justify="right")
    table.add_column("Status", justify="center")
    table.add_column("SHA-256 Provenance", style="dim", justify="center")

    for obs in observations[:10]:
        taxes = obs.fuel_surcharge + obs.airport_tax_udf + obs.tax_gst
        status_color = "red" if obs.is_outlier else "green"
        table.add_row(
            obs.route_code,
            obs.airline_name,
            obs.flight_number,
            obs.advance_window,
            f"₹{obs.base_fare:,.0f}",
            f"₹{taxes:,.0f}",
            f"₹{obs.total_fare:,.0f}",
            f"[{status_color}]{obs.provenance_status}[/{status_color}]",
            f"{obs.sha256_hash[:12]}...",
        )

    console.print(table)

    summary_panel = (
        f"[bold green]Batch Status:[/bold green] {summary.status}\n"
        f"[bold white]Total Scraped:[/bold white] {summary.total_scraped} quotes\n"
        f"[bold white]Cleaned & Validated:[/bold white] {summary.valid_records} observations\n"
        f"[bold yellow]Outliers Filtered (IQR/Hampel):[/bold yellow] {summary.outliers_filtered}\n"
        f"[bold cyan]Batch Merkle SHA-256:[/bold cyan] {summary.batch_sha256}\n"
        f"[bold dim]Saved to: {pipeline.data_dir}[/bold dim]"
    )
    console.print(Panel(summary_panel, title="✔ [bold green]Scraper Batch Complete[/bold green]", border_style="green"))


def main():
    asyncio.run(main_async())


if __name__ == "__main__":
    main()
