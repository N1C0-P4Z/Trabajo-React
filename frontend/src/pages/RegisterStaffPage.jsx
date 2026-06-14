import React from 'react';
import { Card, CardContent } from "@/components/ui/card"
import StaffRegisterForm from '../components/StaffRegisterForm';

const RegisterStaffPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-[500px] border border-border bg-card shadow-xl rounded-2xl">
        <CardContent className="p-6">
          <StaffRegisterForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterStaffPage;
