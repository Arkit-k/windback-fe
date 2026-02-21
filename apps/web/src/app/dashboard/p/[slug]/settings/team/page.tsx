"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Input,
  Badge,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Skeleton,
} from "@windback/ui";
import { toast } from "@windback/ui";
import { useCurrentProject } from "@/providers/project-provider";
import { useAuth } from "@/hooks/use-auth";
import { useTeam, useInviteTeamMember, useRemoveTeamMember } from "@/hooks/use-team";
import { Trash2, Send } from "lucide-react";
import type { TeamRole } from "@/types/api";

export default function TeamSettingsPage() {
  const { slug, project } = useCurrentProject();
  const { user } = useAuth();
  const { data: teamData, isLoading, error } = useTeam(slug);
  const inviteMutation = useInviteTeamMember(slug);
  const removeMutation = useRemoveTeamMember(slug);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamRole>("member");

  const members = teamData?.data ?? [];
  const isOwner =
    user?.id === project.user_id ||
    members.some((m) => m.user_id === user?.id && m.role === "owner");

  function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    inviteMutation.mutate(
      { email: trimmed, role },
      {
        onSuccess: () => {
          toast({ title: "Invitation sent", description: `Invited ${trimmed} as ${role}.` });
          setEmail("");
          setRole("member");
        },
        onError: (err) => {
          toast({ title: "Failed to invite", description: err.message, variant: "destructive" });
        },
      }
    );
  }

  function handleRemove(memberId: string, memberEmail: string) {
    removeMutation.mutate(memberId, {
      onSuccess: () => {
        toast({ title: "Member removed", description: `${memberEmail} has been removed from the team.` });
      },
      onError: (err) => {
        toast({ title: "Failed to remove", description: err.message, variant: "destructive" });
      },
    });
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Team Members</h1>
        <p className="text-sm text-muted-foreground">
          Manage who has access to {project.name}.
        </p>
      </div>

      {/* Invite form */}
      {isOwner && (
        <Card>
          <CardHeader>
            <CardTitle>Invite a Team Member</CardTitle>
            <CardDescription>
              Send an invitation email to add someone to this project.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground">Email</label>
                <Input
                  type="email"
                  placeholder="teammate@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="w-full sm:w-40">
                <label className="text-xs font-medium text-muted-foreground">Role</label>
                <Select value={role} onValueChange={(v) => setRole(v as TeamRole)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={inviteMutation.isPending}>
                <Send className="mr-2 h-4 w-4" />
                {inviteMutation.isPending ? "Sending..." : "Invite"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Team member list */}
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            {members.length} member{members.length !== 1 ? "s" : ""} in this project.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <p className="text-sm text-destructive">
              Failed to load team members. Please try again.
            </p>
          ) : members.length === 0 ? (
            <p className="text-sm text-muted-foreground">No team members yet.</p>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar placeholder */}
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-light)] text-sm font-medium text-[var(--accent)]">
                      {getInitials(member.user_name || member.user_email)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {member.user_name || "Unnamed"}
                      </p>
                      <p className="text-xs text-muted-foreground">{member.user_email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={member.role === "owner" ? "default" : "secondary"}>
                      {member.role === "owner" ? "Owner" : "Member"}
                    </Badge>
                    {isOwner && member.role !== "owner" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(member.id, member.user_email)}
                        disabled={removeMutation.isPending}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
