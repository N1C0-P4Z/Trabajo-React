import React from 'react';
import { Card, CardContent } from "@/components/ui/card"
import LoginForm from '../components/LoginForm';

const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
