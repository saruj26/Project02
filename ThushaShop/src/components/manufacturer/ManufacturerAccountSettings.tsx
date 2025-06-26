// components/manufacturer/AccountSettings.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ManufacturerProfileSettings from "@/components/manufacturer/ManufacturerProfileSettings";
import SecuritySettings from "@/components/manufacturer/SecuritySettings";
import { useState } from "react";

const ManufacturerAccountSettings = () => {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <Tabs 
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full"
    >
      <TabsList className="w-1/2 mx-auto">
        <TabsTrigger value="profile" className="w-1/2 text-sm">
          Profile
        </TabsTrigger>
        <TabsTrigger value="security" className="w-1/2 text-sm">
          Security
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="profile">
        <ManufacturerProfileSettings />
      </TabsContent>
      
      <TabsContent value="security">
        <SecuritySettings />
      </TabsContent>
    </Tabs>
  );
};

export default ManufacturerAccountSettings;

