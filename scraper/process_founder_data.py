import os
from collections import Counter

from dotenv import load_dotenv
from supabase import create_client

# Load environment variables at the start
load_dotenv()


def top_ten_most_common_companies(founders):
    # Flatten all employer lists and count them
    all_companies = []
    for founder in founders:
        if founder.get("employers"):
            all_companies.extend(founder["employers"])
    return Counter(all_companies).most_common(100)


def top_ten_most_common_universities(founders):
    # Flatten all education lists and count them
    all_universities = []
    for founder in founders:
        if founder.get("education"):
            all_universities.extend(founder["education"])
    return Counter(all_universities).most_common(11)


## oldest, youngest, average age, median age
def get_age_data(founders):
    # Use estimated_birth_year instead of age
    current_year = 2024
    ages = []
    for founder in founders:
        birth_year = founder.get("estimated_birth_year")
        if birth_year:
            ages.append(current_year - birth_year)

    if not ages:
        return None, None, None

    median_age = sorted(ages)[len(ages) // 2]

    return max(ages), min(ages), sum(ages) / len(ages), median_age


def main():
    # Check if environment variables are present
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")

    if not supabase_url or not supabase_key:
        raise ValueError(
            "Missing environment variables. Please ensure SUPABASE_URL and SUPABASE_KEY are set in .env file"
        )

    supabase = create_client(supabase_url, supabase_key)
    response = supabase.table("founders").select("*").execute()

    # Access the data property of the response
    founders = response.data

    print("Age Data (Max, Min, Average):", get_age_data(founders))
    print(
        "\nTop 10 Most Common Previous Companies:",
        top_ten_most_common_companies(founders),
    )
    print(
        "\nTop 10 Most Common Universities:", top_ten_most_common_universities(founders)
    )


if __name__ == "__main__":
    main()


"""

Age Data (Max, Min, Average): (52, 18, 33.0)

Top 10 Most Common Previous Companies: [('Entrepreneur First', 358), ('Imperial College London', 17), ('University of Cambridge', 17), ('HAX', 15), ('University of Oxford', 14), ('McKinsey & Company', 12), ('National University of Singapore', 11), ('Stealth Startup', 11), ('Microsoft', 10), ('Goldman Sachs', 10)]

Top 10 Most Common Universities: [('University of Cambridge', 63), ('Imperial College London', 47), ('University of Oxford', 45), ('UCL', 30), ('National University of Singapore', 20), ('University of Bristol', 13), ('Nanyang Technological University', 12), ('University of Warwick', 11), ('University of Bath', 11), ('Y Combinator', 11)]



"""
