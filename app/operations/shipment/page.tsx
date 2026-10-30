import ShipmentManagementClient from "./ShipmentManagementClient";
import RequireAuth from "@/app/components/RequireAuth";

type PageProps = {
  searchParams: Promise<{
    shipment?: string;
    tracking?: string;
  }>;
};

export default async function ShipmentPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  return (
    <RequireAuth>
      <ShipmentManagementClient
        shipmentId={params.shipment || ""}
        tracking={params.tracking || ""}
      />
    </RequireAuth>
  );
}
