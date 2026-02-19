"use client"

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/8bit/card"
import { Button } from "@/components/ui/8bit/button"
import { EventCard } from "@/components/custom/eventCard"
import { useEffect, useState } from "react"
import apiClient from "@/lib/apiClient"
import Link from "next/link"
import { CardDescription } from "@/components/ui/card"

type EventData = {
  _id: string;
  name: string;
  desc?: string;
  eventType?: string;
  eligibility?: string;
  registrationDeadline?: string;
  eventStartDate?: string;
  eventEndDate?: string;
  registrationLimit?: number;
  organizer?: {
    _id: string;
    name: string;
  };
  eventTags?: string[];
  price?: number;
  status?: string;
  visits?: number;
}

export default function TrendingEventsPage() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrendingEvents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/events");
      
      if (response?.data?.success) {
        const allEvents = response.data.events || [];
        
        // Sort by visits (descending), treating undefined/null as 0
        const sortedEvents = allEvents
          .map((event: EventData) => ({
            ...event,
            visits: event.visits || 0
          }))
          .sort((a: EventData, b: EventData) => (b.visits || 0) - (a.visits || 0))
          .slice(0, 5); // Top 5
        
        setEvents(sortedEvents);
      }
    } catch (error) {
      console.log("Error fetching trending events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingEvents();
  }, []);

  return (
    <main className="p-6 retro">
      <div className="max-w-8xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-bold mb-2"> Trending Events</h1>
            <p className="text-muted-foreground">Top 5 most visited events</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/participant/events">
              Back to All Events
            </Link>
          </Button>
        </div>

        {/* Events Grid */}
        <div >
          {loading ? (
            <div className="text-center py-12">
              <p className="text-2xl">Loading trending events...</p>
            </div>
          ) : events.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-xl text-muted-foreground">No events available</p>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-6">
              {events.map((event, index) => (
                <div key={event._id} className="relative">
                  <div className="absolute -top-2 -left-2 z-10 bg-orange-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg border-4 border-background">
                    #{index + 1}
                  </div>
        <Card className="flex flex-col h-full w-full">
            <CardHeader>
                {event.name && <CardTitle>{event.name}</CardTitle>}
                {event.desc && <CardDescription>{event.desc}</CardDescription>}
            </CardHeader>
            <CardContent className="flex-1">
                {event.organizer && <div className="flex gap-2"><p><strong>Organizer:</strong></p><p className="text-muted-foreground">{event.organizer?.name}</p></div>}
                {event.eventType && <div className="flex gap-2"><p><strong>Event Type:</strong></p><p className="text-muted-foreground">{event.eventType}</p></div>}
                {event.eligibility && <div className="flex gap-2"><p><strong>Eligibility:</strong></p><p className="text-muted-foreground">{event.eligibility}</p></div>}
                {event.status && event.status==="Published" && <div className="flex gap-2"><p><strong>Status:</strong></p><p className="text-muted-foreground text-yellow-500">{event.status}</p></div>}
                {event.status && event.status==="Ongoing" && <div className="flex gap-2"><p><strong>Status:</strong></p><p className="text-muted-foreground text-purple-500">{event.status}</p></div>}
                {event.status && event.status==="Closed" && <div className="flex gap-2"><p><strong>Status:</strong></p><p className="text-muted-foreground text-red-500">{event.status}</p></div>}
            </CardContent>
            <CardFooter>
                <Button variant="outline" asChild>
                    <Link href={`/participant/events/${event._id || ''}`}>View Event</Link>
                </Button>
            </CardFooter>
        </Card>
                  <div className="mt-2 text-center text-sm text-muted-foreground">
                    {event.visits || 0} visits
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
