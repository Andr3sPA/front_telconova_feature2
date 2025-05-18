"use client";

import { Table, Column } from "@tanstack/react-table"; // Added Column import
import { XIcon } from "lucide-react"; // Or your preferred icon library
import * as React from "react";

import { DataTableDateFilter } from "@/components/data-table/data-table-date-filter";
import { DataTableFacetedFilter, Option } from "@/components/data-table/data-table-faceted-filter"; // Assuming this will be adapted, imported Option
import { DataTableSliderFilter } from "@/components/data-table/data-table-slider-filter";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  facetedFilterColumns?: {
    accessorKey: string;
    title: string;
    options: Option[]; // Use the imported Option type
  }[];
}

export function DataTableToolbar<TData>({
  table,
  facetedFilterColumns = [],
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const tecnicoColumn = table.getColumn("tecnico"); // Get the tecnico column

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
        {/* Add Input for tecnico search */}
        {tecnicoColumn && (
          <Input
            placeholder="Búsqueda por técnico..."
            value={(tecnicoColumn.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              tecnicoColumn.setFilterValue(event.target.value)
            }
            className="h-8 w-[150px] lg:w-[250px]"
          />
        )}
        {getFacetedFilterableColumns().map((column) => {
          // Cast column to Column<TData, unknown> to satisfy DataTableFacetedFilter's expected type
          const col = column as Column<TData, unknown>;
          const config = facetedFilterColumns.find((fc) => fc.accessorKey === col.id);
          if (!config) return null;

          return (
            <DataTableFacetedFilter
              key={col.id}
              column={col} // Use the casted column
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
