"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/molecules/select";
import { Button } from "@/components/atoms/button";
import { Label } from "@/components/atoms/label";

type StatusOption = {
  value: string;
  label: string;
};

interface OrderStatusUpdaterProps {
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  onUpdateStatus: () => void;
  statusOptions: StatusOption[];
  disabled?: boolean;
}

export function OrderStatusUpdater({
  selectedStatus,
  onStatusChange,
  onUpdateStatus,
  statusOptions,
  disabled = false,
}: OrderStatusUpdaterProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="status-select" className="text-md font-semibold mb-2 block">
          Cambiar Estado de la Orden
        </Label>
        <Select
          value={selectedStatus}
          onValueChange={onStatusChange}
          disabled={disabled || statusOptions.length === 0}
        >
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
      <Button
        onClick={onUpdateStatus}
        className="w-full"
        disabled={disabled || !selectedStatus}
      >
        Cambiar estado
      </Button>
    </div>
  );
}
