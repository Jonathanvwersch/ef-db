import json
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests
from bs4 import BeautifulSoup
from db import insert_all

URL = "https://www.joinef.com/wp-admin/admin-ajax.php"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "X-Requested-With": "XMLHttpRequest",
    "Referer": "https://www.joinef.com/portfolio/",
}
QUERY_TEMPLATE = {
    "post_type": "company",
    "paged": 1,
    "post_status": "publish",
    "orderby": "menu_order",
    "order": "ASC",
    "posts_per_page": 24,
}

session = requests.Session()
session.headers.update(HEADERS)


def fetch_page(page_number):
    query = QUERY_TEMPLATE.copy()
    query["paged"] = page_number
    payload = {
        "action": "loadmore",
        "query": json.dumps(query),
        "page": page_number,
        "format": "row",
    }
    try:
        response = session.post(URL, data=payload, timeout=30)
        if response.status_code == 200:
            return response.text
        print(f"Failed to fetch page {page_number}: {response.status_code}")
    except Exception as e:
        print(f"Error fetching page {page_number}: {e}")
    return None


def extract_companies(html):
    soup = BeautifulSoup(html, "html.parser")
    companies = []
    for card in soup.select(".tile--company"):
        name_elem = card.select_one(".tile__name")
        link_elem = card.select_one(".tile__link")
        if not (name_elem and link_elem):
            continue

        # Get raw industry tags
        raw_industry_tags = [
            tag.get_text(strip=True) for tag in card.select(".tile__tags a")
        ]

        description_elem = card.select_one(".tile__description")
        description = (
            description_elem.get_text(strip=True) if description_elem else None
        )

        companies.append(
            {
                "name": name_elem.get_text(strip=True),
                "ef_website_url": link_elem.get("href"),
                "industry_tags": raw_industry_tags,
                "description": description,
                "founders": [],
            }
        )
    return companies


def split_name_by_capitals(name):
    titles = {
        "Dr.",
        "Dr",
        "Mr.",
        "Mr",
        "Ms.",
        "Ms",
        "Mrs.",
        "Mrs",
        "Miss",
        "Sir",
        "Madam",
        "Mx",
        "Prof.",
        "Prof",
    }
    words, current = [], name[0]
    for char in name[1:]:
        if char.isupper():
            words.append(current.strip())
            current = char
        else:
            current += char
    words.append(current)
    full_name = " ".join(words)
    for title in titles:
        prefix = title + " "
        if full_name.startswith(prefix):
            full_name = full_name[len(prefix) :].strip()
            break
    return full_name


def fetch_company_details(url, max_retries=3, base_delay=2):
    retries = 0
    while retries < max_retries:
        try:
            response = session.get(url, timeout=500)
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, "html.parser")
                founder_names = [
                    elem.get_text(strip=True)
                    for elem in soup.select(".founder__heading")
                ]
                linkedin_links = [
                    link.get("href")
                    for link in soup.select(".founder__btn[href*='linkedin.com']")
                    if "linkedin.com" in link.get("href", "")
                ]
                founders = []
                for i, name in enumerate(founder_names):
                    clean_name = split_name_by_capitals(name)
                    parts = clean_name.split()
                    first_name = parts[0] if parts else ""
                    last_name = " ".join(parts[1:]) if len(parts) > 1 else ""
                    linkedin_url = (
                        linkedin_links[i] if i < len(linkedin_links) else None
                    )
                    founders.append(
                        {
                            "first_name": first_name,
                            "last_name": last_name,
                            "linkedin_url": linkedin_url,
                        }
                    )
                founding_year_elem = soup.select_one(".meta__value")
                founding_year = (
                    founding_year_elem.get_text(strip=True)
                    if founding_year_elem
                    else None
                )

                website_url = (
                    soup.select_one(".pageheader__websitebtn").get("href")
                    if soup.select_one(".pageheader__websitebtn")
                    else None
                )

                return {
                    "founders": founders,
                    "founding_year": founding_year,
                    "website_url": website_url,
                }
            elif response.status_code == 429:
                time.sleep(base_delay * (2**retries))
                retries += 1
            else:
                print(f"Failed to fetch {url}: {response.status_code}")
                return {}
        except Exception as e:
            print(f"Error fetching details from {url}: {e}")
            return {}
    return {}


def main():
    all_companies = []
    max_threads = 10
    with ThreadPoolExecutor(max_workers=max_threads) as executor:
        futures = {executor.submit(fetch_page, page): page for page in range(1, 50)}
        for future in as_completed(futures):
            html = future.result()
            if not html or "No more results" in html:
                break
            companies = extract_companies(html)
            if not companies:
                break
            all_companies.extend(companies)
    with ThreadPoolExecutor(max_workers=max_threads) as executor:
        futures = {
            executor.submit(fetch_company_details, company["ef_website_url"]): company
            for company in all_companies
        }
        for future in as_completed(futures):
            company = futures[future]
            details = future.result()
            print(f"Details fetched for {company['name']}")
            if details:
                company["founders"] = details.get("founders", [])
                company["founding_year"] = details.get("founding_year")
                company["website_url"] = details.get("website_url")
    insert_all(all_companies)


if __name__ == "__main__":
    main()
