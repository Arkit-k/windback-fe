"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  useExchangeRates,
  useConvertCurrency,
  useUpsertExchangeRate,
} from "@/hooks/use-exchange-rates";
import type { ExchangeRate, ConvertedAmount } from "@/types/api";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  Skeleton,
} from "@windback/ui";
import {
  Plus,
  Loader2,
  ArrowRightLeft,
  DollarSign,
  RefreshCw,
} from "lucide-react";

export default function ExchangeRatesPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: rates, isLoading } = useExchangeRates(slug);
  const convertCurrency = useConvertCurrency(slug);
  const upsertRate = useUpsertExchangeRate(slug);

  // Converter state
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [amount, setAmount] = useState<string>("100");
  const [conversionResult, setConversionResult] =
    useState<ConvertedAmount | null>(null);

  // Upsert dialog state
  const [showUpsert, setShowUpsert] = useState(false);
  const [upsertFrom, setUpsertFrom] = useState("");
  const [upsertTo, setUpsertTo] = useState("");
  const [upsertRateValue, setUpsertRateValue] = useState("");

  function handleConvert() {
    if (!fromCurrency.trim() || !toCurrency.trim() || !amount) return;
    convertCurrency.mutate(
      {
        from: fromCurrency.trim().toUpperCase(),
        to: toCurrency.trim().toUpperCase(),
        amount_cents: Math.round(parseFloat(amount) * 100),
      },
      {
        onSuccess: (data) => {
          setConversionResult(data);
        },
      },
    );
  }

  function resetUpsertForm() {
    setUpsertFrom("");
    setUpsertTo("");
    setUpsertRateValue("");
  }

  function handleUpsert() {
    if (!upsertFrom.trim() || !upsertTo.trim() || !upsertRateValue) return;
    upsertRate.mutate(
      {
        from_currency: upsertFrom.trim().toUpperCase(),
        to_currency: upsertTo.trim().toUpperCase(),
        rate: parseFloat(upsertRateValue),
      },
      {
        onSuccess: () => {
          setShowUpsert(false);
          resetUpsertForm();
        },
      },
    );
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Exchange Rates
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage currency exchange rates and convert between currencies.
          </p>
        </div>
        <Dialog open={showUpsert} onOpenChange={setShowUpsert}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              onClick={() => {
                resetUpsertForm();
                setShowUpsert(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add / Update Rate
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add or Update Exchange Rate</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="upsert-from">From Currency</Label>
                  <Input
                    id="upsert-from"
                    placeholder="e.g. USD"
                    value={upsertFrom}
                    onChange={(e) => setUpsertFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="upsert-to">To Currency</Label>
                  <Input
                    id="upsert-to"
                    placeholder="e.g. EUR"
                    value={upsertTo}
                    onChange={(e) => setUpsertTo(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="upsert-rate">Rate</Label>
                <Input
                  id="upsert-rate"
                  type="number"
                  step="0.000001"
                  placeholder="e.g. 0.92"
                  value={upsertRateValue}
                  onChange={(e) => setUpsertRateValue(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowUpsert(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpsert}
                disabled={
                  upsertRate.isPending ||
                  !upsertFrom.trim() ||
                  !upsertTo.trim() ||
                  !upsertRateValue
                }
              >
                {upsertRate.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Currency Converter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Currency Converter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="space-y-1">
              <Label htmlFor="convert-from">From</Label>
              <Input
                id="convert-from"
                placeholder="USD"
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="w-24"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="convert-to">To</Label>
              <Input
                id="convert-to"
                placeholder="EUR"
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="w-24"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="convert-amount">Amount</Label>
              <Input
                id="convert-amount"
                type="number"
                step="0.01"
                placeholder="100.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-32"
              />
            </div>
            <Button
              onClick={handleConvert}
              disabled={convertCurrency.isPending}
            >
              {convertCurrency.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Convert
            </Button>
          </div>

          {conversionResult && (
            <div className="mt-4 rounded-lg border border-border bg-secondary/50 p-4">
              <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <DollarSign className="h-5 w-5" />
                {(conversionResult.original_amount / 100).toFixed(2)}{" "}
                {conversionResult.from_currency}
                <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                {(conversionResult.converted_amount / 100).toFixed(2)}{" "}
                {conversionResult.to_currency}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Rate: 1 {conversionResult.from_currency} ={" "}
                {conversionResult.rate} {conversionResult.to_currency}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exchange Rates Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Exchange Rates
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !rates || rates.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <ArrowRightLeft className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                No exchange rates configured yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 pr-4 font-medium text-muted-foreground">
                      From
                    </th>
                    <th className="pb-3 pr-4 font-medium text-muted-foreground">
                      To
                    </th>
                    <th className="pb-3 pr-4 font-medium text-muted-foreground">
                      Rate
                    </th>
                    <th className="pb-3 font-medium text-muted-foreground">
                      Last Updated
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rates.map((rate) => (
                    <tr
                      key={rate.id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="py-3 pr-4">
                        <Badge variant="outline">{rate.from_currency}</Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant="outline">{rate.to_currency}</Badge>
                      </td>
                      <td className="py-3 pr-4 font-mono text-foreground">
                        {rate.rate}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {formatDate(rate.updated_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
