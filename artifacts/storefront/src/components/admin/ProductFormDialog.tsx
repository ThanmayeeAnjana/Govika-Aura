import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, X, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { useCreateProduct, useUpdateProduct, Product, ProductCategory, StockStatus, ProductVariant } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const variantSchema = z.object({
  label: z.string().min(1, "Label is required"),
  size: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
});

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.enum(["saree", "kurti", "puja", "decor"]),
  price: z.coerce.number().min(0, "Price must be positive"),
  description: z.string().min(1, "Description is required"),
  stockStatus: z.enum(["in_stock", "made_to_order"]),
  active: z.boolean(),
  photos: z.array(z.string()),
  variants: z.array(variantSchema),
});

type FormValues = z.infer<typeof productSchema>;

interface ProductFormDialogProps {
  product?: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
}

export function ProductFormDialog({ product, open, onOpenChange, children }: ProductFormDialogProps) {
  const queryClient = useQueryClient();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      category: product?.category || "saree",
      price: product?.price || 0,
      description: product?.description || "",
      stockStatus: product?.stockStatus || "in_stock",
      active: product?.active ?? true,
      photos: product?.photos || [],
      variants: product?.variants || [],
    },
  });

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      // 1. Request presigned URL
      const reqRes = await fetch("/api/storage/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: file.name,
          size: file.size,
          contentType: file.type,
        }),
      });
      
      if (!reqRes.ok) throw new Error("Failed to get upload URL");
      
      const { uploadURL, objectPath } = await reqRes.json();

      // 2. Upload file
      const uploadRes = await fetch(uploadURL, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) throw new Error("Failed to upload file to storage");

      // 3. Update form
      const currentPhotos = form.getValues("photos");
      form.setValue("photos", [...currentPhotos, objectPath]);
      
    } catch (err) {
      console.error(err);
      alert("Failed to upload image.");
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const removePhoto = (index: number) => {
    const currentPhotos = form.getValues("photos");
    form.setValue("photos", currentPhotos.filter((_, i) => i !== index));
  };

  const onSubmit = (data: FormValues) => {
    if (product) {
      updateProduct.mutate({ id: product.id, data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/products"] });
          onOpenChange(false);
        }
      });
    } else {
      createProduct.mutate({ data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/products"] });
          form.reset();
          onOpenChange(false);
        }
      });
    }
  };

  const isSubmitting = createProduct.isPending || updateProduct.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Handwoven Kanchipuram Saree" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="saree">Saree</SelectItem>
                            <SelectItem value="kurti">Kurti</SelectItem>
                            <SelectItem value="puja">Puja Items</SelectItem>
                            <SelectItem value="decor">Decor</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (₹)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea rows={4} placeholder="Product description..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="stockStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="in_stock">In Stock</SelectItem>
                            <SelectItem value="made_to_order">Made to Order</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-2 pt-1">
                        <FormLabel>Visibility</FormLabel>
                        <div className="flex items-center gap-2">
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <span className="text-sm text-muted-foreground">{field.value ? "Active (Visible)" : "Inactive (Hidden)"}</span>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <FormLabel className="block mb-2">Product Images</FormLabel>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {form.watch("photos").map((photo, i) => (
                      <div key={i} className="relative aspect-square rounded-md overflow-hidden bg-muted group">
                        <img src={`/api/storage${photo}`} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(i)}
                          className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    
                    <label className="aspect-square rounded-md border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                      {isUploading ? (
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      ) : (
                        <>
                          <ImageIcon className="w-6 h-6 text-muted-foreground mb-1" />
                          <span className="text-xs text-muted-foreground">Upload</span>
                        </>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground">First image will be the primary product photo.</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <FormLabel>Variants (Optional)</FormLabel>
                    <Button type="button" variant="outline" size="sm" onClick={() => appendVariant({ label: "" })}>
                      <Plus className="w-3 h-3 mr-1" /> Add Variant
                    </Button>
                  </div>
                  
                  {variantFields.length === 0 ? (
                    <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-md text-center">
                      No variants added. Product will be sold as a single item.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {variantFields.map((field, index) => (
                        <div key={field.id} className="flex gap-2 items-start bg-muted/30 p-2 rounded-md border">
                          <div className="flex-1 space-y-2">
                            <Input placeholder="Label (e.g. Small / Large)" {...form.register(`variants.${index}.label` as const)} />
                            {form.formState.errors.variants?.[index]?.label && (
                              <p className="text-[10px] text-destructive">{form.formState.errors.variants[index]?.label?.message}</p>
                            )}
                          </div>
                          <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={() => removeVariant(index)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting || isUploading}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {product ? "Save Changes" : "Create Product"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
