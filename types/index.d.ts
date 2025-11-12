export interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  cantidad: number;
  unidad_medida: string;
  clasificacion: string;
  subclasificacion?: string;
  ubicacion_estante?: string;
  fecha_registro: string;
  ultimaActualizacion?: string;
  cantidadMinima?: number;
  cantidadMaxima?: number;
  estado?: 'disponible' | 'agotado' | 'por_agotarse';
  imagenUrl?: string;
  notas?: string;
}

export interface ProductoStats {
  totalProductos: number;
  totalCantidad: number;
  porClasificacion: Array<{
    nombre: string;
    cantidad: number;
    porcentaje: number;
  }>;
  porUnidadMedida: Array<{
    nombre: string;
    cantidad: number;
    porcentaje: number;
  }>;
  productosPorAgotarse: Producto[];
  ultimosProductos: Producto[];
}

export interface Trabajador {
  id: number;
  codigo: string;
  nombre: string;
  activo: boolean;
  fechaRegistro: string;
}

export type MessageType = 'success' | 'error' | 'info';

export interface ItemPrestamo {
  id: number;
  nombre: string;
  cantidadPrestada: number;
  cantidadDevuelta: number;
  cantidadDevueltaAnterior?: number; // Para rastrear la cantidad previamente devuelta
  comentarioDetalle: string;
  prestamoId: number;
  productoId?: number; // Referencia al producto original
}

export interface PrestamoHerramienta {
  id: number;
  trabajador_id: number;
  fecha_entrega: string | Date;
  fecha_devolucion_final?: string | Date | null;
  estado: 'pendiente' | 'en_progreso' | 'completado' | 'atrasado';
  observaciones?: string | null;
  items: ItemPrestamo[];
  // Relaciones
  trabajador?: Trabajador;
  Trabajador?: Trabajador; // Para compatibilidad con mayúsculas
  trabajadorId?: number;
  // Alias para compatibilidad
  fechaEntrega?: string | Date;
  fechaDevolucionFinal?: string | Date | null;
  // Métodos de instancia
  puedeCerrar?: () => boolean;
  // Campos calculados
  estaEnMora?: boolean;
  diasDeRetraso?: number;
}
