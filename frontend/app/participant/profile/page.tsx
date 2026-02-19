"use client"

import { useEffect, useState } from "react"
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
  const [profileData, setProfileData] = useState({
    fName: "",
    lName: "",
    email: "",
    participantType: "",
    organization: "",
    contact: "",
    interests: [],
    following: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Password reset states
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [resetting, setResetting] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await apiClient.get("/profile")
        console.log("Profile response:", data)
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
            following: Array.isArray(user.following) ? user.following : []
          })
        }
      } catch (error) {
        console.error("Profile error:", error)
        setError("Failed to load profile data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(null)

    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required")
      return
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long")
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match")
      return
    }

    try {
      setResetting(true)
      const response = await apiClient.patch("/profile/reset-password", {
        oldPassword,
        newPassword,
      })

      if (response?.data?.success) {
        setPasswordSuccess("Password updated successfully!")
        setOldPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setTimeout(() => {
          setShowPasswordReset(false)
          setPasswordSuccess(null)
        }, 2000)
      } else {
        setPasswordError(response?.data?.message || "Failed to update password")
      }
    } catch (error: any) {
      console.error("Password reset error:", error)
      setPasswordError(
        error?.response?.data?.message || "Failed to update password. Please try again."
      )
    } finally {
      setResetting(false)
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
        <Card>
          <div className="flex justify-between items-center mb-6">
            <CardHeader>
              <CardTitle className="text-3xl">Profile</CardTitle>
              <CardDescription>Your profile information</CardDescription>
            </CardHeader>
            <div className="pr-6 flex gap-2">
              <Button onClick={() => setShowPasswordReset(true)} variant="outline">
                Reset Password
              </Button>
              <Button>
                <Link href="/participant/profile/edit">Edit Profile</Link>
              </Button>
            </div>
          </div>

          <CardContent className="space-y-6">
            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="font-semibold text-sm mb-2">First Name</p>
                <p className="text-lg">{profileData.fName}</p>
              </div>
              <div>
                <p className="font-semibold text-sm mb-2">Last Name</p>
                <p className="text-lg">{profileData.lName}</p>
              </div>
            </div>

            {/* Email */}
            <div>
              <p className="font-semibold text-sm mb-2">Email</p>
              <p className="text-lg">{profileData.email}</p>
            </div>

            {/* Participant Type */}
            <div>
              <p className="font-semibold text-sm mb-2">Participant Type</p>
              <p className="text-lg">{profileData.participantType}</p>
            </div>

            {/* Contact */}
            <div>
              <p className="font-semibold text-sm mb-2">Contact</p>
              <p className="text-lg">{profileData.contact}</p>
            </div>

            {/* Organization */}
            <div>
              <p className="font-semibold text-sm mb-2">Organization</p>
              <p className="text-lg">{profileData.organization}</p>
            </div>

            {/* Interests */}
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

            {/* Following */}
            <div>
              <p className="font-semibold text-sm mb-3">Following</p>
              <div className="flex flex-wrap gap-2">
                {profileData.following.map((org) => (
                  <div
                    key={org}
                    className="bg-foreground text-background px-3 py-1.5 text-sm border border-foreground cursor-pointer hover:bg-opacity-80 transition-all"
                  >
                    {org.name}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Password Reset Modal */}
        {showPasswordReset && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle className="text-2xl">Reset Password</CardTitle>
                <CardDescription>Change your account password</CardDescription>
              </CardHeader>
              <form onSubmit={handlePasswordReset}>
                <CardContent className="space-y-4">
                  {passwordError && (
                    <Alert variant="destructive">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{passwordError}</AlertDescription>
                    </Alert>
                  )}
                  {passwordSuccess && (
                    <Alert className="bg-green-500 text-white border-green-500">
                      <AlertTitle>Success</AlertTitle>
                      <AlertDescription>{passwordSuccess}</AlertDescription>
                    </Alert>
                  )}

                  <div>
                    <label className="font-semibold text-sm mb-2 block">
                      Current Password
                    </label>
                    <Input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Enter current password"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-sm mb-2 block">
                      New Password
                    </label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-sm mb-2 block">
                      Confirm New Password
                    </label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowPasswordReset(false)
                      setOldPassword("")
                      setNewPassword("")
                      setConfirmPassword("")
                      setPasswordError(null)
                      setPasswordSuccess(null)
                    }}
                    disabled={resetting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={resetting}>
                    {resetting ? "Updating..." : "Update Password"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        )}
      </div>
    </main>
  )
}
