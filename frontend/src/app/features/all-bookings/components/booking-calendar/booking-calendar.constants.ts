export interface VehicleStyle {
  color: string;
  borderColor: string;
  icon: string;
}

export const VEHICLE_STYLES: Record<string, VehicleStyle> = {
  Sedan: { color: "#0ea5e9", borderColor: "#0284c7", icon: "directions_car" },
  Pickup: { color: "#be3350", borderColor: "#982840", icon: "local_shipping" },
  Van: { color: "#d25414", borderColor: "#aa410d", icon: "airport_shuttle" },
  SUV: { color: "#2b9f6f", borderColor: "#207a54", icon: "time_to_leave" },
  Other: { color: "#7542d9", borderColor: "#5c30b2", icon: "commute" },
};
