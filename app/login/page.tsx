import { LoginForm } from "@/components/login-form"
export default function LoginPage() {
  return (
    <div className="grid h-[80vh] lg:grid-cols-2">
      {/* Contenedor del formulario (se mantiene con z-index alto) */}
      <div className="relative z-20 flex flex-col gap-4 p-4 md:p-8 bg-background/95 backdrop-blur-sm">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>

      {/* Contenedor de la imagen (posición fija y full-screen) */}
      <div className="fixed inset-0 z-10 lg:static lg:inset-auto">
        <img
          src="/login.png"
          alt="Background"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}