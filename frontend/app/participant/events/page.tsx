"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/8bit/card"
import { Input } from "@/components/ui/8bit/input"
import { Label } from "@/components/ui/8bit/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/8bit/select"
import { Button } from "@/components/ui/8bit/button"
import { EventCard } from "@/components/custom/eventCard"
import { useEffect, useState } from "react"
import apiClient from "@/lib/apiClient"

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
}

type FilterState = {
  search: string;
  eventType: string;
  eligibility: string;
  eventStartDate: string;
  eventEndDate: string;
  showFollowed: string;
}

export default function Events() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    eventType: "",
    eligibility: "",
    eventStartDate: "",
    eventEndDate: "",
    showFollowed: "",
  });

  const formatDate = (value?: string) => {
    if (!value) return "";
    return value.split("T")[0];
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.search) params.append("search", filters.search);
      if (filters.eventType && filters.eventType !== "all") params.append("eventType", filters.eventType);
      if (filters.eligibility && filters.eligibility !== "all") params.append("eligibility", filters.eligibility);
      if (filters.eventStartDate) params.append("eventStartDate", filters.eventStartDate);
      if (filters.eventEndDate) params.append("eventEndDate", filters.eventEndDate);
      if (filters.showFollowed === "followed") params.append("showFollowed", "true");

      const queryString = params.toString();
      const url = queryString ? `/events?${queryString}` : "/events";
      
      const response = await apiClient.get(url);
      console.log("Events response:", response);
      
      if (response?.data?.success) {
        setEvents(response.data.events || []);
      }
    } catch (error) {
      console.log("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    fetchEvents();
  };

  const handleReset = () => {
    setFilters({
      search: "",
      eventType: "",
      eligibility: "",
      eventStartDate: "",
      eventEndDate: "",
      showFollowed: "",
    });
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <main className="p-6 retro">
      <div className="max-w-8xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-bold mb-2">Browse Events</h1>
            <p className="text-muted-foreground">Discover and explore upcoming events</p>
          </div>
          <Button asChild>
            <a href="/participant/events/trending">
              Trending
            </a>
          </Button>
        </div>

        {/* Search & Filter Card */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search Bar */}
            <div>
              <Label htmlFor="search" className="mb-2 block">
                Search Events
              </Label>
              <Input
                id="search"
                type="text"
                placeholder="Search by event or organizer name..."
                className="w-full"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>

            {/* Filters Grid */}
            <div className="flex flex-wrap justify-between gap-4">
              {/* Event Type Filter */}
              <div>
                <Label htmlFor="event-type" className="mb-2 block">
                  Event Type
                </Label>
                <Select value={filters.eventType} onValueChange={(value) => handleFilterChange("eventType", value)}>
                  <SelectTrigger id="event-type">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="Merchandise">Merchandise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Eligibility Filter */}
              <div>
                <Label htmlFor="eligibility" className="mb-2 block">
                  Eligibility
                </Label>
                <Select value={filters.eligibility} onValueChange={(value) => handleFilterChange("eligibility", value)}>
                  <SelectTrigger id="eligibility">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="IIITH">IIITH Students</SelectItem>
                    <SelectItem value="Non-IIITH">Non-IIITH</SelectItem>
                    <SelectItem value="Both">Open to All</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Filter */}
              <div>
                <Label className="mb-2 block">
                  Date Range
                </Label>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="start-date" className="text-xs mb-1 block">From</Label>
                    <Input
                      type="date"
                      id="start-date"
                      className="text-sm"
                      value={filters.eventStartDate}
                      onChange={(e) => handleFilterChange("eventStartDate", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-date" className="text-xs mb-1 block">To</Label>
                    <Input
                      type="date"
                      id="end-date"
                      className="text-sm"
                      value={filters.eventEndDate}
                      onChange={(e) => handleFilterChange("eventEndDate", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Followed Clubs / All Filter */}
              <div>
                <Label htmlFor="clubs" className="mb-2 block">
                  Organizers
                </Label>
                <Select value={filters.showFollowed} onValueChange={(value) => handleFilterChange("showFollowed", value)}>
                  <SelectTrigger id="clubs">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Organizers</SelectItem>
                    <SelectItem value="followed">Followed Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? "Searching..." : "Search"}
              </Button>
              <Button variant="outline" onClick={handleReset}>Reset Filters</Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <div>
          <div className="mb-4">
            <h2 className="text-3xl font-bold">Results</h2>
            <p className="text-muted-foreground">
              {loading ? "Loading..." : `Found ${events.length} event${events.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="flex flex-wrap justify-start gap-4 border-y-6 border-x-6 border-foreground dark:border-ring p-6">
            {loading && (
              <p className="text-muted-foreground w-full">Loading events...</p>
            )}
            {!loading && events.length === 0 && (
              <p className="text-muted-foreground w-full">No events found. Try adjusting your filters.</p>
            )}
            {!loading && events.map((event) => (
              <EventCard
                key={event._id}
                id={event._id}
                title={event.name}
                desc={event.desc}
                eventType={event.eventType}
                eligibility={event.eligibility}
                registrationDeadline={formatDate(event.registrationDeadline)}
                eventStartDate={formatDate(event.eventStartDate)}
                eventEndDate={formatDate(event.eventEndDate)}
                organizer={event.organizer?.name}
                status={event.status}
                isOrganizer={false}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
