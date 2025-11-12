'use client';

import React, { useState, useEffect, useCallback } from 'react'; // Removed useMemo
import { api } from '@/lib/api';
import { Producto } from '@/types';
// import FiltroAvanzado from './components/FiltroAvanzado'; // Removed FiltroAvanzado import
import GraficosProductos from './components/GraficosProductos';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface ProductoListProps {
  onEdit: (product: Producto) => void;
  productos: Producto[]; // Products are now passed as a prop
  onDeleteSuccess: () => void; // Callback to refresh list after delete
  showGraphics?: boolean; // New prop to control graphics visibility
  // totalFilteredProducts: number; // Removed as pagination is handled by parent
}

// const ITEMS_POR_PAGINA = 10; // Removed as pagination is handled by parent

const ProductoList: React.FC<ProductoListProps> = ({ onEdit, productos, onDeleteSuccess, showGraphics = true /* Removed totalFilteredProducts from destructuring */ }) => {
  // const [productosFiltrados, setProductosFiltrados] = useState<Producto[]>([]); // Removed internal filtering state
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  // const [paginaActual, setPaginaActual] = useState(1); // Removed internal pagination state
  // const [filtros, setFiltros] = useState<Record<string, string>>({}); // Removed internal filter state
  const [cargando, setCargando] = useState(false); // No longer loading internally

  // Removed UNIDADES_MEDIDA and CLASIFICACIONES as they are used in parent
  // const UNIDADES_MEDIDA = useMemo(() => [
  //   'KILOGRAMOS', 'LIBRAS', 'TONELADAS LARGAS', 'TONELADAS MÉTRICAS', 
  //   'TONELADAS CORTAS', 'GRAMOS', 'UNIDADES', 'LITROS', 'GALONES', 
  //   'BARRILES', 'LATAS', 'CAJAS', 'MILLARES', 'METROS CÚBICOS', 'METROS'
  // ], []);

  // const CLASIFICACIONES = useMemo(() => [
  //   'MATERIALES DE EMBALAJE Y ENVOLTURA', 'CINTAS ESPECIALIZADAS',
  //   'PRECINTOS/ CINTILLOS', 'PINTURAS Y RECUBRIMIENTOS',
  //   'SUMINISTROS DIVERSOS', 'OTROS (ESPECIFICAR)'
  // ], []);

  const router = useRouter();

  // Removed fetchProducts and filtering/pagination useEffect as it's now handled by ProductosPage
  // useEffect(() => {
  //   let resultado = [...productos]; 
  //   
  //   if (filtros.codigo) {
  //     resultado = resultado.filter(p => 
  //       p.codigo.toLowerCase().includes(filtros.codigo.toLowerCase())
  //     );
  //   }
  //   
  //   if (filtros.nombre) {
  //     resultado = resultado.filter(p => 
  //       p.nombre.toLowerCase().includes(filtros.nombre.toLowerCase())
  //     );
  //   }
  //   
  //   if (filtros.clasificacion) {
  //     resultado = resultado.filter(p => 
  //       p.clasificacion === filtros.clasificacion
  //     );
  //   }
  //   
  //   if (filtros.unidadMedida) {
  //     resultado = resultado.filter(p => 
  //       p.unidad_medida === filtros.unidadMedida
  //     );
  //   }
  //   
  //   if (filtros.cantidadMin) {
  //     const min = parseFloat(filtros.cantidadMin);
  //     resultado = resultado.filter(p => p.cantidad >= min);
  //   }
  //   
  //   if (filtros.cantidadMax) {
  //     const max = parseFloat(filtros.cantidadMax);
  //     resultado = resultado.filter(p => p.cantidad <= max);
  //   }
  //   
  //   setProductosFiltrados(resultado);
  //   setPaginaActual(1); 
  // }, [filtros, productos]); 

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        const response = await api.delete<{ mensaje: string }>(`/productos/${id}`);
        if (response.success) {
          setMessage({ type: 'success', text: response.data?.mensaje || 'Producto eliminado correctamente.' });
          onDeleteSuccess(); // Call callback to refresh parent list
        } else {
          setMessage({ type: 'error', text: response.error || 'Error al eliminar el producto.' });
        }
      } catch (error: any) {
        setMessage({ type: 'error', text: error.message || 'Error de conexión al servidor.' });
      }
    }
  };

  // Lógica de paginación
  // const totalPaginas = Math.ceil(productosFiltrados.length / ITEMS_POR_PAGINA);
  // const indiceInicial = (paginaActual - 1) * ITEMS_POR_PAGINA;
  // const itemsPaginaActual = productosFiltrados.slice(
  //   indiceInicial,
  //   indiceInicial + ITEMS_POR_PAGINA
  // );

  // const cambiarPagina = (nuevaPagina: number) => {
  //   if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
  //     setPaginaActual(nuevaPagina);
  //     window.scrollTo({ top: 0, behavior: 'smooth' });
  //   }
  // };

  // No need for internal loading state anymore, parent handles it
  // if (cargando) {
  //   return (
  //     <div className="flex justify-center items-center h-64">
  //       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-6">
      {/* Gráficos */}
      {showGraphics && productos.length > 0 && <GraficosProductos productos={productos} />}

      <div className="bg-white shadow-lg rounded-lg p-6 dark:bg-zinc-800 dark:text-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Lista de Productos</h2>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Mostrando {productos.length} productos
          </div>
        </div>

        {message && (
          <div className={`p-3 mb-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100'}`}>
            {message.text}
          </div>
        )}

        {/* Removed FiltroAvanzado */}
        {/* <FiltroAvanzado 
          onFiltrar={setFiltros} 
          clasificaciones={CLASIFICACIONES} 
          unidadesMedida={UNIDADES_MEDIDA} 
        /> */}

        {productos.length === 0 ? (
          <div className="text-center py-8 dark:bg-zinc-800 dark:text-gray-300">
            <p className="text-gray-500 dark:text-gray-300">No se encontraron productos.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-zinc-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700">
              <thead className="bg-gray-50 dark:bg-zinc-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Código</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Cantidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Unidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Clasificación</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Estante</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-zinc-800 dark:divide-zinc-700">
                {productos.map((product) => (
                  <tr 
                    key={product.id} 
                    className="hover:bg-gray-50 cursor-pointer dark:hover:bg-zinc-700"
                    onClick={() => router.push(`/productos/${product.id}`)} // Navigate to detail page
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded dark:bg-zinc-700 dark:text-gray-300">{product.codigo}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{product.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium dark:text-gray-100">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.cantidad < 10 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                      }`}>
                        {product.cantidad}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {product.unidad_medida} {/* Use product.unidad_medida */}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                        {product.clasificacion}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {product.ubicacion_estante || 'N/A'} {/* Use product.ubicacion_estante */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => { e.stopPropagation(); onEdit(product); }}
                        className="text-blue-600 hover:text-blue-900 mr-3 dark:text-blue-400 dark:hover:text-blue-500"
                        title="Editar"
                      >
                        Editar
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(product.id); }}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-500"
                        title="Eliminar"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductoList;
