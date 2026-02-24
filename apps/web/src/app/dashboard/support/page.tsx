"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button } from "@windback/ui";
import { BookOpen, MessageCircle, Mail } from "lucide-react";
import Link from "next/link";

export default function SupportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Support</h1>
        <p className="text-sm text-muted-foreground">Get help with Windback.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-[var(--accent-light)]">
              <BookOpen className="h-5 w-5 text-[var(--accent)]" />
            </div>
            <CardTitle className="mt-3">Documentation</CardTitle>
            <CardDescription>
              Read the full API reference, integration guides, and SDK documentation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link href="/docs" target="_blank">View Docs</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-violet-50">
              <MessageCircle className="h-5 w-5 text-violet-600" />
            </div>
            <CardTitle className="mt-3">Community</CardTitle>
            <CardDescription>
              Join the community to ask questions, share feedback, and connect with other users.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Join Discord</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-green-50">
              <Mail className="h-5 w-5 text-green-600" />
            </div>
            <CardTitle className="mt-3">Email Support</CardTitle>
            <CardDescription>
              Reach out directly for account issues or technical problems.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <a href="mailto:support@windbackai.com">Contact Us</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
