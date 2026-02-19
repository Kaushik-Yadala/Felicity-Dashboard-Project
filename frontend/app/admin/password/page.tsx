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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/8bit/alert"
import { Textarea } from "@/components/ui/8bit/textarea"
import Link from "next/link"

export default function Dashboard() {

    const [passwordRequests, setPasswordRequests] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [comments, setComments] = useState<string>('')
    const [newPassword, setNewPassword] = useState<string | null>(null)

    const fetchPasswords = async () => {

        try {

            setLoading(true)
            setError(null)
            setNewPassword(null)

            const response = await apiClient.get("/admin/password-reset")

            if (response?.data?.success) {
                setPasswordRequests(response.data.requests)
            }else {
                setError("Failed to load password reset requests.")
            }

        }catch (err) {
            console.error("Error fetching password requests:", err)
            setError(`Failed to fetch: ${err}`)
        } finally {
            setLoading(false)
        }

    }

    const setStatusApprove = async (id: string) => {

        try {

            const payload = {
                id: id,
                status: "Approved",
                comments: comments
            }

            const response = await apiClient.patch(`/admin/password-reset/`, payload)

            console.log(response)

            if (response?.data?.success) {
                setNewPassword(response.data.newPassword)
            } else {
                setError(`Failed to update the request: ${response || "Unknown error"}`)
            }

        }catch (err) {
            console.error("Error updating password request:", err)
            setError(`Failed to update request: ${err}`)
        }

    }

    const setStatusReject = async (id: string) => {

        try {

            const payload = {
                id: id,
                status: "Rejected",
                comments: comments
            }

            const response = await apiClient.patch(`/admin/password-reset/`, payload)
            if (response?.data?.success) {
                setNewPassword(null)
                fetchPasswords()
            } else {
                setError("Failed to update the request.")
            }

        }catch (err) {
            console.error("Error updating password request:", err)
            setError(`Failed to update request: ${err}`)
        }

    }

    useEffect (() => {
        fetchPasswords()
    }, [])


    return (

        <div className="p-6 max-w-8xl mx-auto space-y-6 retro">

            <div className="text-5xl font-bold">
                Password Reset Requests
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {newPassword && (
                <Alert variant="default">
                    <AlertTitle>New Password</AlertTitle>
                    <AlertDescription>{newPassword}</AlertDescription>
                    <Button onClick={fetchPasswords} className="mt-4">
                        Done
                    </Button>
                </Alert>
            )}

            {loading && 
                <p className="text-muted-foreground w-full">Loading...</p>
            }

            {!loading && passwordRequests.length === 0 && (
                <p className="text-muted-foreground w-full">No password reset requests found.</p>
            )}


            <div className="flex flex-wrap justify-start justify-between gap-4 mt-4 relative border-y-6 border-x-6 border-foreground dark:border-ring p-6">

            {!loading && passwordRequests.toReversed().map((request) => (

                <Card className="flex w-full sm:w-[48%] lg:w-[32%]">
                    <CardHeader>
                        {request.organizer.name && <CardTitle>{request.organizer.name}</CardTitle>}
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <p><strong>Reason</strong></p>
                            <p className="text-muted-foreground">{request.reason}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <p><strong>Status</strong></p>
                            {request.status === "Pending" && <p className="text-yellow-500">{request.status}</p>}
                            {request.status === "Approved" && <p className="text-green-500">{request.status}</p>}
                            {request.status === "Rejected" && <p className="text-red-500">{request.status}</p>}
                        </div>
                        <div className="flex flex-col gap-2">
                            <p><strong>Comments:</strong></p>
                            <Textarea
                                placeholder="Add any comments for the organizer"
                                onChange={(e)=>{setComments(e.target.value)}}
                                disabled={request.status !== "Pending"}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-wrap gap-2">
                        <Button variant="outline" className="text-green-500 hover:text-white hover:bg-green-500" onClick={() => setStatusApprove(request._id)} disabled={request.status !== "Pending"}>Approve</Button>
                        <Button variant="outline" className="text-red-500 hover:text-white hover:bg-red-500" onClick={() => setStatusReject(request._id)} disabled={request.status !== "Pending"}>Reject</Button>
                    </CardFooter>
                </Card>

            ))} 
            </div>
        </div>

    );
}