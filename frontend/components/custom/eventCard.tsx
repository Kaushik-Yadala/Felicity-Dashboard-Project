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

interface EventCardProps {
    title?: string;
    desc?: string;
    eventType?: string;
    eligibility?: string;
    registrationDeadline?: string;
    eventStartDate?: string;
    eventEndDate?: string;
    registrationLimit?: string;
    stockQuantity?: string;
    registrations?: string;
    sales?: string;
    revenue?: string;
    attendance?: string;
    organizer?: string;
    status?: string;
    participant?: boolean;
    id?: string;
    isOrganizer?: boolean;
    /* Add the function for the button */
}

export function EventCard(props : EventCardProps) {
    const hasStats =
        props.registrations || props.sales || props.revenue || props.attendance

    return (

        <Card className="flex flex-col h-full w-full sm:w-[48%] lg:w-[32%]">
            <CardHeader>
                {props.title && <CardTitle>{props.title}</CardTitle>}
                {props.desc && <CardDescription>{props.desc}</CardDescription>}
            </CardHeader>
            <CardContent className="flex-1">
                {props.organizer && <div className="flex gap-2"><p><strong>Organizer:</strong></p><p className="text-muted-foreground">{props.organizer}</p></div>}
                {props.eventType && <div className="flex gap-2"><p><strong>Event Type:</strong></p><p className="text-muted-foreground">{props.eventType}</p></div>}
                {props.eligibility && <div className="flex gap-2"><p><strong>Eligibility:</strong></p><p className="text-muted-foreground">{props.eligibility}</p></div>}
                {props.registrationDeadline && <div className="flex gap-2"><p><strong>Registration Deadline:</strong></p><p className="text-muted-foreground">{props.registrationDeadline}</p></div>}
                {props.eventStartDate && <div className="flex gap-2"><p><strong>Start:</strong></p><p className="text-muted-foreground">{props.eventStartDate}</p></div>}
                {props.eventEndDate && <div className="flex gap-2"><p><strong>Event End:</strong></p><p className="text-muted-foreground">{props.eventEndDate}</p></div>}
                {props.registrationLimit && <div className="flex gap-2"><p><strong>Registration Limit:</strong></p><p className="text-muted-foreground">{props.registrationLimit}</p></div>}
                {props.stockQuantity && <div className="flex gap-2"><p><strong>Stock Quantity:</strong></p><p className="text-muted-foreground">{props.stockQuantity}</p></div>}
                {props.status && props.status==="Draft" && <div className="flex gap-2"><p><strong>Status:</strong></p><p className="text-muted-foreground">{props.status}</p></div>}
                {props.status && props.status==="Published" && <div className="flex gap-2"><p><strong>Status:</strong></p><p className="text-muted-foreground text-yellow-500">{props.status}</p></div>}
                {props.status && props.status==="Ongoing" && <div className="flex gap-2"><p><strong>Status:</strong></p><p className="text-muted-foreground text-purple-500">{props.status}</p></div>}
                {props.status && props.status==="Closed" && <div className="flex gap-2"><p><strong>Status:</strong></p><p className="text-muted-foreground text-red-500">{props.status}</p></div>}
                {hasStats && (
                    <div className="mt-3 space-y-1">
                        <p><strong>Stats:</strong></p>
                        {props.revenue && <div className="flex gap-2"><p>Revenue:</p><p className="text-muted-foreground">{props.revenue}</p></div>}
                        {props.registrations && <div className="flex gap-2"><p>Registrations:</p><p className="text-muted-foreground">{props.registrations}</p></div>}
                        {props.sales && <div className="flex gap-2"><p>Sales:</p><p className="text-muted-foreground">{props.sales}</p></div>}
                        {props.attendance && <div className="flex gap-2"><p>attendance:</p><p className="text-muted-foreground">{props.attendance}</p></div>}
                    </div>
                )}
            </CardContent>
            <CardFooter>
                { !props.isOrganizer &&
                <Button variant="outline" asChild>
                    <Link href={`/participant/events/${props.id || ''}`}>View Event</Link>
                </Button>
                }
                { props.isOrganizer &&
                <Button variant="outline" asChild>
                    <Link href={`/organizer/event/${props.id || ''}`}>View Event</Link>
                </Button>
                }
            </CardFooter>
        </Card>
    )

}