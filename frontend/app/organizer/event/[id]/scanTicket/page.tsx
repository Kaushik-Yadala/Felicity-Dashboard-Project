"use client"

import dynamic from "next/dynamic";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/8bit/card"
import { Button } from "@/components/ui/8bit/button"
import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/8bit/alert";
import apiClient from "@/lib/apiClient";
import { useParams } from "next/navigation"


const QRScanner = dynamic(
    () => import('@yudiel/react-qr-scanner').then((mod) => mod.Scanner),
    {
        ssr: false,
        loading: () => <p className="text-center p-4">Loading camera...</p>
    }
);


type EventData = {
    id?: string
    name?: string
    desc?: string
    eventType?: string
    eligibility?: string
    registrationDeadline?: string
    eventStartDate?: string
    eventEndDate?: string
    registrationLimit?: number
    eventTags?: string[]
    price?: number
    stockQuantity?: number
    purchaseLimit?: number
    variants?: { name?: string; options?: string[] }[]
    customForm?: { label?: string; fieldType?: string; options?: string[]; required?: boolean; order?: number }[]
    registrationList?: any[]
    registrations?: number
    attendance?: number
    revenue?: number
    registeredParticipants?: any[]
}

export default function ScanTicket() {

    const [scanResult, setScanResult] = useState<string | null>(null)
    const [correctEvent, setCorrectEvent] = useState<boolean>(true)
    const [message, setMessage] = useState<string>("")
    const params = useParams();
    const eventId = params.id;

    const [eventData, setEventData] = useState<EventData>({
        name: "",
        desc: "",
        eventType: "",
        eligibility: "",
        registrationDeadline: "",
        eventStartDate: "",
        eventEndDate: "",
        registrationLimit: 0,
        eventTags: [],
        price: 0,
        stockQuantity: 0,
        purchaseLimit: 0,
        variants: [],
        customForm: [],
        registrationList: [],
        registrations: 0,
        attendance: 0,
        revenue: 0,
        registeredParticipants: [],
    })
    const fetchEvent = async () => {
        if (!eventId) return
        try {
            const response = await apiClient.get(`/organizer/event/${eventId}`)

            if (response?.data?.success) {
                const event = response.data.event
                console.log("Event data fetched:", event)
                console.log("Registered participants:", event.registeredParticipants)
                setEventData({
                    name: event.name || "",
                    desc: event.desc || "",
                    eventType: event.eventType || "",
                    eligibility: event.eligibility || "",
                    registrationDeadline: event.registrationDeadline || "",
                    eventStartDate: event.eventStartDate || "",
                    eventEndDate: event.eventEndDate || "",
                    registrationLimit: event.registrationLimit ?? 0,
                    eventTags: Array.isArray(event.eventTags) ? event.eventTags : [],
                    price: event.price ?? 0,
                    stockQuantity: event.stockQuantity ?? 0,
                    purchaseLimit: event.purchaseLimit ?? 0,
                    variants: Array.isArray(event.variants) ? event.variants : [],
                    customForm: Array.isArray(event.customForm) ? event.customForm : [],
                    registrationList: Array.isArray(event.registrationList) ? event.registrationList : [],
                    registrations: event.registrations ?? 0,
                    attendance: event.attendance ?? 0,
                    revenue: event.revenue ?? 0,
                    registeredParticipants: Array.isArray(event.registeredParticipants) ? event.registeredParticipants : [],
                })
            }
        } catch (err) {
            console.error("Event fetch error:", err)
        }
    }

    useEffect(() => {

        fetchEvent()
    }, [eventId, message])

    const formatDate = (value?: string) => {
        if (!value) return ""
        return value.split("T")[0]
    }

    const downloadCSV = () => {
        if (!eventData.registeredParticipants || eventData.registeredParticipants.length === 0) {
            alert("No participants to download")
            return
        }

        // Build CSV headers
        const headers = ["Name", "Email", "Scanned", "Time"]

        // Build CSV rows
        const rows = eventData.registeredParticipants.map(reg => {
            const participant = reg.participant || {}

            return [
                `"${participant.fName || ''} ${participant.lName || ''}"`,
                `"${participant.email || ''}"`,
                `"${reg.registrationStatus==='Attended'?'Yes':(reg.registrationStatus==='Cancelled'?'cancelled':'No')}"`,
                `"${new Date(reg.attendanceDate).toLocaleDateString()}"`,
            ].join(',')
        })

        // Combine headers and rows
        const csvContent = [headers.join(','), ...rows].join('\n')

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `${eventData.name?.replace(/\s+/g, '_')}_participants.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleScan = async (result:any) => {

        if (result) {
            setScanResult(result[0].rawValue)
        }

        try {

            const payload = {
                ticketId: result[0].rawValue
            }

            const response = await apiClient.post(`/organizer/event/${eventId}/scan-ticket`, payload)

            console.log("Scan ticket response:", response);

            if (response) {
                setCorrectEvent(response.data.success)
                setMessage(response?.data?.message)
            }

            // fetchEvent()


        } catch (err) {
            console.error("Error scanning ticket:", err)
            setCorrectEvent(false)
            setMessage(`Error scanning ticket: ${err}`)
        }

    }

    return (
        <div className="flex flex-col items-center justify-center p-2 sm:p-4 retro min-h-screen">
            <div className="w-full max-w-sm px-2 sm:px-0">
                <Card className="w-full h-full overflow-hidden border-4">
                    <QRScanner
                        onScan={handleScan}
                        onError={(error:any) => console.log(error?.message)}
                    />
                </Card>
            </div>

            <div className="w-full max-w-sm mt-4 px-2 sm:px-0">
                {scanResult && (
                    <Card className="border-4">
                        <CardHeader>
                            <CardTitle className="text-lg sm:text-xl">Scanned Result</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs sm:text-sm break-all">{scanResult}</p>
                        </CardContent>
                        <CardFooter className="flex justify-center">

                            {!correctEvent &&
                                <div className="text-red-500 bg-red-100 p-2 rounded text-sm">
                                    {message}
                                </div>
                            }

                            {correctEvent &&
                                <div className="text-green-500 bg-green-100 p-2 rounded text-sm">
                                    {message}
                                </div>
                            }

                        </CardFooter>
                    </Card>
                )}
            </div>

            {eventData.registeredParticipants && eventData.registeredParticipants.length > 0 && (
                <div className="mt-8 w-full px-2 sm:px-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                        <div className="text-xl sm:text-3xl font-bold">Participant Details</div>
                        <Button onClick={downloadCSV} variant="default" className="w-full sm:w-auto">
                            Download CSV
                        </Button>
                    </div>
                    <div className="overflow-x-auto -mx-2 sm:mx-0">
                        <div className="inline-block min-w-full align-middle">
                            <table className="w-full border-4 border-foreground text-xs sm:text-base">
                                <thead className="bg-foreground text-background">
                                    <tr>
                                        <th className="border-2 border-foreground p-2 sm:p-3 text-left">Name</th>
                                        <th className="border-2 border-foreground p-2 sm:p-3 text-left hidden sm:table-cell">Email</th>
                                        <th className="border-2 border-foreground p-2 sm:p-3 text-left">Scanned</th>
                                        <th className="border-2 border-foreground p-2 sm:p-3 text-left hidden md:table-cell">Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {eventData.registeredParticipants.map((reg, index) => {
                                        const participant = reg.participant || {}
                                        const teamResponse = reg.formResponses?.find(
                                            (r: any) => r.questionLabel?.toLowerCase().includes('team')
                                        )
                                        
                                        return (
                                            <tr key={index} className="border-2 border-foreground hover:bg-muted">
                                                <td className="border-2 border-foreground p-2 sm:p-3">
                                                    <div className="flex flex-col">
                                                        <span>{participant.fName} {participant.lName}</span>
                                                        <span className="text-xs text-muted-foreground sm:hidden">{participant.email}</span>
                                                    </div>
                                                </td>
                                                <td className="border-2 border-foreground p-2 sm:p-3 hidden sm:table-cell">
                                                    {participant.email}
                                                </td>
                                                <td className="border-2 border-foreground p-2 sm:p-3">
                                                    <span className={`flex px-1 sm:px-2 py-1 justify-center text-xs sm:text-sm ${
                                                        reg.registrationStatus === 'Attended'
                                                            ? 'bg-green-500 text-white'
                                                            : reg.registrationStatus === 'Cancelled'
                                                            ? 'bg-red-500 text-white'
                                                            : 'bg-gray-500 text-white'
                                                    }`}>
                                                        {reg.registrationStatus === 'Attended' ? 'Yes' : reg.registrationStatus === 'Cancelled' ? 'Cancelled' : 'No'}
                                                    </span>
                                                </td>
                                                <td className="border-2 border-foreground p-2 sm:p-3 hidden md:table-cell">
                                                    {reg.attendanceDate ? new Date(reg.attendanceDate).toLocaleString() : 'N/A'}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}
