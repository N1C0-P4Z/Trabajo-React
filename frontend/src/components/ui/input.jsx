/**
 * @fileoverview Componente Input reutilizable con estilos de la app.
 * Envuelve el input nativo de HTML con estilos de Tailwind y soporta
 * todos los atributos estándar (placeholder, disabled, type, etc.).
 * Usa forwardRef para integrarse con formularios (react-hook-form) y Radix Slot.
 */

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Campo de texto estilizado.
 * 
 * @param {Object} props
 * @param {string} [props.className] - Clases CSS adicionales
 * @param {string} [props.type="text"] - Tipo de input (text, email, password, tel, etc.)
 * @param {React.Ref<HTMLInputElement>} ref - Ref que se pasa al input nativo
 * @returns {JSX.Element}
 * 
 * @example
 * <Input type="email" placeholder="juan@gmail.com" />
 * <Input type="password" disabled />
 */
const Input = React.forwardRef(({
  className,
  type,
  ...props
}, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      data-slot="input"
      className={cn(
        "h-7 w-full min-w-0 rounded-md border border-input bg-input/20 px-2 py-0.5 text-sm transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-xs/relaxed file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 md:text-xs/relaxed dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props} />
  );
})

export { Input }
