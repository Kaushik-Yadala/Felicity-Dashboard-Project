"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import apiClient from "@/lib/apiClient"
import { EventCard } from "@/components/custom/eventCard";
import { Button } from "@/components/ui/8bit/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/8bit/alert"

type EventData = {
    _id?: string
    name?: string
    desc?: string
    eventType?: string
    eligibility?: string
    registrationDeadline?: string
    eventStartDate?: string
    eventEndDate?: string
}

type OrganizerData = {
    name: string
    desc: string
    contact: string
    category: string
    events: EventData[]
}

export default function OrganizerPage() {
    const params = useParams()
    const organizerId = params?.id as string | undefined

    const [organizerData, setOrganizerData] = useState<OrganizerData>({
        name: "",
        desc: "",
        contact: "",
        category: "",
        events: [],
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const formatDate = (value?: string) => {
        if (!value) return ""
        return value.split("T")[0]
    }

    useEffect(() => {
        const fetchOrganizer = async () => {
            if (!organizerId) return
            try {
                setLoading(true)
                setError(null)
                const data = await apiClient.get(`/organizers/${organizerId}`)
                console.log("Organizer response:", data)
                if (data?.data.success && data?.data) {
                    const organizer = data.data.data.organizer || {}
                    console.log(organizer)
                    const events = Array.isArray(data.data.data.events) ? data.data.data.events : []

                    setOrganizerData({
                        name: organizer.name || "",
                        desc: organizer.desc || "",
                        contact: organizer.contact || "",
                        category: organizer.category || "",
                        events,
                    })
                }
            } catch (error) {
                console.error("Organizer fetch error:", error)
                setError("Failed to load organizer details. Please try again.")
            } finally {
                setLoading(false)
            }
        }

        fetchOrganizer()
    }, [organizerId])

    if (loading) {
        return (
            <div className="m-6 p-6 max-w-5/6 mx-auto retro">
                <p className="text-2xl text-center">Loading organizer details...</p>
            </div>
        )
    }

    return (
        <div className="m-6 p-6 max-w-5/6 mx-auto space-y-6 retro border-y-6 border-x-6 border-foreground dark:border-ring ">
            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <div className="flex flex-col gap-2">
                <div className="text-5xl font-bold mb-4 retro">
                    {organizerData.name || "Organizer"}
                </div>
                <div>
                    <div className="text-2xl mb-2">
                        Description:
                    </div>
                    <div className="text-muted-foreground mb-4">
                        {organizerData.desc || "No description available."}
                    </div>
                </div>
                <div>
                    <div className="text-2xl mb-2">
                        Category:
                    </div>
                    <div className="text-muted-foreground mb-4">
                        {organizerData.category || "Unknown"}
                    </div>
                </div>
                <div>
                    <div className="text-2xl mb-2">
                        Contact:
                    </div>
                    <div className="text-muted-foreground mb-4">
                        {organizerData.contact || "N/A"}
                    </div>
                </div>

                <div>
                    <div className="text-2xl mb-2">
                        Hosted Events:
                    </div>
                    <div className="flex flex-wrap justify-start justify-between gap-4 mt-4 relative border-y-6 border-x-6 border-foreground dark:border-ring p-6">
                        {organizerData.events.length === 0 && (
                            <div className="text-muted-foreground">No events found.</div>
                        )}
                        {organizerData.events.map((eventItem) => (
                            <EventCard
                                key={eventItem._id}
                                title={eventItem.name}
                                desc={eventItem.desc}
                                eventType={eventItem.eventType}
                                eligibility={eventItem.eligibility}
                                registrationDeadline={formatDate(eventItem.registrationDeadline)}
                                eventStartDate={formatDate(eventItem.eventStartDate)}
                                eventEndDate={formatDate(eventItem.eventEndDate)}
                                organizer={organizerData.name}
                                id={eventItem._id}
                                isOrganizer={false}
                            />
                        ))}
                    </div>
                </div>

            </div>

        </div>
    )
}