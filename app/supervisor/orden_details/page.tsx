"use client";

import * as React from "react";
import { Suspense } from 'react'; // Import Suspense
import { ColumnDef } from "@tanstack/react-table";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSearchParams } from 'next/navigation';

// 1. Define the data type for the new table
export type ResumenTecnicoEntry = {
  id: string; // Technician's unique ID, also used for row ID
  tecnico: string; // Technician's name
  ordenesAsignadas: number; // Count of orders assigned
};

// 2. Create sample data
const data: ResumenTecnicoEntry[] = [
  { id: "tec-001", tecnico: "Juan Pérez", ordenesAsignadas: 5 },
  { id: "tec-002", tecnico: "Ana Gómez", ordenesAsignadas: 3 },
  { id: "tec-003", tecnico: "Carlos López", ordenesAsignadas: 7 },
  { id: "tec-004", tecnico: "Laura Fernández", ordenesAsignadas: 2 },
  { id: "tec-005", tecnico: "Miguel Rodríguez", ordenesAsignadas: 8 },
  { id: "tec-006", tecnico: "Sofía Martínez", ordenesAsignadas: 4 },
  { id: "tec-007", tecnico: "David García", ordenesAsignadas: 6 },
];

// 3. Define the columns
const columns: ColumnDef<ResumenTecnicoEntry>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
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
    accessorKey: "ordenesAsignadas",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Órdenes a Cargo" />
    ),
    cell: ({ row }) => <div>{row.getValue("ordenesAsignadas")}</div>,
    enableSorting: true,
    enableHiding: true,
    meta: {
      label: "Órdenes a Cargo",
    }
  },
];

// New component to contain client-side logic
function OrderDetailsClientContent() {
  const searchParams = useSearchParams();
  const ordenId = searchParams.get('ordenId');

  const { table } = useDataTable<ResumenTecnicoEntry>({
    data,
    columns,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 5, // Adjust as needed
      },
    },
    enableRowSelection: true, // Enable row selection
  });

  const facetedFilterColumnsConfig: any[] = []; 

  const handleAsignarTecnico = () => {
    const selectedRows = table.getSelectedRowModel().rows;
    if (selectedRows.length === 0) {
      alert("Por favor, seleccione al menos un técnico de la tabla.");
      return;
    }
    const selectedTecnicos = selectedRows.map(row => row.original);
    console.log("Técnicos seleccionados para asignar:", selectedTecnicos);
    alert(`Técnicos seleccionados: ${selectedTecnicos.map(t => t.tecnico).join(', ')}.\nImplementar lógica de asignación aquí.`);
    table.resetRowSelection(); 
  };

  return (
    <>
      <div className="container py-1 w-3/4 mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Resumen de Órden</h1>
      </div>
      <div className="grid h-[80vh] lg:grid-cols-2">
        <div className="relative z-20 flex flex-col gap-4 p-4 md:p-8 bg-background/95 backdrop-blur-sm">
          <div className="space-y-4">
            <DataTableToolbar
              table={table}
              facetedFilterColumns={facetedFilterColumnsConfig} />
            <DataTable table={table} />
            <DataTablePagination table={table} />
            <div className="flex justify-center">
              <Button
                onClick={handleAsignarTecnico}
                disabled={table.getSelectedRowModel().rows.length === 0}
              >
                Asignar Técnico
              </Button>
            </div>
          </div>
        </div>
        <div className="fixed inset-0 z-10 lg:static lg:inset-auto lg:pr-8">
          <Card>
            <CardHeader>
              <CardTitle>Orden #{ordenId ? ordenId : "N/A"}</CardTitle>
              <CardDescription>
                Seleccione un técnico y haga clic en "Asignar Técnico" para proceder.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-gray-600"><span className="font-semibold">Cliente:</span> Nombre del cliente</p>
                <p className="text-gray-600"><span className="font-semibold">Fecha:</span> fecha de creación</p>
                <p className="text-gray-600"><span className="font-semibold">Zona:</span> Valle de Aburrá</p>
              </div>

              <div className="space-y-2 mt-4">
                <p className="text-gray-600"><span className="font-semibold">Técnico:</span> <span className="text-gray-400">Sin asignar</span></p>
                <p className="text-gray-600"><span className="font-semibold">Estado:</span> <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Nuevo</span></p>
              </div>
    
              <div className="pt-6 border-t border-gray-200 mt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Descripción</h3>
                <p className="text-gray-600 leading-relaxed">
                  Desde hace tres días no tengo conexión a Internet en mi hogar. El módem muestra una luz roja fija en el indicador de "Wiki". Ya reinicié el equipo varias veces sin éxito. Necesito una solución urgente, trabajo desde casa.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              {/* Add any footer content if needed */}
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
}

// 4. Update the page component to use Suspense
export default function ExtraInfoPage() { 
  return (
    <Suspense fallback={<div>Cargando detalles de la orden...</div>}>
      <OrderDetailsClientContent />
    </Suspense>
  );
}