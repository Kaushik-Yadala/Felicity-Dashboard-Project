"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import apiClient from "@/lib/apiClient"
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/8bit/alert"
import Link from "next/link"

export default function Profile() {
  const router = useRouter()
  const [profileData, setProfileData] = useState({
    fName: "",
    lName: "",
    email: "",
    participantType: "",
    organization: "",
    contact: "",
    interests: [] as string[],
    following: [] as string[],
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await apiClient.get("/profile/edit")
        if (data?.data?.user) {
          const user = data.data.user
          setProfileData({
            fName: user.fName || "",
            lName: user.lName || "",
            email: user.email || "",
            participantType: user.participantType || "",
            organization: user.organization || "",
            contact: user.contact || "",
            interests: Array.isArray(user.interests) ? user.interests : [],
            following: Array.isArray(user.following)
              ? user.following.map((item: { name?: string; _id?: string } | string) =>
                  typeof item === "string" ? item : item.name || item._id || "Unknown"
                )
              : [],
          })
        }
      } catch (error) {
        console.error("Profile edit load error:", error)
        setError("Failed to load profile data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleChange = (field: "fName" | "lName" | "email" | "organization" | "contact") =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setProfileData((prev) => ({ ...prev, [field]: event.target.value }))
    }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      setSubmitting(true)
      setError(null)
      setSuccess(null)
      const payload = {
        fName: profileData.fName,
        lName: profileData.lName,
        email: profileData.email,
        organization: profileData.organization,
        contact: profileData.contact,
      }
      const data = await apiClient.patch("/profile/edit", payload)
      console.log("Profile update response:", data)
      if (data?.data?.success) {
        setSuccess("Profile updated successfully!")
        setTimeout(() => router.push("/participant/profile"), 2000)
      }
    } catch (error) {
      console.error("Profile update error:", error)
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
            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="font-semibold text-sm mb-2">First Name</p>
                <Input value={profileData.fName} onChange={handleChange("fName")} />
              </div>
              <div>
                <p className="font-semibold text-sm mb-2">Last Name</p>
                <Input value={profileData.lName} onChange={handleChange("lName")} />
              </div>
            </div>

            {/* Email */}
            <div>
              <p className="font-semibold text-sm mb-2">Email</p>
              <Input value={profileData.email} onChange={handleChange("email")} />
            </div>

            {/* Participant Type */}
            <div>
              <p className="font-semibold text-sm mb-2">Participant Type</p>
              <p className="text-lg">{profileData.participantType}</p>
            </div>

            {/* Contact */}
            <div>
              <p className="font-semibold text-sm mb-2">Contact</p>
              <Input value={profileData.contact} onChange={handleChange("contact")} />
            </div>

            {/* Organization */}
            <div>
              <p className="font-semibold text-sm mb-2">Organization</p>
              <Input value={profileData.organization} onChange={handleChange("organization")} />
            </div>

            {/* Interests */} // TODO: Implement
            <div>
              <p className="font-semibold text-sm mb-3">Interests</p>
              <div className="flex flex-wrap gap-2">
                {profileData.interests.map((interest) => (
                  <div
                    key={interest}
                    className="bg-foreground text-background px-3 py-1.5 text-sm border border-foreground cursor-pointer hover:bg-opacity-80 transition-all"
                  >
                    {interest}
                  </div>
                ))}
              </div>
            </div>

            {/* Following */} // TODO: Implement
            <div>
              <p className="font-semibold text-sm mb-3">Following</p>
              <div className="flex flex-wrap gap-2">
                {profileData.following.map((org) => (
                  <div
                    key={org}
                    className="bg-foreground text-background px-3 py-1.5 text-sm border border-foreground cursor-pointer hover:bg-opacity-80 transition-all">
                    {org}
                  </div>
                ))}
              </div>
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
