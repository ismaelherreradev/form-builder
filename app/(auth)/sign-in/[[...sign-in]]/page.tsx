"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        toast({
          title: "Error",
          description: result.error.message || "Failed to sign in",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Signed in successfully",
        });
        router.push("/");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid items-center px-4 sm:justify-center">
      <Card className="w-full border-none sm:max-w-md">
        <CardHeader className="space-y-4 text-center">
          <CardTitle className="text-2xl font-extrabold">
            Welcome Back
          </CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                placeholder="Enter your password"
              />
            </div>
          </CardContent>
          <CardFooter>
            <div className="grid w-full gap-y-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Icons.spinner className="size-4 animate-spin" />
                ) : (
                  "Sign In"
                )}
              </Button>

              <Button variant="link" size="sm" asChild>
                <Link href="/sign-up">Don't have an account? Sign up</Link>
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
