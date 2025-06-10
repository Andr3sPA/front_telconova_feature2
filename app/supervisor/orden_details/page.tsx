"use client";

import * as React from "react";
import { Suspense, useEffect, useState } from 'react'; // Ensure all hooks are imported
import { ColumnDef } from "@tanstack/react-table";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/components/organisms/data-table";
import { DataTableToolbar } from "@/components/organisms/data-table-toolbar";
import { DataTableColumnHeader } from "@/components/molecules/data-table-column-header";
import { DataTablePagination } from "@/components/molecules/data-table-pagination";
import { Checkbox } from "@/components/atoms/checkbox";
import { Button } from "@/components/atoms/button";
import { Progress } from "@/components/atoms/progress"; // Import Progress
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/molecules/card";
import { useSearchParams } from 'next/navigation';
import axios from 'axios'; // Import axios

// ... (ResumenTecnicoEntry and OrderInfo types remain the same) ...
export type ResumenTecnicoEntry = {
  technicianId: number; 
  technicianName: string; 
  totalAssignments: number; 
  specialty: string; 
  zone: string; 
};

export type OrderInfo = {
  id: number;
  name: string;
  description: string;
  estimatedTime: number;
  workload: number;
  urgency: string;
  zoneId: number;
  zoneName: string;
  requester: string;
  timestamp: string;
  technicianName: string | null;
  specialtyName: string | null;
  state?: string; 
};


// ... (columns definition remains the same) ...
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
    accessorKey: "technicianName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Técnico" />
    ),
    cell: ({ row }) => <div>{row.getValue("technicianName")}</div>,
    enableSorting: true,
    enableHiding: true,
    meta: {
      label: "Técnico",
    },
    filterFn: (row, columnId, filterValue) => {
      const rowValue = row.getValue(columnId) as string;
      const normalizedRowValue = rowValue
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\\u0300-\\u036f]/g, "");
      return normalizedRowValue.includes(filterValue.toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, ""));
    }
  },
  {
    accessorKey: "totalAssignments",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Órdenes a Cargo" />
    ),
    cell: ({ row }) => <div>{row.getValue("totalAssignments")}</div>,
    enableSorting: true,
    enableHiding: true,
    meta: {
      label: "Órdenes a Cargo",
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
    }
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
    }
  },
];

function OrderDetailsClientContent() {
  const searchParams = useSearchParams();
  const ordenId = searchParams.get('ordenId');
  const [apiData, setApiData] = useState<ResumenTecnicoEntry[]>([]);
  const [loading, setLoading] = useState(true); // For technician table
  const [error, setError] = useState<string | null>(null); // For technician table

  const [orderDetails, setOrderDetails] = useState<OrderInfo | null>(null);
  const [orderLoading, setOrderLoading] = useState(true); // For order details card
  const [orderError, setOrderError] = useState<string | null>(null); // For order details card

  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [assignmentProgress, setAssignmentProgress] = useState(0);

  const fetchTechnicianReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("https://telconovaf2api.onrender.com/api/assignment/report", {
        withCredentials: true,
      });
      const result = response.data;
      if (result && result._embedded && result._embedded.technicianAssignmentReportDTOList) {
        const mappedData: ResumenTecnicoEntry[] = result._embedded.technicianAssignmentReportDTOList.map((item: any) => ({
          technicianId: item.technicianId,
          technicianName: item.technicianName,
          totalAssignments: item.totalAssignments,
          specialty: item.specialty,
          zone: item.zone,
        }));
        setApiData(mappedData);
      } else {
        console.warn("Unexpected API response structure for assignment report:", result);
        setApiData([]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch technician assignment data.");
      console.error("Fetch error (technician report):", err);
      setApiData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async () => {
    if (!ordenId) {
      setOrderError("Order ID is missing.");
      setOrderLoading(false);
      setOrderDetails(null);
      return;
    }
    setOrderLoading(true);
    setOrderError(null);
    try {
      const response = await axios.get(`https://telconovaf2api.onrender.com/api/orders/${ordenId}`, {
        withCredentials: true,
      });
      setOrderDetails({ ...response.data, state: response.data.technicianName ? "Asignado" : (response.data.state || "Nuevo") });
    } catch (err: any) {
      setOrderError(err.message || "Failed to fetch order details.");
      console.error("Fetch error (order details):", err);
      setOrderDetails(null);
    } finally {
      setOrderLoading(false);
    }
  };


  useEffect(() => {
    fetchTechnicianReport();
    fetchOrderDetails();
  }, [ordenId]); 

  const { table } = useDataTable<ResumenTecnicoEntry>({
    data: apiData,
    columns,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 5,
      },
    },
    enableRowSelection: true,
    enableMultiRowSelection: false,
  });

  const facetedFilterColumnsConfig: any[] = []; 

  const refetchOrderDetails = async () => {
    if (ordenId) {
      setOrderLoading(true);
      setOrderError(null); // Clear previous errors
      try {
        const res = await axios.get(`https://telconovaf2api.onrender.com/api/orders/${ordenId}`, { withCredentials: true });
        setOrderDetails({ ...res.data, state: res.data.technicianName ? "Asignado" : (res.data.state || "Nuevo") });
      } catch (err:any) {
        setOrderError(err.message || "Failed to refetch order details.");
        // Optionally setOrderDetails(null) here if that's desired on refetch failure
      } finally {
        setOrderLoading(false);
      }
    } else {
      setOrderError("Order ID is missing for refetch.");
      setOrderDetails(null); // Clear details if no ID
      setOrderLoading(false);
    }
  };

  const handleAsignarTecnico = async () => {
    const selectedRows = table.getSelectedRowModel().rows;
    if (selectedRows.length !== 1) {
      alert("Por favor, seleccione un único técnico para asignar.");
      return;
    }
    if (!ordenId || !orderDetails) {
      alert("No se pudo obtener el ID de la orden o los detalles de la orden.");
      return;
    }

    setAssignmentLoading(true);
    setAssignmentProgress(10);

    const selectedTecnico = selectedRows[0].original as ResumenTecnicoEntry;
    const assignmentPayload = {
      id: 0, 
      technicianId: selectedTecnico.technicianId,
      technicianName: selectedTecnico.technicianName, 
      orderId: parseInt(ordenId),
      orderName: orderDetails.name, 
      timestamp: new Date().toISOString(),
    };

    try {
      setAssignmentProgress(50); // Simulate progress
      await axios.post("https://telconovaf2api.onrender.com/api/assignment", assignmentPayload, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setAssignmentProgress(100);
      alert(`Técnico ${selectedTecnico.technicianName} asignado a la orden ${orderDetails.name}.`);
      table.resetRowSelection(); 
      await refetchOrderDetails(); 
      await fetchTechnicianReport();
      setTimeout(() => {
        setAssignmentProgress(0); // Reset progress bar after a short delay
      }, 1000);
    } catch (error: any) {
      console.error(`Error al asignar técnico ${selectedTecnico.technicianName} a la orden ${orderDetails.name}:`, error);
      if (axios.isAxiosError(error) && error.response && error.response.status === 403) {
        table.resetRowSelection();
        await refetchOrderDetails();
        await fetchTechnicianReport();
        setTimeout(() => {
          setAssignmentProgress(0);
        }, 1000);
      } else {
        alert(`Error al asignar técnico: ${error.response?.data?.message || error.message}`);
        setAssignmentProgress(0); // Reset progress on other errors
      }
    } finally {
      setAssignmentLoading(false);
    }
  };

  const handleAutoAsignar = async () => {
    if (!ordenId || !orderDetails) {
      alert("No se pudo obtener el ID de la orden para asignación automática.");
      return;
    }
    
    setAssignmentLoading(true);
    setAssignmentProgress(10);

    try {
      setAssignmentProgress(50); // Simulate progress
      await axios.post(`https://telconovaf2api.onrender.com/api/assignment/auto?orderId=${ordenId}`, {}, {
        withCredentials: true,
        headers: { // Add headers for auto assignment as well
          'Content-Type': 'application/json',
        },
      });
      setAssignmentProgress(100);
      alert(`Solicitud de asignación automática enviada para la orden ${ordenId}. El técnico asignado se reflejará en breve.`);
      await refetchOrderDetails(); 
      await fetchTechnicianReport();
      setTimeout(() => {
        setAssignmentProgress(0); // Reset progress bar after a short delay
      }, 1000);
    } catch (error: any) {
      console.error("Error en asignación automática:", error);
      if (axios.isAxiosError(error) && error.response && error.response.status === 403) {
        setAssignmentProgress(100); // Mark as complete for UI
        await refetchOrderDetails();
        await fetchTechnicianReport();
        setTimeout(() => {
          setAssignmentProgress(0);
        }, 1000);
      } else {
        alert(`Error en asignación automática: ${error.response?.data?.message || error.message}`);
        setAssignmentProgress(0); // Reset progress on other errors
      }
    } finally {
      setAssignmentLoading(false);
    }
  };

  if (loading || orderLoading) {
    return <div>Cargando datos de técnicos y detalles de la orden...</div>;
  }

  if (error) {
    return <div>Error al cargar los datos: {error}</div>;
  }

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
            facetedFilterColumns={facetedFilterColumnsConfig}
            searchColumnKey="technicianName"
            searchPlaceholder="Buscar por nombre de técnico..."
          />
            <DataTable table={table} />
            <DataTablePagination table={table} />
            <div className="flex justify-center gap-2 mt-4">
              <Button
                onClick={handleAsignarTecnico}
                disabled={table.getSelectedRowModel().rows.length !== 1 || !orderDetails || assignmentLoading}
              >
                Asignar Técnico
              </Button>
              <Button
                onClick={handleAutoAsignar}
                disabled={!orderDetails || assignmentLoading}
                variant="outline" 
              >
                Asignación Automática
              </Button>
            </div>
            {assignmentLoading && (
              <div className="my-4 w-full flex flex-col items-center">
                <Progress value={assignmentProgress} className="w-[80%]" />
                <p className="text-sm text-muted-foreground mt-1">
                  {assignmentProgress < 100 ? `Procesando asignación... ${assignmentProgress}%` : "Asignación completada."}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="fixed inset-0 z-10 lg:static lg:inset-auto lg:pr-8">
          <Card>
            <CardHeader>
              <CardTitle>Orden #{orderDetails ? orderDetails.name : (ordenId || "N/A")}</CardTitle>
              <CardDescription>
                {orderDetails ? `Detalles de la orden. Urgencia: ${orderDetails.urgency}` : "Cargando detalles..."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {orderLoading && <p>Cargando información de la orden...</p>}
              {orderError && <p className="text-red-500">Error: {orderError}</p>}
              {orderDetails && !orderLoading && !orderError && (
                <>
                  <div className="space-y-2">
                    <p className="text-gray-600"><span className="font-semibold">Cliente:</span> {orderDetails.requester}</p>
                    <p className="text-gray-600"><span className="font-semibold">Fecha:</span> {new Date(orderDetails.timestamp).toLocaleDateString()}</p>
                    <p className="text-gray-600"><span className="font-semibold">Zona:</span> {orderDetails.zoneName}</p>
                  </div>

                  <div className="space-y-2 mt-4">
                    <p className="text-gray-600">
                      <span className="font-semibold">Técnico:</span> 
                      {orderDetails.technicianName ? orderDetails.technicianName : <span className="text-gray-400">Sin asignar</span>}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Estado:</span> 
                      <span className={`px-2 py-1 rounded ${orderDetails.technicianName ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                        {orderDetails.state}
                      </span>
                    </p>
                  </div>
        
                  <div className="pt-6 border-t border-gray-200 mt-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Descripción</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {orderDetails.description}
                    </p>
                  </div>
                </>
              )}
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

export default function ExtraInfoPage() { 
  return (
    <Suspense fallback={<div>Cargando detalles de la orden...</div>}>
      <OrderDetailsClientContent />
    </Suspense>
  );
}