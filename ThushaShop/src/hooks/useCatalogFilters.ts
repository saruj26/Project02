
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Product } from "@/types";
import { products } from "@/data/products";
import { useUser } from "@/context/UserContext";

export interface CatalogFilters {
  search: string;
  faceShape: string[];
  frameType: string[];
  frameMaterial: string[];
  priceRange: [number, number];
  visionProblem: string[];
  category: string[];
}

export const useCatalogFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useUser();
  
  const [filters, setFilters] = useState<CatalogFilters>({
    search: searchParams.get("search") || "",
    faceShape: [],
    frameType: [],
    frameMaterial: [],
    priceRange: [0, 200],
    visionProblem: [],
    category: [],
  });

  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);

  // Initialize face shape filter if user has a known face shape
  useEffect(() => {
    if (user && user.preferences.faceShape !== "unknown") {
      setFilters(prev => ({
        ...prev,
        faceShape: [user.preferences.faceShape]
      }));
    }
  }, [user]);

  // Parse search from URL
  useEffect(() => {
    const search = searchParams.get("search");
    if (search) {
      setFilters(prev => ({ ...prev, search }));
    }
  }, [searchParams]);

  // Apply filters and return filtered products
  useEffect(() => {
    let result = [...products];

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(
        product =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm) ||
          product.frameType.toLowerCase().includes(searchTerm) ||
          product.frameMaterial.toLowerCase().includes(searchTerm) ||
          (product.category && product.category.toLowerCase().includes(searchTerm))
      );
    }

    // Apply category filter
    if (filters.category.length > 0) {
      result = result.filter(product =>
        filters.category.includes(product.category || "eyeglasses")
      );
    }

    // Apply face shape filter
    if (filters.faceShape.length > 0) {
      result = result.filter(product =>
        filters.faceShape.some(shape => product.recommendedFaceShapes.includes(shape))
      );
    }

    // Apply frame type filter
    if (filters.frameType.length > 0) {
      result = result.filter(product =>
        filters.frameType.includes(product.frameType)
      );
    }

    // Apply frame material filter
    if (filters.frameMaterial.length > 0) {
      result = result.filter(product =>
        filters.frameMaterial.includes(product.frameMaterial)
      );
    }

    // Apply price range filter
    result = result.filter(
      product =>
        product.price >= filters.priceRange[0] &&
        product.price <= filters.priceRange[1]
    );

    // Apply vision problem filter
    if (filters.visionProblem.length > 0) {
      result = result.filter(product =>
        filters.visionProblem.some(problem => product.recommendedVisionProblems.includes(problem))
      );
    }

    setFilteredProducts(result);
  }, [filters]);

  const handleFilterChange = (filterType: string, value: any) => {
    setFilters(prev => {
      if (filterType === 'priceRange') {
        return { ...prev, priceRange: value };
      }
      
      const currentValues = prev[filterType as keyof CatalogFilters] as string[];
      let newValues;
      
      if (currentValues.includes(value)) {
        newValues = currentValues.filter(v => v !== value);
      } else {
        newValues = [...currentValues, value];
      }
      
      return { ...prev, [filterType]: newValues };
    });
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      faceShape: [],
      frameType: [],
      frameMaterial: [],
      priceRange: [0, 200],
      visionProblem: [],
      category: [],
    });
    setSearchParams({});
  };

  const hasActiveFilters = filters.faceShape.length > 0 || 
                          filters.frameType.length > 0 || 
                          filters.frameMaterial.length > 0 ||
                          filters.visionProblem.length > 0 ||
                          filters.category.length > 0 ||
                          filters.priceRange[0] > 0 ||
                          filters.priceRange[1] < 200;

  return {
    filters,
    filteredProducts,
    handleFilterChange,
    clearFilters,
    hasActiveFilters,
    setSearchParams
  };
};
