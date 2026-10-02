"use client";

import dynamic from "next/dynamic";

type Coordinate = {
  latitude: number;
  longitude: number;
};

type Props = {
  originLocation?: Coordinate | null;
  currentLocation: Coordinate | null;
  destination: Coordinate | null;
  route: Coordinate[];
  shippingMode: string | null;
  serviceType: string | null;
  originAirport: string | null;
  destinationAirport: string | null;
  originAirportLocation?: Coordinate | null;
  destinationAirportLocation?: Coordinate | null;
  status: string | null;
  flightNumber: string | null;
  awbNumber: string | null;
  trackingNumber: string;
};

const ShipmentMap = dynamic(
  () => import("./ShipmentMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[500px] items-center justify-center rounded-2xl bg-slate-100">
        <p className="text-slate-500">
          Loading shipment map...
        </p>
      </div>
    ),
  }
);

export default function ShipmentMapClient({
  originLocation = null,
  currentLocation,
  destination,
  route,
  shippingMode,
  serviceType,
  originAirport,
  destinationAirport,
  originAirportLocation = null,
  destinationAirportLocation = null,
  status,
  flightNumber,
  awbNumber,
  trackingNumber,
}: Props) {
  return (
    <ShipmentMap
      originLocation={originLocation}
      currentLocation={currentLocation}
      destination={destination}
      route={route}
      shippingMode={shippingMode}
      serviceType={serviceType}
      originAirport={originAirport}
      destinationAirport={destinationAirport}
      originAirportLocation={originAirportLocation}
      destinationAirportLocation={
        destinationAirportLocation
      }
      status={status}
      flightNumber={flightNumber}
      awbNumber={awbNumber}
      trackingNumber={trackingNumber}
    />
  );
}