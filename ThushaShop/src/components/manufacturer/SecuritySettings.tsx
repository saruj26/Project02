import React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import PasswordChangeForm from "@/components/account/PasswordChangeForm";

const SecuritySettings: React.FC = () => {
  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <Card className="border-none shadow-none">
        <CardHeader className="pb-4 px-0"> 
          <CardTitle className="text-xl">Security Settings</CardTitle> 
          <CardDescription className="text-sm"> 
            Manage your account security settings
          </CardDescription>
        </CardHeader>
      </Card>
      
      <PasswordChangeForm />
    </div>
  );
};

export default SecuritySettings;