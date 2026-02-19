"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import apiClient from "@/lib/apiClient"
import { EventCard } from "@/components/custom/eventCard"
import { Button } from "@/components/ui/8bit/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/8bit/alert"
import Link from "next/link"

type EventData = {
    _id?: string
    name?: string
    desc?: string
    eventType?: string
    eligibility?: string
    registrationDeadline?: string
    eventStartDate?: string
    eventEndDate?: string
    status?: string
}

type OrganizerData = {
    name: string
    desc: string
    email: string
    contact: string
    category: string
    discord: string
    valid: boolean
    events: EventData[]
}

export default function AdminOrganizerDetailPage() {
    const params = useParams()
    const router = useRouter()
    const organizerId = params?.id as string | undefined

    const [organizerData, setOrganizerData] = useState<OrganizerData>({
        name: "",
        desc: "",
        email: "",
        contact: "",
        category: "",
        discord: "",
        valid: true,
        events: [],
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [actionLoading, setActionLoading] = useState(false)

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
                    const events = Array.isArray(data.data.data.events) ? data.data.data.events : []

                    setOrganizerData({
                        name: organizer.name || "",
                        desc: organizer.desc || "",
                        email: organizer.email || "",
                        contact: organizer.contact || "",
                        category: organizer.category || "",
                        discord: organizer.discord || "",
                        valid: organizer.valid !== false,
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

    const handleDisable = async () => {
        try {
            setActionLoading(true)
            setError(null)
            await apiClient.patch('/admin/organizer/remove', { id: organizerId });
            setOrganizerData(prev => ({ ...prev, valid: false }));
        } catch (error) {
            console.error("Error disabling organizer:", error);
            setError("Failed to disable organizer. Please try again.")
        } finally {
            setActionLoading(false)
        }
    };

    const handleEnable = async () => {
        try {
            setActionLoading(true)
            setError(null)
            await apiClient.patch('/admin/organizer/enable', { id: organizerId });
            setOrganizerData(prev => ({ ...prev, valid: true }));
        } catch (error) {
            console.error("Error enabling organizer:", error);
            setError("Failed to enable organizer. Please try again.")
        } finally {
            setActionLoading(false)
        }
    };

    const handleRemove = async () => {
        if (!confirm("Are you sure you want to permanently remove this organizer?")) {
            return;
        }
        try {
            setActionLoading(true)
            setError(null)
            await apiClient.delete('/admin/organizer/delete', { data: { id: organizerId } });
            router.push('/admin/organizer');
        } catch (error) {
            console.error("Error removing organizer:", error);
            setError("Failed to remove organizer. Please try again.")
            setActionLoading(false)
        }
    };

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
            
            <div className="text-5xl font-bold retro">
                {organizerData.name || "Organizer"}
            </div>

            {!organizerData.valid && (
                <Alert variant="destructive">
                    <AlertTitle>Disabled</AlertTitle>
                    <AlertDescription>This organizer is currently disabled.</AlertDescription>
                </Alert>
            )}

            <div className="flex flex-col gap-4">
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
                        Email:
                    </div>
                    <div className="text-muted-foreground mb-4">
                        {organizerData.email || "N/A"}
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
                        Discord:
                    </div>
                    <div className="text-muted-foreground mb-4">
                        {organizerData.discord || "N/A"}
                    </div>
                </div>

                <div className="flex gap-2 mt-4">
                    {organizerData.valid ? (
                        <Button
                            variant="outline"
                            className="text-red-500 hover:bg-red-500 hover:text-white"
                            onClick={handleDisable}
                            disabled={actionLoading}
                        >
                            {actionLoading ? "Processing..." : "Disable Organizer"}
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            onClick={handleEnable}
                            disabled={actionLoading}
                        >
                            {actionLoading ? "Processing..." : "Enable Organizer"}
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        className="text-red-500 hover:bg-red-500 hover:text-white"
                        onClick={handleRemove}
                        disabled={actionLoading}
                    >
                        {actionLoading ? "Processing..." : "Remove Organizer"}
                    </Button>
                </div>

            </div>
        </div>
    )
}
