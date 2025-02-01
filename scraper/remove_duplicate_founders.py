import os

from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")


def clean_string(s):
    if not s:
        return ""
    # Remove all whitespace, special characters, and convert to lowercase
    return "".join(c.lower() for c in s if c.isalnum())


def main():
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    founders_response = supabase.table("founders").select("*").execute()
    founders = founders_response.data

    founders_dict = {}
    deleted_count = 0
    total_founders = len(founders)

    print(f"Total founders before deduplication: {total_founders}")

    for founder in founders:
        # Create two keys - one strict and one lenient
        strict_key = (
            f"{founder['first_name'].lower().strip()}"
            f"{founder['last_name'].lower().strip()}"
            f"{founder['linkedin_url'].lower().strip() if founder['linkedin_url'] else ''}"
            f"{founder['company_id']}"
        )

        # Lenient key only uses cleaned name and company_id
        lenient_key = (
            f"{clean_string(founder['first_name'])}"
            f"{clean_string(founder['last_name'])}"
            f"{founder['company_id']}"
        )

        print(f"\nChecking founder: {founder['first_name']} {founder['last_name']}")
        print(f"Strict key: {strict_key}")
        print(f"Lenient key: {lenient_key}")

        if lenient_key in founders_dict:
            try:
                existing = founders_dict[lenient_key]
                print(f"\nPotential duplicate found:")
                print(
                    f"Original: ID={existing['id']}, Name={existing['first_name']} {existing['last_name']}, Company={existing['company_id']}"
                )
                print(
                    f"Duplicate: ID={founder['id']}, Name={founder['first_name']} {founder['last_name']}, Company={founder['company_id']}"
                )

                # Delete the duplicate with the higher ID
                founder_to_delete = (
                    founder if founder["id"] > existing["id"] else existing
                )
                if founder["id"] > existing["id"]:
                    founders_dict[lenient_key] = existing  # Keep the original
                else:
                    founders_dict[lenient_key] = founder  # Keep the new one

                delete_response = (
                    supabase.table("founders")
                    .delete()
                    .eq("id", founder_to_delete["id"])
                    .execute()
                )
                print(f"Deleted founder with ID: {founder_to_delete['id']}")
                deleted_count += 1
            except Exception as e:
                print(f"Error deleting founder {founder['id']}: {str(e)}")
        else:
            founders_dict[lenient_key] = founder

    # Verify the deletion
    final_count = len(supabase.table("founders").select("*").execute().data)
    print(f"\nSummary:")
    print(f"Initial count: {total_founders}")
    print(f"Duplicates found and deleted: {deleted_count}")
    print(f"Final count: {final_count}")


if __name__ == "__main__":
    main()
