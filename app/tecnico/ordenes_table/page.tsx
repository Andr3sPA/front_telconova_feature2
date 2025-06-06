"use client";

import React, { useEffect, useState } from "react"; // Added useEffect, useState
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
import axios from "axios"; // Import axios

export type OrdenTecnicoEntry = {
  id: number;
  name: string;
  description: string;
  estimatedTime: number;
  workload: number;
  urgency: "Alta" | "Media" | "Baja" | string;
  zoneId: number;
  zoneName: string;
  requester: string;
  timestamp: string;
  technicianName: string | null;
  specialtyName: string | null;
};

const prioridadOptions: Option[] = [
  { label: "Alta", value: "Alta" },
  { label: "Media", value: "Media" },
  { label: "Baja", value: "Baja" },
];

const columns: ColumnDef<OrdenTecnicoEntry>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Orden ID" />
    ),
    cell: ({ row }) => <div>{row.getValue("id")}</div>,
    enableSorting: true,
    enableHiding: true,
    meta: {
      label: "Orden ID",
    }
  },
  {
    accessorKey: "name", 
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombre Orden" />
    ),
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
    enableSorting: true,
    enableHiding: true,
    meta: {
      label: "Nombre Orden",
    }
  },
  {
    accessorKey: "technicianName", 
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Técnico" /> 
    ),
    cell: ({ row }) => <div>{row.getValue("technicianName") || "No asignado"}</div>,
    enableSorting: true,
    enableHiding: true,
    meta: {
      label: "Técnico", 
    }
  },
  {
    accessorKey: "urgency", 
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Prioridad" />
    ),
    cell: ({ row }) => {
      const urgencyValue = row.getValue("urgency") as string;
      let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
      if (urgencyValue === "Alta") variant = "destructive";
      if (urgencyValue === "Media") variant = "default";
      return <Badge variant={variant}>{urgencyValue}</Badge>;
    },
    enableSorting: true,
    enableHiding: true,
    meta: {
      options: prioridadOptions, 
      label: "Prioridad",
    },
  },
  {
    accessorKey: "zoneName", 
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Zona" />
    ),
    cell: ({ row }) => <div>{row.getValue("zoneName")}</div>,
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
      <Link href={`/tecnico/orden_details?ordenId=${String(row.original.id)}`} passHref>
        <Button variant="outline" size="sm">
          Ver Detalles
        </Button>
      </Link>
    ),
  },
];

export default function OrdenesTablePage() {
  const [apiData, setApiData] = useState<OrdenTecnicoEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get("https://telconovaf2api.onrender.com/api/orders/all", {
          withCredentials: true, 
        });
        const result = response.data; 
        if (result && result._embedded && result._embedded.orderDTOList) {
          const mappedData: OrdenTecnicoEntry[] = result._embedded.orderDTOList.map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            estimatedTime: item.estimatedTime,
            workload: item.workload,
            urgency: item.urgency,
            zoneId: item.zoneId,
            zoneName: item.zoneName,
            requester: item.requester,
            timestamp: item.timestamp,
            technicianName: item.technicianName,
            specialtyName: item.specialtyName,
          }));
          setApiData(mappedData);
        } else {
          setApiData([]); 
        }
      } catch (err: any) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || err.message || "An unknown error occurred");
        } else {
          setError(err.message || "An unknown error occurred");
        }
        setApiData([]); 
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const { table } = useDataTable<OrdenTecnicoEntry>({
    data: apiData, 
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

  if (loading) {
    return <div className="container py-10 w-3/4 mx-auto text-center">Cargando órdenes...</div>;
  }

  if (error) {
    return <div className="container py-10 w-3/4 mx-auto text-center text-red-500">Error al cargar órdenes: {error}</div>;
  }

  return (
    <div className="container py-10 w-3/4 mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Lista de Órdenes Asignadas</h1>
      <div className="space-y-4">
        <DataTableToolbar 
          table={table} 
          facetedFilterColumns={facetedFilterColumnsConfig}
          searchColumnKey="technicianName"
          searchPlaceholder="Búsqueda por técnico..." 
        />
        <DataTable table={table} />
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}

