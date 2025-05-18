"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Badge } from "@/components/ui/badge";
import { Option } from "@/types/data-table"; // Import Option from the centralized types
import Link from "next/link"; // Added Link import
import { Button } from "@/components/ui/button"; // Added Button import

export type TecnicoEntry = {
  id: string;
  tecnico: string;
  prioridad: "Alta" | "Media" | "Baja";
  estado: "Pendiente" | "En Progreso" | "Completado" | "Cancelado";
  zona: string;
};

const data: TecnicoEntry[] = [
  { id: "ORD-001", tecnico: "Sin asignar", prioridad: "Alta", estado: "Pendiente", zona: "Norte" },
  { id: "ORD-002", tecnico: "Ana Gómez", prioridad: "Media", estado: "En Progreso", zona: "Sur" },
  { id: "ORD-003", tecnico: "Carlos López", prioridad: "Baja", estado: "Completado", zona: "Este" },
  { id: "ORD-004", tecnico: "Laura Fernández", prioridad: "Alta", estado: "Pendiente", zona: "Oeste" },
  { id: "ORD-005", tecnico: "Miguel Rodríguez", prioridad: "Media", estado: "Cancelado", zona: "Centro" },
  { id: "ORD-006", tecnico: "Sofía Martínez", prioridad: "Alta", estado: "En Progreso", zona: "Norte" },
  { id: "ORD-007", tecnico: "David García", prioridad: "Baja", estado: "Pendiente", zona: "Sur" },
];

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

const columns: ColumnDef<TecnicoEntry>[] = [
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
    accessorKey: "tecnico",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Técnico" />
    ),
    cell: ({ row }) => <div>{row.getValue("tecnico")}</div>,
    enableSorting: true,
    enableHiding: true,
    meta: {
      label: "Técnico",
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
      if (estado === "Completado") variant = "secondary";
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
      <Link href={`/supervisor/orden_details?ordenId=${row.original.id}`} passHref>
        <Button variant="outline" size="sm">
          Ver Detalles
        </Button>
      </Link>
    ),
  },
];

// Helper function to get a string identifier for a column
function getColumnId<TData>(colDef: ColumnDef<TData>): string | undefined {
  if (typeof colDef.id === 'string') {
    return colDef.id;
  }
  if (typeof colDef.id === 'string') {
    return colDef.id;
  }
  return undefined;
}

export default function TecnicosTablePage() {
  const { table } = useDataTable<TecnicoEntry>({
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
      ('accessorKey' in colDef && typeof colDef.accessorKey === 'string' && colDef.meta?.options) || 
      (colDef.id && colDef.meta?.options)
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
      <h1 className="text-2xl font-bold mb-6 text-center">Lista de Órdenes de Técnicos</h1>
      <div className="space-y-4">
        <DataTableToolbar 
          table={table} 
          facetedFilterColumns={facetedFilterColumnsConfig}
          searchColumnKey="tecnico" // Explicitly specify tecnico column
          searchPlaceholder="Búsqueda por técnico..." // Specify placeholder
        />
        <DataTable table={table} />
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}