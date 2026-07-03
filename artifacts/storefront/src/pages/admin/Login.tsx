import { useState } from "react";
import { useLocation } from "wouter";
import { useAdminLogin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminLogin() {
  const [password, setPassword] = useState("");
  const login = useAdminLogin();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ data: { password } }, {
      onSuccess: () => {
        setLocation("/admin/orders");
      },
      onError: () => {
        toast({
          title: "Invalid password",
          description: "Please check the admin password and try again.",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md border-none shadow-lg">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="font-serif text-3xl text-primary">Mom's Storefront</CardTitle>
          <CardDescription>Admin Dashboard Access</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 text-lg"
              disabled={login.isPending}
            >
              {login.isPending ? "Authenticating..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
