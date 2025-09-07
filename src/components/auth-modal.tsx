import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog"
import { SignUpForm } from "./SignUpForm"
import { SignInForm } from "./sign-in-form"
import { useState } from "react"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLoginView, setIsLoginView] = useState(true)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="text-white">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            {isLoginView ? "Bienvenido de Nuevo" : "Crea tu Cuenta"}
          </DialogTitle>
          <DialogDescription>
            {isLoginView
              ? "Ingresa tus credenciales para acceder."
              : "Únete para empezar a personalizar tu arte."}
          </DialogDescription>
        </DialogHeader>

        {/* --- CAMBIO APLICADO AQUÍ --- */}
        {/* Añadimos una 'key' única a cada formulario. */}
        {/* Esto fuerza a React a montar un componente nuevo y limpio cada vez que cambiamos de vista. */}
        {isLoginView ? <SignInForm key="signin-form" /> : <SignUpForm key="signup-form" />}
        {/* --- FIN DEL CAMBIO --- */}

        <button
          onClick={() => setIsLoginView(!isLoginView)}
          className="text-sm text-center text-red-500 hover:underline mt-4"
        >
          {isLoginView ? "¿No tienes una cuenta? Regístrate" : "¿Ya tienes una cuenta? Inicia Sesión"}
        </button>
      </DialogContent>
    </Dialog>
  )
}