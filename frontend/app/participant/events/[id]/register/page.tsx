"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import apiClient from "@/lib/apiClient"
import { Button } from "@/components/ui/8bit/button"
import { Input } from "@/components/ui/8bit/input"
import { Label } from "@/components/ui/8bit/label"
import { Textarea } from "@/components/ui/8bit/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/8bit/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/8bit/alert"
import Link from "next/link"

type FormField = {
    label?: string
    fieldType?: string
    options?: string[]
    required?: boolean
    order?: number
}

type Variant = {
    name?: string
    options?: string[]
}

type EventData = {
    name: string
    price: number
    variants?: Variant[]
    stockQuantity?: number
    purchaseLimit?: number
    form?: FormField[]
}

type FormResponse = {
    questionLabel: string
    answer: string
}

export default function RegisterPage() {
    const params = useParams()
    const router = useRouter()
    const eventId = params?.id as string | undefined

    const [eventData, setEventData] = useState<EventData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState<string | null>(null)
    
    const [formResponses, setFormResponses] = useState<{ [key: string]: string }>({})
    const [amount, setAmount] = useState<number>(1)


    useEffect(() => {
        const fetchRegistrationForm = async () => {
            if (!eventId) return
            
            try {
                setLoading(true)
                const response = await apiClient.get(`/events/${eventId}/register`)
                
                if (response?.data?.success) {
                    setEventData(response.data.event)
                    setError(null)
                } else {
                    setError(response?.data?.message || "Failed to load registration form")
                }
            } catch (err: any) {
                console.error("Registration form fetch error:", err)
                setError(err?.response?.data?.message || "Error loading registration form")
            } finally {
                setLoading(false)
            }
        }

        fetchRegistrationForm()
    }, [eventId])

    const handleFormChange = (label: string, value: string) => {
        setFormResponses(prev => ({ ...prev, [label]: value }))
    }

    const handleSubmit = async () => {
        if (!eventData) return

        // Validate required fields
        if (eventData.form) {
            for (const field of eventData.form) {
                if (field.required && field.label && !formResponses[field.label]) {
                    setError(`Please fill in the required field: ${field.label}`)
                    return
                }
            }
        }

        try {
            setSubmitting(true)
            setError(null)
            setSuccess(null)

            const payload: any = {}

            if (eventData.form && eventData.form.length > 0) {
                payload.formRes = eventData.form.map(field => ({
                    questionLabel: field.label || "",
                    answer: formResponses[field.label || ""] || ""
                }))
            }

            if (eventData.stockQuantity !== undefined) {
                // Merchandise event
                payload.amount = amount
            }

            const response = await apiClient.post(`/events/${eventId}/register`, payload)

            if (response?.data?.success) {
                // Ensure we have the registration ID before redirecting
                const registrationId = response?.data?.registrationId || response?.data?.registration?._id
                
                if (registrationId) {
                    // Successfully registered and have confirmation - show success message
                    setSuccess(`Registration successful! Ticket ID: ${response?.data?.ticketID || 'Generated'}. Redirecting...`)
                    
                    // Wait a moment for user to see success, then redirect
                    setTimeout(() => {
                        if(eventData.eventType === 'Normal'){
                        router.push(`/participant/registered/${registrationId}`)
                        }else{
                            router.push(`/participant/events/payment/${registrationId}`)
                        }
                    }, 2000)
                } else {
                    setError("Registration created but no confirmation received. Please check your dashboard.")
                    setTimeout(() => {
                        router.push('/participant/dashboard')
                    }, 3000)
                }
            } else {
                setError(response?.data?.message || "Registration failed")
            }
        } catch (err: any) {
            console.error("Registration error:", err)
            setError(err?.response?.data?.message || "Error submitting registration")
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="m-6 p-6 max-w-4xl mx-auto retro">
                <p className="text-2xl">Loading registration form...</p>
            </div>
        )
    }

    if (error && !eventData) {
        return (
            <div className="m-6 p-6 max-w-4xl mx-auto retro">
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
                <Button className="mt-4" variant="outline" asChild>
                    <Link href={`/participant/events/${eventId}`}>Back to Event</Link>
                </Button>
            </div>
        )
    }

    if (!eventData) return null

    return (
        <div className="m-6 p-6 max-w-4xl mx-auto space-y-6 retro border-y-6 border-x-6 border-foreground dark:border-ring">
            <div>
                <h1 className="text-5xl font-bold mb-2">Register for Event</h1>
                <h2 className="text-2xl text-muted-foreground mb-4">{eventData.name}</h2>
            </div>

            {success && (
                <Alert variant="default" className="bg-green-100 dark:bg-green-900 border-green-500">
                    <AlertTitle>Success!</AlertTitle>
                    <AlertDescription>{success}</AlertDescription>
                </Alert>
            )}

            {error && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="space-y-6">
                <div>
                    <div className="text-2xl mb-2">Price:</div>
                    <div className="text-muted-foreground mb-4">₹{eventData.price || 0}</div>
                </div>

                {/* Merchandise specific fields */}
                {eventData.stockQuantity !== undefined && (
                    <>
                        <div>
                            <div className="text-2xl mb-2">Stock Available:</div>
                            <div className="text-muted-foreground mb-4">{eventData.stockQuantity}</div>
                        </div>

                        <div>
                            <Label htmlFor="amount" className="text-xl mb-2 block">
                                Quantity {eventData.purchaseLimit ? `(Max: ${eventData.purchaseLimit})` : ""}
                            </Label>
                            <Input
                                id="amount"
                                type="number"
                                min="1"
                                max={eventData.purchaseLimit || eventData.stockQuantity}
                                value={amount}
                                onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
                                className="max-w-xs"
                            />
                        </div>

                        {eventData.variants && eventData.variants.length > 0 && (
                            <div>
                                <div className="text-2xl mb-2">Available Variants:</div>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {eventData.variants.map((variant, index) => (
                                        <div
                                            key={index}
                                            className="bg-foreground text-background px-3 py-1.5 text-sm"
                                        >
                                            {variant.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Custom Form Fields */}
                {eventData.form && eventData.form.length > 0 && (
                    <div>
                        <div className="text-2xl mb-4">Registration Form</div>
                        <div className="space-y-4">
                            {eventData.form
                                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                                .map((field, index) => (
                                    <div key={index}>
                                        <Label htmlFor={`field-${index}`} className="mb-2 block">
                                            {field.label}{field.required ? " *" : ""}
                                        </Label>

                                        {field.fieldType === "textarea" && (
                                            <Textarea
                                                id={`field-${index}`}
                                                value={formResponses[field.label || ""] || ""}
                                                onChange={(e) => handleFormChange(field.label || "", e.target.value)}
                                                required={field.required}
                                                placeholder={`Enter ${field.label}`}
                                            />
                                        )}

                                        {field.fieldType === "dropdown" && field.options && (
                                            <Select
                                                value={formResponses[field.label || ""] || undefined}
                                                onValueChange={(value) => handleFormChange(field.label || "", value)}
                                            >
                                                <SelectTrigger id={`field-${index}`}>
                                                    <SelectValue placeholder={`Select ${field.label}`} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {field.options.map((option, optIndex) => (
                                                        <SelectItem key={optIndex} value={option}>
                                                            {option}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}

                                        {(!field.fieldType || field.fieldType === "text") && (
                                            <Input
                                                id={`field-${index}`}
                                                type="text"
                                                value={formResponses[field.label || ""] || ""}
                                                onChange={(e) => handleFormChange(field.label || "", e.target.value)}
                                                required={field.required}
                                                placeholder={`Enter ${field.label}`}
                                            />
                                        )}

                                        {field.fieldType === "email" && (
                                            <Input
                                                id={`field-${index}`}
                                                type="email"
                                                value={formResponses[field.label || ""] || ""}
                                                onChange={(e) => handleFormChange(field.label || "", e.target.value)}
                                                required={field.required}
                                                placeholder={`Enter ${field.label}`}
                                            />
                                        )}

                                        {field.fieldType === "number" && (
                                            <Input
                                                id={`field-${index}`}
                                                type="number"
                                                value={formResponses[field.label || ""] || ""}
                                                onChange={(e) => handleFormChange(field.label || "", e.target.value)}
                                                required={field.required}
                                                placeholder={`Enter ${field.label}`}
                                            />
                                        )}
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                <div className="flex gap-3 pt-4">
                    <Button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-8"
                    >
                        {submitting ? "Submitting..." : "Complete Registration"}
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href={`/participant/events/${eventId}`}>Cancel</Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
