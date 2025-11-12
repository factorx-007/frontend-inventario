'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Producto } from '@/types';
import { useRouter } from 'next/navigation';

const UbicacionEstantePage = () => {
  const router = useRouter();
  const [selectedShelf, setSelectedShelf] = useState<string | null>(null);
  const [productsOnShelf, setProductsOnShelf] = useState<Producto[]>([]);
  const [searchProductCode, setSearchProductCode] = useState<string>('');
  const [foundShelf, setFoundShelf] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const shelves = Array.from({ length: 30 }, (_, i) => `E${(i + 1).toString().padStart(2, '0')}`);

  const fetchProductsByShelf = async (shelf: string) => {
    setMessage(null);
    try {
      const response = await api.get<Producto[]>(`/productos/estante/${shelf}`);
      if (response.success && response.data) {
        setProductsOnShelf(response.data);
      } else {
        setProductsOnShelf([]);
        setMessage({ type: 'error', text: response.error || `No se encontraron productos en el estante ${shelf}.` });
      }
    } catch (error: any) {
      setProductsOnShelf([]);
      setMessage({ type: 'error', text: error.message || 'Error de conexión al servidor.' });
    }
  };

  useEffect(() => {
    if (selectedShelf) {
      fetchProductsByShelf(selectedShelf);
    } else {
      setProductsOnShelf([]);
    }
  }, [selectedShelf]);

  const handleSearchProductCode = async () => {
    setMessage(null);
    setFoundShelf(null);
    if (!searchProductCode.trim()) {
      setMessage({ type: 'error', text: 'Por favor, ingrese un código de producto para buscar.' });
      return;
    }
    try {
      const response = await api.get<Producto[]>(`/productos`, { busqueda: searchProductCode });
      if (response.success && response.data && response.data.length > 0) {
        const product = response.data[0]; // Assuming code is unique, take the first result
        setFoundShelf(product.ubicacion_estante || 'No asignado');
      } else {
        setMessage({ type: 'error', text: response.error || `No se encontró el producto con código ${searchProductCode}.` });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error de conexión al servidor.' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 dark:bg-zinc-900">
      <div className="bg-white shadow-lg rounded-lg p-6 mb-8 dark:bg-zinc-800">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 dark:text-gray-100">Gestión de Ubicación por Estante</h1>

        {message && (
          <div className={`p-3 mb-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100'}`}>
            {message.text}
          </div>
        )}

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-100">Selección de Estantes</h2>
            <button
              onClick={() => router.push('/ubicacionEstante/movimiento')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 shadow-md"
            >
              Movimiento de Productos
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {shelves.map((shelf) => (
              <button
                key={shelf}
                className={`p-4 rounded-lg shadow-md text-center text-lg font-medium 
                  ${selectedShelf === shelf ? 'bg-blue-600 text-white dark:bg-blue-700' : 'bg-gray-200 text-gray-800 dark:bg-zinc-700 dark:text-gray-200'}
                  hover:bg-blue-700 hover:text-white transition-colors duration-200`}
                onClick={() => setSelectedShelf(shelf)}
              >
                {shelf}
              </button>
            ))}
          </div>
        </div>

        {selectedShelf && (
          <div className="bg-white shadow-lg rounded-lg p-6 mb-8 dark:bg-zinc-800 dark:border-zinc-700">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4 dark:text-gray-100">Productos en Estante {selectedShelf}</h2>
            {productsOnShelf.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-300">No hay productos en este estante.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 dark:bg-zinc-800 dark:border-zinc-700">
                  <thead>
                    <tr className="bg-gray-100 border-b dark:bg-zinc-700 dark:border-zinc-600">
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-200">Código</th>
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-200">Nombre</th>
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-200">Cantidad</th>
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-200">Unidad</th>
                      <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-200">Clasificación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsOnShelf.map((product) => (
                      <tr key={product.id} className="border-b hover:bg-gray-50 dark:border-zinc-700 dark:hover:bg-zinc-700">
                        <td className="py-2 px-4 text-sm text-gray-700 dark:text-gray-300">{product.codigo}</td>
                        <td className="py-2 px-4 text-sm text-gray-700 dark:text-gray-300">{product.nombre}</td>
                        <td className="py-2 px-4 text-sm text-gray-700 dark:text-gray-300">{product.cantidad}</td>
                        <td className="py-2 px-4 text-sm text-gray-700 dark:text-gray-300">{product.unidad_medida}</td>
                        <td className="py-2 px-4 text-sm text-gray-700 dark:text-gray-300">{product.clasificacion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <div className="bg-white shadow-lg rounded-lg p-6 dark:bg-zinc-800 dark:border-zinc-700">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 dark:text-gray-100">Búsqueda Inversa por Código de Producto</h2>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300" htmlFor="productCodeSearch">
              Código de Producto
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
              id="productCodeSearch"
              type="text"
              placeholder="Ingrese el código del producto"
              value={searchProductCode}
              onChange={(e) => setSearchProductCode(e.target.value)}
            />
          </div>
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-md focus:outline-none focus:shadow-outline transition-colors duration-200 dark:bg-green-700 dark:hover:bg-green-600"
            type="button"
            onClick={handleSearchProductCode}
          >
            Buscar Estante
          </button>
          {foundShelf && (
            <p className="mt-4 text-lg text-gray-800 dark:text-gray-100">
              El producto con código <span className="font-semibold">{searchProductCode}</span> se encuentra en el estante <span className="font-semibold text-blue-600 dark:text-blue-400">{foundShelf}</span>.
            </p>
          )}
          {foundShelf === null && message?.type !== 'error' && searchProductCode !== '' && (
            <p className="mt-4 text-lg text-red-500 dark:text-red-400">No se encontró el estante para el producto con código <span className="font-semibold">{searchProductCode}</span>.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UbicacionEstantePage;
