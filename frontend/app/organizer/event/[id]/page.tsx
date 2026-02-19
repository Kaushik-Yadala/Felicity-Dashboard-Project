"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import apiClient from "@/lib/apiClient"
import { Button } from "@/components/ui/8bit/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/8bit/alert"
import { socket } from "@/lib/socket"
import MessageCard from "@/components/custom/messageCard"
import { Input } from "@/components/ui/8bit/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/8bit/card"

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

export default function OrganizerEventPage() {

    const params = useParams()
    const router = useRouter()
    const eventId = params?.id as string | undefined

    const [currentAnnouncement, setCurrentAnnouncement] = useState("");
    const [currentReply, setCurrentReply] = useState("");
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);

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
        registeredParticipants: []
    })

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const sendMessage = async (type: string, referencedMessageId?: string) => {
        let content = '';
        if (referencedMessageId) {
            content = currentReply.trim();
        } else {
            content = currentAnnouncement.trim();
        }
        
        if (!content) return;

        const messageData = {
            eventId: eventId,
            content: content,
            senderId: socket.id,
            messageType: referencedMessageId ? 'response' : type,
            referencedMessageId: referencedMessageId || null,
            senderName: "Organizer"
        }

        await socket.emit("message", messageData);

        if (referencedMessageId) {
            setCurrentReply("");
            setReplyingTo(null);
        } else {
            setCurrentAnnouncement("");
        }
    }

    const handleReply = (messageId: string) => {
        setReplyingTo(messageId);
    };

    const getRepliesForMessage = (messageId: string) => {
        return messages.filter(msg => 
            msg.messageType === 'response' && 
            msg.referencedMessageId === messageId
        );
    };

    const getReplyCount = (messageId: string) => {
        return getRepliesForMessage(messageId).length;
    };

    const handleDeleteMessage = async (messageId: string) => {
        // Emit socket event to update all participants
        socket.emit("messageStatusUpdate", {
            eventId: eventId,
            messageId: messageId,
            status: 'deleted'
        });
        
        setMessages(prev => prev.map(msg => 
            msg._id === messageId || msg.id === messageId 
                ? { ...msg, status: 'deleted' } 
                : msg
        ));
    };

    const handlePinMessage = async (messageId: string) => {
        const message = messages.find(msg => msg._id === messageId || msg.id === messageId);
        const newStatus = message?.status === 'pinned' ? 'normal' : 'pinned';
        
        // Emit socket event to update all participants
        socket.emit("messageStatusUpdate", {
            eventId: eventId,
            messageId: messageId,
            status: newStatus
        });
        
        setMessages(prev => prev.map(msg => 
            msg._id === messageId || msg.id === messageId 
                ? { ...msg, status: newStatus } 
                : msg
        ));
    };

    useEffect(() => {
        // join room for communication
        socket.connect();
        socket.emit("joinRoom", eventId);

        // Listen for previous messages
        socket.on("previousMessages", (previousMessages) => {
            setMessages(previousMessages);
        })

        // Listen for new messages
        socket.on("newMessage", (message) => {
            setMessages((prev)=>([...prev, message]));
        })

        // Listen for message status updates (pin/delete)
        socket.on("messageStatusUpdate", (data) => {
            setMessages(prev => prev.map(msg => 
                msg._id === data.messageId || msg.id === data.messageId 
                    ? { ...msg, status: data.status } 
                    : msg
            ));
        })

        const fetchEvent = async () => {
            if (!eventId) return
            try {
                setLoading(true)
                const response = await apiClient.get(`/organizer/event/${eventId}`)
                
                if (response?.data?.success) {
                    const event = response.data.event
                    setEventData({
                        id: eventId,
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
                        registeredParticipants: Array.isArray(event.registeredParticipants) ? event.registeredParticipants : []
                    })
                    setError(null)
                } else {
                    setError(response?.data?.message || "Failed to fetch event")
                }
            } catch (err) {
                console.error("Event fetch error:", err)
                setError("Error loading event details. Please try again.")
            } finally {
                setLoading(false)
            }
        }

        fetchEvent()

        return () => {
            socket.emit("leaveRoom", eventId)
            socket.off("previousMessages")
            socket.off("newMessage")
            socket.off("messageStatusUpdate")
            socket.disconnect()
        };
    }, [eventId])

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
        const headers = ["Name", "Email", "Reg Date", "Payment", "Team", "Attendance"]

        // Build CSV rows
        const rows = eventData.registeredParticipants.map(reg => {
            const participant = reg.participant || {}
            const teamResponse = reg.formResponses?.find(
                (r: any) => r.questionLabel?.toLowerCase().includes('team')
            )
            
            return [
                `"${participant.fName || ''} ${participant.lName || ''}"`,
                `"${participant.email || ''}"`,
                `"${new Date(reg.createdAt).toLocaleDateString()}"`,
                `"${reg.payment || ''}"`,
                `"${teamResponse?.answer || 'N/A'}"`,
                `"${reg.registrationStatus || ''}"`
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

    if (loading) {
        return (
            <div className="m-6 p-6 max-w-5/6 mx-auto">
                <div className="text-2xl">Loading event details...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="m-6 p-6 max-w-5/6 mx-auto">
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="m-6 p-6 max-w-5/6 mx-auto space-y-6 retro border-y-6 border-x-6 border-foreground dark:border-ring">
            <div className="flex justify-between items-center mb-4">
                <div className="text-5xl font-bold retro">
                    {eventData.name || "Event"}
                </div>
                <div className="flex flex-wrap gap-4">
                    <Button 
                        variant="outline" 
                        onClick={() => router.push(`/organizer/event/${eventId}/scanTicket`)}
                    >
                        scanTickets
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={() => router.push(`/organizer/event/${eventId}/edit`)}
                    >
                        Edit Event
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                {/* Stats Section */}
                <div className="bg-muted p-4 rounded-lg mb-4">
                    <div className="text-3xl font-bold mb-4">Event Statistics</div>
                    <div className="flex flex-wrap justify-between gap-4">
                        <div>
                            <div className="text-xl mb-1">Total Registrations:</div>
                            <div className="text-2xl font-semibold text-muted-foreground">
                                {eventData.registrations}
                            </div>
                        </div>
                        <div>
                            <div className="text-xl mb-1">Attendance:</div>
                            <div className="text-2xl font-semibold text-muted-foreground">
                                {eventData.attendance}
                            </div>
                        </div>
                        <div>
                            <div className="text-xl mb-1">Revenue:</div>
                            <div className="text-2xl font-semibold text-muted-foreground">
                                ₹{eventData.revenue}
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="text-2xl mb-2">Description:</div>
                    <div className="text-muted-foreground mb-4">
                        {eventData.desc || "No description available."}
                    </div>
                </div>

                <div>
                    <div className="text-2xl mb-2">Event Type:</div>
                    <div className="text-muted-foreground mb-4">
                        {eventData.eventType || "N/A"}
                    </div>
                </div>

                <div>
                    <div className="text-2xl mb-2">Eligibility:</div>
                    <div className="text-muted-foreground mb-4">
                        {eventData.eligibility || "N/A"}
                    </div>
                </div>

                <div>
                    <div className="text-2xl mb-2">Registration Deadline:</div>
                    <div className="text-muted-foreground mb-4">
                        {formatDate(eventData.registrationDeadline) || "N/A"}
                    </div>
                </div>

                <div>
                    <div className="text-2xl mb-2">Event Dates:</div>
                    <div className="text-muted-foreground mb-4">
                        {formatDate(eventData.eventStartDate)}{eventData.eventStartDate ? " to " : ""}{formatDate(eventData.eventEndDate)}
                    </div>
                </div>

                <div>
                    <div className="text-2xl mb-2">Registration Limit:</div>
                    <div className="text-muted-foreground mb-4">
                        {eventData.registrationLimit ?? "No limit"}
                    </div>
                </div>

                <div>
                    <div className="text-2xl mb-2">Price:</div>
                    <div className="text-muted-foreground mb-4">
                        ₹{eventData.price ?? 0}
                    </div>
                </div>

                <div>
                    <div className="text-2xl mb-2">Tags:</div>
                    <div>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {eventData.eventTags && eventData.eventTags.length > 0 ? (
                                eventData.eventTags.map((tag) => (
                                    <div
                                        key={tag}
                                        className="bg-foreground text-background px-3 py-1.5 text-sm border border-foreground"
                                    >
                                        {tag}
                                    </div>
                                ))
                            ) : (
                                <div className="text-muted-foreground">No tags</div>
                            )}
                        </div>
                    </div>
                </div>

                {eventData.eventType === "Merchandise" && (
                    <>
                        <div>
                            <div className="text-2xl mb-2">Stock Quantity:</div>
                            <div className="text-muted-foreground mb-4">
                                {eventData.stockQuantity ?? 0}
                            </div>
                        </div>
                        <div>
                            <div className="text-2xl mb-2">Purchase Limit:</div>
                            <div className="text-muted-foreground mb-4">
                                {eventData.purchaseLimit ?? 0}
                            </div>
                        </div>
                        <div>
                            <div className="text-2xl mb-2">Variants:</div>
                            <div>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {eventData.variants && eventData.variants.length > 0 ? (
                                        eventData.variants.map((variant, index) => (
                                            <div key={index} className="flex flex-col gap-1 bg-muted p-3 rounded">
                                                <div className="font-semibold">{variant.name || "Variant"}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {variant.options && variant.options.length > 0 
                                                        ? variant.options.join(", ") 
                                                        : "No options"}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-muted-foreground">No variants</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Custom Form Section */}
                {eventData.customForm && eventData.customForm.length > 0 && (
                    <div>
                        <div className="text-2xl mb-2">Custom Registration Form:</div>
                        <div className="space-y-3 mb-4">
                            {eventData.customForm
                                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                                .map((field, index) => (
                                    <div key={index} className="bg-muted p-3 rounded">
                                        <div className="font-semibold">
                                            {field.label}{field.required ? " *" : ""}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Type: {field.fieldType || "text"}
                                        </div>
                                        {field.options && field.options.length > 0 && (
                                            <div className="text-sm text-muted-foreground">
                                                Options: {field.options.join(", ")}
                                            </div>
                                        )}
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                {/* Registrations List */}
                <div>
                    <div className="text-2xl mb-2">Registrations ({eventData.registrationList?.length ?? 0}):</div>
                    <div className="text-muted-foreground mb-4">
                        {eventData.registrationList && eventData.registrationList.length > 0 
                            ? `${eventData.registrationList.length} participants registered` 
                            : "No registrations yet"}
                    </div>
                </div>

                {/* Registered Participants Details Table */}
                {eventData.registeredParticipants && eventData.registeredParticipants.length > 0 && (
                    <div className="mt-8">
                        <div className="flex flex-wrap justify-between items-center mb-4">
                            <div className="text-3xl font-bold">Participant Details</div>
                            <Button onClick={downloadCSV} variant="default">
                                Download CSV
                            </Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full border-4 border-foreground">
                                <thead className="bg-foreground text-background">
                                    <tr>
                                        <th className="border-2 border-foreground p-3 text-left">Name</th>
                                        <th className="border-2 border-foreground p-3 text-left">Email</th>
                                        <th className="border-2 border-foreground p-3 text-left">Reg Date</th>
                                        <th className="border-2 border-foreground p-3 text-left">Payment</th>
                                        <th className="border-2 border-foreground p-3 text-left">Team</th>
                                        <th className="border-2 border-foreground p-3 text-left">Attendance</th>
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
                                                <td className="border-2 border-foreground p-3">
                                                    {participant.fName} {participant.lName}
                                                </td>
                                                <td className="border-2 border-foreground p-3">
                                                    {participant.email}
                                                </td>
                                                <td className="border-2 border-foreground p-3">
                                                    {new Date(reg.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="border-2 border-foreground p-3">
                                                    <span className={`px-2 py-1 ${
                                                        reg.payment === 'Completed' 
                                                            ? 'bg-green-500 text-white' 
                                                            : reg.payment === 'Failed'
                                                            ? 'bg-red-500 text-white'
                                                            : 'bg-yellow-500 text-black'
                                                    }`}>
                                                        {reg.payment}
                                                    </span>
                                                </td>
                                                <td className="border-2 border-foreground p-3">
                                                    {teamResponse?.answer || 'N/A'}
                                                </td>
                                                <td className="border-2 border-foreground p-3">
                                                    <span className={`px-2 py-1 ${
                                                        reg.registrationStatus === 'Attended'
                                                            ? 'bg-green-500 text-white'
                                                            : reg.registrationStatus === 'Cancelled'
                                                            ? 'bg-red-500 text-white'
                                                            : 'bg-gray-500 text-white'
                                                    }`}>
                                                        {reg.registrationStatus}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Communication Area - Organizer View */}
            <div className="mt-8">
                <Card className="border-4">
                    <CardHeader>
                        <CardTitle className="text-3xl">Event Communication</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Announcements Section */}
                        <div className="space-y-2">
                            <h3 className="text-lg font-bold text-purple-700">Announcements</h3>
                            <div className="space-y-3">
                                {messages.filter(msg => msg.messageType === 'announcement').length === 0 ? (
                                    <p className="text-center text-muted-foreground">No announcements yet.</p>
                                ) : (
                                    messages
                                        .filter(msg => msg.messageType === 'announcement')
                                        .map((message) => (
                                            <div key={message._id || message.id} className="relative">
                                                <MessageCard
                                                    id={message._id || message.id}
                                                    eventId={message.eventId || eventId || ""}
                                                    messageType={message.messageType || "announcement"}
                                                    senderId={message.senderId || ""}
                                                    senderName={message.senderName || "Organizer"}
                                                    organizerId={message.organizerId || ""}
                                                    content={message.content || ""}
                                                    status={message.status || "active"}
                                                    referenceCount={getReplyCount(message._id || message.id)}
                                                    replies={getRepliesForMessage(message._id || message.id)}
                                                    onReply={handleReply}
                                                />
                                                <div className="flex gap-2 mt-2">
                                                    <Button 
                                                        size="sm" 
                                                        variant="destructive"
                                                        onClick={() => handleDeleteMessage(message._id || message.id)}
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                )}
                            </div>
                            
                            {/* Announcement Input */}
                            <div className="flex gap-2 mt-4">
                                <Input
                                    type="text"
                                    placeholder="Make an announcement..."
                                    value={currentAnnouncement}
                                    onChange={(e) => setCurrentAnnouncement(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault()
                                            sendMessage('announcement')
                                        }
                                    }}
                                    className="flex-1"
                                />
                                <Button 
                                    onClick={() => sendMessage('announcement')}
                                    disabled={!currentAnnouncement.trim()}
                                >
                                    Announce
                                </Button>
                            </div>
                        </div>

                        {/* Pinned Messages */}
                        {messages.filter(msg => msg.messageType === 'message' && msg.status === 'pinned').length > 0 && (
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-blue-700">Pinned Messages</h3>
                                <div className="space-y-3">
                                    {messages
                                        .filter(msg => msg.messageType === 'message' && msg.status === 'pinned')
                                        .map((message) => (
                                            <div key={message._id || message.id} className="relative">
                                                <MessageCard
                                                    id={message._id || message.id}
                                                    eventId={message.eventId || eventId || ""}
                                                    messageType={message.messageType || "message"}
                                                    senderId={message.senderId || ""}
                                                    senderName={message.senderName || "Anonymous"}
                                                    organizerId={message.organizerId || ""}
                                                    content={message.content || ""}
                                                    status={message.status || "active"}
                                                    referenceCount={getReplyCount(message._id || message.id)}
                                                    replies={getRepliesForMessage(message._id || message.id)}
                                                    onReply={handleReply}
                                                />
                                                <div className="flex gap-2 mt-2">
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline"
                                                        onClick={() => handlePinMessage(message._id || message.id)}
                                                    >
                                                        Unpin
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        variant="destructive"
                                                        onClick={() => handleDeleteMessage(message._id || message.id)}
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        )}

                        {/* Messages Display */}
                        <div className="max-h-96 overflow-y-auto space-y-3 p-4 bg-muted/20 border-2 border-foreground">
                            <h3 className="text-lg font-bold mb-2">Messages</h3>
                            {messages.filter(msg => msg.messageType === 'message' && msg.status !== 'pinned').length === 0 ? (
                                <p className="text-center text-muted-foreground">No messages yet.</p>
                            ) : (
                                messages
                                    .filter(msg => msg.messageType === 'message' && msg.status !== 'pinned')
                                    .map((message) => (
                                        <div key={message._id || message.id} className="relative">
                                            <MessageCard
                                                id={message._id || message.id}
                                                eventId={message.eventId || eventId || ""}
                                                messageType={message.messageType || "message"}
                                                senderId={message.senderId || ""}
                                                senderName={message.senderName || "Anonymous"}
                                                organizerId={message.organizerId || ""}
                                                content={message.content || ""}
                                                status={message.status || "active"}
                                                referenceCount={getReplyCount(message._id || message.id)}
                                                replies={getRepliesForMessage(message._id || message.id)}
                                                onReply={handleReply}
                                            />
                                            <div className="flex gap-2 mt-2">
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={() => handlePinMessage(message._id || message.id)}
                                                >
                                                    {message.status === 'pinned' ? 'Unpin' : 'Pin'}
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="destructive"
                                                    onClick={() => handleDeleteMessage(message._id || message.id)}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                            )}
                        </div>

                        {/* Reply Input */}
                        {replyingTo && (
                            <div className="p-3 bg-blue-50 border-2 border-blue-500 rounded space-y-2">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm font-semibold text-blue-700">Replying to message</p>
                                    <Button 
                                        size="sm" 
                                        variant="ghost"
                                        onClick={() => {
                                            setReplyingTo(null);
                                            setCurrentReply("");
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        type="text"
                                        placeholder="Type your reply..."
                                        value={currentReply}
                                        onChange={(e) => setCurrentReply(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault()
                                                sendMessage('response', replyingTo)
                                            }
                                        }}
                                        className="flex-1"
                                    />
                                    <Button 
                                        onClick={() => sendMessage('response', replyingTo)}
                                        disabled={!currentReply.trim()}
                                    >
                                        Send Reply
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Question Forum */}
                        <div className="space-y-2">
                            <h3 className="text-lg font-bold">Question Forum</h3>
                            <div className="max-h-96 overflow-y-auto space-y-3 p-4 bg-muted/20 border-2 border-foreground">
                                {messages.filter(msg => msg.messageType === 'question').length === 0 ? (
                                    <p className="text-center text-muted-foreground">No questions yet.</p>
                                ) : (
                                    messages
                                        .filter(msg => msg.messageType === 'question')
                                        .map((message) => (
                                            <div key={message._id || message.id} className="relative">
                                                <MessageCard
                                                    id={message._id || message.id}
                                                    eventId={message.eventId || eventId || ""}
                                                    messageType={message.messageType || "question"}
                                                    senderId={message.senderId || ""}
                                                    senderName={message.senderName || "Anonymous"}
                                                    organizerId={message.organizerId || ""}
                                                    content={message.content || ""}
                                                    status={message.status || "active"}
                                                    referenceCount={getReplyCount(message._id || message.id)}
                                                    replies={getRepliesForMessage(message._id || message.id)}
                                                    onReply={handleReply}
                                                />
                                                <div className="flex gap-2 mt-2">
                                                    <Button 
                                                        size="sm" 
                                                        variant="destructive"
                                                        onClick={() => handleDeleteMessage(message._id || message.id)}
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
