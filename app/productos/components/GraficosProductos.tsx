'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { api } from '@/lib/api';
import { Producto, ProductoStats } from '@/types';
import { 
  Package, Box, Tag, AlertTriangle, 
  TrendingUp, BarChart2, PieChart as PieChartIcon, Zap 
} from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg dark:bg-zinc-700 dark:border-zinc-600 dark:text-gray-100">
        <p className="font-semibold">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`tooltip-${index}`} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const GraficosProductos = ({ productos }: { productos: Producto[] }) => {
  const [stats, setStats] = useState<ProductoStats | null>(null);
  const [loading, setLoading] = useState(true);
  // const [activeTab, setActiveTab] = useState('resumen'); // Removed activeTab

  useEffect(() => {
    // No longer fetching stats, as ProductoDashboard handles overall stats
    // const fetchStats = async () => {
    //   try {
    //     const response = await api.get<ProductoStats>('/productos/estadisticas');
    //     if (response.success && response.data) {
    //       setStats(response.data);
    //     }
    //   } catch (error) {
    //     console.error('Error al cargar estadísticas:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    // fetchStats();
    setLoading(false); // Set loading to false as no async operation is pending
  }, [productos]);

  // Definir unidades de medida permitidas
  const UNIDADES_MEDIDA_PERMITIDAS = [
    'KILOGRAMOS', 'LIBRAS', 'TONELADAS LARGAS', 'TONELADAS MÉTRICAS',
    'TONELADAS CORTAS', 'GRAMOS', 'UNIDADES', 'LITROS', 'GALONES',
    'BARRILES', 'LATAS', 'CAJAS', 'MILLARES', 'METROS CÚBICOS', 'METROS',
    'OTROS (ESPECIFICAR)'
  ];

  // Procesar datos para gráficos
  const procesarDatos = (tipo: 'clasificacion' | 'unidad') => {
    const datos = productos.reduce((acc: any[], producto) => {
      const key = tipo === 'clasificacion' ? producto.clasificacion : producto.unidad_medida; // Use producto.unidad_medida
      
      // Filtrar por unidades de medida permitidas si el tipo es 'unidad'
      if (tipo === 'unidad' && !UNIDADES_MEDIDA_PERMITIDAS.includes(key)) {
        console.log(`Filtering out unit: ${key}`); // Debugging line
        return acc; 
      }
      console.log(`Processing unit: ${key}`); // Debugging line

      const existente = acc.find(item => item.name === key);
      
      if (existente) {
        existente.cantidadTotal += producto.cantidad;
        existente.productos += 1;
      } else {
        acc.push({
          name: key,
          cantidadTotal: producto.cantidad,
          productos: 1
        });
      }
      return acc;
    }, []);

    return datos
      .sort((a, b) => b.cantidadTotal - a.cantidadTotal)
      .slice(0, 5); // Re-added the slice for Top 5
  };

  const datosClasificacion = procesarDatos('clasificacion');
  const datosUnidadMedida = procesarDatos('unidad');

  console.log("Datos Unidad Medida:", datosUnidadMedida);

  // Remove these as ProductoDashboard handles them
  // const productosPorAgotarse = [...productos]
  //   .filter(p => p.cantidad <= (p.cantidadMinima || 5))
  //   .sort((a, b) => a.cantidad - b.cantidad);

  // const productosRecientes = [...productos]
  //   .sort((a, b) => new Date(b.fechaRegistro).getTime() - new Date(a.fechaRegistro).getTime())
  //   .slice(0, 5);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Pestañas */}
      {/* Remove tabs as ProductoDashboard handles alerts and inventory status */}
      {/* <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('resumen')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'resumen' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            <div className="flex items-center">
              <BarChart2 className="mr-2 h-4 w-4" />
              Resumen
            </div>
          </button>
          <button
            onClick={() => setActiveTab('inventario')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'inventario' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            <div className="flex items-center">
              <Package className="mr-2 h-4 w-4" />
              Estado del Inventario
            </div>
          </button>
          <button
            onClick={() => setActiveTab('alertas')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'alertas' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            <div className="flex items-center">
              <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" />
              Alertas
            </div>
          </button>
        </nav>
      </div> */}

      {/* Only show graphs for resumen section */}
      {/* {activeTab === 'resumen' && ( */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de barras - Productos por clasificación */}
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200 dark:bg-zinc-800 dark:border-zinc-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center">
                <Tag className="mr-2 h-5 w-5 text-blue-500 dark:text-blue-400" />
                Productos por Clasificación
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-300">Top 5</span>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datosClasificacion}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" className="dark:stroke-zinc-700" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12, fill: '#a1a1aa' }}
                    angle={-30}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis tick={{ fill: '#a1a1aa' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Bar 
                    dataKey="cantidadTotal" 
                    name="Cantidad Total" 
                    fill="#4f46e5"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico circular - Distribución por unidad de medida */}
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200 dark:bg-zinc-800 dark:border-zinc-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center">
                <Box className="mr-2 h-5 w-5 text-green-500 dark:text-green-400" />
                Distribución por Unidad de Medida
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-300">Top 5</span>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={datosUnidadMedida}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="cantidadTotal"
                    nameKey="name"
                    label={({ name, percent = 0 }) => 
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    paddingAngle={5}
                    innerRadius={40}
                  >
                    {datosUnidadMedida.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={<CustomTooltip />}
                    formatter={(value: number, name: string, props: any) => {
                      const total = datosUnidadMedida.reduce((sum, item) => sum + item.cantidadTotal, 0);
                      const porcentaje = ((value / total) * 100).toFixed(1);
                      return [`${name}: ${value} (${porcentaje}%)`, 'Cantidad'];
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      {/* )} */}

      {/* Remove inventory and alerts sections */}
      {/* {activeTab === 'inventario' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribución por Clasificación</h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={datosClasificacion}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" />
                  <PolarRadiusAxis angle={30} domain={[0, 'dataMax + 20']} />
                  <Radar
                    name="Cantidad"
                    dataKey="cantidadTotal"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Últimos Productos Agregados</h3>
            <div className="space-y-4">
              {productosRecientes.map((producto) => (
                <div key={producto.id} className="flex items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                  <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-900">{producto.nombre}</h4>
                    <p className="text-sm text-gray-500">
                      {producto.cantidad} {producto.unidadMedida} • {new Date(producto.fechaRegistro).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )} */}

      {/* {activeTab === 'alertas' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
                Productos por Agotarse
              </h3>
              <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                {productosPorAgotarse.length} productos
              </span>
            </div>
            
            {productosPorAgotarse.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mínimo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {productosPorAgotarse.map((producto) => (
                      <tr key={producto.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{producto.nombre}</div>
                          <div className="text-sm text-gray-500">{producto.codigo}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            producto.cantidad < 3 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {producto.cantidad} {producto.unidadMedida}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {producto.cantidadMinima || 'No definido'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {producto.ubicacionEstante || 'No especificada'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            {producto.cantidad < 3 ? 'Crítico' : 'Bajo Stock'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">¡Todo en orden!</h3>
                <p className="mt-1 text-sm text-gray-500">No hay productos con stock bajo en este momento.</p>
              </div>
            )}
          </div>
        </div>
      )} */}
    </div>
  );
};

export default GraficosProductos;
