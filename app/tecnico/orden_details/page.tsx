"use client";

import React, { Suspense } from "react";
import TecnicoOrdenDetailsView from "@/components/organisms/TecnicoOrdenDetailsView";

export default function TecnicoOrdenDetailsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-10 px-4 text-center">Cargando detalles de la orden...</div>}>
      <TecnicoOrdenDetailsView />
    </Suspense>
  );
}
