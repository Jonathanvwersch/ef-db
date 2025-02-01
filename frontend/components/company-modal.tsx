"use client";

import { Company, Founder } from "@/types";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase";

interface CompanyModalProps {
  company: Company | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CompanyModal({
  company,
  isOpen,
  onClose,
}: CompanyModalProps) {
  const [founders, setFounders] = useState<Founder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchFounders() {
      if (!company) return;

      setIsLoading(true);
      const supabase = createSupabaseClient();

      const { data, error } = await supabase
        .from("founders")
        .select("*")
        .eq("company_id", company.id);

      if (!error && data) {
        // Remove duplicates from education and employers arrays
        const processedFounders = data.map((founder) => ({
          ...founder,
          education: founder.education ? [...new Set(founder.education)] : [],
          employers: founder.employers ? [...new Set(founder.employers)] : [],
        }));
        setFounders(processedFounders);
      }
      setIsLoading(false);
    }

    void fetchFounders();
  }, [company]);

  if (!company) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">{company.name} Details</DialogTitle>
        <div className="space-y-8">
          {/* Company Details */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {company.name}
              </h2>
              <p className="mt-2 text-gray-600">{company.description}</p>
            </div>

            <div className="flex flex-col gap-2">
              {company.website_url && (
                <a
                  href={company.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800"
                >
                  <span className="text-sm">Company Website</span>
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              )}

              <a
                href={company.ef_website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800"
              >
                <span className="text-sm">EF Profile</span>
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Founded</h3>
              <p className="mt-1 text-gray-900">{company.founding_year}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Industries</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {company.industry_tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-sm bg-gray-100 text-gray-700 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Founders Details */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Founders
            </h2>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div
                    key={i}
                    className="h-32 bg-gray-100 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {founders.map((founder) => (
                  <div key={founder.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">
                        {founder.first_name} {founder.last_name}
                      </h3>
                      {founder.linkedin_url && (
                        <a
                          href={founder.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                          title="View LinkedIn Profile"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                          </svg>
                        </a>
                      )}
                    </div>

                    {founder.education?.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">
                          Education
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {founder.education.map((school, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 text-sm bg-gray-100 text-gray-700 rounded-md"
                            >
                              {school}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {founder.employers?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">
                          Previous Companies
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {founder.employers.map((employer, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 text-sm bg-gray-100 text-gray-700 rounded-md"
                            >
                              {employer}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
