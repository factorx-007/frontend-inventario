'use client';

import { useState } from 'react';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

type FiltroAvanzadoProps = {
  onFiltrar: (filtros: any) => void;
  clasificaciones: string[];
  unidadesMedida: string[];
};

const FiltroAvanzado = ({ onFiltrar, clasificaciones, unidadesMedida }: FiltroAvanzadoProps) => {
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtros, setFiltros] = useState({
    codigo: '',
    nombre: '',
    clasificacion: '',
    cantidadMin: '',
    cantidadMax: '',
    unidadMedida: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const limpiarFiltros = () => {
    const filtrosIniciales = {
      codigo: '',
      nombre: '',
      clasificacion: '',
      cantidadMin: '',
      cantidadMax: '',
      unidadMedida: '',
    };
    setFiltros(filtrosIniciales);
    onFiltrar(filtrosIniciales);
  };

  const aplicarFiltros = () => {
    onFiltrar(filtros);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Filtros Avanzados</h3>
        <button
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-md shadow-sm text-sm font-medium hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          {mostrarFiltros ? (
            <>
              <XMarkIcon className="h-4 w-4" />
              Ocultar Filtros
            </>
          ) : (
            <>
              <FunnelIcon className="h-4 w-4" />
              Mostrar Filtros
            </>
          )}
        </button>
      </div>

      {mostrarFiltros && (
        <div className="pt-4 border-t border-gray-200 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Código</label>
              <input
                type="text"
                name="codigo"
                value={filtros.codigo}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
                placeholder="Filtrar por código"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={filtros.nombre}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
                placeholder="Filtrar por nombre"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Clasificación</label>
              <select
                name="clasificacion"
                value={filtros.clasificacion}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
              >
                <option value="">Todas las clasificaciones</option>
                {clasificaciones.map((clasificacion) => (
                  <option key={clasificacion} value={clasificacion}>
                    {clasificacion}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Unidad de Medida</label>
              <select
                name="unidadMedida"
                value={filtros.unidadMedida}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
              >
                <option value="">Todas las unidades</option>
                {unidadesMedida.map((unidad) => (
                  <option key={unidad} value={unidad}>
                    {unidad}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cantidad Mínima</label>
              <input
                type="number"
                name="cantidadMin"
                value={filtros.cantidadMin}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
                placeholder="Mínimo"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cantidad Máxima</label>
              <input
                type="number"
                name="cantidadMax"
                value={filtros.cantidadMax}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
                placeholder="Máximo"
                min="0"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3 border-t pt-4 border-gray-200">
            <button
              onClick={limpiarFiltros}
              className="px-5 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors dark:text-gray-300 dark:bg-zinc-800 dark:hover:bg-zinc-700"
            >
              Limpiar Filtros
            </button>
            <button
              onClick={aplicarFiltros}
              className="px-5 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors dark:text-gray-300 dark:bg-blue-800 dark:hover:bg-blue-700"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FiltroAvanzado;
