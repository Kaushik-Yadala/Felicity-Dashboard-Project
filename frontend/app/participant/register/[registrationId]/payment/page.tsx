"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/8bit/card"
import { Button } from "@/components/ui/8bit/button"
import { Input } from "@/components/ui/8bit/input"
import { Label } from "@/components/ui/8bit/label"
import apiClient from "@/lib/apiClient"

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const registrationId = params.registrationId

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string>("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError("Please select an image file")
        return
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB")
        return
      }

      setSelectedFile(file)
      setError("")
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile) {
      setError("Please select a payment screenshot")
      return
    }

    setUploading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append('paymentProof', selectedFile)
      formData.append('registrationId', registrationId as string)

      // TODO: Replace with actual backend endpoint
      const response = await apiClient.post(
        `/participant/register/${registrationId}/payment`,
        formData,
        {
          headers: {
          },
        }
      )

      if (response?.data?.success) {
        alert("Payment proof uploaded successfully!")
        router.push(`/participant/registered/${registrationId}`)
      }
    } catch (err: any) {
      console.error("Payment upload error:", err)
      setError(err?.response?.data?.message || "Failed to upload payment proof")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 retro min-h-screen">
      <div className="w-full max-w-md">
        <Card className="border-4">
          <CardHeader>
            <CardTitle className="text-2xl">Upload Payment Proof</CardTitle>
            <CardDescription>
              Please upload a screenshot or image of your payment confirmation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paymentProof">Payment Screenshot</Label>
                <Input
                  id="paymentProof"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">
                  Accepted formats: JPG, PNG, GIF (Max 5MB)
                </p>
              </div>

              {preview && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="border-4 border-foreground p-2">
                    <img
                      src={preview}
                      alt="Payment proof preview"
                      className="w-full h-auto max-h-64 object-contain"
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-100 border-2 border-red-500 text-red-700 p-3">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={!selectedFile || uploading}
                className="w-full"
              >
                {uploading ? "Uploading..." : "Submit Payment Proof"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={uploading}
            >
              Cancel
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
