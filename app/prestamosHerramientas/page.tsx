'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import { Trabajador, PrestamoHerramienta, ItemPrestamo, Producto } from '@/types';
import FiltroAvanzado from '@/app/productos/components/FiltroAvanzado';

interface NewItemState {
  nombre: string;
  cantidadPrestada: number;
  comentarioDetalle: string;
  productoId?: number; // Add productoId to link with actual product
}

const ITEMS_POR_PAGINA = 5; // Define items per page for product list

const PrestamosHerramientasPage = () => {
  const [trabajadorId, setTrabajadorId] = useState<string>('');
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [items, setItems] = useState<NewItemState[]>([]);
  const [newItem, setNewItem] = useState<NewItemState>({ nombre: '', cantidadPrestada: 0, comentarioDetalle: '' });
  const [openLoans, setOpenLoans] = useState<PrestamoHerramienta[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]); // All products
  const [productosFiltrados, setProductosFiltrados] = useState<Producto[]>([]); // Filtered products
  const [filtros, setFiltros] = useState<Record<string, string>>({}); // Filters for products
  const [paginaActual, setPaginaActual] = useState(1); // For product pagination
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null); // For adding a new item
  const [loadingProducts, setLoadingProducts] = useState(true); // Add loading state for products

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

  const fetchTrabajadores = async () => {
    try {
      const response = await api.get<Trabajador[]>('/trabajadores', { activo: true });
      if (response.success && response.data) {
        setTrabajadores(response.data);
      } else {
        setMessage({ type: 'error', text: response.error || 'Error al cargar trabajadores.' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error de conexión al servidor.' });
    }
  };

  const calcularDiasRetraso = (fechaEntrega: string | Date | undefined): number => {
    if (!fechaEntrega) return 0;
    const fechaEntregaDate = new Date(fechaEntrega);
    const hoy = new Date();
    // Diferencia en milisegundos
    const diffTime = hoy.getTime() - fechaEntregaDate.getTime();
    // Convertir a días
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const fetchOpenLoans = async () => {
    try {
      // Buscar préstamos que no estén completados ni cancelados
      const response = await api.get<PrestamoHerramienta[]>('/prestamos', { 
        params: {
          estado: ['pendiente', 'en_progreso', 'atrasado'],
          incluirItems: true // Asegurarse de incluir los ítems
        }
      });
      
      if (response.success && response.data) {
        // Procesar los préstamos para agregar información de mora y procesar ítems
        const prestamosProcesados: PrestamoHerramienta[] = response.data.map(prestamo => {
          const fechaEntrega = prestamo.fecha_entrega || prestamo.fechaEntrega;
          const diasRetraso = calcularDiasRetraso(fechaEntrega);
          const estaEnMora = diasRetraso > 2; // Más de 2 días de retraso
          
          // Procesar ítems para asegurar que tengan los campos necesarios
          const itemsProcesados = (prestamo.items || []).map(item => ({
            ...item,
            cantidadDevueltaAnterior: item.cantidadDevuelta || 0,
            cantidadDevuelta: 0 // Reiniciar para nueva devolución
          }));
          
          // Verificar si todos los ítems han sido devueltos completamente
          const todosLosItemsDevueltos = itemsProcesados.every(
            item => item.cantidadDevueltaAnterior >= item.cantidadPrestada
          );
          
          // Si todos los ítems están devueltos pero el estado no está como completado
          const estadoActual = todosLosItemsDevueltos && prestamo.estado !== 'completado'
            ? 'completado'
            : prestamo.estado;
          
          // Crear un nuevo objeto con las propiedades correctas
          const prestamoActualizado: PrestamoHerramienta = {
            ...prestamo,
            items: itemsProcesados,
            estado: (() => {
              if (todosLosItemsDevueltos) return 'completado';
              if (estaEnMora) return 'atrasado';
              return estadoActual as 'pendiente' | 'en_progreso' | 'completado' | 'atrasado';
            })(),
            // Agregar propiedades calculadas
            diasDeRetraso: diasRetraso,
            estaEnMora: !todosLosItemsDevueltos && estaEnMora
          };
          
          return prestamoActualizado;
        });
        
        setOpenLoans(prestamosProcesados);
      } else {
        setMessage({ type: 'error', text: response.error || 'Error al cargar préstamos activos.' });
      }
    } catch (error: any) {
      console.error('Error al cargar préstamos:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || error.message || 'Error de conexión al servidor.' 
      });
    }
  };

  const fetchAllProducts = async () => {
    setLoadingProducts(true); // Set loading to true when fetching products
    try {
      const response = await api.get<Producto[]>('/productos');
      if (response.success && response.data) {
        setProductos(response.data);
        // No need to set productosFiltrados here, useEffect will handle it based on filtros
      } else {
        setMessage({ type: 'error', text: response.error || 'Error al cargar los productos.' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error de conexión al servidor.' });
    } finally {
      setLoadingProducts(false); // Set loading to false after fetch completes
    }
  };

  useEffect(() => {
    fetchTrabajadores();
    fetchOpenLoans();
    // fetchAllProducts(); // Products will be fetched by the filtering useEffect
  }, []);

  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setLoadingProducts(true); // Set loading to true when filtering
      try {
        const queryParams: Record<string, string> = {};
        if (filtros.codigo) queryParams.busqueda = filtros.codigo;
        else if (filtros.nombre) queryParams.busqueda = filtros.nombre;
        if (filtros.clasificacion) queryParams.clasificacion = filtros.clasificacion;

        const response = await api.get<Producto[]>('/productos', queryParams);
        if (response.success && response.data) {
          let resultado = response.data;

          // Apply client-side filters not supported by backend
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
          setProductos(response.data); // Update all products with the backend response
          setProductosFiltrados(resultado);
        } else {
          setMessage({ type: 'error', text: response.error || 'Error al cargar productos filtrados.' });
        }
      } catch (error: any) {
        setMessage({ type: 'error', text: error.message || 'Error de conexión al servidor.' });
      } finally {
        setLoadingProducts(false); // Set loading to false after filter completes
      }
    };

    fetchFilteredProducts();
    setPaginaActual(1); // Reset to first page when filters change
  }, [filtros]); // Depend on filtros only, as products are fetched within

  // Pagination logic for products
  const totalPaginasProductos = Math.ceil(productosFiltrados.length / ITEMS_POR_PAGINA);
  const indiceInicialProductos = (paginaActual - 1) * ITEMS_POR_PAGINA;
  const itemsPaginaActualProductos = productosFiltrados.slice(
    indiceInicialProductos,
    indiceInicialProductos + ITEMS_POR_PAGINA
  );

  const cambiarPaginaProductos = (nuevaPagina: number) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginasProductos) {
      setPaginaActual(nuevaPagina);
    }
  };

  const handleAddItem = () => {
    if (!selectedProduct) {
      setMessage({ type: 'error', text: 'Por favor, seleccione un producto antes de agregarlo.' });
      return;
    }
    if (newItem.cantidadPrestada <= 0) {
      setMessage({ type: 'error', text: 'La cantidad a prestar debe ser mayor que cero.' });
      return;
    }
    if (newItem.cantidadPrestada > (selectedProduct.cantidad || 0)) {
      setMessage({ type: 'error', text: 'La cantidad a prestar no puede ser mayor a la cantidad disponible en stock.' });
      return;
    }

    // Check if the product is already in the list to update its quantity
    const existingItemIndex = items.findIndex(item => item.productoId === selectedProduct.id);

    if (existingItemIndex > -1) {
      const updatedItems = [...items];
      const existingItem = updatedItems[existingItemIndex];
      const newTotalQuantity = existingItem.cantidadPrestada + newItem.cantidadPrestada;

      if (newTotalQuantity > (selectedProduct.cantidad || 0)) {
        setMessage({ type: 'error', text: 'La cantidad total prestada para este producto no puede exceder la cantidad disponible.' });
        return;
      }

      updatedItems[existingItemIndex] = {
        ...existingItem,
        cantidadPrestada: newTotalQuantity,
        comentarioDetalle: newItem.comentarioDetalle || existingItem.comentarioDetalle || '',
      };
      setItems(updatedItems);
    } else {
      setItems([
        ...items,
        {
          nombre: selectedProduct.nombre,
          cantidadPrestada: newItem.cantidadPrestada,
          comentarioDetalle: newItem.comentarioDetalle || `Préstamo de ${selectedProduct.nombre}`,
          productoId: selectedProduct.id,
        },
      ]);
    }

    setNewItem({ nombre: '', cantidadPrestada: 0, comentarioDetalle: '' });
    setSelectedProduct(null); // Clear selected product after adding
    setMessage(null);
  };

  const handleLendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!trabajadorId) {
      setMessage({ type: 'error', text: 'Debe seleccionar un trabajador.' });
      return;
    }
    if (items.length === 0) {
      setMessage({ type: 'error', text: 'Debe agregar al menos un ítem al préstamo.' });
      return;
    }

    // Validar que no se excedan las cantidades disponibles
    const itemsConError = items.filter(item => {
      const producto = productos.find(p => p.id === item.productoId);
      return producto && item.cantidadPrestada > (producto.cantidad || 0);
    });

    if (itemsConError.length > 0) {
      setMessage({ 
        type: 'error', 
        text: `No hay suficiente stock para ${itemsConError[0].nombre}. Cantidad disponible: ${productos.find(p => p.id === itemsConError[0].productoId)?.cantidad || 0}` 
      });
      return;
    }

    try {
      const response = await api.post<PrestamoHerramienta>('/prestamos', {
        trabajadorId: parseInt(trabajadorId),
        items,
        estado: 'pendiente' // Asegurarse de establecer el estado inicial
      });

      if (response.success && response.data) {
        setMessage({ type: 'success', text: 'Préstamo registrado correctamente.' });
        setTrabajadorId('');
        setItems([]);
        fetchOpenLoans(); // Actualizar la lista de préstamos
      } else {
        // Mostrar error específico del backend si está disponible
        setMessage({ 
          type: 'error', 
          text: response.error || 'Error al registrar el préstamo.' 
        });
      }
    } catch (error: any) {
      // Catch network errors specifically
      if (error.message.includes('Failed to fetch') || error.message.includes('Connection refused')) {
        setMessage({ type: 'error', text: 'Error de conexión con el servidor. Por favor, asegúrese de que el backend esté funcionando.' });
      } else {
        setMessage({ type: 'error', text: error.message || 'Error inesperado al registrar el préstamo.' });
      }
    }
  };

  const handleReturnChange = (loanId: number, itemId: number, value: number) => {
    setOpenLoans((prevLoans) =>
      prevLoans.map((loan) =>
        loan.id === loanId
          ? {
              ...loan,
              items: loan.items.map((item) =>
                item.id === itemId ? { ...item, cantidadDevuelta: value } : item
              ),
            }
          : loan
      )
    );
  };

  const handleReturnSubmit = async (loan: PrestamoHerramienta) => {
    setMessage(null);
    
    // Validar que haya al menos un ítem con cantidad devuelta
    const hasItemsToReturn = loan.items.some(item => (item.cantidadDevuelta || 0) > 0);
    if (!hasItemsToReturn) {
      setMessage({ type: 'error', text: 'Debe especificar al menos una cantidad a devolver.' });
      return;
    }
    
    // Validar cantidades devueltas
    const itemsConError = loan.items.filter(item => {
      const cantidadDevuelta = item.cantidadDevuelta || 0;
      return cantidadDevuelta < 0 || 
             cantidadDevuelta > item.cantidadPrestada ||
             (item.cantidadDevuelta || 0) > (item.cantidadPrestada - (item.cantidadDevueltaAnterior || 0));
    });
    
    if (itemsConError.length > 0) {
      setMessage({ 
        type: 'error', 
        text: `Cantidad inválida para ${itemsConError[0].nombre}. Verifique que la cantidad sea válida.` 
      });
      return;
    }
    
    // Preparar los ítems para actualizar
    const itemsToUpdate = loan.items
      .filter(item => (item.cantidadDevuelta || 0) > 0) // Solo incluir ítems con devolución
      .map((item) => ({
        id: item.id,
        cantidadDevuelta: (item.cantidadDevueltaAnterior || 0) + (item.cantidadDevuelta || 0),
        cantidadDevueltaAnterior: item.cantidadDevueltaAnterior || 0, // Guardar el valor anterior para referencia
        cantidadPrestada: item.cantidadPrestada // Incluir para validación en el backend
      }));

    // Verificar si todos los ítems han sido devueltos completamente
    const allItemsReturned = loan.items.every(
      item => (item.cantidadDevueltaAnterior || 0) + (item.cantidadDevuelta || 0) >= item.cantidadPrestada
    );

    try {
      // Mostrar confirmación antes de proceder
      const confirmMessage = allItemsReturned 
        ? '¿Está seguro de marcar este préstamo como completado? Esta acción no se puede deshacer.'
        : `¿Desea registrar la devolución de ${itemsToUpdate.length} ítem(s)?`;
      
      if (!window.confirm(confirmMessage)) {
        return; // El usuario canceló la operación
      }

      setMessage({ type: 'info', text: 'Procesando devolución...' });
      
      const response = await api.put<PrestamoHerramienta>(
        `/prestamos/${loan.id}/devolucion`,
        { 
          items: itemsToUpdate, 
          cerrarPrestamo: allItemsReturned,
          estado: allItemsReturned ? 'completado' : 'en_progreso'
        }
      );

      if (response.success) {
        setMessage({ 
          type: 'success', 
          text: allItemsReturned 
            ? '¡Préstamo completado exitosamente!' 
            : 'Devolución registrada correctamente.' 
        });
        fetchOpenLoans(); // Actualizar la lista de préstamos
      } else {
        // Manejar errores específicos del backend
        if (response.error?.includes('No hay suficiente stock')) {
          setMessage({ 
            type: 'error', 
            text: 'Error: No hay suficiente stock para completar la devolución. ' +
                  'Verifique las cantidades e intente nuevamente.'
          });
        } else {
          setMessage({ 
            type: 'error', 
            text: response.error || 'Error al procesar la devolución. Intente nuevamente.'
          });
        }
      }
    } catch (error: any) {
      console.error('Error en handleReturnSubmit:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 
              error.message || 
              'Error de conexión al servidor. Intente nuevamente.'
      });
    }
  };

  if (loadingProducts) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Función para obtener el color según el estado
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'en_progreso':
        return 'bg-blue-100 text-blue-800';
      case 'completado':
        return 'bg-green-100 text-green-800';
      case 'atrasado':
        return 'bg-red-100 text-red-800 border border-red-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoText = (estado: string) => {
    const estados: Record<string, string> = {
      'pendiente': 'Pendiente',
      'en_progreso': 'En Progreso',
      'completado': 'Completado',
      'atrasado': 'Atrasado'
    };
    return estados[estado] || estado;
  };

  // Función para formatear fechas
  const formatDate = (dateString: string | Date) => {
    if (!dateString) return 'No especificada';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return 'Fecha inválida';
    
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="bg-white shadow-lg rounded-lg p-4 md:p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Gestión de Préstamos</h1>
            <p className="text-sm text-gray-500">Registra y gestiona los préstamos de herramientas</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <button 
              onClick={fetchOpenLoans}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 w-full md:w-auto justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Actualizar Lista
            </button>
          </div>
        </div>

        {message && (
          <div className={`p-3 mb-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <div className="mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Registrar Nuevo Préstamo</h2>
          </div>
          <form onSubmit={handleLendSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="trabajadorId">
                Trabajador
              </label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                id="trabajadorId"
                value={trabajadorId}
                onChange={(e) => setTrabajadorId(e.target.value)}
                required
              >
                <option value="">Seleccione un trabajador</option>
                {trabajadores.map((trabajador) => (
                  <option key={trabajador.id} value={trabajador.id}>
                    {trabajador.nombre} ({trabajador.codigo})
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4 border border-gray-200 p-4 rounded-md bg-gray-50">
              <h3 className="text-lg font-medium text-gray-700 mb-3">Items a Prestar</h3>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-md font-semibold text-gray-700">Productos Disponibles para Préstamo</h4>
                  <div className="text-sm text-gray-500">
                    Mostrando {Math.min(itemsPaginaActualProductos.length, ITEMS_POR_PAGINA)} de {productosFiltrados.length} productos
                  </div>
                </div>
                <div className="mb-4">
                  <FiltroAvanzado
                    onFiltrar={setFiltros}
                    unidadesMedida={UNIDADES_MEDIDA}
                    clasificaciones={CLASIFICACIONES}
                  />
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seleccionar</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidad</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {itemsPaginaActualProductos.map((product) => (
                        <tr key={product.id} className={selectedProduct?.id === product.id ? 'bg-blue-50' : ''}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <input
                              type="radio"
                              name="selectedProduct"
                              checked={selectedProduct?.id === product.id}
                              onChange={() => setSelectedProduct(product)}
                              className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.codigo}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.nombre}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.cantidad}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.unidad_medida}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPaginasProductos > 1 && (
                  <div className="flex justify-center items-center mt-4">
                    <button
                      onClick={() => cambiarPaginaProductos(paginaActual - 1)}
                      disabled={paginaActual === 1}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                      Anterior
                    </button>
                    <span className="mx-2 text-gray-700">
                      Página {paginaActual} de {totalPaginasProductos}
                    </span>
                    <button
                      onClick={() => cambiarPaginaProductos(paginaActual + 1)}
                      disabled={paginaActual === totalPaginasProductos}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </div>

              {items.length === 0 ? (
                <p className="text-gray-600 mb-3">No hay ítems agregados al préstamo.</p>
              ) : (
                <div className="mb-3">
                  {items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center mb-2 bg-gray-100 p-2 rounded-md border border-gray-200">
                      <span className="text-gray-700">{item.nombre} ({item.cantidadPrestada}) - {item.comentarioDetalle}</span>
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700 text-sm"
                        onClick={() => setItems(prevItems => prevItems.filter((_, i) => i !== index))}
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 mt-4">
                {/* <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-indigo-500"
                  type="text"
                  placeholder="Nombre genérico (e.g., Llave Mixta)"
                  value={newItem.nombre}
                  onChange={(e) => setNewItem({ ...newItem, nombre: e.target.value })}
                /> */}
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cantidadPrestada">
                    Cantidad a Prestar
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-indigo-500"
                    type="number"
                    placeholder="Cantidad Prestada"
                    value={newItem.cantidadPrestada === 0 ? '' : newItem.cantidadPrestada}
                    onChange={(e) => setNewItem({ ...newItem, cantidadPrestada: parseInt(e.target.value) || 0 })}
                    min="1"
                    max={selectedProduct?.cantidad || 0} // Limit to available stock
                    disabled={!selectedProduct}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="comentarioDetalle">
                    Característica específica (CRÍTICO)
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-indigo-500"
                    type="text"
                    placeholder="Característica específica (CRÍTICO)"
                    value={newItem.comentarioDetalle}
                    onChange={(e) => setNewItem({ ...newItem, comentarioDetalle: e.target.value })}
                    disabled={!selectedProduct}
                  />
                </div>
              </div>
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-md focus:outline-none focus:shadow-outline transition-colors duration-200"
                type="button"
                onClick={handleAddItem}
                disabled={!selectedProduct || newItem.cantidadPrestada <= 0}
              >
                Agregar Ítem
              </button>
            </div>

            <div className="flex items-center justify-start mt-6">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md focus:outline-none focus:shadow-outline transition-colors duration-200"
                type="submit"
              >
                Registrar Préstamo
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Gestión de Devoluciones (Préstamos Activos)</h2>
          {openLoans.length === 0 ? (
            <p className="text-gray-600">No hay préstamos activos actualmente.</p>
          ) : (
            <div className="space-y-6">
              {openLoans.map((loan) => (
                <div key={loan.id} className="border border-gray-200 rounded-md p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-lg font-medium text-gray-800">
                        Trabajador: {loan.Trabajador?.nombre || loan.trabajador?.nombre || 'Desconocido'} 
                        <span className="text-gray-500 ml-2">({loan.Trabajador?.codigo || loan.trabajador?.codigo || 'N/A'})</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Préstamo ID: {loan.id} • 
                        Fecha: {new Date(loan.fecha_entrega || loan.fechaEntrega || '').toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoColor(loan.estado)}`}>
                        {getEstadoText(loan.estado)}
                      </span>
                      {loan.estaEnMora && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          En mora: {loan.diasDeRetraso} días
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mb-3">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Fecha de Préstamo:</span>{' '}
                      {formatDate(loan.fecha_entrega)}
                    </p>
                    {loan.fecha_devolucion_final && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Fecha de Devolución:</span>{' '}
                        {formatDate(loan.fecha_devolucion_final)}
                      </p>
                    )}
                  </div>
                  <h3 className="text-md font-semibold text-gray-700 mb-2">Ítems Prestados:</h3>
                  <ul className="space-y-2">
                    {loan.items.map((item) => (
                      <li key={item.id} className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm">
                        <span className="text-gray-700">
                          {item.nombre} ({item.comentarioDetalle}) - Prestado: {item.cantidadPrestada}
                        </span>
                        <div className="flex items-center space-x-2">
                          <label htmlFor={`devuelto-${item.id}`} className="text-sm text-gray-600">Devuelto:</label>
                          <input
                            id={`devuelto-${item.id}`}
                            type="number"
                            min="0"
                            max={item.cantidadPrestada}
                            value={item.cantidadDevuelta}
                            onChange={(e) => handleReturnChange(loan.id, item.id, parseInt(e.target.value) || 0)}
                            className="w-20 p-1 border rounded text-gray-700 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                  <button
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md focus:outline-none focus:shadow-outline transition-colors duration-200"
                    onClick={() => handleReturnSubmit(loan)}
                  >
                    Registrar Devolución
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrestamosHerramientasPage;
