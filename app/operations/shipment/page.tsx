import ShipmentManagementClient from "./ShipmentManagementClient";

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
    <ShipmentManagementClient
      shipmentId={params.shipment || ""}
      tracking={params.tracking || ""}
    />
  );
}
