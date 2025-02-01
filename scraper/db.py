import os

import requests
from dotenv import load_dotenv
from postgrest.exceptions import APIError
from requests.exceptions import RequestException
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

session = requests.Session()
session.headers.update(
    {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36"
    }
)


def check_website_status(url):
    if not url:
        return None
    if not url.startswith(("http://", "https://")):
        url = f"https://{url}"
    try:
        try:
            response = session.get(url, timeout=10, allow_redirects=True, verify=False)
            if response.status_code == 200:
                return True
        except RequestException:
            if url.startswith("https://"):
                http_url = url.replace("https://", "http://")
                response = session.get(http_url, timeout=10, allow_redirects=True)
                if response.status_code == 200:
                    return True
        return False
    except RequestException:
        return False


def clean_industry_tags(industry_tags):
    if not industry_tags:
        return []

    cleaned_tags = []
    for tag in industry_tags:
        # First split compound tags
        parts = (
            tag.replace(" or ", "/")
            .replace(" & ", "/")
            .replace(", ", "/")
            .replace(" Or ", "/")
            .split("/")
        )

        for part in parts:
            tag_lower = part.lower().strip()
            if tag_lower == "ai":
                cleaned_tags.append("AI")
            elif tag_lower == "enterprise software":
                cleaned_tags.append("Enterprise")
            elif tag_lower == "environmental science":
                cleaned_tags.append("Environment")
            elif "development" in tag_lower:
                cleaned_tags.append("Developer Tools")
            elif tag_lower == "biotechnology":
                cleaned_tags.append("Biotech")
            elif tag_lower == "web3":
                cleaned_tags.append("Web3")
            elif tag_lower == "b2c":
                cleaned_tags.append("B2C")
            elif tag_lower == "b2b":
                cleaned_tags.append("B2B")
            elif tag_lower == "ar vr xr":
                cleaned_tags.append("AR")
                cleaned_tags.append("VR")
                cleaned_tags.append("XR")
            elif tag_lower == "enterprise solutions":
                cleaned_tags.append("Enterprise")
            elif tag_lower == "ml":
                cleaned_tags.append("Machine Learning")
            elif tag_lower == "financial services":
                cleaned_tags.append("Financial Services")
            else:
                cleaned_tags.append(part.strip())

    return list(set(cleaned_tags))  # Remove duplicates


def insert_into_db(company):
    try:
        website_url = company.get("website_url")
        # is_active = check_website_status(website_url) if website_url else False

        # First get current company status if it exists
        current = (
            supabase.table("companies")
            .select("status")
            .eq("ef_website_url", company["ef_website_url"])
            .execute()
        )
        current_status = current.data[0]["status"] if current.data else None
        print("BEFORE", company.get("industry_tags", []))
        cleaned_industry_tags = clean_industry_tags(company.get("industry_tags", []))
        print("AFTER", cleaned_industry_tags)

        # Only include status in update if current status is inactive and new check is active
        update_data = {
            "name": company["name"][:255],
            "ef_website_url": company["ef_website_url"][:255],
            "description": (
                company["description"][:2000] if company.get("description") else None
            ),
            "logo": company.get("logo", "")[:255] if company.get("logo") else None,
            "demo_video": (
                company.get("demo_video", "")[:255]
                if company.get("demo_video")
                else None
            ),
            # "website_url": website_url[:255] if website_url else None,
            # "founding_year": company.get("founding_year"),
            "industry_tags": cleaned_industry_tags,
        }

        # # Only update status if current status is inactive and new check is active
        # if current_status == "inactive" and is_active:
        #     update_data["status"] = "active"

        result = (
            supabase.table("companies")
            .upsert(
                update_data,
                on_conflict="ef_website_url",
            )
            .execute()
        )

        company_id = result.data[0]["id"]
        # status = "🟢" if is_active else "🔴" if website_url else "⚪️"
        # print(
        #     f"{status} Company '{company['name']}' website status: {is_active}"
        #     if website_url
        #     else f"{status} Company '{company['name']}' has no website"
        # )

        # for founder in company["founders"]:
        #     supabase.table("founders").upsert(
        #         {
        #             "first_name": founder["first_name"][:255],
        #             "last_name": (
        #                 founder.get("last_name", "")[:255]
        #                 if founder.get("last_name")
        #                 else None
        #             ),
        #             "linkedin_url": (
        #                 founder.get("linkedin_url", "")[:255]
        #                 if founder.get("linkedin_url")
        #                 else None
        #             ),
        #             "company_id": company_id,
        #         },
        #         on_conflict="first_name,last_name,company_id",
        #     ).execute()

        print(f"✅ Upserted company '{company['name']}' with ID {company_id}")
    except APIError as e:
        print(f"❌ Database error for company '{company['name']}': {e.message}")
    except (ValueError, TypeError) as e:
        print(f"❌ Data error for company '{company['name']}': {e}")
    except Exception as e:
        print(f"❌ Unexpected error for company '{company['name']}': {e}")


def insert_all(companies):
    """Insert all companies into the database"""
    for company in companies:
        insert_into_db(company)
