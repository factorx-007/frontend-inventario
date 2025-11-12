'use client';

import React, { useState } from 'react';
import { Producto } from '@/types';
import { AlertTriangle, Package, ListFilter } from 'lucide-react'; // Import Recharts components
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, CartesianGrid, XAxis, YAxis, Bar } from 'recharts'; // Import Recharts components
import ProductoList from '../ProductoList'; // Import ProductoList
import FiltroAvanzado from './FiltroAvanzado'; // Import FiltroAvanzado
import { useRouter } from 'next/navigation';

interface ProductoDashboardProps {
  productos: Producto[];
}

const COLORS = ['#FF8042', '#FFBB28', '#00C49F', '#0088FE']; // Colors for pie chart

const ProductoDashboard: React.FC<ProductoDashboardProps> = ({ productos }) => {
  const [activeView, setActiveView] = useState<'none' | 'alertas' | 'inventario'>('none'); // Removed 'listaCompleta'
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllAlerts, setShowAllAlerts] = useState(false); // State to show all alerts
  // const [filtrosLista, setFiltrosLista] = useState<Record<string, string>>({}); // Removed state for filters in complete list
  const router = useRouter();

  const productosPorAgotarse = productos.filter(
    (p) => p.cantidad <= (p.cantidadMinima || 5) &&
           (p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.codigo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const displayedAlerts = showAllAlerts ? productosPorAgotarse : productosPorAgotarse.slice(0, 10); // Conditionally slice alerts

  const inventarioGeneral = productos.reduce(
    (acc, p) => acc + p.cantidad,
    0
  );

  // Calcular estadísticas adicionales para alertas
  const criticalStockProducts = productos.filter(p => p.cantidad < (p.cantidadMinima || 5) / 2);
  const lowStockProducts = productosPorAgotarse.length - criticalStockProducts.length;

  const alertDistributionData = [
    { name: 'Crítico', value: criticalStockProducts.length },
    { name: 'Bajo Stock', value: lowStockProducts },
  ].filter(item => item.value > 0);

  // Calcular la distribución por clasificación para el inventario general
  const clasificacionInventario = productos.reduce((acc: any[], producto) => {
    const existing = acc.find(item => item.name === producto.clasificacion);
    if (existing) {
      existing.value += producto.cantidad;
    } else {
      acc.push({ name: producto.clasificacion, value: producto.cantidad });
    }
    return acc;
  }, []).sort((a, b) => b.value - a.value).slice(0, 5);

  // Data for additional inventory chart (e.g., top 5 most abundant products)
  const topAbundantProducts = [...productos]
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5)
    .map(p => ({ name: p.nombre, cantidad: p.cantidad }));

  // Removed Filtered products for the complete list section
  // const productosFiltradosParaLista = productos.filter(p => {
  //   let match = true;
  //   if (filtrosLista.codigo) {
  //     match = match && p.codigo.toLowerCase().includes(filtrosLista.codigo.toLowerCase());
  //   }
  //   if (filtrosLista.nombre) {
  //     match = match && p.nombre.toLowerCase().includes(filtrosLista.nombre.toLowerCase());
  //   }
  //   if (filtrosLista.clasificacion) {
  //     match = match && p.clasificacion === filtrosLista.clasificacion;
  //   }
  //   if (filtrosLista.unidadMedida) {
  //     match = match && p.unidad_medida === filtrosLista.unidadMedida;
  //   }
  //   if (filtrosLista.cantidadMin) {
  //     match = match && p.cantidad >= parseFloat(filtrosLista.cantidadMin);
  //   }
  //   if (filtrosLista.cantidadMax) {
  //     match = match && p.cantidad <= parseFloat(filtrosLista.cantidadMax);
  //   }
  //   return match;
  // });

  // const UNIDADES_MEDIDA = [
  //   'KILOGRAMOS', 'LIBRAS', 'TONELADAS LARGAS', 'TONELADAS MÉTRICAS',
  //   'TONELADAS CORTAS', 'GRAMOS', 'UNIDADES', 'LITROS', 'GALONES',
  //   'BARRILES', 'LATAS', 'CAJAS', 'MILLARES', 'METROS CÚBICOS', 'METROS', 'OTROS'
  // ];

  // const CLASIFICACIONES = [
  //   'MATERIALES DE EMBALAJE Y ENVOLTURA', 'CINTAS ESPECIALIZADAS',
  //   'PRECINTOS/ CINTILLOS', 'PINTURAS Y RECUBRIMIENTOS',
  //   'SUMINISTROS DIVERSOS', 'OTROS'
  // ];

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-8 dark:bg-zinc-900 dark:text-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Resumen de Inventario</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between dark:bg-blue-950 dark:text-blue-200">
          <div className="flex items-center">
            <Package className="h-6 w-6 text-blue-600 mr-3 dark:text-blue-400" />
            <span className="text-lg font-medium text-gray-800 dark:text-blue-200">Total Productos</span>
          </div>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{productos.length}</span>
        </div>
        <div className="bg-green-50 p-4 rounded-lg flex items-center justify-between dark:bg-green-950 dark:text-green-200">
          <div className="flex items-center">
            <span className="text-lg font-medium text-gray-800 dark:text-green-200">Cantidad Total</span>
          </div>
          <span className="text-2xl font-bold text-green-600 dark:text-green-400">{inventarioGeneral}</span>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg flex items-center justify-between dark:bg-yellow-950 dark:text-yellow-200">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-yellow-600 mr-3 dark:text-yellow-400" />
            <span className="text-lg font-medium text-gray-800 dark:text-yellow-200">Productos en Alerta</span>
          </div>
          <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{productosPorAgotarse.length}</span>
        </div>
      </div>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveView(activeView === 'alertas' ? 'none' : 'alertas')}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200
            ${activeView === 'alertas' ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-800 dark:text-yellow-100 dark:hover:bg-yellow-700'}`}
        >
          {activeView === 'alertas' ? 'Ocultar Alertas' : 'Mostrar Alertas'}
        </button>
        <button
          onClick={() => setActiveView(activeView === 'inventario' ? 'none' : 'inventario')}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200
            ${activeView === 'inventario' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-800 dark:text-blue-100 dark:hover:bg-blue-700'}`}
        >
          {activeView === 'inventario' ? 'Ocultar Estado de Inventario' : 'Mostrar Estado de Inventario'}
        </button>
        {/* Removed Lista Completa button */}
        {/* <button
          onClick={() => setActiveView(activeView === 'listaCompleta' ? 'none' : 'listaCompleta')}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200
            ${activeView === 'listaCompleta' ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-800 dark:text-indigo-100 dark:hover:bg-indigo-700'}`}
        >
          Ver Lista Completa
        </button> */}
      </div>

      {activeView === 'alertas' && (
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200 mt-6 dark:bg-zinc-800 dark:border-zinc-700">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500 dark:text-yellow-400" />
            Productos con Bajo Stock
          </h3>
          {productosPorAgotarse.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Buscar producto en alertas..."
                  className="p-2 border border-gray-300 rounded-md w-full dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {alertDistributionData.length > 0 && (
                <div className="h-60 mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Distribución de Alertas</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={alertDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent = 0 }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        paddingAngle={5}
                        innerRadius={40}
                      >
                        {alertDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#333', border: 'none', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                      <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
              <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700">
                <thead className="bg-gray-50 dark:bg-zinc-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Producto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Cantidad Actual</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Mínimo Permitido</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-zinc-800 dark:divide-zinc-700">
                  {displayedAlerts.map((producto) => (
                    <tr 
                      key={producto.id} 
                      className="hover:bg-gray-50 dark:hover:bg-zinc-700 cursor-pointer"
                      onClick={() => router.push(`/productos/${producto.id}`)} // Redirect to product detail
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {producto.nombre} ({producto.codigo})
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          producto.cantidad < 3 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                        }`}>
                          {producto.cantidad} {producto.unidad_medida}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {producto.cantidadMinima || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {productosPorAgotarse.length > 10 && !showAllAlerts && (
                <div className="text-center mt-4">
                  <button 
                    onClick={() => setShowAllAlerts(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Ver todas las {productosPorAgotarse.length} alertas
                  </button>
                </div>
              )}
              {showAllAlerts && (
                <div className="text-center mt-4">
                  <button 
                    onClick={() => setShowAllAlerts(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Mostrar menos alertas
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-300">
              No hay productos con bajo stock en este momento.
            </div>
          )}
        </div>
      )}

      {activeView === 'inventario' && (
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200 mt-6 dark:bg-zinc-800 dark:border-zinc-700">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
            <Package className="mr-2 h-5 w-5 text-blue-500 dark:text-blue-400" />
            Estado General del Inventario
          </h3>
          <p className="text-gray-700 dark:text-gray-300">Total de productos diferentes en inventario: <span className="font-bold text-blue-600 dark:text-blue-400">{productos.length}</span></p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">Cantidad total de unidades en inventario: <span className="font-bold text-green-600 dark:text-green-400">{inventarioGeneral}</span></p>
          
          {clasificacionInventario.length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Cantidad por Clasificación (Top 5)</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                {clasificacionInventario.map((item, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <span>{item.name}</span>
                    <span className="font-semibold">{item.value} unidades</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {topAbundantProducts.length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Productos Más Abundantes (Top 5)</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={topAbundantProducts}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" className="dark:stroke-zinc-700" />
                  <XAxis dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 10 }} angle={-30} textAnchor="end" height={50} />
                  <YAxis tick={{ fill: '#a1a1aa' }} />
                  <Tooltip contentStyle={{ background: '#333', border: 'none', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Bar dataKey="cantidad" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Removed Lista Completa section */}
      {/* {activeView === 'listaCompleta' && (
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200 mt-6 dark:bg-zinc-800 dark:border-zinc-700">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
            <ListFilter className="mr-2 h-5 w-5 text-indigo-500 dark:text-indigo-400" />
            Lista Completa de Productos
          </h3>
          <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-zinc-700 dark:border-zinc-600">
            <FiltroAvanzado 
              onFiltrar={setFiltrosLista}
              clasificaciones={CLASIFICACIONES}
              unidadesMedida={UNIDADES_MEDIDA}
            />
          </div>
          <ProductoList 
            productos={productosFiltradosParaLista} 
            onEdit={() => {}} // Pass a no-op function for now, as direct editing is not desired here
            onDeleteSuccess={() => {}} // Pass a no-op function for now
            showGraphics={false} 
          />
        </div>
      )} */}
    </div>
  );
};

export default ProductoDashboard;
