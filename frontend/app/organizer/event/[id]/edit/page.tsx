"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import apiClient from "@/lib/apiClient"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/8bit/select"

export default function EditEvent() {
  const params = useParams()
  const router = useRouter()
  const eventId = params?.id as string | undefined

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  const [status, setStatus] = useState("Draft")
  const [name, setName] = useState("")
  const [desc, setDesc] = useState("")
  const [eventType, setEventType] = useState("Normal")
  const [eligibility, setEligibility] = useState("Both")
  const [registrationDeadline, setRegistrationDeadline] = useState("")
  const [eventStartDate, setEventStartDate] = useState("")
  const [eventEndDate, setEventEndDate] = useState("")
  const [registrationLimit, setRegistrationLimit] = useState("")
  const [registrationFee, setRegistrationFee] = useState("")
  const [eventTags, setEventTags] = useState("")
  const [price, setPrice] = useState("")
  const [stockQuantity, setStockQuantity] = useState("")
  const [purchaseLimit, setPurchaseLimit] = useState("")
  const [variants, setVariants] = useState("")
  const [customForm, setCustomForm] = useState<any[]>([])

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return
      try {
        setLoading(true)
        const response = await apiClient.get(`/organizer/event/${eventId}/edit`)
        
        if (response?.data?.success) {
          const event = response.data.eventData
          setStatus(event.status || "Draft")
          setName(event.name || "")
          setDesc(event.desc || "")
          setEventType(event.eventType || "Normal")
          setEligibility(event.eligibility || "Both")
          setRegistrationDeadline(event.registrationDeadline?.split("T")[0] || "")
          setEventStartDate(event.eventStartDate?.split("T")[0] || "")
          setEventEndDate(event.eventEndDate?.split("T")[0] || "")
          setRegistrationLimit(String(event.registrationLimit || ""))
          setRegistrationFee(String(event.registrationFee || ""))
          setEventTags(Array.isArray(event.eventTags) ? event.eventTags.join(", ") : "")
          setPrice(String(event.price || ""))
          setStockQuantity(String(event.stockQuantity || ""))
          setPurchaseLimit(String(event.purchaseLimit || ""))
          setVariants(Array.isArray(event.variants) ? event.variants.map((v: any) => v.name || v).join(", ") : "")
          setCustomForm(Array.isArray(event.customForm) ? event.customForm : [])
          setError(null)
        } else {
          setError(response?.data?.message || "Failed to fetch event")
        }
      } catch (err) {
        console.error("Event fetch error:", err)
        setError("Error loading event details. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [eventId])

  const handleSave = async (shouldPublish: boolean = false) => {
    if (!eventId) return
    
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const payload: any = {}

      // Always allow description editing for Draft and Published
      if (isDraft || isPublished) {
        payload.desc = desc
      }

      // Fields that can only be edited in Draft status
      if (isDraft) {
        payload.name = name
        payload.eventType = eventType
        payload.eligibility = eligibility
        payload.eventStartDate = eventStartDate
        payload.eventEndDate = eventEndDate
        payload.registrationFee = Number(registrationFee) || undefined
        payload.eventTags = eventTags.split(",").map(tag => tag.trim()).filter(Boolean)
        payload.price = Number(price) || undefined
        payload.customForm = customForm

        if (eventType === "Merchandise") {
          payload.stockQuantity = Number(stockQuantity) || undefined
          payload.purchaseLimit = Number(purchaseLimit) || undefined
          payload.variants = variants.split(",").map(v => ({ name: v.trim() })).filter(v => v.name)
        }
      }

      // Registration deadline can be edited in Draft or Published (extended only)
      if (isDraft || isPublished) {
        payload.registrationDeadline = registrationDeadline
      }

      // Registration limit can be edited in Draft or Published (increased only)
      if (isDraft || isPublished) {
        payload.registrationLimit = Number(registrationLimit) || undefined
      }

      // Include status when publishing from Draft or when status has been changed
      if (shouldPublish && status === "Draft") {
        payload.status = "Published"
      } else if (status !== "Draft") {
        // For non-Draft events, always send the status (Published can change to Ongoing/Closed, etc.)
        payload.status = status
      }

      const response = await apiClient.patch(`/organizer/event/${eventId}/edit`, payload)

      if (response?.data?.success) {
        setSuccess(shouldPublish ? "Event published successfully!" : "Event saved successfully!")
        setTimeout(() => router.push(`/organizer/event/${eventId}`), 2000)
      } else {
        setError(response?.data?.message || "Failed to save event")
      }
    } catch (err: any) {
      console.error("Save error:", err)
      const errorMsg = err?.response?.data?.message || "Error saving event"
      setError(errorMsg)
      alert(errorMsg)
    } finally {
      setSaving(false)
    }
  }

  const isDraft = status === "Draft"
  const isPublished = status === "Published"
  const isMerchandise = eventType === "Merchandise"

  const canEditName = isDraft
  const canEditDesc = isDraft || isPublished
  const canEditEventType = isDraft
  const canEditEligibility = isDraft
  const canEditRegDeadline = isDraft || isPublished
  const canEditEventDates = isDraft
  const canEditRegLimit = isDraft || isPublished
  const canEditRegFee = isDraft
  const canEditTags = isDraft
  const canEditPrice = isDraft
  const canEditMerch = isDraft && isMerchandise
  const canEditForm = isDraft

  const statusOptions = isDraft
    ? ["Draft", "Published"]
    : isPublished
      ? ["Published", "Ongoing", "Closed"]
      : status === "Ongoing"
        ? ["Ongoing", "Completed", "Closed"]
        : [status]

  const canEditStatus = statusOptions.length > 1

  const addQuestion = () => {
    setCustomForm((prev) => [
      ...prev,
      {
        label: "",
        fieldType: "text",
        options: [],
        required: false,
        order: prev.length + 1,
      },
    ])
  }

  const updateQuestion = (
    index: number,
    patch: Partial<{ label: string; fieldType: string; options: string[]; required: boolean }>
  ) => {
    setCustomForm((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch, order: i + 1 } : item))
    )
  }

  const removeQuestion = (index: number) => {
    setCustomForm((prev) =>
      prev.filter((_, i) => i !== index).map((item, i) => ({ ...item, order: i + 1 }))
    )
  }

  const addOption = (index: number) => {
    const options = customForm[index].options || []
    updateQuestion(index, { options: [...options, ""] })
  }

  const updateOption = (index: number, optIndex: number, value: string) => {
    const options = (customForm[index].options || []).map((opt: string, i: number) =>
      i === optIndex ? value : opt
    )
    updateQuestion(index, { options })
  }

  const removeOption = (index: number, optIndex: number) => {
    const options = (customForm[index].options || []).filter((_: string, i: number) => i !== optIndex)
    updateQuestion(index, { options })
  }

  if (loading) {
    return (
      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-2xl">Loading event details...</div>
        </div>
      </main>
    )
  }

  if (error && !saving) {
    return (
      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
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
        {success && (
          <Alert className="mb-6 bg-green-500 text-white border-green-500">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        <Card>
          <div className="flex justify-between items-center mb-6">
            <CardHeader>
              <CardTitle className="text-3xl w-xl">Edit Event</CardTitle>
              <CardDescription>Fields are editable based on current status</CardDescription>
            </CardHeader>
          </div>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="font-semibold text-sm mb-2">Status</p>
                <Select value={status} onValueChange={setStatus} disabled={!canEditStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="font-semibold text-sm mb-2">Event Type</p>
                <Select
                  value={eventType}
                  onValueChange={setEventType}
                  disabled={!canEditEventType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="Merchandise">Merchandise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <p className="font-semibold text-sm mb-2">Name</p>
              <Input value={name} onChange={(e) => setName(e.target.value)} disabled={!canEditName} />
            </div>

            <div>
              <p className="font-semibold text-sm mb-2">Description</p>
              <Textarea className="min-h-32" value={desc} onChange={(e) => setDesc(e.target.value)} disabled={!canEditDesc} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="font-semibold text-sm mb-2">Eligibility</p>
                <Select value={eligibility} onValueChange={setEligibility} disabled={!canEditEligibility}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select eligibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IIITH">IIITH</SelectItem>
                    <SelectItem value="Non-IIITH">Non-IIITH</SelectItem>
                    <SelectItem value="Both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="font-semibold text-sm mb-2">Registration Deadline</p>
                <Input
                  type="date"
                  value={registrationDeadline}
                  onChange={(e) => setRegistrationDeadline(e.target.value)}
                  disabled={!canEditRegDeadline}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="font-semibold text-sm mb-2">Event Start Date</p>
                <Input
                  type="date"
                  value={eventStartDate}
                  onChange={(e) => setEventStartDate(e.target.value)}
                  disabled={!canEditEventDates}
                />
              </div>
              <div>
                <p className="font-semibold text-sm mb-2">Event End Date</p>
                <Input
                  type="date"
                  value={eventEndDate}
                  onChange={(e) => setEventEndDate(e.target.value)}
                  disabled={!canEditEventDates}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="font-semibold text-sm mb-2">Registration Limit</p>
                <Input value={registrationLimit} onChange={(e) => setRegistrationLimit(e.target.value)} disabled={!canEditRegLimit} />
              </div>

              <div>
                <p className="font-semibold text-sm mb-2">Price</p>
                <Input value={price} onChange={(e) => setPrice(e.target.value)} disabled={!canEditPrice} />
              </div>
              <div>
                <p className="font-semibold text-sm mb-2">Tags (comma-separated)</p>
                <Input
                  value={eventTags}
                  onChange={(e) => setEventTags(e.target.value)}
                  disabled={!canEditTags}
                />
              </div>
            </div>

            {isMerchandise && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="font-semibold text-sm mb-2">Stock Quantity</p>
                  <Input value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} disabled={!canEditMerch} />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-2">Purchase Limit</p>
                  <Input value={purchaseLimit} onChange={(e) => setPurchaseLimit(e.target.value)} disabled={!canEditMerch} />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-2">Variants (comma-separated)</p>
                  <Input
                    value={variants}
                    onChange={(e) => setVariants(e.target.value)}
                    disabled={!canEditMerch}
                  />
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm">Custom Form</p>
                <Button
                  variant="outline"
                  type="button"
                  disabled={!canEditForm}
                  onClick={addQuestion}
                >
                  Add Question
                </Button>
              </div>

              {customForm.length === 0 && (
                <div className="text-muted-foreground">No questions added yet.</div>
              )}

              {customForm.map((item, index) => (
                <div key={`question-${index}`} className="border border-foreground p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Question {index + 1}</p>
                    <Button
                      variant="outline"
                      type="button"
                      disabled={!canEditForm}
                      onClick={() => removeQuestion(index)}
                    >
                      Remove
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold text-sm mb-2">Label</p>
                      <Input
                        value={item.label}
                        disabled={!canEditForm}
                        onChange={(event) => updateQuestion(index, { label: event.target.value })}
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-2">Field Type</p>
                      <Select
                        value={item.fieldType}
                        disabled={!canEditForm}
                        onValueChange={(value) =>
                          updateQuestion(index, {
                            fieldType: value,
                            options: value === "dropdown" ? item.options : [],
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select field type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">text</SelectItem>
                          <SelectItem value="number">number</SelectItem>
                          <SelectItem value="dropdown">dropdown</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold text-sm mb-2">Required</p>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={item.required}
                          disabled={!canEditForm}
                          onChange={(event) => updateQuestion(index, { required: event.target.checked })}
                        />
                        <span className="text-sm">Required field</span>
                      </label>
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-2">Order</p>
                      <Input value={String(item.order)} disabled />
                    </div>
                  </div>

                  {item.fieldType === "dropdown" && (
                    <div className="space-y-2">
                      <p className="font-semibold text-sm">Options</p>
                      {item.options.length === 0 && (
                        <div className="text-muted-foreground">No options added.</div>
                      )}
                      {item.options.map((opt: string, optIndex: number) => (
                        <div key={`opt-${index}-${optIndex}`} className="flex items-center gap-2">
                          <Input
                            value={opt}
                            disabled={!canEditForm}
                            onChange={(event) => updateOption(index, optIndex, event.target.value)}
                          />
                          <Button
                            variant="outline"
                            type="button"
                            disabled={!canEditForm}
                            onClick={() => removeOption(index, optIndex)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        type="button"
                        disabled={!canEditForm}
                        onClick={() => addOption(index)}
                      >
                        Add Option
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              {status === "Draft" && (
                <>
                  <Button 
                    variant="default" 
                    disabled={saving}
                    onClick={() => handleSave(false)}
                  >
                    {saving ? "Saving..." : "Save Draft"}
                  </Button>
                  <Button 
                    variant="outline" 
                    disabled={saving}
                    onClick={() => handleSave(true)}
                  >
                    {saving ? "Publishing..." : "Publish Event"}
                  </Button>
                </>
              )}
              {status !== "Draft" && (
                <Button 
                  variant="default" 
                  disabled={saving}
                  onClick={() => handleSave(false)}
                >
                  {saving ? "Saving..." : "Save Event"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
