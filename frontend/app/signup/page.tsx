"use client"

import { useEffect,useState } from "react"
import { Button } from "@/components/ui/8bit/button"
import {useRouter} from "next/navigation"
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
import Link from "next/link"
import ReCAPTCHA from "react-google-recaptcha"
import apiClient from "@/lib/apiClient"

const types = ["IIITH", "Non-IIITH"]

export default function Signup() {

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

const router = useRouter()
  const [formData, setFormData] = useState({
    fName: "",
    lName: "",
    email: "",
    password: "",
    organization: "",
    contact: "",
    participantType: "",
  })
  const [error, setError] = useState("")
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);

  const handleChange = (field: keyof typeof formData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: event.target.value }))
    }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    try {
      const response = await fetch("http://localhost:9999/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({...formData, captchaValue}),
      })

      const data = await response.json()

      if (data?.success) {
        if (data?.token) {
          localStorage.setItem("felicity_token", data.token)
          router.push("/participant/onboarding")
        }
      } else {
        setError(data?.message || "Signup failed. Please try again.")
      }
    } catch (err) {
      setError("Signup failed. Please try again.")
    }
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center retro">
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>Felicity SignUp</CardTitle>
        <CardDescription>
          Enter your email below to create your account
        </CardDescription>
        <CardAction>
          <Button variant="link" asChild>
            <Link href="/login">Log In</Link>
          </Button>
        </CardAction>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      required
                      value={formData.fName}
                      onChange={handleChange("fName")}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      required
                      value={formData.lName}
                      onChange={handleChange("lName")}
                    />
                </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={formData.email}
                onChange={handleChange("email")}
              />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange("password")}
              />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="organization">Organization</Label>
                <Input
                  id="organization"
                  type="text"
                  placeholder="IIITH"
                  required
                  value={formData.organization}
                  onChange={handleChange("organization")}
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="contact">Contact Number</Label>
                <Input
                  id="contact"
                  type="text"
                  placeholder="1234567890"
                  required
                  value={formData.contact}
                  onChange={handleChange("contact")}
                />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Participant Type</Label>
              <Select
                value={formData.participantType}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, participantType: value }))
                }
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
        </CardContent>
        <CardFooter className="flex-col gap-2 mt-4">
          <ReCAPTCHA
            sitekey={process.env.NEXT_PUBLIC_SITE_KEY || ""}
            onChange={setCaptchaValue}
          />
          <Button type="submit" className="w-full">
            Sign Up
          </Button>
        </CardFooter>
      </form>
    </Card>
    {error && (
      <div className="mt-4 max-w-xl w-full bg-red-100 text-red-700 border border-red-300 px-4 py-2">
        {error}
      </div>
    )}
    </div>
  )
}
