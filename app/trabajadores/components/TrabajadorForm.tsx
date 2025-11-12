'use client';

import { useState, useEffect } from 'react';
import { Trabajador } from '@/types';
import { api } from '@/lib/api';
import { X, Save, User } from 'lucide-react';

interface TrabajadorFormProps {
  trabajador?: Trabajador | null;
  onClose: () => void;
  onSave: () => void;
}

const TrabajadorForm = ({ trabajador, onClose, onSave }: TrabajadorFormProps) => {
  const [form, setForm] = useState({
    codigo: '',
    nombre: '',
    activo: true
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (trabajador) {
      setForm({
        codigo: trabajador.codigo,
        nombre: trabajador.nombre,
        activo: trabajador.activo
      });
    } else {
      // Reset form when creating a new worker
      setForm({
        codigo: '',
        nombre: '',
        activo: true
      });
    }
  }, [trabajador]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      let response;
      
      if (trabajador) {
        // Update existing worker
        response = await api.put(`/trabajadores/${trabajador.id}`, form);
      } else {
        // Create new worker
        response = await api.post('/trabajadores', form);
      }

      if (response.success) {
        setMessage({
          type: 'success',
          text: trabajador 
            ? 'Trabajador actualizado correctamente' 
            : 'Trabajador creado correctamente'
        });
        onSave();
        if (!trabajador) {
          // Reset form after successful creation
          setForm({
            codigo: '',
            nombre: '',
            activo: true
          });
        }
      } else {
        setMessage({
          type: 'error',
          text: response.error || 'Error al guardar el trabajador'
        });
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Error de conexión al guardar el trabajador'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {trabajador ? 'Editar Trabajador' : 'Nuevo Trabajador'}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          disabled={isSubmitting}
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {message && (
        <div
          className={`mb-4 p-4 rounded-md ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nombre Completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="activo"
              name="activo"
              checked={form.activo}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-zinc-700 dark:border-zinc-600"
            />
            <label htmlFor="activo" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Activo
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white dark:hover:bg-zinc-600"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {trabajador ? 'Actualizar' : 'Guardar'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TrabajadorForm;
