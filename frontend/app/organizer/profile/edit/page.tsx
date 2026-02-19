"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/8bit/card"
import { Button } from "@/components/ui/8bit/button"
import { Input } from "@/components/ui/8bit/input"
import { Textarea } from "@/components/ui/8bit/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/8bit/alert"
import api from "@/lib/apiClient"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function EditProfile() {
  const router = useRouter()
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    valid: true,
    category: "",
    contact: "",
    desc: "",
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadProfile = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await api.get("organizer/profile")

        if (!isMounted) {
          return
        }

        if (!response?.data?.success) {
          setError("Failed to load profile data.")
          return
        }

        const organizerData = response.data.organizerData || {}
        setProfileData({
          name: organizerData.name || "",
          email: organizerData.email || "",
          valid: organizerData.valid ?? true,
          category: organizerData.category || "",
          contact: organizerData.contact || "",
          desc: organizerData.desc || "",
        })
        console.log(response)
      } catch (err) {
        console.error(err)
        if (isMounted) {
          setError("Failed to load profile data. Please try again.")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      isMounted = false
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      setError(null)
      setSuccess(null)
      
      const response = await api.patch("organizer/profile", {
        name: profileData.name,
        category: profileData.category,
        contact: profileData.contact,
        desc: profileData.desc,
      })

      if (response?.data?.success) {
        setSuccess("Profile updated successfully!")
        setTimeout(() => router.push("/organizer/profile"), 2000)
      } else {
        setError("Failed to update profile.")
      }
    } catch (err) {
      console.error(err)
      setError("Failed to update profile. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-2xl text-center">Loading profile...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="p-6">
      <div className="max-w-4xl mx-auto">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-6 bg-green-500 text-white border-green-500">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        <Card>
          <div className="flex justify-between items-center mb-6">
            <CardHeader>
              <CardTitle className="text-3xl w-md">Edit Profile</CardTitle>
            </CardHeader>
          </div>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
            <div>
              <p className="font-semibold text-sm mb-2">Name</p>
              <Input
                value={profileData.name}
                onChange={(event) =>
                  setProfileData((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
              />
            </div>

            <div>
              <p className="font-semibold text-sm mb-2">Description</p>
              <Textarea
                className="h-50"
                value={profileData.desc}
                onChange={(event) =>
                  setProfileData((prev) => ({
                    ...prev,
                    desc: event.target.value,
                  }))
                }
              />
            </div>

            <div>
              <p className="font-semibold text-sm mb-2">Email</p>
              <p className="text-lg">{profileData.email}</p>
            </div>

            <div>
              <p className="font-semibold text-sm mb-2">Category</p>
              <Input
                value={profileData.category}
                onChange={(event) =>
                  setProfileData((prev) => ({
                    ...prev,
                    category: event.target.value,
                  }))
                }
              />
            </div>

            <div>
              <p className="font-semibold text-sm mb-2">Contact</p>
              <Input
                value={profileData.contact}
                onChange={(event) =>
                  setProfileData((prev) => ({
                    ...prev,
                    contact: event.target.value,
                  }))
                }
              />
            </div>

            <div className="flex justify-end">
              <Button variant="default" type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
          </form>
        </Card>
      </div>
    </main>
  )
}
