// filepath: c:\Users\andre\Desktop\uni\Ing Web\front_telconova_feature2\components\organisms\TecnicoOrdenesTable.tsx
"use client";

import React, { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/components/organisms/data-table";
import { DataTableToolbar } from "@/components/organisms/data-table-toolbar";
import { DataTableColumnHeader } from "@/components/molecules/data-table-column-header";
import { DataTablePagination } from "@/components/molecules/data-table-pagination";
import { Badge } from "@/components/atoms/badge";
import { Option } from "@/types/data-table";
import Link from "next/link";
import { Button } from "@/components/atoms/button";
import axios from "axios";

export type OrdenTecnicoEntry = {
  id: number;
  name: string;
  description: string;
  estimatedTime: number;
  workload: number;
  urgency: "Alta" | "Media" | "Baja" | string; // Keep string for flexibility with API data
  zoneId: number;
  zoneName: string;
  requester: string;
  timestamp: string;
  technicianName: string | null;
  specialtyName: string | null;
};

// Base columns definition (options for filters will be injected dynamically)
const baseColumns: ColumnDef<OrdenTecnicoEntry>[] = [
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
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Descripción" />
    ),
    cell: ({ row }) => {
      const description = row.getValue("description") as string;
      return <div title={description}>{description.length > 50 ? `${description.substring(0, 47)}...` : description}</div>;
    },
    enableSorting: false,
    enableHiding: true,
    meta: {
      label: "Descripción",
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
      // options will be set dynamically via state for this column's filter
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
      // options will be set dynamically via state for this column's filter
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

export default function TecnicoOrdenesTable() {
  const [apiData, setApiData] = useState<OrdenTecnicoEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoneOptions, setZoneOptions] = useState<Option[]>([]);
  const [dynamicPrioridadOptions, setDynamicPrioridadOptions] = useState<Option[]>([]); // New state for dynamic priority options

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

          const uniqueZones = [...new Set(mappedData.map(item => item.zoneName).filter(Boolean))];
          const generatedZoneOptions = uniqueZones.map(zone => ({ label: zone, value: zone }));
          setZoneOptions(generatedZoneOptions);

          // Dynamically create priority options from fetched data
          const uniquePriorities = [...new Set(mappedData.map(item => item.urgency).filter(Boolean))];
          const generatedPrioridadOptions = uniquePriorities.map(priority => ({ label: priority, value: priority }));
          setDynamicPrioridadOptions(generatedPrioridadOptions);

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

  const columns = React.useMemo(() => {
    return baseColumns.map(col => {
      if (('accessorKey' in col && col.accessorKey === 'zoneName') || col.id === 'zoneName') {
        return {
          ...col,
          meta: {
            ...col.meta,
            options: zoneOptions,
          }
        };
      }
      if (('accessorKey' in col && col.accessorKey === 'urgency') || col.id === 'urgency') {
        return {
          ...col,
          meta: {
            ...col.meta,
            options: dynamicPrioridadOptions,
          }
        };
      }
      return col;
    });
  }, [zoneOptions, dynamicPrioridadOptions]); // Add dynamicPrioridadOptions to dependencies

  const { table } = useDataTable<OrdenTecnicoEntry>({
    data: apiData, 
    columns, // Use the memoized columns that now include dynamic options
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },
  });

  const facetedFilterColumnsConfig = React.useMemo(() => columns
    .filter(colDef => 
      colDef.meta?.options && 
      (('accessorKey' in colDef && typeof colDef.accessorKey === 'string') || colDef.id)
    )
    .map(colDef => {
      const key = ('accessorKey' in colDef && typeof colDef.accessorKey === 'string') 
                    ? colDef.accessorKey 
                    : colDef.id!;
      
      // Options are now directly from the memoized columns definition, which are dynamic
      return {
        accessorKey: key,
        title: colDef.meta?.label ?? key,
        options: colDef.meta!.options!, 
      };
    }), [columns]); // Depend on the memoized columns which carry the dynamic options

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
          // searchConfig or filterConfig prop omitted as it caused errors for this file
        />
        <div className="rounded-md border">
          {/* DataTable receives the table object which includes columns and data */}
          <DataTable table={table} /> 
        </div>
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
