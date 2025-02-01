"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { useState } from "react";
import { Company } from "@/types";
import Link from "next/link";
import CompanyModal from "./company-modal";

const columnHelper = createColumnHelper<Company>();

const columns = [
  columnHelper.accessor("name", {
    header: "Company Name",
    filterFn: "arrIncludes",
    cell: (info) => (
      <Link
        href={
          info.row.original.website_url
            ? info.row.original.website_url
            : "https://en.wikipedia.org/wiki/Rest_in_peace"
        }
        target="_blank"
        className="text-blue-600 hover:underline font-medium"
      >
        {info.getValue()}
      </Link>
    ),
  }),

  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => {
      const status = info.getValue();
      const statusStyles = {
        active: "bg-emerald-100 text-emerald-800 border-2 border-emerald-300",
        inactive: "bg-rose-100 text-rose-800 border-2 border-rose-300",
        acquired: "bg-purple-100 text-purple-800 border-2 border-purple-300",
      };
      const statusLabels = {
        active: "Active",
        inactive: "Inactive",
        acquired: "Acquired",
      };

      return (
        <span
          className={`px-3 py-1.5 rounded-full font-semibold text-sm ${
            statusStyles[status as keyof typeof statusStyles]
          }`}
        >
          {statusLabels[status as keyof typeof statusLabels]}
        </span>
      );
    },
  }),

  columnHelper.accessor("founding_year", {
    header: "Founded",
    cell: (info) => (
      <span className="text-gray-900 font-medium">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor("industry_tags", {
    header: "Industries",
    filterFn: "arrIncludes",
    cell: (info) => (
      <div className="flex flex-wrap gap-1">
        {info.getValue()?.map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-medium"
          >
            {tag}
          </span>
        ))}
      </div>
    ),
  }),
  columnHelper.accessor("description", {
    header: "Description",
    cell: (info) => (
      <div className="max-w-md truncate text-gray-900">{info.getValue()}</div>
    ),
  }),
  columnHelper.accessor("ef_website_url", {
    header: "EF Website",
    filterFn: "arrIncludes",
    cell: (info) => (
      <Link
        href={`${info.row.original.ef_website_url}`}
        target="_blank"
        className="text-blue-600 hover:underline font-medium"
      >
        {info.getValue()}
      </Link>
    ),
  }),
];

const statuses = ["Active", "Inactive", "Acquired"];

interface CompaniesTableProps {
  data: Company[];
}

export default function CompaniesTable({ data }: CompaniesTableProps) {
  const [searchFilter, setSearchFilter] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const uniqueIndustries = Array.from(
    new Set(data.flatMap((company) => company.industry_tags))
  ).sort();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="p-4">
      <div className="mb-4 flex gap-4 flex-wrap">
        <input
          type="text"
          value={searchFilter}
          onChange={(e) => {
            const value = e.target.value;
            setSearchFilter(value);
            table.setGlobalFilter(value);
          }}
          placeholder="Search companies..."
          className="p-2 border rounded"
          style={{ color: "black" }}
        />

        <select
          value={statusFilter}
          onChange={(e) => {
            const value = e.target.value;
            setStatusFilter(value);
            table.getColumn("status")?.setFilterValue(value);
          }}
          className="p-2 border rounded flex-1"
          style={{ color: "black" }}
        >
          <option value="">Status</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <select
          value={industryFilter}
          onChange={(e) => {
            const value = e.target.value;
            setIndustryFilter(value);
            table.getColumn("industry_tags")?.setFilterValue(value);
          }}
          className="p-2 border rounded flex-1"
          style={{ color: "black" }}
        >
          <option value="">All Industries</option>
          {uniqueIndustries.map((industry) => (
            <option key={industry} value={industry}>
              {industry}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => setSelectedCompany(row.original)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CompanyModal
        company={selectedCompany}
        isOpen={!!selectedCompany}
        onClose={() => setSelectedCompany(null)}
      />
    </div>
  );
}
