import React from 'react';
import { Card, CardContent } from "@/components/ui/card"
import LoginForm from '../components/LoginForm';

const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-[400px] border border-border bg-card shadow-xl rounded-2xl">
        <CardContent className="p-6">
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
