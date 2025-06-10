// filepath: c:\Users\andre\Desktop\uni\Ing Web\front_telconova_feature2\components\organisms\TecnicoOrdenDetailsView.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation';
import axios from 'axios'; 
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/molecules/card";
import { OrderStatusUpdater } from "@/components/molecules/OrderStatusUpdater";

export type OrderDetails = {
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
};

const statusOptions = [
  { value: "nuevo", label: "Nuevo" },
  { value: "en_curso", label: "En curso" },
  { value: "pausado", label: "Pausado" },
  { value: "finalizado", label: "Finalizado" },
  { value: "cerrado", label: "Cerrado" },
];

export default function TecnicoOrdenDetailsView() {
  const searchParams = useSearchParams();
  const ordenId = searchParams.get('ordenId');

  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  useEffect(() => {
    if (ordenId) {
      const fetchOrderDetails = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await axios.get(`https://telconovaf2api.onrender.com/api/orders/${ordenId}`, {
            withCredentials: true, 
          });
          
          const data: OrderDetails = response.data; 
          setOrderDetails(data);
          if (data && data.urgency) { 
            const currentStatus = data.urgency.toLowerCase();
            // Find the status option that matches the current urgency label from the API
            const matchingStatus = statusOptions.find(option => option.label.toLowerCase() === currentStatus);
            // If a match is found, set its value; otherwise, default to the first option's value or an empty string if no options
            setSelectedStatus(matchingStatus?.value || (statusOptions.length > 0 ? statusOptions[0].value : ""));
          }

        } catch (err: any) {
          setError(err.message);
          setOrderDetails(null);
        } finally {
          setLoading(false);
        }
      };
      fetchOrderDetails();
    } else {
      setError("No se proporcionó un ID de orden.");
      setLoading(false);
    }
  }, [ordenId]);

  const handleStatusChange = () => {
    if (!ordenId) {
      alert("ID de orden no encontrado.");
      return;
    }
    // Find the label for the currently selected status value
    const statusLabel = statusOptions.find(option => option.value === selectedStatus)?.label || selectedStatus;
    alert(`Orden ID: ${ordenId}\nNuevo Estado: ${statusLabel}\nImplementar lógica de cambio de estado aquí.`);
    // TODO: Implement actual API call to update status
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        Cargando detalles de la orden...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 px-4 text-center text-red-500">
        <h1 className="text-2xl font-bold">Error</h1>
        <p className="mt-4">{error}</p>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <h1 className="text-2xl font-bold">Detalles de la Orden</h1>
        <p className="mt-4">No se encontró información para la orden solicitada.</p>
      </div>
    );
  }

  const formattedTimestamp = new Date(orderDetails.timestamp).toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const currentStatusLabel = statusOptions.find(s => s.value === selectedStatus)?.label || selectedStatus;

  return (
    <div className="container mx-auto py-10 px-4 flex justify-center">
      <div className="w-full max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Orden #{orderDetails.id} - {orderDetails.name}</CardTitle>
            <CardDescription>
              Detalles de la orden de servicio y gestión de estado.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-6">
              <div className="space-y-2">
                <p><span className="font-semibold">Solicitante:</span> {orderDetails.requester}</p>
                <p><span className="font-semibold">Fecha de Creación:</span> {formattedTimestamp}</p>
                <p><span className="font-semibold">Zona:</span> {orderDetails.zoneName}</p>
                <p><span className="font-semibold">Prioridad (Estado API):</span> {orderDetails.urgency}</p> 
                <p><span className="font-semibold">Tiempo Estimado:</span> {orderDetails.estimatedTime} horas</p>
                <p><span className="font-semibold">Carga de Trabajo:</span> {orderDetails.workload}</p>
              </div>
              <div className="space-y-2">
                <p><span className="font-semibold">Técnico Asignado:</span> {orderDetails.technicianName || "No asignado"}</p>
                <p><span className="font-semibold">Especialidad Requerida:</span> {orderDetails.specialtyName || "No especificada"}</p>
                <p><span className="font-semibold">Estado Actual (UI):</span> <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{currentStatusLabel}</span></p>
              </div>
              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-2">Descripción del Problema/Servicio</h3>
                <p className="text-gray-700 leading-relaxed">
                  {orderDetails.description} 
                </p>
              </div>
            </div>
            <div className="md:w-1/3 space-y-4 pt-4 border-t md:border-t-0 md:border-l md:pl-6">
              <OrderStatusUpdater 
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
                onUpdateStatus={handleStatusChange}
                statusOptions={statusOptions}
                disabled={!selectedStatus} // Disable if no status is selected (e.g. initial load or error)
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
