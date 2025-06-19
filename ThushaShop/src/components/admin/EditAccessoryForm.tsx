import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAdminDashboard } from "@/context/AdminDashboardContext";
import { Accessory } from "@/types/accessory";

interface EditAccessoryFormProps {
  accessory: Accessory;
  onCancel: () => void;
  onSuccess: () => void;
}

interface AccessoryFormData {
  name: string;
  description: string;
  category: string;
  price: string;
  stock: string;
  weight: string;
}

const EditAccessoryForm: React.FC<EditAccessoryFormProps> = ({
  accessory,
  onCancel,
  onSuccess,
}) => {
  const { updateAccessory, categories, refreshProducts } = useAdminDashboard();
  const { toast } = useToast();

  const [formData, setFormData] = useState<AccessoryFormData>({
    name: accessory.name,
    description: accessory.description,
    category: accessory.category.id.toString(),
    price: accessory.price.toString(),
    stock: accessory.stock.toString(),
    weight: accessory.weight.toString(),
  });

  const [image, setImage] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(accessory.image);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof AccessoryFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImage(e.target.files[0]);
      setCurrentImageUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Accessory name is required",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.category) {
      toast({
        title: "Validation Error",
        description: "Category is required",
        variant: "destructive",
      });
      return false;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      toast({
        title: "Validation Error",
        description: "Price must be a valid positive number",
        variant: "destructive",
      });
      return false;
    }

    const stock = parseInt(formData.stock);
    if (isNaN(stock) || stock < 0) {
      toast({
        title: "Validation Error",
        description: "Stock must be a valid non-negative integer",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("category_id", formData.category);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("stock", formData.stock);

      if (formData.weight) {
        formDataToSend.append("weight", formData.weight);
      }

      if (image) {
        formDataToSend.append("image", image);
      }

      await updateAccessory(accessory.id, formDataToSend);
      await refreshProducts();

      toast({
        title: "Success",
        description: "Accessory updated successfully",
      });

      onSuccess();
    } catch (error) {
      console.error("Error updating accessory:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update accessory",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Accessory</CardTitle>
        <CardDescription>Update the details for this accessory</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Accessory Name *</Label>
              <Input
                id="name"
                placeholder="Enter accessory name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange("category", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter accessory description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image">Accessory Image</Label>
            <div className="flex items-center gap-4">
              {currentImageUrl && (
                <img
                  src={currentImageUrl}
                  alt="Current accessory"
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          </div>

          {/* Pricing and Stock */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                placeholder="0"
                value={formData.stock}
                onChange={(e) => handleInputChange("stock", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (grams)</Label>
              <Input
                id="weight"
                placeholder="e.g., 18"
                value={formData.weight}
                onChange={(e) => handleInputChange("weight", e.target.value)}
              />
            </div>
          </div>

          {/* Physical Properties */}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default EditAccessoryForm;
