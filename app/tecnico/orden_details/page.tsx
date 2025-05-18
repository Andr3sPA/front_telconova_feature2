"use client";

import React, { useState, Suspense } from "react"; // Added Suspense
import { useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Mock data for order details - replace with actual data fetching
const getOrderDetails = (orderId: string | null) => {
  if (!orderId) return null;
  // In a real app, you would fetch this data based on orderId
  return {
    id: orderId,
    cliente: "Nombre del Cliente Ejemplo",
    fecha: new Date().toLocaleDateString(),
    zona: "Zona Ejemplo",
    tecnicoActual: "Técnico Asignado Ejemplo", // Or "Sin asignar"
    estadoActual: "Nuevo", // Default or fetched status
    descripcion: "Descripción detallada del problema o servicio requerido para esta orden específica."
  };
};

const statusOptions = [
  { value: "nuevo", label: "Nuevo" },
  { value: "en_curso", label: "En curso" },
  { value: "pausado", label: "Pausado" },
  { value: "finalizado", label: "Finalizado" },
  { value: "cerrado", label: "Cerrado" },
];

// New component to contain client-side logic
function TecnicoOrdenDetailsClientContent() {
  const searchParams = useSearchParams();
  const ordenId = searchParams.get('ordenId');
  const orderDetails = getOrderDetails(ordenId);

  const [selectedStatus, setSelectedStatus] = useState<string>(orderDetails?.estadoActual.toLowerCase().replace(" ", "_") || statusOptions[0].value);

  const handleStatusChange = () => {
    if (!ordenId) {
      alert("ID de orden no encontrado.");
      return;
    }
    const statusLabel = statusOptions.find(option => option.value === selectedStatus)?.label || selectedStatus;
    alert(`Orden ID: ${ordenId}\nNuevo Estado: ${statusLabel}\nImplementar lógica de cambio de estado aquí.`);
    // Here you would typically make an API call to update the order status
  };

  if (!orderDetails) {
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <h1 className="text-2xl font-bold">Detalles de la Orden</h1>
        <p className="mt-4">No se pudo cargar la información de la orden. Verifique el ID o intente de nuevo.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 flex justify-center">
      <div className="w-full max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Orden #{orderDetails.id}</CardTitle>
            <CardDescription>
              Detalles de la orden de servicio y gestión de estado.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-6">
            {/* Left Side: Order Details */}
            <div className="flex-1 space-y-6">
              <div className="space-y-2">
                <p><span className="font-semibold">Cliente:</span> {orderDetails.cliente}</p>
                <p><span className="font-semibold">Fecha de Creación:</span> {orderDetails.fecha}</p>
                <p><span className="font-semibold">Zona:</span> {orderDetails.zona}</p>
              </div>

              <div className="space-y-2">
                <p><span className="font-semibold">Técnico Asignado:</span> {orderDetails.tecnicoActual}</p>
                <p><span className="font-semibold">Estado Actual:</span> <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{statusOptions.find(s => s.value === orderDetails.estadoActual.toLowerCase().replace(" ", "_"))?.label || orderDetails.estadoActual}</span></p>
              </div>
    
              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-2">Descripción del Problema/Servicio</h3>
                <p className="text-gray-700 leading-relaxed">
                  {orderDetails.descripcion}
                </p>
              </div>
            </div>

            {/* Right Side: Status Change */}
            <div className="md:w-1/3 space-y-4 pt-4 border-t md:border-t-0 md:border-l md:pl-6">
              <div>
                <Label htmlFor="status-select" className="text-md font-semibold mb-2 block">Cambiar Estado de la Orden</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger id="status-select" className="w-full">
                    <SelectValue placeholder="Seleccione un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleStatusChange} className="w-full">Cambiar estado</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function TecnicoOrdenDetailsPage() {
  return (
    <Suspense fallback={<div>Cargando detalles de la orden...</div>}>
      <TecnicoOrdenDetailsClientContent />
    </Suspense>
  );
}
