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

interface AdminOrganizerCardProps {
    name?: string;
    desc?: string;
    category?: string;
    contact?: string;
    disabled?: boolean;
    id?: string;
}

export function AdminOrganizerCard(props : AdminOrganizerCardProps) {
    const [isDisabled, setIsDisabled] = useState(!!props.disabled)

    const handleDisable = async () => {
        try {
            await apiClient.patch('/admin/organizer/remove', { id: props.id });
            setIsDisabled(true);
        } catch (error) {
            console.log("Error disabling organizer:", error);
        }
    };

    const handleEnable = async () => {
        try {
            await apiClient.patch('/admin/organizer/enable', { id: props.id });
            setIsDisabled(false);
        } catch (error) {
            console.log("Error enabling organizer:", error);
        }
    };

    const handleRemove = async () => {
        try {
            await apiClient.delete('/admin/organizer/delete', { data: { id: props.id } });
            window.location.reload();
        } catch (error) {
            console.log("Error removing organizer:", error);
        }
    };

    return (
        <Card className="flex w-full sm:w-[48%] lg:w-[32%]">
            <CardHeader>
                {props.name && <CardTitle>{props.name}</CardTitle>}
                {props.desc && <CardDescription>{props.desc}</CardDescription>}
            </CardHeader>
            <CardContent>
                {props.category && <div className="flex"><p><strong>Category:</strong></p><p className="text-muted-foreground">{props.category}</p></div>}
                {props.contact && <div className="flex"><p><strong>Contact:</strong></p><p className="text-muted-foreground">{props.contact}</p></div>}
                {isDisabled && <div className="text-red-500 font-semibold mt-2">DISABLED</div>}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                <Button variant="outline" asChild>
                    <Link href={`/admin/organizer/${props.id}`}>View Details</Link>
                </Button>
                <div className="flex gap-2">
                { !isDisabled &&
                    <Button
                        variant="outline"
                        className="text-red-500 hover:bg-red-500 hover:text-white"
                        onClick={handleDisable}>Disable</Button>
                }
                { isDisabled &&
                    <Button
                        variant="outline"
                        onClick={handleEnable}>Enable</Button>
                }
                <Button
                    variant="outline"
                    className="text-red-500 hover:bg-red-500 hover:text-white"
                    onClick={handleRemove}>Remove</Button>
                </div>
            </CardFooter>
        </Card>
    )

}
