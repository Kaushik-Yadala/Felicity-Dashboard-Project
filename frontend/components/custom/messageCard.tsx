import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/8bit/card"
import {Button} from "@/components/ui/8bit/button"
import Link from "next/link"
import { useState } from "react"

interface MessageCardProps {
    id: string;
    eventId: string;
    messageType: string;
    senderId: string;
    senderName: string;
    organizerId: string;
    content: string;
    status: string;
    referenceCount: number;
    replies?: any[];
    onReply?: (messageId: string) => void;
    onViewReplies?: (messageId: string) => void;
}

export default function MessageCard({
    id,
    eventId,
    messageType,
    senderId,
    senderName,
    organizerId,
    content,
    status,
    referenceCount,
    replies = [],
    onReply,
    onViewReplies,
}: MessageCardProps) {
    const isDeleted = status === "deleted";
    const isPinned = status === "pinned";
    const isAnnouncement = messageType === "announcement";
    const [showReplies, setShowReplies] = useState(false);
    
    const handleViewReplies = () => {
        setShowReplies(!showReplies);
        if (onViewReplies && !showReplies) {
            onViewReplies(id);
        }
    };

    const getCardClassName = () => {
        if (isDeleted) return "border-red-500 bg-red-50";
        if (isAnnouncement) return "border-purple-500 bg-purple-50 border-4";
        if (isPinned) return "border-blue-500 bg-blue-50 border-4";
        return "";
    };
    
    return (
        <div className="space-y-2">
            <Card className={getCardClassName()}>
                <CardHeader>
                    <CardTitle className={isDeleted ? "text-red-600" : isAnnouncement ? "text-purple-700" : isPinned ? "text-blue-700" : ""}>
                        {senderName}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className={isDeleted ? "text-red-600 font-semibold" : ""}>
                        {isDeleted ? "DELETED" : content}
                    </p>
                </CardContent>
                <CardFooter className="flex gap-2 justify-between">
                    <div className="flex gap-2">
                        {onReply && !isDeleted && (
                            <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => onReply(id)}
                            >
                                Reply
                            </Button>
                        )}
                        {referenceCount > 0 && (
                            <Button 
                                size="sm" 
                                variant="outline"
                                onClick={handleViewReplies}
                            >
                                {showReplies ? 'Hide' : 'View'} {referenceCount} {referenceCount === 1 ? 'Reply' : 'Replies'}
                            </Button>
                        )}
                    </div>
                </CardFooter>
            </Card>
            
            {/* Show replies */}
            {showReplies && replies.length > 0 && (
                <div className="ml-8 space-y-2 border-l-4 border-foreground pl-4">
                    {replies.map((reply, index) => (
                        <Card key={reply.id || index} className="bg-muted/50">
                            <CardHeader>
                                <CardTitle className="text-sm">{reply.senderName || "Anonymous"}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm">{reply.content}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
