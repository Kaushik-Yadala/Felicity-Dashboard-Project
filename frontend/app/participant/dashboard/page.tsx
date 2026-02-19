"use client"

import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/8bit/card"
import { Button } from "@/components/ui/8bit/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/8bit/tabs"
import { useEffect, useState } from "react"
import apiClient from "@/lib/apiClient"
import { EventCard } from "@/components/custom/eventCard"
import Link from "next/link"

export default function Dashboard() {

    const [upcoming, setUpcoming] = useState([]);
    const [normal, setNormal] = useState([]);
    const [merch, setMerch] = useState([]);
    const [closed, setClosed] = useState([]);
    const [cancelled, setCancelled] = useState([]);
    const [registrations, setRegistrations] = useState([]);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const [upcomingData, normalData, merchData, closedData, cancelledData, registrationsData] = await Promise.all([
                    apiClient.get("/profile/dashboard/upcoming"),
                    apiClient.get("/profile/dashboard/history/normal"),
                    apiClient.get("/profile/dashboard/history/merch"),
                    apiClient.get("/profile/dashboard/history/closed"),
                    apiClient.get("/profile/dashboard/history/cancelled"),
                    apiClient.get("/profile/dashboard/registrations"),
                ])

                setUpcoming(upcomingData.data.upcomingEvents || [])
                setNormal(normalData.data.upcomingEvents || [])
                setMerch(merchData.data.upcomingEvents || [])
                setClosed(closedData.data.upcomingEvents || [])
                setCancelled(cancelledData.data.upcomingEvents || [])
                setRegistrations(registrationsData.data.registrations || [])

                console.log(registrationsData.data.registrations)

            } catch (error) {
                console.error("Error loading dashboard:", error)
            }
        }

        loadDashboard()

    }, [])


    return (

        <div className="p-6 max-w-8xl mx-auto space-y-6 retro">

            <div className="text-5xl font-bold">
                Dashboard
            </div>

            <div className="text-2xl font-semibold mt-4">
                Upcoming Events
            </div>
            <div className="flex flex-wrap justify-start gap-4 mt-4 border-y-6 border-x-6 border-foreground dark:border-ring p-6">
                {upcoming && upcoming.map((event:any, index) => (
                    <EventCard key={index} title={event.name} eventType={event.type} organizer={event.organizer} eventStartDate={event.startDate} eventEndDate={event.endDate} id={event.id} isOrganizer={false}/>
                ))}
            </div>
            <div>

                <div className="text-2xl font-semibold mt-4">
                    Participation History
                </div>

                <Tabs defaultValue="normal" className="w-full mt-4">
                    <TabsList>
                        <TabsTrigger value="normal">Normal</TabsTrigger>
                        <TabsTrigger value="merch">Merchandise</TabsTrigger>
                        <TabsTrigger value="completed">Completed</TabsTrigger>
                        <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                    </TabsList>
                    <TabsContent value="normal">
                        <div className="flex flex-wrap justify-between gap-4 mt-4  border-y-6 border-x-6 border-foreground dark:border-ring p-6">
                            {normal && normal.map((event:any, index) => (
                                <EventCard key={index} title={event.name} eventType={event.type} organizer={event.organizer} eventStartDate={event.startDate} eventEndDate={event.endDate} id={event.id} isOrganizer={false}/>
                            ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="merch">
                        <div className="flex flex-wrap justify-between gap-4 mt-4  border-y-6 border-x-6 border-foreground dark:border-ring p-6">
                            {merch && merch.map((event:any, index) => (
                                <EventCard key={index} title={event.name} eventType={event.type} organizer={event.organizer} eventStartDate={event.startDate} eventEndDate={event.endDate} id={event.id} isOrganizer={false}/>
                            ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="completed">
                        <div className="flex flex-wrap justify-between gap-4 mt-4  border-y-6 border-x-6 border-foreground dark:border-ring p-6">
                            {closed && closed.map((event:any, index) => (
                                <EventCard key={index} title={event.name} eventType={event.type} organizer={event.organizer} eventStartDate={event.startDate} eventEndDate={event.endDate} id={event.id} isOrganizer={false}/>
                            ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="cancelled">
                        <div className="flex flex-wrap justify-between gap-4 mt-4  border-y-6 border-x-6 border-foreground dark:border-ring p-6">
                            {cancelled && cancelled.map((event:any, index) => (
                                <EventCard key={index} title={event.name} eventType={event.type} organizer={event.organizer} eventStartDate={event.startDate} eventEndDate={event.endDate} id={event.id} isOrganizer={false}/>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
            <div className="text-2xl font-semibold mt-4">
                Event Records
            </div>
            <div className="flex flex-wrap justify-start gap-4 mt-4 border-y-6 border-x-6 border-foreground dark:border-ring p-6">
                {registrations.length === 0 && (
                    <p className="text-muted-foreground w-full">No event registrations found.</p>
                )}
                {registrations.map((reg:any) => (
                    <Card key={reg._id} className="w-full sm:w-[48%] lg:w-[32%]">
                        <CardHeader>
                            <CardTitle>{reg.event?.name || "Event"}</CardTitle>
                            <CardDescription>
                                Type: {reg.event?.eventType || "N/A"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div>
                                    <strong>Organizer:</strong>{" "}
                                    <span className="text-muted-foreground">
                                        {reg.event?.organizer?.name || "Unknown"}
                                    </span>
                                </div>
                                <div>
                                    <strong>Status:</strong>{" "}
                                    <span className={`font-semibold ${
                                        reg.registrationStatus === 'Registered' ? 'text-green-500' :
                                        reg.registrationStatus === 'Attended' ? 'text-blue-500' :
                                        reg.registrationStatus === 'Cancelled' ? 'text-red-500' :
                                        'text-yellow-500'
                                    }`}>
                                        {reg.registrationStatus}
                                    </span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Ticket ID: {reg.ticketID}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" asChild className="w-full">
                                <Link href={`/participant/registered/${reg._id}`}>
                                    View Details
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

        </div>

    );
}