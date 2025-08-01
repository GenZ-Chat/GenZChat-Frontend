import { Calendar, Home, Inbox, Search, Settings, MessageCircle, User, Phone, Video, Users } from "lucide-react"
import { Input } from "@/components/ui/input"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"



// Friends list
const friends = [
  {
    name: "Alice Johnson",
    status: "online",
    avatar: "A",
  },
  {
    name: "Bob Smith", 
    status: "away",
    avatar: "B",
  },
  {
    name: "Charlie Brown",
    status: "online", 
    avatar: "C",
  },
  {
    name: "Diana Lee",
    status: "offline",
    avatar: "D",
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      {/* Header with Logo and App Name */}
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-primary" />
          <span className="text-xl font-semibold">GenZChat</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Search Input */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search friends..."
              className="pl-9"
            />
          </div>
        </div>

        {/* Friends List */}
        <SidebarGroup>
          <SidebarGroupLabel>Friends</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {friends.map((friend) => (
                <SidebarMenuItem key={friend.name}>
                  <SidebarMenuButton className="h-12 justify-start gap-3">
                    <div className="relative">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                        {friend.avatar}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${
                        friend.status === 'online' 
                          ? 'bg-green-500' 
                          : friend.status === 'away' 
                          ? 'bg-yellow-500' 
                          : 'bg-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium">{friend.name}</div>
                      <div className="text-xs text-muted-foreground capitalize">{friend.status}</div>
                    </div>
                    <div className="flex gap-1">
                      <button className="h-7 w-7 rounded-md hover:bg-accent hover:text-accent-foreground flex items-center justify-center">
                        <Phone className="h-3 w-3" />
                      </button>
                      <button className="h-7 w-7 rounded-md hover:bg-accent hover:text-accent-foreground flex items-center justify-center">
                        <Video className="h-3 w-3" />
                      </button>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 dark:from-green-600 dark:to-green-700 dark:hover:from-green-700 dark:hover:to-green-800 text-white font-semibold h-11 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <Users className="h-4 w-4 mr-2 relative z-10" />
              <span className="relative z-10 text-sm">Find Friends</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}