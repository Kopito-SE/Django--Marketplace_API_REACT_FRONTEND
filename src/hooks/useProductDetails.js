import { useQuery } from '@tanstack/react-query'

// Your Django API URL - adjust if needed
const getProductDetails = async (id) => {
  const response = await fetch(`http://127.0.0.1:8000/api/products/${id}/`)
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  
  return response.json()
}

export function useProductDetails(productId) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProductDetails(productId),
    enabled: !!productId, // Only run if we have an ID
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 1, // Only retry once
  })
}