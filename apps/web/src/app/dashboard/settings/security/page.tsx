"use client";

import { useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Label } from "@windback/ui";
import { useAuth } from "@/hooks/use-auth";
import { useEnable2FA, useVerify2FA, useDisable2FA } from "@/hooks/use-totp";
import { Shield, ShieldCheck, ShieldOff } from "lucide-react";

export default function SecuritySettingsPage() {
  const { user } = useAuth();
  const enable2FA = useEnable2FA();
  const verify2FA = useVerify2FA();
  const disable2FA = useDisable2FA();

  const [step, setStep] = useState<"idle" | "setup" | "verify">("idle");
  const [secret, setSecret] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [code, setCode] = useState("");
  const [disableCode, setDisableCode] = useState("");

  const is2FAEnabled = user?.totp_enabled;

  async function handleEnable() {
    const result = await enable2FA.mutateAsync();
    setSecret(result.data.secret);
    setQrUrl(result.data.qr_url);
    setStep("setup");
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    await verify2FA.mutateAsync(code);
    setStep("idle");
    setCode("");
    setSecret("");
    setQrUrl("");
  }

  async function handleDisable(e: React.FormEvent) {
    e.preventDefault();
    await disable2FA.mutateAsync(disableCode);
    setDisableCode("");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Security</h1>
        <p className="text-sm text-muted-foreground">Manage your account security settings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {is2FAEnabled ? (
              <ShieldCheck className="h-5 w-5 text-green-500" />
            ) : (
              <Shield className="h-5 w-5 text-muted-foreground" />
            )}
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            {is2FAEnabled
              ? "2FA is enabled. Your account has an extra layer of security."
              : "Add an extra layer of security to your account with TOTP-based 2FA."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!is2FAEnabled && step === "idle" && (
            <Button onClick={handleEnable} disabled={enable2FA.isPending}>
              {enable2FA.isPending ? "Setting up..." : "Enable 2FA"}
            </Button>
          )}

          {step === "setup" && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">1. Scan this QR code with your authenticator app:</p>
                <div className="mt-2 rounded-lg border border-border bg-white p-4 inline-block">
                  <img src={qrUrl} alt="2FA QR Code" className="h-48 w-48" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Or enter this secret manually:</p>
                <code className="mt-1 block rounded bg-muted px-3 py-2 text-sm font-mono">{secret}</code>
              </div>
              <form onSubmit={handleVerify} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="verify-code">2. Enter the 6-digit code from your app:</Label>
                  <Input
                    id="verify-code"
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    maxLength={6}
                    pattern="[0-9]{6}"
                    required
                    className="max-w-[200px]"
                  />
                </div>
                {verify2FA.error && (
                  <p className="text-sm text-destructive">{verify2FA.error.message}</p>
                )}
                <Button type="submit" disabled={verify2FA.isPending}>
                  {verify2FA.isPending ? "Verifying..." : "Verify & Enable"}
                </Button>
              </form>
            </div>
          )}

          {is2FAEnabled && step === "idle" && (
            <form onSubmit={handleDisable} className="space-y-3">
              <p className="text-sm text-muted-foreground">
                To disable 2FA, enter your current TOTP code.
              </p>
              <div className="flex items-end gap-3">
                <div className="space-y-2">
                  <Label htmlFor="disable-code">TOTP Code</Label>
                  <Input
                    id="disable-code"
                    placeholder="000000"
                    value={disableCode}
                    onChange={(e) => setDisableCode(e.target.value)}
                    maxLength={6}
                    pattern="[0-9]{6}"
                    required
                    className="max-w-[200px]"
                  />
                </div>
                <Button type="submit" variant="destructive" disabled={disable2FA.isPending}>
                  <ShieldOff className="mr-2 h-4 w-4" />
                  {disable2FA.isPending ? "Disabling..." : "Disable 2FA"}
                </Button>
              </div>
              {disable2FA.error && (
                <p className="text-sm text-destructive">{disable2FA.error.message}</p>
              )}
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
