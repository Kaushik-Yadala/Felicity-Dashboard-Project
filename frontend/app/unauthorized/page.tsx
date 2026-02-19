'use client'

import {Label} from "@/components/ui/8bit/label";
import { Button } from "@/components/ui/8bit/button"
import { useRouter } from "next/navigation"

export default function unauthorized() {

    const router = useRouter();

    return (

        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-4xl font-bold mb-4 text-red-500 retro">Unauthorized Access</h1>
            <Label className="text-lg text-gray-600 mb-6 retro">You do not have permission to view this page.</Label>
            <Button variant="outline" className="text-red-500 hover:bg-red-500 hover:text-white" onClick={
                (e)=>{
                    localStorage.removeItem("felicity_token");
                    router.push("/login");
                }
            }>
              Logout
            </Button>
        </div>

    )

}