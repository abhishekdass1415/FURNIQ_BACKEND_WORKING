// Helper function to safely import API service
let apiServiceInstance = null;

export const getApiService = async () => {
  if (apiServiceInstance) {
    return apiServiceInstance;
  }
  
  try {
    const module = await import('./apiService.js');
    apiServiceInstance = module.default;
    return apiServiceInstance;
  } catch (error) {
    console.error('Failed to import API service:', error);
    throw new Error('API service not available');
  }
};

// Fallback API service for when backend is not available
export const createFallbackApiService = () => {
  return {
    getProducts: async () => {
      console.warn('Using fallback API service - backend not available');
      return [];
    },
    createProduct: async (product) => {
      console.warn('Using fallback API service - backend not available');
      return { ...product, id: Date.now() };
    },
    updateProduct: async (id, product) => {
      console.warn('Using fallback API service - backend not available');
      return { ...product, id };
    },
    deleteProduct: async (id) => {
      console.warn('Using fallback API service - backend not available');
      return true;
    },
    checkApiStatus: async () => false,
    login: async () => {
      throw new Error('Backend server is not running');
    }
  };
};
