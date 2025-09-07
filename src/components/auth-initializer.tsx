"use client";

import { useAuthStore } from "../store/useAuthStore";
import { useEffect, useRef } from "react";

// Este componente no renderiza nada, solo ejecuta la lógica de inicialización una vez.
export function AuthInitializer() {
  const initialized = useRef(false);

  useEffect(() => {
    // Nos aseguramos que la inicialización solo corra una vez
    if (!initialized.current) {
      useAuthStore.getState().init();
      initialized.current = true;
    }
  }, []);

  return null; // No necesita renderizar nada en la UI
}