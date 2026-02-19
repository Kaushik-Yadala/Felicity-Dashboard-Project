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
import {Button} from "@/components/ui/8bit/button"
import Link from "next/link"
import apiClient from "@/lib/apiClient";
import { useState } from "react";

interface OrganizerCardProps {
    name?: string;
    desc?: string;
    category?: string;
    contact?: string;
    following?: boolean;
    id?: string;
    /* Add the function for the button */
}

export function OrganizerCard(props : OrganizerCardProps) {
    const [isFollowing, setIsFollowing] = useState(!!props.following)

    return (



        <Card className="flex w-full sm:w-[48%] lg:w-[32%]">
            <CardHeader>
                {props.name && <CardTitle>{props.name}</CardTitle>}
                {props.desc && <CardDescription>{props.desc}</CardDescription>}
            </CardHeader>
            <CardContent>
                {props.category && <div className="flex flex-wrap"><p><strong>Category:</strong></p><p className="text-muted-foreground">{props.category}</p></div>}
                {props.contact && <div className="flex flex-wrap"><p><strong>Contact:</strong></p><p className="text-muted-foreground">{props.contact}</p></div>}
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
                <Button variant="outline" asChild>
                    <Link href={`/participant/organizers/${props.id}`}>View Organizer</Link>
                </Button>
                { !isFollowing &&
                    <Button
                        variant="outline"
                        onClick={async () => {
                        try {
                            const payload = {
                                organizer : props.id
                            }
                            const data = await apiClient.post(`/organizers/${props.id}/follow`, payload);
                            console.log("Follow response:", data);
                            setIsFollowing(true)
                        } catch (error) {
                            console.log("Error following organizer:", error);
                    }}}>Follow</Button>
                }
                { isFollowing &&
                    <Button
                        variant="outline"
                        className="text-red-500 hover:bg-red-500 hover:text-white"
                        onClick={async () => {
                        try {
                            const payload = {
                                organizer : props.id
                            }
                            const data = await apiClient.post(`/organizers/${props.id}/unfollow`, payload);
                            console.log("Unfollow response:", data);
                            setIsFollowing(false)
                        } catch (error) {
                            console.log("Error unfollowing organizer:", error);
                    }
                    }}>Unfollow</Button>
                }
            </CardFooter>
        </Card>
    )

}
