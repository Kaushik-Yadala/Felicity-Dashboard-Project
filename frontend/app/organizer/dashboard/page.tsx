"use client"

import { useEffect, useState } from "react"
import apiClient from "@/lib/apiClient"
import { EventCard } from "@/components/custom/eventCard";
import { OrganizerCard } from "@/components/custom/organizerCard";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/8bit/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/8bit/alert"

export default function Dashboard() {

    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await apiClient.get("/organizer/dashboard");
                // console.log("Dashboard response:", response);
                if (response?.data?.returnData) {
                    setEvents(response.data.returnData);
                    console.log("Dashboard events:", response.data.returnData);
                }
            } catch (error) {
                console.error("Error loading dashboard:", error);
                setError("Failed to load dashboard. Please try again.");
            } finally {
                setLoading(false);
            }
        }

        loadDashboard()
    }, [])

    return (

        <div className="p-6 max-w-8xl mx-auto space-y-6 ">

            <div className="text-5xl font-bold mb-4 retro">
                Dashboard
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="flex flex-wrap justify-start justify-between gap-4 mt-4 relative border-y-6 border-x-6 border-foreground dark:border-ring p-6">
                {loading && <p className="text-muted-foreground w-full">Loading dashboard...</p>}
                {!loading && events.length === 0 && (
                    <p className="text-muted-foreground w-full">No events found.</p>
                )}
                {!loading && events.map(
                    (e, index) => <EventCard key={index} title={e.name} eventType={e.eventType} status={e.status} registrations={e.registrations} attendance={e.attendance} revenue={e.revenue} id={e.id} isOrganizer={true}/>
                )}
            </div>

        </div>

    );
}
