import { Company } from "@/types";
import { useMemo } from "react";

interface Props {
  data: Company[];
  isLoading: boolean;
}

const topTenMostCommonUniversities = [
  "University of Cambridge",
  "Imperial College London",
  "University of Oxford",
  "UCL",
  "National University of Singapore",
  "University of Bristol",
  "Nanyang Technological University",
  "University of Warwick",
  "University of Bath",
  "HEC Paris",
];

const topTenMostCommonPreviousCompanies = [
  "McKinsey & Company",
  "Microsoft",
  "Goldman Sachs",
  "Amazon",
  "Google",
  "CERN",
  "Boston Consulting Group (BCG)",
  "Morgan Stanley",
  "Palantir",
  "Bain & Company",
];

const ageData = {
  oldest: 52,
  youngest: 18,
  average: 33,
  median: 32,
};

export default function InNumbers({ data, isLoading }: Props) {
  const stats = useMemo(
    () => ({
      total: data.length,
      foundersCount: 731,
      active: data.filter((company) => company.status === "active").length,
      inactive: data.filter((company) => company.status === "inactive").length,
      acquired: data.filter((company) => company.status === "acquired").length,
      industries: new Set(data.flatMap((company) => company.industry_tags))
        .size,
      yearsActive: (() => {
        let minYear = Infinity;
        let maxYear = 0;
        for (const company of data) {
          if (company.founding_year) {
            minYear = Math.min(minYear, company.founding_year);
            maxYear = Math.max(maxYear, company.founding_year);
          }
        }
        return maxYear - minYear;
      })(),
    }),
    [data]
  );

  if (isLoading) {
    return (
      <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="h-10 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded mt-2 w-2/3 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mb-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-4xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm font-medium text-gray-500 mt-1">
            Total Companies
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-emerald-200">
          <div className="text-4xl font-bold text-emerald-600">
            {stats.active}
          </div>
          <div className="text-sm font-medium text-emerald-600 mt-1">
            Active Companies
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-purple-200">
          <div className="text-4xl font-bold text-purple-600">
            {stats.acquired}
          </div>
          <div className="text-sm font-medium text-purple-600 mt-1">
            Acquired Companies
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-red-200">
          <div className="text-4xl font-bold text-red-600">
            {stats.foundersCount}
          </div>
          <div className="text-sm font-medium text-red-600 mt-1">Founders</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-200">
          <div className="text-4xl font-bold text-blue-600">
            {stats.industries}
          </div>
          <div className="text-sm font-medium text-blue-600 mt-1">
            Unique Industries
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Founder Age Distribution
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {ageData.youngest}
            </div>
            <div className="text-sm text-gray-500">Youngest</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {ageData.oldest}
            </div>
            <div className="text-sm text-gray-500">Oldest</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {ageData.average}
            </div>
            <div className="text-sm text-gray-500">Average</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {ageData.median}
            </div>
            <div className="text-sm text-gray-500">Median</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Most Common Universities
        </h3>
        <div className="flex flex-wrap gap-2">
          {topTenMostCommonUniversities.map((university) => (
            <span
              key={university}
              className="px-2 py-1 text-sm bg-gray-100 text-gray-700 rounded-md"
            >
              {university}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Most Common Previous Companies
        </h3>
        <div className="flex flex-wrap gap-2">
          {topTenMostCommonPreviousCompanies.map((company) => (
            <span
              key={company}
              className="px-2 py-1 text-sm bg-gray-100 text-gray-700 rounded-md"
            >
              {company}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
