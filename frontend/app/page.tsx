"use client"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {useRouter} from "next/navigation"

export default function profile() {

    const router = useRouter();

    return (

        router.push("/login")

    )
}