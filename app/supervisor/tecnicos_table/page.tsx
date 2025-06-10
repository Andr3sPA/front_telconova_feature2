"use client";

import React, { useEffect, useState } from "react";
import axios from "axios"; // Import axios
import { ColumnDef } from "@tanstack/react-table";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/components/organisms/data-table";
import { DataTableToolbar } from "@/components/organisms/data-table-toolbar";
import { DataTableColumnHeader } from "@/components/molecules/data-table-column-header";
import { DataTablePagination } from "@/components/molecules/data-table-pagination";
import { Option } from "@/types/data-table"; 
import Link from "next/link"; 
import { Button } from "@/components/atoms/button"; 

// Define the new type for the order data from the assignment report
export type AssignmentOrderEntry = {
  id: number;
  name: string; // Added name
  description: string; // Added description
  technicianName: string | null;
  zoneName: string; 
  urgency: string;  // Added urgency for consistency, though might be N/A
  // state: string; // State can be derived or set to a default if not directly available
};


const columns: ColumnDef<AssignmentOrderEntry>[] = [
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
    },
    filterFn: (row, columnId, filterValue) => {
      const rowValue = row.getValue(columnId) as number;
      const stringifiedRowValue = String(rowValue);
      return stringifiedRowValue.includes(String(filterValue));
    }
  },
  {
    accessorKey: "name", // New column for Order Name
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
    accessorKey: "description", // New column for Description
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
      <DataTableColumnHeader column={column} title="Nombre Técnico" />
    ),
    cell: ({ row }) => <div>{row.getValue("technicianName") || "No asignado"}</div>,
    enableSorting: true,
    enableHiding: true,
    meta: {
      label: "Nombre Técnico",
    }
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
    },
  },
  {
    accessorKey: "urgency", 
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Prioridad" />
    ),
    cell: ({ row }) => {
      const urgencyValue = row.getValue("urgency") as string;
      // Basic display, can be enhanced with Badges like in OrdenesTablePage if needed
      return <div>{urgencyValue}</div>; 
    },
    enableSorting: true,
    enableHiding: true,
    meta: {
      // options will be set dynamically via state for this column's filter
      label: "Prioridad",
    },
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

export default function TecnicosTablePage() {
  const [apiData, setApiData] = useState<AssignmentOrderEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoneOptions, setZoneOptions] = useState<Option[]>([]);
  const [prioridadOptions, setPrioridadOptions] = useState<Option[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Changed endpoint to /api/orders/all
        const response = await axios.get("https://telconovaf2api.onrender.com/api/orders/all", {
          withCredentials: true, 
        });
        console.log("API Response (TecnicosTablePage - /api/orders/all):", response.data); 
        const result = response.data; 
        
        // Updated mapping for /api/orders/all response structure
        if (result && result._embedded && result._embedded.orderDTOList) {
          const mappedData: AssignmentOrderEntry[] = result._embedded.orderDTOList.map((item: any) => ({
            id: item.id, 
            name: item.name, // Added name
            description: item.description, // Added description
            technicianName: item.technicianName || "No asignado", 
            zoneName: item.zoneName, 
            urgency: item.urgency, // Added urgency
            // state: item.technicianName ? "Asignada" : "Pendiente", // Example state derivation
          }));
          console.log("Mapped Data (TecnicosTablePage):", mappedData); 
          setApiData(mappedData);

          // Dynamically create zone options
          const uniqueZones = [...new Set(mappedData.map(item => item.zoneName).filter(Boolean))];
          setZoneOptions(uniqueZones.map(zone => ({ label: zone, value: zone })));

          // Dynamically create prioridad options
          const uniquePriorities = [...new Set(mappedData.map(item => item.urgency).filter(Boolean))];
          setPrioridadOptions(uniquePriorities.map(priority => ({ label: priority, value: priority })));

        } else {
          console.warn("Unexpected API response structure from /api/orders/all:", result);
          setApiData([]); 
        }
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || "Error al cargar las órdenes");
        setApiData([]); 
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const { table } = useDataTable<AssignmentOrderEntry>({
    data: apiData, 
    columns: React.useMemo(() => { // Make columns reactive to dynamic options
      return columns.map(col => {
        if (('accessorKey' in col && col.accessorKey === 'zoneName') || col.id === 'zoneName') {
          // Ensure label is preserved/set if not already
          const metaLabel = (col.meta as { label?: string })?.label || "Zona";
          return { ...col, meta: { ...col.meta, label: metaLabel, options: zoneOptions } };
        }
        if (('accessorKey' in col && col.accessorKey === 'urgency') || col.id === 'urgency') {
          // Ensure label is preserved/set if not already
          const metaLabel = (col.meta as { label?: string })?.label || "Prioridad";
          return { ...col, meta: { ...col.meta, label: metaLabel, options: prioridadOptions } };
        }
        return col;
      });
    }, [zoneOptions, prioridadOptions]), // Updated dependencies
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },
  });

  const facetedFilterColumnsConfig = React.useMemo(() => {
    const config = [];
    
    // Configuration for Zona filter
    const zoneColDef = columns.find(col => (('accessorKey' in col && col.accessorKey === 'zoneName') || col.id === 'zoneName'));
    if (zoneColDef && zoneOptions.length > 0) {
      config.push({
        accessorKey: "zoneName",
        title: (zoneColDef.meta as { label: string })?.label || "Zona",
        options: zoneOptions,
      });
    }

    // Configuration for Prioridad (urgency) filter
    const urgencyColDef = columns.find(col => (('accessorKey' in col && col.accessorKey === 'urgency') || col.id === 'urgency'));
    if (urgencyColDef && prioridadOptions.length > 0) {
      config.push({
        accessorKey: "urgency",
        title: (urgencyColDef.meta as { label: string })?.label || "Prioridad",
        options: prioridadOptions,
      });
    }
    return config;
  }, [zoneOptions, prioridadOptions]); // Updated dependencies

  if (loading) {
    return <div className="container py-10 w-3/4 mx-auto text-center">Cargando órdenes...</div>;
  }

  if (error) {
    return <div className="container py-10 w-3/4 mx-auto text-center text-red-500">Error al cargar las órdenes: {error}</div>;
  }

  return (
    <div className="container py-10 w-3/4 mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Listado de Órdenes</h1>
      <div className="space-y-4">
        <DataTableToolbar 
          table={table} 
          facetedFilterColumns={facetedFilterColumnsConfig}
          searchColumnKey="id" 
          searchPlaceholder="Búsqueda por orden id"
        />
        <DataTable table={table} />
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}