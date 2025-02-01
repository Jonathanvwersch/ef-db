"use client";

import { useQuery } from "@tanstack/react-query";
import CompaniesTable from "@/components/companies-table";
import { Company } from "@/types";
import InNumbers from "@/components/in-numbers";

async function fetchCompanies(): Promise<Company[]> {
  const response = await fetch("/api/companies");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

function TableSkeleton() {
  return (
    <div className="p-4">
      <div className="mb-4 flex gap-4 flex-wrap">
        <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 w-48 bg-gray-200 rounded animate-pulse flex-1" />
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[...Array(5)].map((_, i) => (
                <th key={i} className="px-6 py-3 text-left">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {[...Array(10)].map((_, index) => (
              <tr key={index}>
                {[...Array(5)].map((_, i) => (
                  <td key={i} className="px-6 py-4">
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Home() {
  const {
    data: companies,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["companies"],
    queryFn: fetchCompanies,
  });

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Entrepreneur First Companies
              </h1>
              <p className="mt-2 text-gray-600">
                <a
                  target="_blank"
                  href="https://www.joinef.com"
                  className="text-blue-500"
                >
                  Entrepreneur First
                </a>{" "}
                invests in exceptional individuals to build startups from
                scratch
              </p>
              <p className="mt-2 text-xs text-gray-500">
                *This website is not affiliated with Entrepreneur First. Data
                was scraped from public sources and manually cleaned. There may
                be errors in the data. Report them{" "}
                <a
                  target="_blank"
                  href="https://docs.google.com/forms/d/e/1FAIpQLSdLnilvMKXuS6j3TOWOVyOHubOwy1-l1uXGPEwvN5_CJcWttg/viewform?usp=header"
                  className="text-blue-500"
                >
                  here
                </a>
                .
              </p>
            </div>
          </div>
          <InNumbers data={companies || []} isLoading={isLoading} />
          <div className="bg-white rounded-lg shadow">
            {isLoading ? (
              <TableSkeleton />
            ) : error ? (
              <div className="p-4 text-red-500">Error loading companies</div>
            ) : (
              <CompaniesTable data={companies || []} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
