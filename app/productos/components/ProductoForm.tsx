'use client';

import { useState, useEffect } from 'react';
import { Producto } from '@/types';
import { api } from '@/lib/api';
import { X, Save, Plus } from 'lucide-react';

const UNIT_MEASURE_OPTIONS = [
  'KILOGRAMOS', 'LIBRAS', 'TONELADAS LARGAS', 'TONELADAS MÉTRICAS',
  'TONELADAS CORTAS', 'GRAMOS', 'UNIDADES', 'LITROS', 'GALONES',
  'BARRILES', 'LATAS', 'CAJAS', 'MILLARES', 'METROS CÚBICOS', 'METROS', 'OTROS'
];

const CLASSIFICATION_OPTIONS = [
  'MATERIALES DE EMBALAJE Y ENVOLTURA',
  'CINTAS ESPECIALIZADAS',
  'PRECINTOS/ CINTILLOS',
  'PINTURAS Y RECUBRIMIENTOS',
  'SUMINISTROS DIVERSOS',
  'OTROS'
];

interface ProductoFormProps {
  producto?: Producto | null;
  onClose: () => void;
  onSave: () => void;
}

const ProductoForm = ({ producto, onClose, onSave }: ProductoFormProps) => {
  // Estado local del formulario - los nombres de las propiedades deben coincidir con la interfaz Producto
  const [form, setForm] = useState<Omit<Producto, 'id' | 'fecha_registro' | 'ultimaActualizacion' | 'estado' | 'imagenUrl'>>({
    codigo: '',
    nombre: '',
    cantidad: 0,
    unidad_medida: '',
    clasificacion: '',
    subclasificacion: '',
    ubicacion_estante: '',
    cantidadMinima: 5,
    cantidadMaxima: 100,
    notas: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showOtherUnidad, setShowOtherUnidad] = useState(false);
  const [showOtherClasificacion, setShowOtherClasificacion] = useState(false);

  useEffect(() => {
    if (producto) {
      setForm({
        codigo: producto.codigo,
        nombre: producto.nombre,
        cantidad: producto.cantidad,
        unidad_medida: producto.unidad_medida,
        clasificacion: producto.clasificacion,
        subclasificacion: producto.subclasificacion || '',
        ubicacion_estante: producto.ubicacion_estante || '',
        cantidadMinima: producto.cantidadMinima || 5,
        cantidadMaxima: producto.cantidadMaxima || 100,
        notas: producto.notas || ''
      });
      
      if (!UNIT_MEASURE_OPTIONS.includes(producto.unidad_medida)) {
        setShowOtherUnidad(true);
      }
      if (!CLASSIFICATION_OPTIONS.includes(producto.clasificacion)) {
        setShowOtherClasificacion(true);
      }
    }
  }, [producto]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'unidad_medida') {
      setShowOtherUnidad(value === 'OTROS');
    } else if (name === 'clasificacion') {
      setShowOtherClasificacion(value === 'OTROS');
    }
    
    setForm(prev => ({
      ...prev,
      [name]: name === 'cantidad' || name === 'cantidadMinima' || name === 'cantidadMaxima'
        ? Number(value) || 0
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      let response;
      
      if (producto) {
        // Actualizar producto existente
        response = await api.put(`/productos/${producto.id}`, form);
      } else {
        // Crear nuevo producto
        response = await api.post('/productos', form);
      }

      if (response.success) {
        setMessage({
          type: 'success',
          text: producto ? 'Producto actualizado correctamente' : 'Producto creado correctamente'
        });
        setTimeout(() => {
          onSave();
          onClose();
        }, 1000);
      } else {
        setMessage({
          type: 'error',
          text: response.error || 'Error al guardar el producto'
        });
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Error de conexión al servidor'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              {producto ? '✏️ Editar Producto' : '✨ Nuevo Producto'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
              aria-label="Cerrar"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {message && (
            <div className={`p-4 mb-6 rounded-lg border ${
              message.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300' 
                : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
            }`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {message.type === 'success' ? (
                    <svg className="h-5 w-5 text-green-400 dark:text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-red-400 dark:text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{message.text}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Código <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="codigo"
                  value={form.codigo}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Ej: PROD-001"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Ej: Martillo de carpintero"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Cantidad <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="cantidad"
                  min="0"
                  value={form.cantidad}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Unidad de Medida <span className="text-red-500">*</span>
                </label>
                <select
                  name="unidad_medida"
                  value={showOtherUnidad ? 'OTROS' : form.unidad_medida}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 appearance-none bg-no-repeat bg-right-2 bg-[length:1.5em_1.5em]"
                  style={{
                    backgroundImage: "url(" + encodeURI("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'><path stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/></svg>") + ")"
                  }}
                  required
                >
                  <option value="">Seleccione una opción</option>
                  {UNIT_MEASURE_OPTIONS.map((unidad) => (
                    <option key={unidad} value={unidad}>
                      {unidad}
                    </option>
                  ))}
                  <option value="OTROS">Otro (especificar)</option>
                </select>
                
                {showOtherUnidad && (
                  <input
                    type="text"
                    name="unidad_medida"
                    value={form.unidad_medida}
                    onChange={handleChange}
                    placeholder="Especifique la unidad de medida"
                    className="mt-2 w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    required
                  />
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Clasificación <span className="text-red-500">*</span>
                </label>
                <select
                  name="clasificacion"
                  value={showOtherClasificacion ? 'OTROS' : form.clasificacion}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 appearance-none bg-no-repeat bg-right-2 bg-[length:1.5em_1.5em]"
                  style={{
                    backgroundImage: "url(" + encodeURI("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'><path stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/></svg>") + ")"
                  }}
                  required
                >
                  <option value="">Seleccione una opción</option>
                  {CLASSIFICATION_OPTIONS.map((clasificacion) => (
                    <option key={clasificacion} value={clasificacion}>
                      {clasificacion}
                    </option>
                  ))}
                  <option value="OTROS">Otro (especificar)</option>
                </select>
                
                {showOtherClasificacion && (
                  <input
                    type="text"
                    name="clasificacion"
                    value={form.clasificacion}
                    onChange={handleChange}
                    placeholder="Especifique la clasificación"
                    className="mt-2 w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    required
                  />
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Subclasificación
                </label>
                <input
                  type="text"
                  name="subclasificacion"
                  value={form.subclasificacion}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ubicación en Estante
                </label>
                <input
                  type="text"
                  name="ubicacion_estante"
                  value={form.ubicacion_estante || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Cantidad Mínima
                </label>
                <input
                  type="number"
                  name="cantidadMinima"
                  min="0"
                  value={form.cantidadMinima}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Cantidad Máxima
                </label>
                <input
                  type="number"
                  name="cantidadMaxima"
                  min="0"
                  value={form.cantidadMaxima}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Notas
              </label>
              <textarea
                name="notas"
                rows={3}
                value={form.notas}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 resize-none"
                placeholder="Notas adicionales sobre el producto..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-8">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Guardar</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductoForm;
