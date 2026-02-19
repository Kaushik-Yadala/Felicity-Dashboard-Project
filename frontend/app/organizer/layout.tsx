"use client"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/8bit/navigation-menu"
import { Button } from "@/components/ui/8bit/button"
import Link from "next/link"
import {useRouter} from "next/navigation"
import { useEffect } from "react"
import apiClient from "@/lib/apiClient"

export default function ParticipantLayout({ children }: { children: React.ReactNode }) {

  const router = useRouter();

  useEffect(() => {

    const checkAuth = async () => {

      try {

        const response = await apiClient.get("/auth/organizer");
        console.log("Auth check response:", response);

        console.log("Auth check response data:", response?.data);

        if(!response?.data?.success) {
          router.push("/unauthorized");
        }

      } catch (error) {
        console.log("Auth check error:", error);
        router.push("/unauthorized");
      }

    }

    checkAuth();

  }, [])

  return (
    <>
      <nav className="border-b-6 border-foreground dark:border-ring">
        <div className="max-w-full mx-auto px-6 py-4">
          <NavigationMenu className="w-full mx-auto flex justify-center">
            <NavigationMenuList className="flex items-center justify-center gap-8">
              <NavigationMenuItem>
                <NavigationMenuLink className="px-3 py-2 font-medium hover:text-primary transition-colors cursor-pointer" asChild>
                    <Link href="/organizer/dashboard">Dashboard</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink className="px-3 py-2 font-medium hover:text-primary transition-colors cursor-pointer" asChild>
                    <Link href="/organizer/createEvent">Create Event</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuLink className="px-3 py-2 font-medium hover:text-primary transition-colors cursor-pointer" asChild>
                    <Link href="/organizer/ongoingEvents">Ongoing Events</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink className="px-3 py-2 font-medium hover:text-primary transition-colors cursor-pointer" asChild>
                    <Link href="/organizer/payments">Approve Payments</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuLink className="px-3 py-2 font-medium hover:text-primary transition-colors cursor-pointer" asChild>
                    <Link href="/organizer/profile">Profile</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>


              <NavigationMenuItem>
                <Button variant="outline" size="sm" className="text-red-500 hover:bg-red-500 hover:text-white" onClick={
                    (e)=>{
                        localStorage.removeItem("felicity_token");
                        router.push("/login");
                    }
                }>
                  Logout
                </Button>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </nav>
      <main>
        {children}
      </main>
    </>
  )
}