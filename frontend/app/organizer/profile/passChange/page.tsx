"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/8bit/card"
import { Button } from "@/components/ui/8bit/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/8bit/alert"
import { Textarea } from "@/components/ui/8bit/textarea"
import Link from "next/link"
import { useEffect, useState } from "react"
import apiClient from "@/lib/apiClient"

export default function PasswordChange() {
  const [requestData, setRequestData] = useState<any>(null)
  const [hasRequest, setHasRequest] = useState(false)
  const [priorRequests, setPriorRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reason, setReason] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const fetchPasswordRequest = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.get("organizer/profile/Password-reset")

      console.log(response.data)

      if (response?.data?.exists) {
        setHasRequest(true)
        setRequestData(response.data.message)
        setPriorRequests(response.data.priorRequest || [])
      } else {
        setHasRequest(false)
        setRequestData(null)
        setPriorRequests(response.data.priorRequest || [])
      }
    } catch (err) {
      console.error("Error fetching password request:", err)
      setError("Failed to load password request data.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPasswordRequest()
  }, [])

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError("Please provide a reason for the password change request.")
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      const response = await apiClient.post("organizer/profile/password-reset", {
        reason: reason.trim(),
      })

      console.log(response.data)

      if (response?.data?.success) {
        setReason("")
        setPriorRequests(response.data.priorRequests || [])
        await fetchPasswordRequest()
      } else {
        setError(response?.data?.message || "Failed to submit request.")
      }
    } catch (err) {
      console.error("Error submitting password request:", err)
      setError("Failed to submit password change request.")
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  if (loading) {
    return (
      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-2xl text-center">Loading...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="p-6">
      <div className="max-w-4xl mx-auto">

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Password Change Request</CardTitle>
            <CardDescription>
              {hasRequest
                ? "Your pending password change request"
                : "Request a password change"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">

            {hasRequest && requestData ? (
              <>
                <div>
                  <p className="font-semibold text-sm mb-2">Status</p>
                  <p className="text-lg capitalize">{requestData.status}</p>
                </div>

                <div>
                  <p className="font-semibold text-sm mb-2">Reason</p>
                  <p className="text-lg">{requestData.reason}</p>
                </div>

                {requestData.comments && (
                  <div>
                    <p className="font-semibold text-sm mb-2">Comments</p>
                    <p className="text-lg">{requestData.comments}</p>
                  </div>
                )}

                <div>
                  <p className="font-semibold text-sm mb-2">Requested At</p>
                  <p className="text-lg">{formatDate(requestData.createdAt)}</p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label htmlFor="reason" className="font-semibold text-sm mb-2 block">
                    Reason for Password Change
                  </label>
                  <Textarea
                    id="reason"
                    placeholder="Please provide a reason for requesting a password change..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={6}
                    className="w-full"
                  />
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !reason.trim()}
                  className="w-full"
                >
                  {submitting ? "Submitting..." : "Request Password Change"}
                </Button>
              </>
            )}

            {priorRequests.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-xl mb-4">Prior Requests</h3>
                <div className="space-y-3">
                  {priorRequests.toReversed().map((req, index) => (
                    <Card key={index} className="border-2">
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="font-semibold text-sm">Status</p>
                            <p className={`text-sm capitalize ${req.status === 'pending' ? 'text-yellow-500' :
                                req.status === 'Approved' ? 'text-green-500' :
                                  'text-red-500'
                              }`}>
                              {req.status}
                            </p>
                          </div>
                          <div>
                            <p className="font-semibold text-sm">Requested At</p>
                            <p className="text-sm">{formatDate(req.createdAt)}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="font-semibold text-sm">Reason</p>
                            <p className="text-sm">{req.reason}</p>
                          </div>
                          {req.comments && (
                            <div className="col-span-2">
                              <p className="font-semibold text-sm">Comments</p>
                              <p className="text-sm">{req.comments}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

          </CardContent>
        </Card>
      </div>
    </main>
  )
}
