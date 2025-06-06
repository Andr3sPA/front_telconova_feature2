"use client";

import React, { useEffect, useState } from "react";
import axios from "axios"; // Import axios
import { ColumnDef } from "@tanstack/react-table";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Option } from "@/types/data-table"; 
import Link from "next/link"; 
import { Button } from "@/components/ui/button"; 

export type TechnicianReportEntry = {
  technicianId: number;
  technicianName: string;
  specialty: string;
  zone: string;
  totalAssignments: number;
};


const data: TechnicianReportEntry[] = [
  { technicianId: 1, technicianName: "Sin asignar", specialty: "Electricidad", zone: "Norte", totalAssignments: 5 },
  { technicianId: 2, technicianName: "Ana Gómez", specialty: "Plomería", zone: "Sur", totalAssignments: 3 },
  { technicianId: 3, technicianName: "Carlos López", specialty: "Carpintería", zone: "Este", totalAssignments: 8 },
  { technicianId: 4, technicianName: "Laura Fernández", specialty: "Pintura", zone: "Oeste", totalAssignments: 2 },
  { technicianId: 5, technicianName: "Miguel Rodríguez", specialty: "Electricidad", zone: "Centro", totalAssignments: 7 },
  { technicianId: 6, technicianName: "Sofía Martínez", specialty: "Plomería", zone: "Norte", totalAssignments: 4 },
  { technicianId: 7, technicianName: "David García", specialty: "Carpintería", zone: "Sur", totalAssignments: 6 },
];

const columns: ColumnDef<TechnicianReportEntry>[] = [
  {
    accessorKey: "technicianId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID Técnico" />
    ),
    cell: ({ row }) => <div>{row.getValue("technicianId")}</div>,
    enableSorting: true,
    enableHiding: true,
    meta: {
      label: "ID Técnico",
    }
  },
  {
    accessorKey: "technicianName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombre Técnico" />
    ),
    cell: ({ row }) => <div>{row.getValue("technicianName")}</div>,
    enableSorting: true,
    enableHiding: true,
    meta: {
      label: "Nombre Técnico",
    }
  },
  {
    accessorKey: "specialty",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Especialidad" />
    ),
    cell: ({ row }) => <div>{row.getValue("specialty")}</div>,
    enableSorting: true,
    enableHiding: true,
    meta: {
      label: "Especialidad",
    },
  },
  {
    accessorKey: "zone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Zona" />
    ),
    cell: ({ row }) => <div>{row.getValue("zone")}</div>,
    enableSorting: true,
    enableHiding: true,
    meta: {
      label: "Zona",
    },
  },
  {
    accessorKey: "totalAssignments",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Órdenes Asignadas" />
    ),
    cell: ({ row }) => <div className="text-center">{row.getValue("totalAssignments")}</div>,
    enableSorting: true,
    enableHiding: true,
    meta: {
      label: "Órdenes Asignadas",
    }
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <Link href={`/supervisor/tecnico_details?tecnicoId=${row.original.technicianId}`} passHref>
        <Button variant="outline" size="sm">
          Ver Detalles
        </Button>
      </Link>
    ),
  },
];

export default function TecnicosTablePage() {
  const [apiData, setApiData] = useState<TechnicianReportEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get("https://telconovaf2api.onrender.com/api/assignment/report", {
          withCredentials: true, 
        });
        const result = response.data; 
        if (result && result._embedded && result._embedded.technicianAssignmentReportDTOList) {
          const mappedData: TechnicianReportEntry[] = result._embedded.technicianAssignmentReportDTOList.map((item: any) => ({
            technicianId: item.technicianId,
            technicianName: item.technicianName,
            specialty: item.specialty,
            zone: item.zone,
            totalAssignments: item.totalAssignments,
          }));
          setApiData(mappedData);
        } else {
          setApiData([]); 
        }
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || "Error al cargar el reporte");
        setApiData([]); 
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const { table } = useDataTable<TechnicianReportEntry>({
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
    return <div className="container py-10 w-3/4 mx-auto text-center">Cargando reporte de técnicos...</div>;
  }

  if (error) {
    return <div className="container py-10 w-3/4 mx-auto text-center text-red-500">Error al cargar el reporte: {error}</div>;
  }

  return (
    <div className="container py-10 w-3/4 mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Reporte de Asignaciones por Técnico</h1>
      <div className="space-y-4">
        <DataTableToolbar 
          table={table} 
          facetedFilterColumns={facetedFilterColumnsConfig}
          searchColumnKey="technicianName" 
          searchPlaceholder="Búsqueda por nombre de técnico..."
        />
        <DataTable table={table} />
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}