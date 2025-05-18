"use client";

import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  ColumnDef,
  TableOptions,
  Table,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
  ColumnPinningState,
} from "@tanstack/react-table";

export interface UseDataTableProps<TData>
  extends Omit<
    TableOptions<TData>,
    | "getCoreRowModel"
    | "getFilteredRowModel"
    | "getPaginationRowModel"
    | "getSortedRowModel"
    | "getFacetedRowModel"
    | "getFacetedUniqueValues"
    | "state"
    | "onStateChange"
    | "onSortingChange"
    | "onColumnFiltersChange"
    | "onColumnVisibilityChange"
    | "onRowSelectionChange"
  > {
  columns: ColumnDef<TData>[];
  data: TData[];
  pageCount?: number;
  initialState?: Partial<TableOptions<TData>["initialState"] & {
    sorting?: SortingState;
    columnFilters?: ColumnFiltersState;
    visibility?: VisibilityState;
    rowSelection?: RowSelectionState;
    columnPinning?: ColumnPinningState;
  }>;
}

export function useDataTable<TData>({
  columns,
  data,
  pageCount: externalPageCount,
  initialState = {},
  ...rest
}: UseDataTableProps<TData>) {
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(initialState.rowSelection ?? {});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(initialState.columnVisibility ?? {});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(initialState.columnFilters ?? []);
  const [sorting, setSorting] = React.useState<SortingState>(initialState.sorting ?? []);

  const table = useReactTable<TData>({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    initialState: {
      ...initialState,
      sorting: undefined,
      columnFilters: undefined,
      columnVisibility: undefined,
      rowSelection: undefined,
    },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),

    manualPagination: externalPageCount != null,
    pageCount: externalPageCount ?? -1,
    
    getRowId: (row, index, parent) => {
      if (rest.getRowId) return rest.getRowId(row, index, parent);
      return (row as any).id ?? (parent ? `${parent.id}.${index}` : `${index}`);
    },
    debugTable: process.env.NODE_ENV === "development",
    ...rest,
  });

  return { table };
}
