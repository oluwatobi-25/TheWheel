"use client";

import { Bell, Edit2, Trash2, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { deleteAlert } from "@/lib/actions/alert.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface AlertPanelProps {
  alerts: any[];
  watchlistData: StockWithData[];
}

export default function AlertPanel({ alerts, watchlistData }: AlertPanelProps) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const res = await deleteAlert(id);
      if (res.success) {
        toast.success("Alert deleted");
        router.refresh();
      } else {
        toast.error("Failed to delete alert");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="alert-panel flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-2">
        <Bell className="h-6 w-6 text-yellow-500" />
        <h2 className="text-2xl font-bold text-white">Price Alerts</h2>
      </div>

      {/* Grey outer container */}
      <div className="bg-gray-900 rounded-2xl p-3 flex flex-col gap-3">
        {alerts.length === 0 ? (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
            <p className="text-gray-500 text-base">No active alerts set.</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const stockInfo = watchlistData.find(s => s.symbol === alert.symbol);
            const currentPrice = stockInfo?.currentPrice || alert.lastPrice || 0;
            const changePercent = stockInfo?.changePercent || 0;
            const changeFormatted = stockInfo?.changeFormatted || "0.00%";

            return (
              <div
                key={alert._id}
                className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex flex-col gap-3"
              >
                {/* Top row: logo + name/price + ticker/change */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gray-700 flex items-center justify-center overflow-hidden">
                      <img
                        src={`https://logo.clearbit.com/${alert.symbol.toLowerCase()}.com`}
                        alt={alert.symbol}
                        className="h-8 w-8 object-contain"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                          (e.currentTarget.nextSibling as HTMLElement).style.display = "flex";
                        }}
                      />
                      <span
                        style={{ display: "none" }}
                        className="text-white font-bold text-xl w-full h-full items-center justify-center"
                      >
                        {alert.symbol.charAt(0)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-lg font-semibold text-white leading-tight">
                        {alert.company}
                      </span>
                      <span className="text-base text-gray-400 font-mono">
                        {formatPrice(currentPrice)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-lg font-semibold text-white uppercase">
                      {alert.symbol}
                    </span>
                    <span className={`text-base font-mono ${changePercent >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {changePercent >= 0 ? "+" : ""}{changeFormatted}
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-700" />

                {/* Bottom row: alert condition + actions + frequency */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm text-gray-500 uppercase tracking-wider">Alert:</span>
                    <span className="text-lg font-bold text-white">
                      Price {alert.alertType === "upper" ? ">" : alert.alertType === "equal" ? "=" : "<"} {formatPrice(alert.threshold)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="p-1.5 text-gray-400 hover:text-white transition-colors">
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(alert._id)}
                      disabled={deleting === alert._id}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      {deleting === alert._id
                        ? <Loader2 className="h-5 w-5 animate-spin" />
                        : <Trash2 className="h-5 w-5" />
                      }
                    </button>
                    <span className="text-sm px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 whitespace-nowrap">
                      {alert.frequency?.replace(/-/g, " ")}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}