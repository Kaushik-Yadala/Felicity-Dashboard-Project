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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/8bit/alert"
import Link from "next/link"
import { useState } from "react"
import apiClient from "@/lib/apiClient"
import {useRouter} from "next/navigation"

type CreateClubData = {
  name: string;
  desc: string;
  category: string;
}

type CreatedCredentials = {
  email: string;
  password: string;
} | null;

export default function CreateClub() {
    const router = useRouter();

    const [createClubData, setCreateClubData] = useState<CreateClubData>({
        name: "",
        desc: "",
        category: "",
    })

    const [credentials, setCredentials] = useState<CreatedCredentials>(null);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (field:"name"|"desc"|"category", value:string) => {
        setCreateClubData(
            (prev) => ({...prev, [field]:value})
        )
    }

    const submit = async () => {
        try {
            setError(null);
            const res = await apiClient.post("/admin/organizer/add", createClubData);
            console.log("Create club response:", res);
            if (res.data.success) {
                setCredentials({
                    email: res.data.email,
                    password: res.data.password
                });
            }
        } catch (error) {
            console.log("Create club error:", error);
            setError("Failed to create club. Please try again.");
        }
    }

  return (
    <main className="p-6">
      <div className="max-w-2/3 mx-auto">
        <Card>
          <div className="flex justify-between items-center mb-6">
            <CardHeader>
              <CardTitle className="text-3xl w-xl">Create New Club</CardTitle>
            </CardHeader>
          </div>

          <CardContent className="space-y-6">
              {credentials && (
                <Alert variant="default">
                  <AlertTitle>Club Created Successfully!</AlertTitle>
                  <AlertDescription>
                    <p className="font-semibold mt-2">Please save these credentials:</p>
                    <p className="mt-1"><strong>Email:</strong> {credentials.email}</p>
                    <p><strong>Password:</strong> {credentials.password}</p>
                    <div className="mt-3">
                      <Button variant="default" onClick={() => router.push("/admin/organizer")}>
                        Go to Organizer List
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div>
                <p className="font-semibold text-sm mb-2">Club Name</p>
                <Input 
                defaultValue={createClubData.name} 
                onChange={(e)=>handleChange("name", e.target.value)}
                placeholder="Enter club name"
                />
              </div>

              <div>
                <p className="font-semibold text-sm mb-2">Description</p>
                <Textarea 
                className="h-50" 
                defaultValue={createClubData.desc}
                onChange={(e)=>handleChange("desc", e.target.value)}
                placeholder="Enter club description"
                />
              </div>

              <div>
                <p className="font-semibold text-sm mb-2">Category</p>
                <Input 
                defaultValue={createClubData.category} 
                onChange={(e)=>handleChange("category", e.target.value)}
                placeholder="Enter category (e.g., Technical, Cultural, Sports)"
                />
              </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" asChild>
                <Link href="/admin/organizer">Cancel</Link>
              </Button>
              <Button variant="default" onClick={submit}>
                Create Club
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
