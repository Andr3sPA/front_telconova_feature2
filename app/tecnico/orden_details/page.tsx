"use client";

import React, { useState, Suspense, useEffect } from "react";
import { useSearchParams } from 'next/navigation';
import axios from 'axios'; 
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

function TecnicoOrdenDetailsClientContent() {
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
            const matchingStatus = statusOptions.find(option => option.label.toLowerCase() === currentStatus);
            setSelectedStatus(matchingStatus?.value || statusOptions[0].value);
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
    const statusLabel = statusOptions.find(option => option.value === selectedStatus)?.label || selectedStatus;
    alert(`Orden ID: ${ordenId}\\nNuevo Estado: ${statusLabel}\\nImplementar lógica de cambio de estado aquí.`);
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
                <p><span className="font-semibold">Prioridad:</span> {orderDetails.urgency}</p>
                <p><span className="font-semibold">Tiempo Estimado:</span> {orderDetails.estimatedTime} horas</p>
                <p><span className="font-semibold">Carga de Trabajo:</span> {orderDetails.workload}</p>
              </div>
              <div className="space-y-2">
                <p><span className="font-semibold">Técnico Asignado:</span> {orderDetails.technicianName || "No asignado"}</p>
                <p><span className="font-semibold">Especialidad Requerida:</span> {orderDetails.specialtyName || "No especificada"}</p>
                <p><span className="font-semibold">Estado Actual:</span> <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{statusOptions.find(s => s.value === selectedStatus)?.label || selectedStatus}</span></p>
              </div>
              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-2">Descripción del Problema/Servicio</h3>
                <p className="text-gray-700 leading-relaxed">
                  {orderDetails.description} 
                </p>
              </div>
            </div>
            <div className="md:w-1/3 space-y-4 pt-4 border-t md:border-t-0 md:border-l md:pl-6">
              <div>
                <Label htmlFor="status-select" className="text-md font-semibold mb-2 block">Cambiar Estado de la Orden</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus} disabled={!selectedStatus}>
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
              <Button onClick={handleStatusChange} className="w-full" disabled={!selectedStatus}>Cambiar estado</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function TecnicoOrdenDetailsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-10 px-4 text-center">Cargando detalles de la orden...</div>}>
      <TecnicoOrdenDetailsClientContent />
    </Suspense>
  );
}
