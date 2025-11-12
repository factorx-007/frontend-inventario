'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Trabajador, ItemPrestamo, PrestamoHerramienta } from '@/types';

interface ReporteMoroso {
  id: number;
  codigo: string;
  nombre: string;
  itemsPendientes: Array<ItemPrestamo & { pendiente: number; fechaPrestamo: string }>;
  totalPendiente: number;
  fechaPrestamoMasAntiguo: string;
}

const ReporteMorososPage = () => {
  const [morosos, setMorosos] = useState<ReporteMoroso[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchMorosos = async () => {
    setMessage(null);
    try {
      const response = await api.get<ReporteMoroso[]>('/prestamos/reportes/morosos');
      if (response.success && response.data) {
        setMorosos(response.data);
      } else {
        setMessage({ type: 'error', text: response.error || 'Error al cargar el reporte de morosos.' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error de conexión al servidor.' });
    }
  };

  useEffect(() => {
    fetchMorosos();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Reporte de Morosos</h1>

        {message && (
          <div className={`p-3 mb-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <button
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-md focus:outline-none focus:shadow-outline transition-colors duration-200 mb-6"
          onClick={handlePrint}
        >
          Imprimir Reporte
        </button>

        <div className="bg-white shadow-lg rounded-lg p-6">
          {morosos.length === 0 ? (
            <p className="text-gray-600">No hay trabajadores morosos actualmente.</p>
          ) : (
            morosos.map((moroso, index) => (
              <div key={index} className="mb-6 pb-4 border-b border-gray-200 last:border-b-0 last:mb-0">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Trabajador: {moroso.nombre} <span className="text-gray-500 text-sm">({moroso.codigo})</span></h2>
                <p className="text-sm text-gray-600 mb-1">Total Pendiente: <span className="font-bold text-red-600">{moroso.totalPendiente} ítems</span></p>
                <p className="text-sm text-gray-600 mb-3">Préstamo más antiguo: {new Date(moroso.fechaPrestamoMasAntiguo).toLocaleDateString()}</p>
                <h3 className="text-lg font-medium text-gray-600 mb-3">Ítems Pendientes:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {moroso.itemsPendientes.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-gray-700">
                      <span className="font-medium">{item.nombre}</span> - Cantidad Prestada: {item.cantidadPrestada}, Cantidad Devuelta: {item.cantidadDevuelta},
                      Faltan por Devolver: <span className="font-bold text-red-600">{item.pendiente}</span> <span className="text-sm text-gray-500">({item.comentarioDetalle})</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ReporteMorososPage;
