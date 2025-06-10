import Link from 'next/link';
import Image from 'next/image'; // Import the Image component

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 text-white p-8">
      <div className="text-center mb-12">
        <Image
          src="/login.png" // Using the login.png image
          alt="TelcoNova Logo"
          width={150}
          height={150}
          className="mx-auto mb-6 rounded-full shadow-lg"
        />
        <h1 className="text-5xl font-bold mb-4">Bienvenido a TelcoNova</h1>
        <p className="text-xl text-slate-300 mb-10">
          Su solución integral para la gestión eficiente de órdenes de servicio técnico.
        </p>
      </div>
      <div className="w-full max-w-xs">
        <Link href="/login" passHref>
          <button className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-4 px-8 rounded-lg text-lg shadow-xl transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75">
            Iniciar Sesión
          </button>
        </Link>
      </div>
      <footer className="absolute bottom-8 text-center text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} TelcoNova. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
