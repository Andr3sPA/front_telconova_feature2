import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-12">Bienvenido a TelcoNova</h1>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6 w-full max-w-4xl">
        <Link href="/login" passHref>
          <button className="w-full bg-gray-500 hover:bg-gray-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition duration-150 ease-in-out transform hover:-translate-y-1 hover:scale-105">
            Iniciar Sesión
          </button>
        </Link>
      </div>
    </div>
  );
}
