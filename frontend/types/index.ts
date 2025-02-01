export interface Company {
  id: number;
  name: string;
  ef_website_url: string;
  description: string | null;
  logo: string | null;
  demo_video: string | null;
  website_url: string | null;
  revenue: number | null;
  funding_raised: number | null;
  latest_funding_round: string | null;
  employee_count: number | null;
  founding_year: number | null;
  industry_tags: string[];
  created_at: string;
  updated_at: string;
  is_still_active: boolean;
  status: "active" | "inactive" | "acquired";
}

export interface Founder {
  id: number;
  first_name: string;
  last_name: string | null;
  linkedin_url: string | null;
  estimated_birth_year: number | null;
  education: string[];
  employers: string[];
  company_id: number;
  created_at: string;
  updated_at: string;
}
