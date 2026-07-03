import { useListProducts, getListProductsQueryKey, useUpdateProduct, useDeleteProduct, ProductCategory, Product } from "@workspace/api-client-react";
import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { ProductFormDialog } from "@/components/admin/ProductFormDialog";

export function AdminProducts() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  
  const { data: products, isLoading } = useListProducts(
    { search: search || undefined, includeInactive: true },
    { query: { queryKey: getListProductsQueryKey({ search: search || undefined, includeInactive: true }) } }
  );

  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const handleToggleActive = (id: number, active: boolean) => {
    updateProduct.mutate(
      { id, data: { active } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListProductsQueryKey({ search: search || undefined, includeInactive: true }) }) }
    );
  };

  const handleToggleStock = (id: number, stockStatus: "in_stock" | "made_to_order") => {
    updateProduct.mutate(
      { id, data: { stockStatus } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListProductsQueryKey({ search: search || undefined, includeInactive: true }) }) }
    );
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct(undefined);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProduct.mutate(
        { id },
        { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListProductsQueryKey({ search: search || undefined, includeInactive: true }) }) }
      );
    }
  };

  return (
    <AdminLayout>
      <ProductFormDialog 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        product={editingProduct} 
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your catalog, stock, and pricing.</p>
        </div>
        <Button className="gap-2 shrink-0" onClick={handleAdd}>
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      <div className="bg-background rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Search products..." 
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium">Visible</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-16" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-16" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-10" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-16 ml-auto" /></td>
                  </tr>
                ))
              ) : products && products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-muted overflow-hidden shrink-0">
                          {product.photos?.[0] && (
                            <img src={`/api/storage${product.photos[0]}`} className="w-full h-full object-cover" alt="" />
                          )}
                        </div>
                        <span className="font-medium line-clamp-1">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize">{product.category}</td>
                    <td className="px-6 py-4 font-medium text-primary">₹{product.price}</td>
                    <td className="px-6 py-4">
                      <Badge 
                        variant="outline" 
                        className={`cursor-pointer hover:bg-muted ${product.stockStatus === 'in_stock' ? 'text-green-600 border-green-200 bg-green-50' : ''}`}
                        onClick={() => handleToggleStock(product.id, product.stockStatus === 'in_stock' ? 'made_to_order' : 'in_stock')}
                      >
                        {product.stockStatus === 'in_stock' ? 'In Stock' : 'Made to Order'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Switch 
                        checked={product.active} 
                        onCheckedChange={(v) => handleToggleActive(product.id, v)} 
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={() => handleEdit(product)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => handleDelete(product.id)} disabled={deleteProduct.isPending}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No products found. Add your first product to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
