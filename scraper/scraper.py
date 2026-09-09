import os
import time
import logging
import datetime
from urllib.parse import urlencode
import numpy as np
import psycopg2
from dotenv import load_dotenv
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError
from playwright_stealth import stealth_sync

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

DB_URL = os.environ.get("DATABASE_URL")

ROUTES = [
    ("DEL", "BOM"), ("BOM", "DEL"), ("DEL", "BLR"), ("BLR", "DEL"),
    ("DEL", "HYD"), ("HYD", "DEL"), ("BOM", "BLR"), ("BLR", "BOM"),
    ("DEL", "CCU"), ("CCU", "DEL"), ("DEL", "PNQ"), ("PNQ", "DEL"),
    ("BOM", "GOI"), ("GOI", "BOM"), ("DEL", "MAA")
]

ADVANCE_WINDOWS = [1, 7, 15, 30, 45]

def get_db_connection():
    try:
        if not DB_URL or DB_URL.startswith("postgresql://user:password"):
             logger.warning("Using dummy database connection (credentials not set)")
             return None
        return psycopg2.connect(DB_URL)
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return None

def is_outlier(price, all_prices):
    if len(all_prices) < 4:
        return False
    q1 = np.percentile(all_prices, 25)
    q3 = np.percentile(all_prices, 75)
    iqr = q3 - q1
    upper_bound = q3 + 1.5 * iqr
    return price > upper_bound

def fetch_flights_for_route(page, origin, destination, days_ahead):
    target_date = datetime.date.today() + datetime.timedelta(days=days_ahead)
    date_str = target_date.strftime("%Y-%m-%d")

    # Placeholder URL construction for demonstration purposes
    params = urlencode({
        'origin': origin,
        'destination': destination,
        'date': date_str
    })
    url = f"https://example.com/flights?{params}"

    max_retries = 3
    retry_delays = [5, 10, 20]

    for attempt in range(max_retries):
        try:
            page.goto(url, timeout=30000)

            # Simulate basic check for CAPTCHA/Block
            if "captcha" in page.content().lower() or "403 forbidden" in page.content().lower():
                raise Exception("Blocked or CAPTCHA detected")

            # Wait for price elements (using partial text matching instead of hardcoded classes)
            page.wait_for_selector("text=₹", timeout=15000)

            flight_elements = page.query_selector_all("xpath=//div[contains(., '₹') and contains(@class, 'flight')]")

            if not flight_elements:
                logger.info(f"No flights found for {origin}-{destination} on T+{days_ahead}")
                return None

            prices = []
            results = []

            for el in flight_elements:
                try:
                    price_text = el.query_selector("xpath=.//*[contains(text(), '₹')]").inner_text()
                    price = float(price_text.replace("₹", "").replace(",", "").strip())
                    prices.append(price)

                    # Dummy extraction logic
                    carrier = "MockAirline"
                    tax_gst = price * 0.05
                    tax_udf = 200
                    base_fare = price - tax_gst - tax_udf

                    results.append({
                        "carrier": carrier,
                        "baseFare": base_fare,
                        "taxGST": tax_gst,
                        "taxUDF": tax_udf,
                        "totalFare": price
                    })
                except Exception as el_err:
                    continue

            valid_results = []
            for res in results:
                if is_outlier(res['totalFare'], prices):
                    logger.warning(f"Outlier detected for {origin}-{destination} T+{days_ahead}: {res['totalFare']}")
                else:
                    valid_results.append(res)

            return valid_results

        except PlaywrightTimeoutError:
            logger.warning(f"Timeout on {origin}-{destination} T+{days_ahead}")
            if attempt < max_retries - 1:
                time.sleep(retry_delays[attempt])
                continue
            return None
        except Exception as e:
            logger.warning(f"Error fetching {origin}-{destination} T+{days_ahead}: {e}")
            if attempt < max_retries - 1:
                logger.info(f"Retrying in {retry_delays[attempt]}s...")
                time.sleep(retry_delays[attempt])
                continue
            return None

def save_to_db(conn, data):
    if not conn:
        return

    try:
        cursor = conn.cursor()
        query = """
            INSERT INTO "ScrapeLog" (
                timestamp, origin, destination, carrier, "advanceWindow",
                "baseFare", "taxGST", "taxUDF", "totalFare", "provenanceStatus"
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        for row in data:
            cursor.execute(query, (
                datetime.datetime.now(),
                row['origin'],
                row['destination'],
                row['carrier'],
                row['advanceWindow'],
                row['baseFare'],
                row['taxGST'],
                row['taxUDF'],
                row['totalFare'],
                row['status']
            ))
        conn.commit()
        cursor.close()
    except Exception as e:
        logger.error(f"Error saving to DB: {e}")
        conn.rollback()

def run_scraper():
    conn = get_db_connection()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        stealth_sync(page)

        all_data = []

        for origin, destination in ROUTES:
            for window in ADVANCE_WINDOWS:
                logger.info(f"Scraping {origin}-{destination} for T+{window}")

                flights = fetch_flights_for_route(page, origin, destination, window)

                if flights is None:
                    all_data.append({
                        'origin': origin,
                        'destination': destination,
                        'carrier': 'Unknown',
                        'advanceWindow': f'T+{window}',
                        'baseFare': None,
                        'taxGST': None,
                        'taxUDF': None,
                        'totalFare': None,
                        'status': 'Sold Out / Missing'
                    })
                else:
                    for flight in flights:
                        all_data.append({
                            'origin': origin,
                            'destination': destination,
                            'carrier': flight['carrier'],
                            'advanceWindow': f'T+{window}',
                            'baseFare': flight['baseFare'],
                            'taxGST': flight['taxGST'],
                            'taxUDF': flight['taxUDF'],
                            'totalFare': flight['totalFare'],
                            'status': 'Live'
                        })

                time.sleep(2)

        save_to_db(conn, all_data)

        if conn:
            conn.close()
        browser.close()

if __name__ == "__main__":
    logger.info("Starting scraper run")
    try:
        run_scraper()
    except Exception as e:
        logger.error(f"Scraper failed: {e}")
    logger.info("Scraper run completed")
