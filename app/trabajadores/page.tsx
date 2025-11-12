'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import { Trabajador } from '@/types';
import { Plus, Search, RefreshCw, Check, X, Filter, Pencil, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import TrabajadorForm from './components/TrabajadorForm';

const ITEMS_POR_PAGINA = 10;

export default function TrabajadoresPage() {
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [trabajadoresFiltrados, setTrabajadoresFiltrados] = useState<Trabajador[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactivos, setShowInactivos] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTrabajador, setEditingTrabajador] = useState<Trabajador | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);

  // Cargar trabajadores
  const fetchTrabajadores = async () => {
    try {
      setLoading(true);
      const response = await api.get<Trabajador[]>('/trabajadores');
      
      if (response.success && response.data) {
        setTrabajadores(response.data);
        aplicarFiltros(response.data, searchTerm, showInactivos);
      } else {
        setMessage({ type: 'error', text: response.error || 'Error al cargar trabajadores' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros a la lista de trabajadores
  const aplicarFiltros = (lista: Trabajador[], terminoBusqueda: string, mostrarInactivos: boolean) => {
    let filtrados = [...lista];
    
    // Filtrar por término de búsqueda
    if (terminoBusqueda) {
      const term = terminoBusqueda.toLowerCase();
      filtrados = filtrados.filter(trabajador => 
        trabajador.nombre.toLowerCase().includes(term) ||
        trabajador.codigo.toLowerCase().includes(term)
      );
    }
    
    // Filtrar por estado activo/inactivo
    if (!mostrarInactivos) {
      filtrados = filtrados.filter(trabajador => trabajador.activo);
    }
    
    setTrabajadoresFiltrados(filtrados);
    setPaginaActual(1); // Reiniciar a la primera página al cambiar filtros
  };
  
  // Manejar cambio en el término de búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    aplicarFiltros(trabajadores, term, showInactivos);
  };
  
  // Manejar cambio en el filtro de inactivos
  const handleInactivosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const mostrar = e.target.checked;
    setShowInactivos(mostrar);
    aplicarFiltros(trabajadores, searchTerm, mostrar);
  };
  
  // Obtener trabajadores para la página actual
  const trabajadoresPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
    return trabajadoresFiltrados.slice(inicio, inicio + ITEMS_POR_PAGINA);
  }, [trabajadoresFiltrados, paginaActual]);
  
  // Calcular el total de páginas
  const totalPaginas = Math.ceil(trabajadoresFiltrados.length / ITEMS_POR_PAGINA);

  useEffect(() => {
    fetchTrabajadores();
  }, []);

  // Manejar edición de trabajador
  const handleEdit = (trabajador: Trabajador) => {
    setEditingTrabajador(trabajador);
    setShowForm(true);
  };

  // Manejar cambio de estado activo/inactivo
  const toggleEstado = async (id: number, estadoActual: boolean) => {
    if (window.confirm(`¿Estás seguro de que deseas ${estadoActual ? 'desactivar' : 'activar'} este trabajador?`)) {
      try {
        // Usamos PUT en lugar de PATCH ya que nuestra API no tiene implementado PATCH
        const response = await api.put(`/trabajadores/${id}`, { activo: !estadoActual });
        if (response.success) {
          setMessage({ 
            type: 'success', 
            text: `Trabajador ${!estadoActual ? 'activado' : 'desactivado'} correctamente` 
          });
          fetchTrabajadores();
        } else {
          setMessage({
            type: 'error',
            text: response.error || `Error al ${estadoActual ? 'desactivar' : 'activar'} el trabajador`
          });
        }
      } catch (error: any) {
        setMessage({ 
          type: 'error', 
          text: error.message || 'Error de conexión al actualizar el trabajador' 
        });
      }
    }
  };

  // Manejar eliminación de trabajador
  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este trabajador?')) {
      try {
        const response = await api.delete(`/trabajadores/${id}`);
        if (response.success) {
          setMessage({ 
            type: 'success', 
            text: 'Trabajador eliminado correctamente' 
          });
          fetchTrabajadores();
        } else {
          setMessage({
            type: 'error',
            text: response.error || 'Error al eliminar el trabajador'
          });
        }
      } catch (error: any) {
        setMessage({ 
          type: 'error', 
          text: error.message || 'Error de conexión al eliminar el trabajador' 
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Gestión de Trabajadores</h1>
            <p className="text-gray-600">Administra los trabajadores del sistema</p>
          </div>
          <button
            onClick={() => {
              setEditingTrabajador(null);
              setShowForm(true);
            }}
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nuevo Trabajador
          </button>
        </div>

        {/* Mensajes */}
        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="search"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 border"
                  placeholder="Buscar por código o nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setShowInactivos(!showInactivos)}
                className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium ${
                  showInactivos 
                    ? 'bg-gray-200 text-gray-800 border-gray-300' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Filter className="h-4 w-4 mr-2 text-gray-500" />
                {showInactivos ? 'Mostrar solo activos' : 'Mostrar inactivos'}
              </button>
            </div>
          </div>
        </div>

        {/* Formulario de creación/edición */}
        {showForm && (
          <TrabajadorForm
            trabajador={editingTrabajador}
            onClose={() => {
              setShowForm(false);
              setEditingTrabajador(null);
            }}
            onSave={() => {
              setShowForm(false);
              setEditingTrabajador(null);
              fetchTrabajadores();
            }}
          />
        )}

        {/* Lista de trabajadores */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <RefreshCw className="animate-spin h-8 w-8 text-blue-500" />
                <span className="ml-2">Cargando trabajadores...</span>
              </div>
            ) : trabajadores.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay trabajadores</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || !showInactivos 
                    ? 'No se encontraron trabajadores con los filtros actuales.' 
                    : 'Comienza creando un nuevo trabajador.'}
                </p>
                {!searchTerm && showInactivos && (
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => setShowForm(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Plus className="-ml-1 mr-2 h-5 w-5" />
                      Nuevo Trabajador
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Código
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Fecha de Registro
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {trabajadoresPaginados.map((trabajador) => (
                    <tr key={trabajador.id} className={!trabajador.activo ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {trabajador.codigo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {trabajador.nombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          trabajador.activo 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {trabajador.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {new Date(trabajador.fechaRegistro).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(trabajador)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded-md"
                            title="Editar"
                          >
                            <Pencil className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(trabajador.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-md"
                            title="Eliminar"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          {/* Paginación */}
          {trabajadoresFiltrados.length > ITEMS_POR_PAGINA && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                  disabled={paginaActual === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                  disabled={paginaActual === totalPaginas}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{(paginaActual - 1) * ITEMS_POR_PAGINA + 1}</span> a{' '}
                    <span className="font-medium">
                      {Math.min(paginaActual * ITEMS_POR_PAGINA, trabajadoresFiltrados.length)}
                    </span>{' '}
                    de <span className="font-medium">{trabajadoresFiltrados.length}</span> resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setPaginaActual(1)}
                      disabled={paginaActual === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Primera</span>
                      <ChevronsLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                      disabled={paginaActual === 1}
                      className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Anterior</span>
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <div className="flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      Página {paginaActual} de {totalPaginas}
                    </div>
                    <button
                      onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                      disabled={paginaActual === totalPaginas}
                      className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Siguiente</span>
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => setPaginaActual(totalPaginas)}
                      disabled={paginaActual === totalPaginas}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Última</span>
                      <ChevronsRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
