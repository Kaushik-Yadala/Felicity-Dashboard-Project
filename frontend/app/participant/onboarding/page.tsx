"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import apiClient from "@/lib/apiClient"
import { Button } from "@/components/ui/8bit/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/8bit/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/8bit/alert"

type Organizer = {
    _id: string
    name: string
    category: string
}

export default function OnboardingPage() {
    const router = useRouter()
    const [organizers, setOrganizers] = useState<Organizer[]>([])
    const [categories, setCategories] = useState<string[]>([])
    const [selectedInterests, setSelectedInterests] = useState<string[]>([])
    const [selectedOrganizers, setSelectedOrganizers] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchOnboardingData = async () => {
            try {
                setLoading(true)
                const response = await apiClient.get("/profile/onboarding")
                
                if (response?.data?.success) {
                    const orgs = response.data.data || []
                    setOrganizers(orgs)
                    
                    // Extract unique categories from organizers
                    const uniqueCategories = Array.from(
                        new Set(orgs.map((org: Organizer) => org.category).filter(Boolean))
                    )
                    setCategories(uniqueCategories)
                }
            } catch (err) {
                console.error("Error fetching onboarding data:", err)
                setError("Failed to load onboarding options")
            } finally {
                setLoading(false)
            }
        }

        fetchOnboardingData()
    }, [])

    const toggleInterest = (interest: string) => {
        setSelectedInterests(prev =>
            prev.includes(interest)
                ? prev.filter(i => i !== interest)
                : [...prev, interest]
        )
    }

    const toggleOrganizer = (organizerId: string) => {
        setSelectedOrganizers(prev =>
            prev.includes(organizerId)
                ? prev.filter(id => id !== organizerId)
                : [...prev, organizerId]
        )
    }

    const handleSubmit = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await apiClient.patch("/profile/onboarding", {
                interests: selectedInterests,
                following: selectedOrganizers
            })

            if (response?.data?.success) {
                router.push("/participant/dashboard")
            } else {
                setError("Failed to save preferences")
            }
        } catch (err) {
            console.error("Error saving preferences:", err)
            setError("Failed to save preferences. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const handleSkip = () => {
        router.push("/participant/dashboard")
    }

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6 retro">
            <div className="text-center mb-8">
                <h1 className="text-5xl font-bold mb-2">Welcome to Felicity!</h1>
                <p className="text-xl text-muted-foreground">
                    Let's personalize your experience
                </p>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl">Select Your Interests</CardTitle>
                    <p className="text-muted-foreground">Choose one or more topics you're interested in</p>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => toggleInterest(category)}
                                className={`px-4 py-2 border-2 transition-all ${
                                    selectedInterests.includes(category)
                                        ? "bg-foreground text-background border-foreground"
                                        : "bg-background text-foreground border-foreground hover:bg-muted"
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                    {selectedInterests.length > 0 && (
                        <p className="mt-4 text-sm text-muted-foreground">
                            Selected: {selectedInterests.join(", ")}
                        </p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl">Follow Organizers</CardTitle>
                    <p className="text-muted-foreground">Choose clubs and organizers to follow</p>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {organizers.map((org) => (
                            <div
                                key={org._id}
                                onClick={() => toggleOrganizer(org._id)}
                                className={`p-4 border-4 cursor-pointer transition-all ${
                                    selectedOrganizers.includes(org._id)
                                        ? "bg-foreground text-background border-foreground"
                                        : "bg-background text-foreground border-foreground dark:border-ring hover:bg-muted"
                                }`}
                            >
                                <h3 className="font-bold text-lg mb-1">{org.name}</h3>
                                <p className={`text-sm ${
                                    selectedOrganizers.includes(org._id)
                                        ? "text-background/80"
                                        : "text-muted-foreground"
                                }`}>
                                    {org.category}
                                </p>
                            </div>
                        ))}
                    </div>
                    {selectedOrganizers.length > 0 && (
                        <p className="mt-4 text-sm text-muted-foreground">
                            Following: {selectedOrganizers.length} organizer{selectedOrganizers.length !== 1 ? "s" : ""}
                        </p>
                    )}
                </CardContent>
            </Card>

            <div className="flex gap-4 justify-center pt-4">
                <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-8"
                >
                    {submitting ? "Saving..." : "Save & Continue"}
                </Button>
                <Button
                    variant="outline"
                    onClick={handleSkip}
                    disabled={submitting}
                >
                    Skip for Now
                </Button>
            </div>
        </div>
    )
}
