import React, { useState, useEffect } from "react";
import {
  Card, CardHeader, CardTitle, CardDescription,
  CardContent, CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";
import { useManufacturerDashboard } from "@/context/ManufacturerDashboardContext";

const ManufacturerProfileSettings = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const { manufacturerProfile,  updateManufacturerProfile } = useManufacturerDashboard();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    address: "",
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);


  useEffect(() => {
    if (manufacturerProfile) {
      setFormData({
        name: user?.name || "",
        email: user?.email || "",
        phone_number: manufacturerProfile.phone_number || "",
        address: manufacturerProfile.address || "",
      });

      if (manufacturerProfile.image) {
        const url = manufacturerProfile.image.startsWith("http")
          ? manufacturerProfile.image
          : `${window.location.origin}/media/${manufacturerProfile.image}`;
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  }, [manufacturerProfile, user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("phone_number", formData.phone_number);
      formDataToSend.append("address", formData.address);

      if (profileImage) {
        formDataToSend.append("image", profileImage);
      }

      await updateManufacturerProfile(formDataToSend);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>Update your manufacturer profile information</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              {previewUrl ? (
                <AvatarImage src={previewUrl} alt="Profile" />
              ) : (
                <AvatarFallback className="text-2xl">
                  {formData.name.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>

            <div className="space-y-2">
              <Label htmlFor="profile-image" className="text-center block">
                Profile Photo
              </Label>
              <Input
                id="profile-image"
                type="file"
                onChange={handleImageChange}
                accept="image/*"
                className="w-full max-w-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={user?.role || "manufacturer"}
                readOnly
                disabled
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button type="submit">Save Changes</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ManufacturerProfileSettings;