'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Producto } from '@/types';
import ProductoForm from '../components/ProductoForm';
import { ArrowLeft, Edit, Trash2, Package, Tag, Hash, Scale, MapPin, CalendarDays, AlertTriangle } from 'lucide-react';

const ProductoDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchProduct = async () => {
    if (id) {
      setLoading(true);
      try {
        const response = await api.get<Producto>(`/productos/${id}`);
        if (response.success && response.data) {
          setProducto(response.data);
        } else {
          setMessage({ type: 'error', text: response.error || 'Error al cargar el producto.' });
        }
      } catch (error: any) {
        setMessage({ type: 'error', text: error.message || 'Error de conexión al servidor.' });
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.')) {
      if (id) {
        try {
          const response = await api.delete<{ mensaje: string }>(`/productos/${id}`);
          if (response.success) {
            setMessage({ type: 'success', text: response.data?.mensaje || 'Producto eliminado correctamente.' });
            router.push('/productos'); // Redirect to product list after deletion
          } else {
            setMessage({ type: 'error', text: response.error || 'Error al eliminar el producto.' });
          }
        } catch (error: any) {
          setMessage({ type: 'error', text: error.message || 'Error de conexión al servidor.' });
        }
      }
    }
  };

  const handleSaveSuccess = () => {
    setShowEditForm(false);
    fetchProduct(); // Re-fetch product data to show updated details
    setMessage({ type: 'success', text: 'Producto actualizado correctamente.' });
    setTimeout(() => setMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
        <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Producto no encontrado</h1>
        <p className="text-gray-600 mb-4">El producto con el ID "{id}" no existe o no pudo ser cargado.</p>
        <button
          onClick={() => router.push('/productos')}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowLeft className="-ml-1 mr-2 h-4 w-4" />
          Volver a la lista de productos
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 dark:bg-zinc-900">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 md:p-8 dark:bg-zinc-800">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/productos')}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors dark:text-blue-400 dark:hover:text-blue-500"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            <span className="text-lg font-medium">Volver</span>
          </button>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowEditForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-green-700 dark:hover:bg-green-600"
            >
              <Edit className="-ml-1 mr-2 h-4 w-4" />
              Editar
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-600"
            >
              <Trash2 className="-ml-1 mr-2 h-4 w-4" />
              Eliminar
            </button>
          </div>
        </div>

        {message && (
          <div className={`p-3 mb-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100'}`}>
            {message.text}
          </div>
        )}

        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 border-b pb-4 dark:border-zinc-700">Detalles del Producto</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-3">
            <Hash className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-300">Código</p>
              <p className="text-lg text-gray-900 font-semibold dark:text-gray-100">{producto.codigo}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Package className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-300">Nombre</p>
              <p className="text-lg text-gray-900 font-semibold dark:text-gray-100">{producto.nombre}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Scale className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-300">Cantidad</p>
              <p className="text-lg text-gray-900 font-semibold dark:text-gray-100">{producto.cantidad} {producto.unidad_medida}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Tag className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-300">Clasificación</p>
              <p className="text-lg text-gray-900 font-semibold dark:text-gray-100">{producto.clasificacion}</p>
            </div>
          </div>
          {producto.subclasificacion && (
            <div className="flex items-center space-x-3">
              <Tag className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-300">Subclasificación</p>
                <p className="text-lg text-gray-900 font-semibold dark:text-gray-100">{producto.subclasificacion}</p>
              </div>
            </div>
          )}
          <div className="flex items-center space-x-3">
            <MapPin className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-300">Ubicación Estante</p>
              <p className="text-lg text-gray-900 font-semibold dark:text-gray-100">{producto.ubicacion_estante || 'No especificada'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-300">Cantidad Mínima</p>
              <p className="text-lg text-gray-900 font-semibold dark:text-gray-100">{producto.cantidadMinima || 'No definida'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <CalendarDays className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-300">Fecha de Registro</p>
              <p className="text-lg text-gray-900 font-semibold dark:text-gray-100">{new Date(producto.fecha_registro).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {showEditForm && (
          <ProductoForm
            producto={producto}
            onClose={() => setShowEditForm(false)}
            onSave={handleSaveSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default ProductoDetailPage;
