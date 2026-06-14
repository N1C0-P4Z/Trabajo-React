/**
 * @fileoverview Componente Switch (toggle) basado en Radix UI.
 * Se usa para activar/desactivar opciones booleanas como el estado de un usuario.
 */

import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Interruptor de tipo toggle (on/off).
 * 
 * @param {Object} props
 * @param {string} [props.className] - Clases CSS adicionales
 * @param {"default"|"sm"} [props.size="default"] - Tamaño del switch
 * @param {React.Ref<HTMLButtonElement>} ref
 * @returns {JSX.Element}
 * 
 * @example
 * <Switch checked={activo} onCheckedChange={setActivo} />
 * <Switch size="sm" disabled />
 */
const Switch = React.forwardRef(({
  className,
  size = "default",
  ...props
}, ref) => {
  return (
    <SwitchPrimitive.Root
      ref={ref}
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 data-[size=default]:h-[16.6px] data-[size=default]:w-[28px] data-[size=sm]:h-[14px] data-[size=sm]:w-[24px] dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:bg-primary data-unchecked:bg-input dark:data-unchecked:bg-input/80 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}>
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full bg-background ring-0 transition-transform group-data-[size=default]/switch:size-3.5 group-data-[size=sm]/switch:size-3 group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-2px)] dark:data-checked:bg-primary-foreground group-data-[size=default]/switch:data-unchecked:translate-x-0 group-data-[size=sm]/switch:data-unchecked:translate-x-0 dark:data-unchecked:bg-foreground" />
    </SwitchPrimitive.Root>
  );
})

export { Switch }
