"use client"

import { Button } from "@/components/ui/8bit/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/8bit/card"
import { Input } from "@/components/ui/8bit/input"
import { Label } from "@/components/ui/8bit/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/8bit/select"
import router from "next/dist/client/router"
import { useEffect, useState } from "react"
import {useRouter} from "next/navigation"
import Link from "next/link"
import ReCAPTCHA from "react-google-recaptcha"
import apiClient from "@/lib/apiClient"

const types = ["participant", "organizer", "admin"]

export default function Login() {

    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setAccountType] = useState("");
    const [captchaValue, setCaptchaValue] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {

      const checkToken = async () => {

        try {

          const token = localStorage.getItem("felicity_token");

          if(token) {
            const response = await apiClient.get("/role");
            if(response?.data?.role) {
              router.push(`/${response.data.role}/dashboard`)
            }
          }

        } catch (err) {
          console.log("Error accessing localStorage:", err);
        }

      }
      checkToken();

    }, [])

    const submit = async () => {

        setError(null); // Clear previous errors

        const payload = {
            email,
            password,
            role,
            captchaValue
        }

        try {
          const response = await fetch("http://localhost:9999/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          })

          const data = await response.json()

          if (data?.success) {
            if (data?.token) {
              localStorage.setItem("felicity_token", data.token)
              router.push(`/${role}/dashboard`)
            }
          } else {
            setError(data?.message || "Login failed. Please check your credentials and try again.")
          }
        } catch (err) {
            setError("An error occurred. Please try again later.")
            console.log("Login error:", err)
        }

    }

  return (
    <div className="flex min-h-screen items-center justify-center">
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>Felicity Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
        <CardAction>
          <Button variant="link" asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                onChange={(e)=>setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <Input
               id="password"
                type="password"
                 required 
                    onChange={(e)=>setPassword(e.target.value)}
                 />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Account Type</Label>
              <Select
                onValueChange={(e)=>setAccountType(e)}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  {types.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <ReCAPTCHA sitekey={process.env.NEXT_PUBLIC_SITE_KEY || ""} onChange={setCaptchaValue} />
        <Button type="button" className="w-full" onClick={submit}>
          Login
        </Button>
        {error && (
          <div className="w-full p-3 bg-red-100 border-2 border-red-500 text-red-700 rounded mt-2">
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}
      </CardFooter>
    </Card>
    </div>
  )
}
