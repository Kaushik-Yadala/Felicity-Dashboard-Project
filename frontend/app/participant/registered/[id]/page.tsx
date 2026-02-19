"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/8bit/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/8bit/alert"
import Link from "next/link"
import apiClient from "@/lib/apiClient"
import Image from "next/image"

type Registration = {
    _id: string
    event: {
        _id: string
        name: string
        eventType: string
    }
    ticketID: string
    registrationStatus: string
}

export default function RegisteredPage() {
    const params = useParams()
    const router = useRouter()
    const eventId = params?.id as string | undefined

    const [registration, setRegistration] = useState<Registration | null>(null)
    const [qrCode, setQrCode] = useState<string>("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [cancelling, setCancelling] = useState(false)

    useEffect(() => {
        const fetchRegistration = async () => {
            if (!eventId) return

            try {
                setLoading(true)
                // Fetch all registrations and find the one for this event
                const response = await apiClient.get(`/profile/dashboard/registrations/${eventId}`)
                
                if (response?.data?.success) {
                    const eventReg = response.data.registration
                    

                    if (eventReg) {
                        setRegistration(eventReg)
                        // Generate QR code from ticket ID
                        const QRCode = require('qrcode')
                        const qrUrl = await QRCode.toDataURL(eventReg.ticketID)
                        setQrCode(qrUrl)
                    } else {
                        setError("Registration not found for this event")
                    }
                }
            } catch (err) {
                console.error("Error fetching registration:", err)
                setError("Failed to load registration details")
            } finally {
                setLoading(false)
            }
        }

        fetchRegistration()
    }, [eventId])

    const handleCancelRegistration = async () => {
        if (!registration) return

        if (!confirm("Are you sure you want to cancel this registration?")) {
            return
        }

        try {
            setCancelling(true)
            const response = await apiClient.patch(`/profile/dashboard/registrations/${registration._id}/cancel`)
            
            if (response?.data?.success) {
                alert("Registration cancelled successfully")
                router.push("/participant/dashboard")
            } else {
                setError("Failed to cancel registration")
            }
        } catch (err) {
            console.error("Error cancelling registration:", err)
            setError("Failed to cancel registration")
        } finally {
            setCancelling(false)
        }
    }

    if (loading) {
        return (
            <div className="m-6 p-6 max-w-4xl mx-auto retro">
                <p className="text-2xl">Loading registration details...</p>
            </div>
        )
    }

    if (error || !registration) {
        return (
            <div className="m-6 p-6 max-w-4xl mx-auto retro">
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error || "Registration not found"}</AlertDescription>
                </Alert>
                <div className="mt-4">
                    <Button variant="outline" asChild>
                        <Link href="/participant/dashboard">Back to Dashboard</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="m-6 p-6 max-w-4xl mx-auto space-y-6 retro border-y-6 border-x-6 border-foreground dark:border-ring">
            <div className="space-y-6">
                <div>
                    <h1 className="text-5xl font-bold mb-2">Registration Details</h1>
                    <p className="text-xl text-muted-foreground">
                        Status: <span className={`font-semibold ${
                            registration.registrationStatus === 'Registered' ? 'text-green-500' :
                            registration.registrationStatus === 'Attended' ? 'text-blue-500' :
                            registration.registrationStatus === 'Cancelled' ? 'text-red-500' :
                            'text-yellow-500'
                        }`}>
                            {registration.registrationStatus}
                        </span>
                    </p>
                </div>

                <div className="space-y-4">
                    <div>
                        <h2 className="text-2xl font-semibold mb-2">Event Name</h2>
                        <p className="text-xl text-muted-foreground">{registration.event.name}</p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold mb-2">Ticket ID</h2>
                        <p className="text-xl font-mono bg-muted p-3 rounded">{registration.ticketID}</p>
                    </div>

                    {qrCode && (
                        <div className="flex flex-col justify-center">
                            <h2 className="text-2xl font-semibold mb-2">QR Code</h2>
                            <div className="bg-white p-4 inline-block rounded">
                                <img src={qrCode} alt="QR Code" className="w-64 h-64" />
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                                Show this QR code at the event for entry
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex gap-4 pt-4">
                    {registration.registrationStatus !== 'Cancelled' && (
                        <Button
                            variant="outline"
                            className="text-red-500 hover:bg-red-500 hover:text-white"
                            onClick={handleCancelRegistration}
                            disabled={cancelling}
                        >
                            {cancelling ? "Cancelling..." : "Cancel Registration"}
                        </Button>
                    )}
                    <Button variant="outline" asChild>
                        <Link href={`/participant/events/${registration.event._id}`}>View Event Details</Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
