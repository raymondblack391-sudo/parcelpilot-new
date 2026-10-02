import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import RequireAuth from "@/app/components/RequireAuth";
import StaffNav from "@/app/components/StaffNav";
import EditShipmentForm from "@/app/components/EditShipmentForm";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditShipmentPage({
  params,
}: Props) {
  const { id } = await params;

  const { data: shipment, error } = await supabase
    .from("shipments")
    .select("*")
    .eq("tracking_number", id)
    .single();

  if (error || !shipment) {
    notFound();
  }

  return (
    <RequireAuth>
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <StaffNav />

        <div className="mx-auto max-w-5xl px-6 py-8">
          <div className="mb-8">
            <Link
              href={`/operations/shipment?shipment=${encodeURIComponent(
                shipment.id
              )}`}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              ← Back to Shipment Management
            </Link>

            <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-blue-600">
              Shipment Management
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
              Edit Shipment
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Update shipment information without changing its
              operational tracking location or status.
            </p>
          </div>

          <EditShipmentForm
            trackingNumber={shipment.tracking_number || ""}
            senderName={shipment.sender_name || ""}
            receiverName={shipment.receiver_name || ""}
            senderAddress={shipment.sender_address || ""}
            receiverAddress={shipment.receiver_address || ""}
            packageWeight={shipment.package_weight}
            packageCount={shipment.package_count}
            serviceType={shipment.service_type || ""}
            estimatedDeliveryDate={
              shipment.estimated_delivery_date || ""
            }
          />
        </div>
      </main>
    </RequireAuth>
  );
}
