"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/8bit/card"
import { Button } from "@/components/ui/8bit/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/8bit/alert"
import Link from "next/link"
import { useEffect, useState } from "react"
import apiClient from "@/lib/apiClient"

export default function Profile() {
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    valid: true,
    category: "",
    contact: "",
    desc: ""
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await apiClient.get("organizer/profile")

        if (!data?.data?.success) {
          setError("Failed to load profile data.")
          return
        }

        console.log(data)

        const organizerData = data.data.organizerData || {}
        setProfileData({
          name: organizerData.name || "",
          email: organizerData.email || "",
          valid: organizerData.valid ?? true,
          category: organizerData.category || "",
          contact: organizerData.contact || "",
          desc: organizerData.desc || "",
        })
      } catch (err) {
        console.error("Profile error:", err)
        setError("Failed to load profile data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

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
        <Card>
          <div className="flex justify-between items-center mb-6">
            <CardHeader>
              <CardTitle className="text-3xl">Profile</CardTitle>
              <CardDescription>Your profile information</CardDescription>
            </CardHeader>
            <div className="pr-6 flex gap-3">
              <Button variant="outline">
                <Link href="/organizer/profile/passChange">Change Password</Link>
              </Button>
              <Button>
                <Link href="/organizer/profile/edit">Edit Profile</Link>
              </Button>
            </div>
          </div>

          <CardContent className="space-y-6">
            {/* First Name & Last Name */}
              <div>
                <p className="font-semibold text-sm mb-2">Name</p>
                <p className="text-lg">{profileData.name}</p>
              </div>

              <div>
                <p className="font-semibold text-sm mb-2">Description</p>
                <p className="text-lg">{profileData.desc}</p>
              </div>

            {/* Email */}
            <div>
              <p className="font-semibold text-sm mb-2">Email</p>
              <p className="text-lg">{profileData.email}</p>
            </div>

            {/* Participant Type */}
            <div>
              <p className="font-semibold text-sm mb-2">Category</p>
              <p className="text-lg">{profileData.category}</p>
            </div>

            {/* Contact */}
            <div>
              <p className="font-semibold text-sm mb-2">Contact</p>
              <p className="text-lg">{profileData.contact}</p>
            </div>

          </CardContent>
        </Card>
      </div>
    </main>
  )
}
