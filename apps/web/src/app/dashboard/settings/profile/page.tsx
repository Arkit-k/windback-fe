"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Input,
  Label,
  Badge,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@windback/ui";
import { useAuth, useUpdateProfile } from "@/hooks/use-auth";
import { User as UserIcon, Building2, CreditCard } from "lucide-react";

const BUSINESS_TYPES = ["SaaS", "E-commerce", "Marketplace", "Agency", "Other"];

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessLocation, setBusinessLocation] = useState("");
  const [businessType, setBusinessType] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBusinessName(user.business_name || "");
      setBusinessLocation(user.business_location || "");
      setBusinessType(user.business_type || "");
    }
  }, [user]);

  const [profileSaved, setProfileSaved] = useState(false);
  const [businessSaved, setBusinessSaved] = useState(false);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    await updateProfile.mutateAsync({ name });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  }

  async function handleSaveBusiness(e: React.FormEvent) {
    e.preventDefault();
    await updateProfile.mutateAsync({
      business_name: businessName,
      business_location: businessLocation,
      business_type: businessType,
    });
    setBusinessSaved(true);
    setTimeout(() => setBusinessSaved(false), 2000);
  }

  if (!user) return null;

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your personal and business information.</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-muted-foreground" />
            Profile
          </CardTitle>
          <CardDescription>Your personal information.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--accent-light)] text-lg font-semibold text-[var(--accent)]">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                minLength={2}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email} disabled className="opacity-60" />
              <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
            </div>

            {updateProfile.error && (
              <p className="text-sm text-destructive">{updateProfile.error.message}</p>
            )}

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? "Saving..." : "Save"}
              </Button>
              {profileSaved && (
                <span className="text-sm text-green-600">Saved!</span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Business Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            Business Info
          </CardTitle>
          <CardDescription>Your business details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveBusiness} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="business-name">Business Name</Label>
              <Input
                id="business-name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Acme Inc."
                maxLength={255}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business-location">Location</Label>
              <Input
                id="business-location"
                value={businessLocation}
                onChange={(e) => setBusinessLocation(e.target.value)}
                placeholder="San Francisco, CA"
                maxLength={255}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business-type">Business Type</Label>
              <Select value={businessType || undefined} onValueChange={setBusinessType}>
                <SelectTrigger id="business-type" className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {BUSINESS_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {updateProfile.error && (
              <p className="text-sm text-destructive">{updateProfile.error.message}</p>
            )}

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? "Saving..." : "Save"}
              </Button>
              {businessSaved && (
                <span className="text-sm text-green-600">Saved!</span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Account Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            Account
          </CardTitle>
          <CardDescription>Your account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Plan</span>
            <Badge variant="secondary" className="capitalize">
              {user.plan_tier || "starter"}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Member Since</span>
            <span className="text-sm text-foreground">
              {new Date(user.created_at).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Account ID</span>
            <code className="text-xs text-muted-foreground">{user.id}</code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
