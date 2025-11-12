'use client';

import React, { useState, useEffect, useMemo } from 'react';
import ProductoList from './ProductoList';
import ProductoForm from './components/ProductoForm';
import ProductoDashboard from './components/ProductoDashboard';
import { Producto } from '@/types';
import { Plus } from 'lucide-react';
import { api } from '@/lib/api';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import FiltroAvanzado from './components/FiltroAvanzado'; // Added import for FiltroAvanzado

const ITEMS_POR_PAGINA = 10; // Define items per page

const ProductosPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [refreshList, setRefreshList] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productosFiltrados, setProductosFiltrados] = useState<Producto[]>([]); // New state for filtered products
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

  const fetchProducts = async () => {
    setLoadingProducts(true);
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
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [refreshList]);

  // New useEffect for filtering and pagination
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
      const max = parseFloat(filtros.cantidadMax);
      resultado = resultado.filter(p => p.cantidad <= max);
    }

    setProductosFiltrados(resultado);
    setPaginaActual(1); // Reset to first page when filters change
  }, [filtros, productos]);

  const handleEdit = (product: Producto) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleSaveSuccess = () => {
    fetchProducts(); // Refresh products after save
    setMessage({ type: 'success', text: 'Operación completada con éxito' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

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

  return (
    <div className="min-h-screen bg-gray-100 p-4 relative dark:bg-zinc-900">
      {/* Botón flotante para agregar producto */}
      <button
        onClick={() => {
          setEditingProduct(null);
          setShowForm(true);
        }}
        className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 z-40 dark:bg-blue-700 dark:hover:bg-blue-600"
        aria-label="Agregar producto"
      >
        <Plus className="h-6 w-6" />
      </button>

      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8 dark:bg-zinc-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">Gestión de Productos</h1>
              <p className="text-gray-600 mt-1 dark:text-gray-300">Administra el inventario de productos</p>
            </div>
            <button
              onClick={() => {
                setEditingProduct(null);
                setShowForm(true);
              }}
              className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600"
            >
              <Plus className="-ml-1 mr-2 h-4 w-4" />
              Agregar Producto
            </button>
          </div>

          {message && (
            <div className={`p-3 mb-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100'}`}>
              {message.text}
            </div>
          )}

          {loadingProducts ? (
            <div className="flex justify-center items-center h-64 dark:bg-zinc-800">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
            </div>
          ) : (
            <ProductoDashboard productos={productos} />
          )}

          {/* Advanced Filter and Product List Section */}
          <div className="mt-8 bg-white shadow-lg rounded-lg p-6 dark:bg-zinc-800">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Lista de Productos Completa</h2>
            <FiltroAvanzado 
              onFiltrar={setFiltros} 
              clasificaciones={CLASIFICACIONES} 
              unidadesMedida={UNIDADES_MEDIDA} 
            />

            <div className="mt-6">
              {productosFiltrados.length === 0 ? (
                <div className="text-center py-8 dark:bg-zinc-800 dark:text-gray-300">
                  <p className="text-gray-500 dark:text-gray-300">No se encontraron productos que coincidan con los filtros.</p>
                  <button 
                    onClick={() => setFiltros({})}
                    className="mt-2 text-blue-600 hover:text-blue-800 font-medium dark:text-blue-400 dark:hover:text-blue-500"
                  >
                    Limpiar filtros
                  </button>
                </div>
              ) : (
                <ProductoList 
                  onEdit={handleEdit} 
                  productos={itemsPaginaActual} // Pass paginated and filtered products
                  onDeleteSuccess={fetchProducts} 
                  showGraphics={false} // Ensure graphics are not shown here
                />
              )}
            </div>

            {/* Pagination Controls */}
            {totalPaginas > 1 && productosFiltrados.length > 0 && (
              <div className="flex items-center justify-between mt-4 px-4 py-3 bg-white border-t border-gray-200 sm:px-6 dark:bg-zinc-800 dark:border-zinc-700">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => cambiarPagina(paginaActual - 1)}
                    disabled={paginaActual === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-zinc-700 dark:border-zinc-600 dark:text-gray-300 dark:hover:bg-zinc-600"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => cambiarPagina(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-zinc-700 dark:border-zinc-600 dark:text-gray-300 dark:hover:bg-zinc-600"
                  >
                    Siguiente
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Mostrando <span className="font-medium">{indiceInicial + 1}</span> a{' '}
                      <span className="font-medium">
                        {Math.min(indiceInicial + ITEMS_POR_PAGINA, productosFiltrados.length)}
                      </span>{' '}
                      de <span className="font-medium">{productosFiltrados.length}</span> resultados
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => cambiarPagina(paginaActual - 1)}
                        disabled={paginaActual === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                          paginaActual === 1 ? 'text-gray-300 cursor-not-allowed dark:text-gray-500' : 'text-gray-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-zinc-600'
                        }`}
                      >
                        <span className="sr-only">Anterior</span>
                        <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                      
                      {/* Números de página */}
                      {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                        let paginaAMostrar;
                        if (totalPaginas <= 5) {
                          paginaAMostrar = i + 1;
                        } else if (paginaActual <= 3) {
                          paginaAMostrar = i + 1;
                        } else if (paginaActual >= totalPaginas - 2) {
                          paginaAMostrar = totalPaginas - 4 + i;
                        } else {
                          paginaAMostrar = paginaActual - 2 + i;
                        }
                        
                        return (
                          <button
                            key={paginaAMostrar}
                            onClick={() => cambiarPagina(paginaAMostrar)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              paginaActual === paginaAMostrar
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-zinc-700 dark:border-zinc-600 dark:text-gray-300 dark:hover:bg-zinc-600'
                            }`}
                          >
                            {paginaAMostrar}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => cambiarPagina(paginaActual + 1)}
                        disabled={paginaActual === totalPaginas}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                          paginaActual === totalPaginas ? 'text-gray-300 cursor-not-allowed dark:text-gray-500' : 'text-gray-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-zinc-600'
                        }`}
                      >
                        <span className="sr-only">Siguiente</span>
                        <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Modal de formulario */}
      {showForm && (
        <ProductoForm
          producto={editingProduct}
          onClose={handleCloseForm}
          onSave={handleSaveSuccess}
        />
      )}
    </div>
  );
};

export default ProductosPage;
