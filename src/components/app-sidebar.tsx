import React from "react";
import { Calendar, Target, Bell, Download, Calculator, Home, BookOpen, Heart, Trophy, Users, TrendingUp, Shield, DollarSign, Crown, GraduationCap, HelpCircle, Mail, PanelLeft, UserCheck, BarChart3 } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Calculator", url: "/calculator", icon: Calculator },
  { title: "User Guide", url: "/user-guide", icon: HelpCircle },
];

const calendarItems = [
  { title: "Payment Calendar", url: "/calendar", icon: Calendar },
  { title: "Goal Planning", url: "/calendar/goals", icon: Target },
  { title: "Reminders", url: "/calendar/reminders", icon: Bell },
  { title: "Export", url: "/calendar/export", icon: Download },
];

const educationItems = [
  { title: "Framework Steps", url: "/framework", icon: BookOpen },
  { title: "Daily Devotionals", url: "/devotionals", icon: Heart },
];

const motivationItems = [
  { title: "Achievements", url: "/achievements", icon: Trophy },
  { title: "Accountability", url: "/accountability", icon: Users },
  { title: "Prayer Corner", url: "/prayers", icon: Heart },
  { title: "Coaching", url: "/coaching", icon: GraduationCap },
];

const advancedToolsItems = [
  { title: "Income Optimization", url: "/income-optimization", icon: TrendingUp },
  { title: "Emergency Fund", url: "/emergency-fund-calculator", icon: Shield },
  { title: "Giving Tracker", url: "/giving-stewardship-tracker", icon: DollarSign },
  { title: "Legacy Planning", url: "/legacy-planning", icon: Crown },
];

const adminItems = [
  { title: "Email Automation", url: "/admin/email-automation", icon: Mail },
  { title: "Debt Management", url: "/admin/debt-manage", icon: DollarSign },
  { title: "Lead Management", url: "/admin/lead-manage", icon: UserCheck },
  { title: "Lead Analytics", url: "/admin/lead-analytics", icon: BarChart3 },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;
  const { user } = useAuth();

  // Centralized active path check for all sidebar items
  const isActive = (path: string) => currentPath === path;
  
  // Unified styles: subtle blurred purple bg when active; transparent when not
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "font-semibold text-brand-purple bg-brand-purple/10 border-l-4 border-brand-purple pl-2"
      : "bg-transparent text-brand-charcoal hover:bg-brand-purple/5 hover:text-brand-purple transition-colors";

  // Button container classes to strictly control background
  const getButtonCls = (active: boolean) => (
    active
      ? "bg-brand-purple/10"
      : "bg-transparent hover:bg-brand-purple/5"
  );

  return (
    <Sidebar collapsible="icon" variant="inset" className="border-r border-brand-purple/10">
      {/* Custom Toggle Button */}
      <div className="flex justify-end p-3 pr-2 border-b border-brand-purple/10 group-data-[collapsible=icon]:px-0">
        <SidebarTrigger className="h-8 w-8 text-brand-purple hover:bg-brand-purple/10 hover:text-brand-purple hover:scale-110 transition-all duration-200 ease-out" />
      </div>

      <SidebarContent className="px-2 py-3 space-y-3 group-data-[collapsible=icon]:px-0">
        {/* Admin Section - Only visible to admin users */}
        {user?.role === 'admin' && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold text-brand-charcoal uppercase tracking-wider mb-3 px-3">
              Admin
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title} isActive={isActive(item.url)} className={getButtonCls(isActive(item.url))}>
                      <NavLink to={item.url} end className={getNavCls}>
                        <item.icon className={`${!collapsed ? "mr-3 " : ""}h-5 w-5`} />
                        {!collapsed && <span className="font-medium">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Main Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-brand-charcoal uppercase tracking-wider mb-2 px-3">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={isActive(item.url)} className={getButtonCls(isActive(item.url))}>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className={`${!collapsed ? "mr-3 " : ""}h-5 w-5`} />
                      {!collapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Calendar Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-brand-charcoal uppercase tracking-wider mb-2 px-3">
            Calendar
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {calendarItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={isActive(item.url)} className={getButtonCls(isActive(item.url))}>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className={`${!collapsed ? "mr-3 " : ""}h-5 w-5`} />
                      {!collapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Education Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-brand-charcoal uppercase tracking-wider mb-2 px-3">
            Education
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {educationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={isActive(item.url)} className={getButtonCls(isActive(item.url))}>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className={`${!collapsed ? "mr-3 " : ""}h-5 w-5`} />
                      {!collapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Motivation Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-brand-charcoal uppercase tracking-wider mb-2 px-3">
            Motivation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {motivationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={isActive(item.url)} className={getButtonCls(isActive(item.url))}>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className={`${!collapsed ? "mr-3 " : ""}h-5 w-5`} />
                      {!collapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Advanced Tools Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-brand-charcoal uppercase tracking-wider mb-2 px-3">
            Advanced Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {advancedToolsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={isActive(item.url)} className={getButtonCls(isActive(item.url))}>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className={`${!collapsed ? "mr-3 " : ""}h-5 w-5`} />
                      {!collapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}