export interface Product {
  id: string;        // ID1, ID2, ...
  imageId: string;   // Google Drive file ID
  title: string;
  price: number;
  category: string;
  tags: string[];
  shortDesc?: string;
  description?: string;
  discountPrice?: number;
  isWholesale?: boolean;
}

export interface ProductsApiResponse {
  products: Product[];
}
