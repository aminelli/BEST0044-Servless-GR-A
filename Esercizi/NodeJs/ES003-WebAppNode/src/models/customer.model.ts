
// Interfaccia per il modello Customer

export interface Customer {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
}

// Interfaccia per i parametri di ricerca 
export interface CustomerQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    order?: 'ASC' | 'DESC';
}

// Interfaccia per la paginazione dei risultati
export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    }
}


// Interfaccia dati statistici
export interface CustomerStats {
    total: number;
    recentlyAdded: number;
    withComopany: number;
    byCountry: { [key: string]: number };
    
}