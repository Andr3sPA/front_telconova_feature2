"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Badge } from "@/components/ui/badge";
import { Option } from "@/types/data-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// 1. Define the data type for this table
export type OrdenTecnicoEntry = {
  id: string; // Orden ID
  supervisor: string;
  prioridad: "Alta" | "Media" | "Baja";
  estado: "Pendiente" | "En Progreso" | "Completado" | "Cancelado";
  zona: string;
};

// 2. Create sample data
const data: OrdenTecnicoEntry[] = [
  { id: "ORD-101", supervisor: "Luisa Martinez", prioridad: "Alta", estado: "Pendiente", zona: "Norte" },
  { id: "ORD-102", supervisor: "Marcos Rivera", prioridad: "Media", estado: "En Progreso", zona: "Sur" },
  { id: "ORD-103", supervisor: "Luisa Martinez", prioridad: "Baja", estado: "Completado", zona: "Este" },
  { id: "ORD-104", supervisor: "Pedro Pascal", prioridad: "Alta", estado: "Pendiente", zona: "Oeste" },
  { id: "ORD-105", supervisor: "Marcos Rivera", prioridad: "Media", estado: "Cancelado", zona: "Centro" },
];

// Reusable options for filters (can be moved to a shared location if used elsewhere)
const prioridadOptions: Option[] = [
  { label: "Alta", value: "Alta" },
  { label: "Media", value: "Media" },
  { label: "Baja", value: "Baja" },
];

const estadoOptions: Option[] = [
  { label: "Pendiente", value: "Pendiente" },
  { label: "En Progreso", value: "En Progreso" },
  { label: "Completado", value: "Completado" },
  { label: "Cancelado", value: "Cancelado" },
];

// 3. Define the columns
const columns: ColumnDef<OrdenTecnicoEntry>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Orden" />
    ),
    cell: ({ row }) => <div>{row.getValue("id")}</div>,
    enableSorting: true,
    enableHiding: true,
    meta: {
      label: "Orden",
    }
  },
  {
    accessorKey: "supervisor",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Supervisor" />
    ),
    cell: ({ row }) => <div>{row.getValue("supervisor")}</div>,
    enableSorting: true,
    enableHiding: true,
    meta: {
      label: "Supervisor",
    }
  },
  {
    accessorKey: "prioridad",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Prioridad" />
    ),
    cell: ({ row }) => {
      const prioridad = row.getValue("prioridad") as string;
      let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
      if (prioridad === "Alta") variant = "destructive";
      if (prioridad === "Media") variant = "default";
      // For "Baja", it will use the default "secondary" or you can specify another
      return <Badge variant={variant}>{prioridad}</Badge>;
    },
    enableSorting: true,
    enableHiding: true,
    meta: {
      options: prioridadOptions,
      label: "Prioridad",
    },
  },
  {
    accessorKey: "estado",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => {
      const estado = row.getValue("estado") as string;
      let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
      if (estado === "Pendiente") variant = "outline";
      if (estado === "En Progreso") variant = "default";
      // "Completado" uses "secondary" by default
      if (estado === "Cancelado") variant = "destructive";
      return <Badge variant={variant}>{estado}</Badge>;
    },
    enableSorting: true,
    enableHiding: true,
    meta: {
      options: estadoOptions,
      label: "Estado",
    },
  },
  {
    accessorKey: "zona",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Zona" />
    ),
    cell: ({ row }) => <div>{row.getValue("zona")}</div>,
    enableSorting: true,
    enableHiding: true,
    meta: {
      label: "Zona",
    }
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <Link href={`/tecnico/orden_details?ordenId=${row.original.id}`} passHref>
        <Button variant="outline" size="sm">
          Ver Detalles
        </Button>
      </Link>
    ),
  },
];

// 4. Create the page component
export default function OrdenesTablePage() {
  const { table } = useDataTable<OrdenTecnicoEntry>({
    data,
    columns,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },
  });

  const facetedFilterColumnsConfig = columns
    .filter(colDef => 
      colDef.meta?.options && 
      (('accessorKey' in colDef && typeof colDef.accessorKey === 'string') || colDef.id)
    )
    .map(colDef => {
      const key = ('accessorKey' in colDef && typeof colDef.accessorKey === 'string') 
                    ? colDef.accessorKey 
                    : colDef.id!;
      return {
        accessorKey: key,
        title: colDef.meta?.label ?? key,
        options: colDef.meta!.options!,
      };
    });

  return (
    <div className="container py-10 w-3/4 mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Lista de Órdenes Asignadas</h1>
      <div className="space-y-4">
        <DataTableToolbar 
          table={table} 
          facetedFilterColumns={facetedFilterColumnsConfig}
          searchColumnKey="supervisor" // Specify supervisor column for search
          searchPlaceholder="Búsqueda por supervisor..." // Specify placeholder
        />
        <DataTable table={table} />
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}

