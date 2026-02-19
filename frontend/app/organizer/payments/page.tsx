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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/8bit/alert"

interface PaymentRequest {
    registrationId: string;
    ticketID: string;
    eventName: string;
    eventPrice: number;
    eventType: string;
    participantName: string;
    participantEmail: string;
    participantType: string;
    amount: number;
    totalPrice: number;
    paymentProof: string;
    createdAt: string;
}

export default function PaymentsPage() {
    const [payments, setPayments] = useState<PaymentRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const loadPayments = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiClient.get("/organizer/payments");
            if (response?.data?.success) {
                setPayments(response.data.payments);
            }
        } catch (error) {
            console.error("Error loading payments:", error);
            setError("Failed to load payment requests. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadPayments();
    }, []);

    const handleApprove = async (registrationId: string) => {
        try {
            setProcessingId(registrationId);
            setError(null);
            setSuccessMessage(null);
            const response = await apiClient.post(`/organizer/payments/${registrationId}/approve`);
            
            if (response?.data?.success) {
                setSuccessMessage("Payment approved successfully! Email sent to participant.");
                setPayments(prev => prev.filter(p => p.registrationId !== registrationId));
            } else {
                setError(response?.data?.message || "Failed to approve payment");
            }
        } catch (error: any) {
            console.error("Error approving payment:", error);
            setError(error?.response?.data?.message || "Failed to approve payment");
        } finally {
            setProcessingId(null);
        }
    }

    const handleReject = async (registrationId: string) => {
        try {
            setProcessingId(registrationId);
            setError(null);
            setSuccessMessage(null);
            const response = await apiClient.post(`/organizer/payments/${registrationId}/reject`);
            
            if (response?.data?.success) {
                setSuccessMessage("Payment rejected successfully.");
                setPayments(prev => prev.filter(p => p.registrationId !== registrationId));
            } else {
                setError(response?.data?.message || "Failed to reject payment");
            }
        } catch (error: any) {
            console.error("Error rejecting payment:", error);
            setError(error?.response?.data?.message || "Failed to reject payment");
        } finally {
            setProcessingId(null);
        }
    }

    return (
        <div className="p-6 max-w-8xl mx-auto space-y-6">
            <div className="text-5xl font-bold mb-4 retro">
                Payment Requests
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {successMessage && (
                <Alert>
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
            )}

            <div className="space-y-4 border-y-6 border-x-6 border-foreground dark:border-ring p-6">
                {loading && <p className="text-muted-foreground">Loading payment requests...</p>}
                
                {!loading && payments.length === 0 && (
                    <p className="text-muted-foreground">No pending payment requests.</p>
                )}

                {!loading && payments.map((payment) => (
                    <Card key={payment.registrationId} className="mb-4">
                        <CardHeader>
                            <CardTitle>{payment.eventName}</CardTitle>
                            <CardDescription>
                                Ticket ID: {payment.ticketID}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-semibold">Participant Details</p>
                                    <p className="text-sm">Name: {payment.participantName}</p>
                                    <p className="text-sm">Email: {payment.participantEmail}</p>
                                    <p className="text-sm">Type: {payment.participantType}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">Order Details</p>
                                    <p className="text-sm">Quantity: {payment.amount}</p>
                                    <p className="text-sm">Price per item: ₹{payment.eventPrice}</p>
                                    <p className="text-sm font-bold">Total: ₹{payment.totalPrice}</p>
                                </div>
                            </div>
                            
                            {payment.paymentProof && (
                                <div className="mt-4">
                                    <p className="text-sm font-semibold mb-2">Payment Proof:</p>
                                    <img 
                                        src={payment.paymentProof} 
                                        alt="Payment Proof" 
                                        className="max-w-full h-auto max-h-96 border-4 border-foreground rounded"
                                    />
                                </div>
                            )}
                            
                            <p className="text-xs text-muted-foreground">
                                Submitted: {new Date(payment.createdAt).toLocaleString()}
                            </p>
                        </CardContent>
                        <CardFooter className="flex gap-4">
                            <Button 
                                onClick={() => handleApprove(payment.registrationId)}
                                disabled={processingId === payment.registrationId}
                                variant="default"
                            >
                                {processingId === payment.registrationId ? "Processing..." : "Accept"}
                            </Button>
                            <Button 
                                onClick={() => handleReject(payment.registrationId)}
                                disabled={processingId === payment.registrationId}
                                variant="destructive"
                            >
                                {processingId === payment.registrationId ? "Processing..." : "Reject"}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
