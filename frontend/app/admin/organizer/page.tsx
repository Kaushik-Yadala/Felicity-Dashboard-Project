"use client"

import { AdminOrganizerCard } from "@/components/custom/adminOrganizerCard";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/8bit/alert"
import apiClient from "@/lib/apiClient";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ManageOrganizers() {

    const [organizers, setOrganizers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrganizers = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await apiClient.get("/organizers/admin");
                console.log("Organizers response:", response);
                if (response?.data?.organizers) {
                    setOrganizers(response.data.organizers);
                }
            } catch (error) {
                console.error("Error fetching organizers:", error);
                setError("Failed to load organizers. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrganizers();
    }, []);


    return (

        <div className="p-6 max-w-8xl mx-auto space-y-6 ">

            <div className="flex justify-between items-center mb-4">
                <div>
                    <div className="text-5xl font-bold mb-4 retro">
                        Manage Organizers
                    </div>
                    <div className="text-muted-foreground retro">Manage all organizers and clubs</div>
                </div>
                <Button variant="default" asChild>
                    <Link href="/admin/organizer/create">Create Organizer</Link>
                </Button>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="flex flex-wrap justify-start justify-between gap-4 mt-4 relative border-y-6 border-x-6 border-foreground dark:border-ring p-6">
                {loading && <p className="text-muted-foreground w-full">Loading organizers...</p>}
                {!loading && organizers.length === 0 && (
                    <p className="text-muted-foreground w-full">No organizers found.</p>
                )}
                {!loading && organizers.map((org, index) => (
                    <AdminOrganizerCard key={index} name={org.name} desc={org.desc} contact={org.contact} category={org.category} disabled={org.disabled} id={org._id}/>
                ))}
            </div>

        </div>

    );
}
