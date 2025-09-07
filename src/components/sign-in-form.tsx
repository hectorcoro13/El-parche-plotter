"use client"
import { useState } from "react";
import { Button } from "./ui/button";
import Swal from "sweetalert2";
import { useAuthStore } from "../store/useAuthStore";
import { useCartStore } from "../store/useCartStore";
import { useUIStore } from "../store/useUIStore";
import { AlertTriangle } from "lucide-react";

export function SignInForm() {
  const login = useAuthStore(state => state.login);
  const closeAuthModal = useUIStore(state => state.closeAuthModal);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Credenciales incorrectas.");
      
      await login(data.token);
      await useCartStore.getState().syncCart();
      
      closeAuthModal();

      await Swal.fire({
        title: '¡Sesión Iniciada!',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: '#111827',
        color: '#FFFFFF'
      });

      const user = useAuthStore.getState().user;
      
      if (user?.isAdmin) {
        window.location.href = '/admin';
      } else {
        window.location.href = '/';
      }

    } catch (err: any) {
      const errorText = err.message.includes('bloqueada') 
        ? 'Tu cuenta ha sido bloqueada.' 
        : 'El usuario o la contraseña son incorrectos.';
      
      // 1. Mostramos el error directamente en el formulario
      setErrorMessage(errorText);

      // --- 2. Y también mostramos la notificación Toast ---
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        },
        background: '#111827',
        color: '#FFFFFF',
        iconColor: '#ef4444'
      });

      Toast.fire({
        icon: "error",
        title: errorText
      });

    } finally {
      setIsLoading(false);
    }
  };
  const inputStyles = "w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className={inputStyles} required />
      <input type="password" name="password" placeholder="Contraseña" value={formData.password} onChange={handleChange} className={inputStyles} required />

      {errorMessage && (
        <div className="flex items-center gap-x-2 rounded-md border border-red-500/30 bg-red-900/20 p-3 text-sm text-red-400 animate-in fade-in-50">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}

      <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading}>
        {isLoading ? "Ingresando..." : "Iniciar Sesión"}
      </Button>
    </form>
  );
}