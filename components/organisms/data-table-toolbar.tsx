"use client";

import { Table, Column } from "@tanstack/react-table"; // Added Column import
import { XIcon } from "lucide-react"; // Or your preferred icon library
import * as React from "react";

import { DataTableDateFilter } from "@/components/molecules/data-table-date-filter";
import { DataTableFacetedFilter, Option } from "@/components/molecules/data-table-faceted-filter"; // Assuming this will be adapted, imported Option
import { DataTableSliderFilter } from "@/components/molecules/data-table-slider-filter";
import { DataTableViewOptions } from "@/components/molecules/data-table-view-options";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { cn } from "@/lib/utils";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  facetedFilterColumns?: {
    accessorKey: string;
    title: string;
    options: Option[];
  }[];
  searchColumnKey?: string;
  searchPlaceholder?: string;
}

export function DataTableToolbar<TData>({
  table,
  facetedFilterColumns = [],
  searchColumnKey,
  searchPlaceholder = "Búsqueda...",
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const searchColumn = searchColumnKey ? table.getColumn(searchColumnKey) : undefined;

  const getFacetedFilterableColumns = () => {
    return table.getAllColumns().filter(
      (column) =>
        typeof column.accessorFn !== "undefined" &&
        column.getCanFilter() &&
        facetedFilterColumns.some((fc) => fc.accessorKey === column.id)
    );
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {searchColumn && (
          <Input
            placeholder={searchPlaceholder}
            value={(searchColumn.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              searchColumn.setFilterValue(event.target.value)
            }
            className="h-8 w-[150px] lg:w-[250px]"
          />
        )}
        {getFacetedFilterableColumns().map((column) => {
          // Cast column to Column<TData, unknown> to satisfy DataTableFacetedFilter's expected type
          // This casting was correct, the issue might be in how it was applied or interpreted by the linter in the previous step.
          const col = column as Column<TData, unknown>; 
          const config = facetedFilterColumns.find((fc) => fc.accessorKey === col.id);
          if (!config) return null;

          return (
            <DataTableFacetedFilter
              key={col.id}
              column={col}
              title={config.title}
              options={config.options}
            />
          );
        })}

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <XIcon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}

interface DataTableToolbarFilterProps<TData> {
  column: Column<TData>;
}

function DataTableToolbarFilter<TData>({
  column,
}: DataTableToolbarFilterProps<TData>) {
  {
    const columnMeta = column.columnDef.meta;

    const onFilterRender = React.useCallback(() => {
      if (!columnMeta?.variant) return null;

      switch (columnMeta.variant) {
        case "text":
          return (
            <Input
              placeholder={columnMeta.placeholder ?? columnMeta.label}
              value={(column.getFilterValue() as string) ?? ""}
              onChange={(event) => column.setFilterValue(event.target.value)}
              className="h-8 w-40 lg:w-56"
            />
          );

        case "number":
          return (
            <div className="relative">
              <Input
                type="number"
                inputMode="numeric"
                placeholder={columnMeta.placeholder ?? columnMeta.label}
                value={(column.getFilterValue() as string) ?? ""}
                onChange={(event) => column.setFilterValue(event.target.value)}
                className={cn("h-8 w-[120px]", columnMeta.unit && "pr-8")}
              />
              {columnMeta.unit && (
                <span className="absolute top-0 right-0 bottom-0 flex items-center rounded-r-md bg-accent px-2 text-muted-foreground text-sm">
                  {columnMeta.unit}
                </span>
              )}
            </div>
          );

        case "range":
          return (
            <DataTableSliderFilter
              column={column}
              title={columnMeta.label ?? column.id}
            />
          );

        case "date":
        case "dateRange":
          return (
            <DataTableDateFilter
              column={column}
              title={columnMeta.label ?? column.id}
              multiple={columnMeta.variant === "dateRange"}
            />
          );

        case "select":
        case "multiSelect":
          return (
            <DataTableFacetedFilter
              column={column}
              title={columnMeta.label ?? column.id}
              options={columnMeta.options ?? []}
            />
          );

        default:
          return null;
      }
    }, [column, columnMeta]);

    return onFilterRender();
  }
}
