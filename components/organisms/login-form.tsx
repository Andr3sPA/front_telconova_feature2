"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/atoms/button"
import { Input } from "@/components/atoms/input"
import { Label } from "@/components/atoms/label"
import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import axios from "axios"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const formSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.post(
        "https://telconovaf2api.onrender.com/api/auth/login",
        {
          email: values.email,
          password: values.password,
        },
        {
          withCredentials: true,
        }
      )

      if (response.status === 200 || response.status === 204) {
        console.log("Login successful")
        router.push("/supervisor/tecnicos_table")
      } else {
        setError("Login failed. Please check your credentials.")
      }
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "An unknown error occurred during login."
        )
      } else {
        setError(err.message || "An unknown error occurred during login.")
      }
      console.error("Login error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Acceso</h1>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Correo eléctronico</Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            required
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Contraseña</Label>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Olvidaste tu contraseña?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            {...register("password")}
            required
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Iniciando sesión..." : "Iniciar sesión"}
        </Button>
      </div>
      <div className="text-center text-sm">
        No tienes una cuenta?{" "}
        <a href="#" className="underline underline-offset-4">
          Regístrate
        </a>
      </div>
    </form>
  )
}
