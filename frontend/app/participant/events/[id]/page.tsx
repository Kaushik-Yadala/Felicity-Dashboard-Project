"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import apiClient from "@/lib/apiClient"
import { Button } from "@/components/ui/8bit/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/8bit/alert"
import Link from "next/link"
import { socket } from "@/lib/socket"
import MessageCard from "@/components/custom/messageCard"
import { Input } from "@/components/ui/8bit/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/8bit/card"

type EventData = {
    id?: string
    name?: string
    desc?: string
    organizer?: string
    eventType?: string
    eligibility?: string
    registrationDeadline?: string
    eventStartDate?: string
    eventEndDate?: string
    eventTags?: string[]
    price?: number
    form?: { label: string; type: string }[]
    stockQuantity?: number
    purchaseLimit?: number
    variants?: { name?: string; options?: string[] }[]
    registered?: boolean
    canRegister?: boolean
    participantName?: string
}


export default function EventPage() {

    const params = useParams()
    const eventId = params?.id as string | undefined

    const [currentMessage, setCurrentMessage] = useState("");
    const [currentQuestion, setCurrentQuestion] = useState("");
    const [currentReply, setCurrentReply] = useState("");
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);

    const [eventData, setEventData] = useState<EventData>({
        name:"",
        desc:"",
        organizer:"",
        eventType:"",
        eligibility:"",
        registrationDeadline:"",
        eventStartDate:"",
        eventEndDate:"",
        eventTags:[],
        price:0,
        form:[],
        stockQuantity:0,
        purchaseLimit:0,
        variants:[],
        registered: false,
        canRegister: false,
        participantName: ""
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const sendMessage = async (type: string, referencedMessageId?: string) => {

        let content = '';
        if (referencedMessageId) {
            content = currentReply.trim();
        } else {
            content = type === 'question' ? currentQuestion.trim() : currentMessage.trim();
        }
        
        if (!content) return;

        const messageData = {
            eventId: eventId,
            content: content,
            senderId: socket.id,
            messageType: referencedMessageId ? 'response' : type,
            referencedMessageId: referencedMessageId || null,
            senderName: eventData.participantName || "Anonymous"
        }

        await socket.emit("message", messageData);

        if (referencedMessageId) {
            setCurrentReply("");
            setReplyingTo(null);
        } else if (type === 'question') {
            setCurrentQuestion("");
        } else {
            setCurrentMessage("");
        }

    }

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
                setError(null)
                const increment = apiClient.post(`/events/${eventId}/increment`)
                const data = await apiClient.get(`/events/${eventId}`)
                // console.log("Event response:", data)
                if (data?.data.success) {
                    console.log(data)
                    const event = data.data.event
                    setEventData({
                        id: eventId,
                        name: event.name || "",
                        desc: event.desc || "",
                        organizer: event.organizer || "",
                        eventType: event.eventType || "",
                        eligibility: event.eligibility || "",
                        registrationDeadline: event.registrationDeadline || "",
                        eventStartDate: event.eventStartDate || "",
                        eventEndDate: event.eventEndDate || "",
                        eventTags: Array.isArray(event.eventTags) ? event.eventTags : [],
                        price: event.price ?? 0,
                        stockQuantity: event.stockQuantity ?? 0,
                        purchaseLimit: event.purchaseLimit ?? 0,
                        variants: Array.isArray(event.variants) ? event.variants : [],
                        form: Array.isArray(event.form) ? event.form : [],
                        registered: event.registered ?? false,
                        canRegister: event.canRegister ?? false,
                        participantName: event.participantName || ""
                    })
                }
            } catch (error) {
                console.error("Event fetch error:", error)
                setError("Failed to load event details. Please try again.")
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

    if (loading) {
        return (
            <div className="m-6 p-6 max-w-4xl mx-auto retro">
                <p className="text-2xl text-center">Loading event details...</p>
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
            <div className="flex flex-col gap-2">
                <div className="text-5xl font-bold mb-4 retro">
                    {eventData.name || "Event"}
                </div>
                <div>
                    <div className="text-2xl mb-2">
                        Description:
                    </div>
                    <div className="text-muted-foreground mb-4">
                        {eventData.desc || "No description available."}
                    </div>
                </div>
                <div>
                    <div className="text-2xl mb-2">
                        Organizer:
                    </div>
                    <div className="text-muted-foreground mb-4">
                        {eventData.organizer || "Unknown"}
                    </div>
                </div>
                <div>
                    <div className="text-2xl mb-2">
                        Event Type:
                    </div>
                    <div className="text-muted-foreground mb-4">
                        {eventData.eventType || "N/A"}
                    </div>
                </div>
                <div>
                    <div className="text-2xl mb-2">
                        Eligibility:
                    </div>
                    <div className="text-muted-foreground mb-4">
                        {eventData.eligibility || "N/A"}
                    </div>
                </div>
                <div>
                    <div className="text-2xl mb-2">
                        Registration Deadline:
                    </div>
                    <div className="text-muted-foreground mb-4">
                        {formatDate(eventData.registrationDeadline) || "N/A"}
                    </div>
                </div>
                <div>
                    <div className="text-2xl mb-2">
                        Event Dates:
                    </div>
                    <div className="text-muted-foreground mb-4">
                        {formatDate(eventData.eventStartDate)}{eventData.eventStartDate ? " to " : ""}{formatDate(eventData.eventEndDate)}
                    </div>
                </div>
                <div>
                    <div className="text-2xl mb-2">
                        Tags:
                    </div>
                    <div>
                      <div className="flex flex-wrap gap-2 mb-4">
                                                    {eventData.eventTags && eventData.eventTags.length > 0 ? (
                                                        eventData.eventTags.map((tag) => (
                                                            <div
                                                                key={tag}
                                                                className="bg-foreground text-background px-3 py-1.5 text-sm border border-foreground cursor-pointer hover:bg-opacity-80 transition-all"
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
                <div>
                    <div className="text-2xl mb-2">
                        Price:
                    </div>
                    <div className="text-muted-foreground mb-4">
                        {eventData.price ?? 0}
                    </div>
                </div>
                <div>
                    <div className="text-2xl mb-2">
                        Form
                    </div>
                    <div className="text-muted-foreground mb-4">
                        {eventData.form && eventData.form.length > 0 ? "Yes" : "No"}
                    </div>
                </div>

                                {eventData.eventType === "Merchandise" && (
                                    <>
                                        <div>
                                                <div className="text-2xl mb-2">
                                                        Stock Quantity:
                                                </div>
                                                <div className="text-muted-foreground mb-4">
                                                        {eventData.stockQuantity ?? 0}
                                                </div>
                                        </div>
                                        <div>
                                                <div className="text-2xl mb-2">
                                                        Purchase Limit:
                                                </div>
                                                <div className="text-muted-foreground mb-4">
                                                        {eventData.purchaseLimit ?? 0}
                                                </div>
                                        </div>
                                        <div>
                                                <div className="text-2xl mb-2">
                                                        Variants:
                                                </div>
                                                <div>
                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                        {eventData.variants && eventData.variants.length > 0 ? (
                                                            eventData.variants.map((variant, index) => (
                                                                <div
                                                                    key={`${variant.name || "variant"}-${index}`}
                                                                    className="bg-foreground text-background px-3 py-1.5 text-sm border border-foreground cursor-pointer hover:bg-opacity-80 transition-all"
                                                                >
                                                                    {variant.name || "Variant"}
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

                <div>

                    <div className="flex gap-3">
                        {eventData.registered && (
                            <div className="bg-green-500 text-white px-4 py-2 font-semibold">
                                ✓ Already Registered
                            </div>
                        )}
                        {!eventData.registered && eventData.canRegister && (
                            <Button asChild>
                                <Link href={`/participant/events/${eventData.id}/register`}>Register Now</Link>
                            </Button>
                        )}
                        {!eventData.registered && !eventData.canRegister && (
                            <Button variant="outline" disabled>
                                Registration Unavailable
                            </Button>
                        )}
                    </div>
                    
                </div>
            </div>

            {/* Communication Area - Only for registered participants */}
            {eventData.registered && (
                <>
                    <div className="mt-8">
                        <Card className="border-4">
                            <CardHeader>
                                <CardTitle className="text-3xl">Event Communication</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Announcements */}
                                {messages.filter(msg => msg.messageType === 'announcement').length > 0 && (
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-bold text-purple-700">Announcements</h3>
                                        <div className="space-y-3">
                                            {messages
                                                .filter(msg => msg.messageType === 'announcement')
                                                .map((message) => (
                                                    <MessageCard
                                                        key={message._id || message.id}
                                                        id={message._id || message.id}
                                                        eventId={message.eventId || eventId || ""}
                                                        messageType={message.messageType || "announcement"}
                                                        senderId={message.senderId || ""}
                                                        senderName={message.senderName || "Organizer"}
                                                        organizerId={message.organizerId || ""}
                                                        content={message.content || ""}
                                                        status={message.status || "normal"}
                                                        referenceCount={getReplyCount(message._id || message.id)}
                                                        replies={getRepliesForMessage(message._id || message.id)}
                                                        onReply={handleReply}
                                                    />
                                                ))
                                            }
                                        </div>
                                    </div>
                                )}

                                {/* Pinned Messages */}
                                {messages.filter(msg => msg.messageType === 'message' && msg.status === 'pinned').length > 0 && (
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-bold text-blue-700">Pinned Messages</h3>
                                        <div className="space-y-3">
                                            {messages
                                                .filter(msg => msg.messageType === 'message' && msg.status === 'pinned')
                                                .map((message) => (
                                                    <MessageCard
                                                        key={message._id || message.id}
                                                        id={message._id || message.id}
                                                        eventId={message.eventId || eventId || ""}
                                                        messageType={message.messageType || "message"}
                                                        senderId={message.senderId || ""}
                                                        senderName={message.senderName || "Anonymous"}
                                                        organizerId={message.organizerId || ""}
                                                        content={message.content || ""}
                                                        status={message.status || "normal"}
                                                        referenceCount={getReplyCount(message._id || message.id)}
                                                        replies={getRepliesForMessage(message._id || message.id)}
                                                        onReply={handleReply}
                                                    />
                                                ))
                                            }
                                        </div>
                                    </div>
                                )}

                                {/* Messages Display */}
                                <div className="max-h-96 overflow-y-auto space-y-3 p-4 bg-muted/20 border-2 border-foreground">
                                    <h3 className="text-lg font-bold mb-2">Messages</h3>
                                    {messages.filter(msg => msg.messageType === 'message' && msg.status !== 'pinned').length === 0 ? (
                                        <p className="text-center text-muted-foreground">No messages yet. Start the conversation!</p>
                                    ) : (
                                        messages
                                            .filter(msg => msg.messageType === 'message' && msg.status !== 'pinned')
                                            .map((message) => (
                                                <MessageCard
                                                    key={message._id || message.id}
                                                    id={message._id || message.id}
                                                    eventId={message.eventId || eventId || ""}
                                                    messageType={message.messageType || "message"}
                                                    senderId={message.senderId || ""}
                                                    senderName={message.senderName || "Anonymous"}
                                                    organizerId={message.organizerId || ""}
                                                    content={message.content || ""}
                                                    status={message.status || "normal"}
                                                    referenceCount={getReplyCount(message._id || message.id)}
                                                    replies={getRepliesForMessage(message._id || message.id)}
                                                    onReply={handleReply}
                                                />
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

                                {/* Message Input */}
                                <div className="flex gap-2">
                                    <Input
                                        type="text"
                                        placeholder="Type your message..."
                                        value={currentMessage}
                                        onChange={(e) => setCurrentMessage(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault()
                                                sendMessage('message')
                                            }
                                        }}
                                        className="flex-1"
                                    />
                                    <Button 
                                        onClick={() => sendMessage('message')}
                                        disabled={!currentMessage.trim()}
                                    >
                                        Send
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Question Forum - Only for registered participants */}
                    <div className="mt-8">
                        <Card className="border-4">
                            <CardHeader>
                                <CardTitle className="text-3xl">Question Forum</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Questions Display */}
                                <div className="max-h-96 overflow-y-auto space-y-3 p-4 bg-muted/20 border-2 border-foreground">
                                    {messages.filter(msg => msg.messageType === 'question').length === 0 ? (
                                        <p className="text-center text-muted-foreground">No questions yet. Ask the first question!</p>
                                    ) : (
                                        messages
                                            .filter(msg => msg.messageType === 'question')
                                            .map((message) => (
                                                <MessageCard
                                                    key={message._id || message.id}
                                                    id={message._id || message.id}
                                                    eventId={message.eventId || eventId || ""}
                                                    messageType={message.messageType || "question"}
                                                    senderId={message.senderId || ""}
                                                    senderName={message.senderName || "Anonymous"}
                                                    organizerId={message.organizerId || ""}
                                                    content={message.content || ""}
                                                    status={message.status || "normal"}
                                                    referenceCount={getReplyCount(message._id || message.id)}
                                                    replies={getRepliesForMessage(message._id || message.id)}
                                                />
                                            ))
                                    )}
                                </div>

                                {/* Question Input */}
                                <div className="flex gap-2">
                                    <Input
                                        type="text"
                                        placeholder="Ask a question..."
                                        value={currentQuestion}
                                        onChange={(e) => setCurrentQuestion(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault()
                                                sendMessage('question')
                                            }
                                        }}
                                        className="flex-1"
                                    />
                                    <Button 
                                        onClick={() => sendMessage('question')}
                                        disabled={!currentQuestion.trim()}
                                    >
                                        Ask
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}

        </div>
    )
}