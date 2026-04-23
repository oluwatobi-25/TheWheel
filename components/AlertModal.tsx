"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createAlert } from "@/lib/actions/alert.actions"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    symbol: string;
    company: string;
    currentPrice: number;
    userId: string;
}

export default function AlertModal({
    isOpen,
    onClose,
    symbol,
    company,
    currentPrice,
    userId,
}: AlertModalProps) {
    const [alertName, setAlertName] = useState(`${company} Price Target`)
    const [alertType, setAlertType] = useState<'upper' | 'lower'>('upper')
    const [threshold, setThreshold] = useState(currentPrice.toString())
    const [frequency, setFrequency] = useState<'once-per-minute' | 'once-per-hour' | 'once-per-day'>('once-per-day')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const res = await createAlert({
                userId,
                symbol,
                company,
                alertName,
                alertType,
                threshold: parseFloat(threshold),
                frequency,
            })

            if (res.success) {
                toast.success("Alert created successfully")
                onClose()
            } else {
                toast.error(res.error || "Failed to create alert")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="text-white max-w-md rounded-2xl overflow-hidden border-0 p-0"
                style={{
                    background: "rgba(18, 18, 18, 0.95)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                }}
            >
                {/* Header */}
                <div
                    className="px-6 pt-6 pb-4"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-yellow-400"
                            style={{ background: "rgba(234,179,8,0.12)" }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                            </svg>
                        </div>
                        <div>
                            <DialogTitle className="text-base font-semibold text-white leading-tight">Price Alert</DialogTitle>
                            <p className="text-[11px] text-gray-500 mt-0.5">{company} · {symbol}</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    {/* Alert Name */}
                    <div className="space-y-1.5">
                        <Label htmlFor="alertName" className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Alert Name</Label>
                        <Input
                            id="alertName"
                            value={alertName}
                            onChange={(e) => setAlertName(e.target.value)}
                            className="h-10 text-sm border-0 text-white placeholder:text-gray-600 focus-visible:ring-1 focus-visible:ring-yellow-500/50"
                            style={{ background: "rgba(255,255,255,0.05)" }}
                            placeholder="e.g. Apple at Discount"
                        />
                    </div>

                    {/* Type + Condition row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Alert Type</Label>
                            <Select value="price" disabled>
                                <SelectTrigger
                                    className="h-10 text-sm border-0 text-gray-500 focus:ring-0"
                                    style={{ background: "rgba(255,255,255,0.03)" }}
                                >
                                    <SelectValue placeholder="Price" />
                                </SelectTrigger>
                                <SelectContent style={{ background: "rgba(20,20,20,0.98)", border: "1px solid rgba(255,255,255,0.08)" }}>
                                    <SelectItem value="price" className="text-white focus:bg-white/10">Price</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Condition</Label>
                            <Select value={alertType} onValueChange={(v: any) => setAlertType(v)}>
                                <SelectTrigger
                                    className="h-10 text-sm border-0 text-white focus:ring-1 focus:ring-yellow-500/50"
                                    style={{ background: "rgba(255,255,255,0.05)" }}
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent style={{ background: "rgba(20,20,20,0.98)", border: "1px solid rgba(255,255,255,0.08)" }}>
                                    <SelectItem value="upper" className="text-white focus:bg-white/10">Greater than (&gt;)</SelectItem>
                                    <SelectItem value="lower" className="text-white focus:bg-white/10">Less than (&lt;)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Threshold */}
                    <div className="space-y-1.5">
                        <Label htmlFor="threshold" className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Threshold Value</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                            <Input
                                id="threshold"
                                type="number"
                                step="0.01"
                                value={threshold}
                                onChange={(e) => setThreshold(e.target.value)}
                                className="h-10 pl-7 text-sm border-0 text-white placeholder:text-gray-600 focus-visible:ring-1 focus-visible:ring-yellow-500/50"
                                style={{ background: "rgba(255,255,255,0.05)" }}
                                placeholder="140.00"
                            />
                        </div>
                    </div>

                    {/* Frequency */}
                    <div className="space-y-1.5">
                        <Label className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Frequency</Label>
                        <Select value={frequency} onValueChange={(v: any) => setFrequency(v)}>
                            <SelectTrigger
                                className="h-10 text-sm border-0 text-white focus:ring-1 focus:ring-yellow-500/50"
                                style={{ background: "rgba(255,255,255,0.05)" }}
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent style={{ background: "rgba(20,20,20,0.98)", border: "1px solid rgba(255,255,255,0.08)" }}>
                                <SelectItem value="once-per-minute" className="text-white focus:bg-white/10">Once per minute</SelectItem>
                                <SelectItem value="once-per-hour" className="text-white focus:bg-white/10">Once per hour</SelectItem>
                                <SelectItem value="once-per-day" className="text-white focus:bg-white/10">Once per day</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Submit */}
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold h-11 rounded-xl mt-2 transition-colors"
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Alert"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
