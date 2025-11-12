'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Producto } from '@/types';
import { ArrowLeft, Box, CheckSquare, Square, Save, MoveRight, Search } from 'lucide-react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import FiltroAvanzado from '@/app/productos/components/FiltroAvanzado'; // Added import for FiltroAvanzado

const ITEMS_POR_PAGINA = 10; // Define items per page

const MovimientoProductosPage = () => {
  const router = useRouter();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [newShelf, setNewShelf] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [paginaActual, setPaginaActual] = useState(1); // New state for current page
  const [filtros, setFiltros] = useState<Record<string, string>>({}); // New state for filters

  const UNIDADES_MEDIDA = useMemo(() => [
    'KILOGRAMOS', 'LIBRAS', 'TONELADAS LARGAS', 'TONELADAS MÉTRICAS',
    'TONELADAS CORTAS', 'GRAMOS', 'UNIDADES', 'LITROS', 'GALONES',
    'BARRILES', 'LATAS', 'CAJAS', 'MILLARES', 'METROS CÚBICOS', 'METROS'
  ], []);

  const CLASIFICACIONES = useMemo(() => [
    'MATERIALES DE EMBALAJE Y ENVOLTURA', 'CINTAS ESPECIALIZADAS',
    'PRECINTOS/ CINTILLOS', 'PINTURAS Y RECUBRIMIENTOS',
    'SUMINISTROS DIVERSOS', 'OTROS (ESPECIFICAR)'
  ], []);

  const shelves = Array.from({ length: 30 }, (_, i) => `E${(i + 1).toString().padStart(2, '0')}`);

  const fetchAllProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get<Producto[]>('/productos');
      if (response.success && response.data) {
        setProductos(response.data);
      } else {
        setMessage({ type: 'error', text: response.error || 'Error al cargar los productos.' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error de conexión al servidor.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const [productosFiltrados, setProductosFiltrados] = useState<Producto[]>([]);

  useEffect(() => {
    let resultado = [...productos];

    if (filtros.codigo) {
      resultado = resultado.filter(p =>
        p.codigo.toLowerCase().includes(filtros.codigo.toLowerCase())
      );
    }

    if (filtros.nombre) {
      resultado = resultado.filter(p =>
        p.nombre.toLowerCase().includes(filtros.nombre.toLowerCase())
      );
    }

    if (filtros.clasificacion) {
      resultado = resultado.filter(p =>
        p.clasificacion === filtros.clasificacion
      );
    }

    if (filtros.unidadMedida) {
      resultado = resultado.filter(p =>
        p.unidad_medida === filtros.unidadMedida
      );
    }

    if (filtros.cantidadMin) {
      const min = parseFloat(filtros.cantidadMin);
      resultado = resultado.filter(p => p.cantidad >= min);
    }

    if (filtros.cantidadMax) {
      const max = parseFloat(filtros.cantidadMax.toLowerCase());
      resultado = resultado.filter(p => p.cantidad <= max);
    }

    setProductosFiltrados(resultado);
    setPaginaActual(1); // Reset to first page when filters change
  }, [filtros, productos]);

  // Pagination logic
  const totalPaginas = Math.ceil(productosFiltrados.length / ITEMS_POR_PAGINA);
  const indiceInicial = (paginaActual - 1) * ITEMS_POR_PAGINA;
  const itemsPaginaActual = productosFiltrados.slice(
    indiceInicial,
    indiceInicial + ITEMS_POR_PAGINA
  );

  const cambiarPagina = (nuevaPagina: number) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleProductSelect = (productId: number) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === itemsPaginaActual.length) { // Check against current page items
      setSelectedProducts([]);
    } else {
      setSelectedProducts(itemsPaginaActual.map(p => p.id)); // Select all on current page
    }
  };

  const handleMassiveShelfUpdate = async () => {
    if (selectedProducts.length === 0 || !newShelf) {
      setMessage({ type: 'error', text: 'Por favor, seleccione productos y un nuevo estante.' });
      return;
    }

    setMessage(null);
    try {
      for (const productId of selectedProducts) {
        await api.put(`/productos/${productId}`, { ubicacionEstante: newShelf });
      }
      setMessage({ type: 'success', text: `Estante actualizado para ${selectedProducts.length} productos.` });
      setSelectedProducts([]);
      setNewShelf('');
      fetchAllProducts(); // Refresh the list
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error al actualizar estantes masivamente.' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-zinc-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 dark:bg-zinc-900">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 md:p-8 dark:bg-zinc-800">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/ubicacionEstante')}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors dark:text-blue-400 dark:hover:text-blue-500"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            <span className="text-lg font-medium">Volver a Gestión de Estantes</span>
          </button>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b pb-4 dark:border-zinc-700">Movimiento de Productos entre Estantes</h1>

        {message && (
          <div className={`p-3 mb-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100'}`}>
            {message.text}
          </div>
        )}

        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-zinc-700 dark:border-zinc-600">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
            <MoveRight className="mr-2 h-5 w-5 text-indigo-500 dark:text-indigo-400" />
            Asignar o Cambiar Estante Masivamente
          </h2>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <select
              value={newShelf}
              onChange={(e) => setNewShelf(e.target.value)}
              className="grow p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-600 dark:text-gray-100"
            >
              <option value="">Seleccionar nuevo estante</option>
              {shelves.map(shelf => (
                <option key={shelf} value={shelf}>{shelf}</option>
              ))}
            </select>
            <button
              onClick={handleMassiveShelfUpdate}
              className="px-5 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition-colors duration-200 flex items-center"
              disabled={selectedProducts.length === 0 || !newShelf}
            >
              <Save className="mr-2 h-5 w-5" />
              Guardar Cambios
            </button>
          </div>
        </div>

        {/* Filtro Avanzado Section */}
        <FiltroAvanzado
          onFiltrar={setFiltros}
          unidadesMedida={UNIDADES_MEDIDA}
          clasificaciones={CLASIFICACIONES}
        />

        <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-zinc-800 dark:border-zinc-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700">
            <thead className="bg-gray-50 dark:bg-zinc-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  <button onClick={handleSelectAll} className="focus:outline-none">
                    {selectedProducts.length === itemsPaginaActual.length && itemsPaginaActual.length > 0 ? // Check against current page items
                      <CheckSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" /> : 
                      <Square className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    }
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Código</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Estante Actual</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Cantidad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Unidad</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-zinc-800 dark:divide-zinc-700">
              {itemsPaginaActual.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-zinc-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button onClick={() => handleProductSelect(product.id)} className="focus:outline-none">
                      {selectedProducts.includes(product.id) ? 
                        <CheckSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" /> : 
                        <Square className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      }
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{product.codigo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{product.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{product.ubicacion_estante || 'No asignado'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{product.cantidad}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{product.unidad_medida}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPaginas > 1 && (
          <div className="flex justify-center items-center mt-6">
            <button
              onClick={() => cambiarPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:bg-zinc-700 dark:text-gray-200 dark:hover:bg-zinc-600"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <span className="mx-2 text-gray-700 dark:text-gray-200">
              Página {paginaActual} de {totalPaginas}
            </span>
            <button
              onClick={() => cambiarPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:bg-zinc-700 dark:text-gray-200 dark:hover:bg-zinc-600"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovimientoProductosPage;
