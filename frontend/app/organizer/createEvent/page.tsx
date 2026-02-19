"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/8bit/card"
import { Button } from "@/components/ui/8bit/button"
import { Input } from "@/components/ui/8bit/input"
import { Textarea } from "@/components/ui/8bit/textarea"
import Link from "next/link"
import { useState } from "react"
import apiClient from "@/lib/apiClient"
import {useRouter} from "next/navigation"

type CreateEventData = {
  name: string;
  desc: string;
}

export default function CreateEvent() {
    const router = useRouter();


    const [createEventData, setCreateEventData] = useState<CreateEventData>({
        name: "",
        desc: "",
    })

    const handleChange = (field:"name"|"desc", value:string) => {
        setCreateEventData(
            (prev) => ({...prev, [field]:value})
        )
    }

    const submit = async () => {
        try {

            const res = await apiClient.post("/organizer/event/create", createEventData);
            console.log("Create event response:", res);
            router.push(`/organizer/event/${res.data.eventId}/edit`);
        } catch (error) {
            console.log("Create event error:", error);
        }
    }

  return (
    <main className="p-6">
      <div className="max-w-2/3 mx-auto">
        <Card>
          <div className="flex justify-between items-center mb-6">
            <CardHeader>
              <CardTitle className="text-3xl w-xl">Create Event Draft</CardTitle>
            </CardHeader>
          </div>

          <CardContent className="space-y-6">
            {/* First Name & Last Name */}
              <div>
                <p className="font-semibold text-sm mb-2">Name</p>
                <Input 
                defaultValue={createEventData.name} 
                onChange={(e)=>handleChange("name", e.target.value)}
                />
              </div>

              <div>
                <p className="font-semibold text-sm mb-2">Description</p>
                <Textarea 
                className="h-50" 
                defaultValue={createEventData.desc}
                onChange={(e)=>handleChange("desc", e.target.value)}
                />
              </div>

            <div className="flex justify-end">
              <Button variant="default" onClick={submit}>
                Create Draft
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
