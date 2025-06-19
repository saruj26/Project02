import { ApiProduct, Product } from '@/types/product';

export function normalizeProduct(apiProduct: ApiProduct): Product {
  return {
    ...apiProduct,
    images: apiProduct.images || [],
    category: typeof apiProduct.category === 'string'
      ? { id: 0, name: apiProduct.category } // Create category object from string
      : apiProduct.category,
    frame_type: apiProduct.frame_type
      ? (typeof apiProduct.frame_type === 'string'
        ? { id: 0, name: apiProduct.frame_type }
        : { id: apiProduct.frame_type.id, name: apiProduct.frame_type.name })
      : undefined
  };
}

import { ApiAccessory, Accessory } from '@/types/accessory';

export function normalizeAccessory(apiAccessory: ApiAccessory): Accessory {
  return {
    ...apiAccessory,
    category: typeof apiAccessory.category === 'string'
      ? { id: 0, name: apiAccessory.category } // Create category object from string
      : apiAccessory.category
  };
}