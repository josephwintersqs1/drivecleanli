/** Shared add-on catalog — referenced by service packages */
export interface AddOnDefinition {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
}

export interface VehicleTier {
  id: string;
  label: string;
  price: number;
}

export interface AddOnGroup {
  title: string;
  subtitle?: string;
  addOnIds: string[];
}

export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  /** Lowest tier or flat price — for marketing "From $X" */
  fromPrice: number;
  baseDurationMinutes: number;
  /** Empty = flat-price standalone service */
  vehicleTiers: VehicleTier[];
  flatPrice?: number;
  addOnGroups: AddOnGroup[];
}

export const addOnCatalog: Record<string, AddOnDefinition> = {
  'spray-wax-wheels': {
    id: 'spray-wax-wheels',
    name: 'Nicks High Gloss Spray Wax — Wheels',
    price: 50,
    durationMinutes: 30,
  },
  'ceramic-hand-wax': {
    id: 'ceramic-hand-wax',
    name: 'Nicks Crystal Ceramic Hand Wax',
    price: 100,
    durationMinutes: 60,
  },
  'engine-bay': {
    id: 'engine-bay',
    name: 'Engine Bay Detail',
    price: 50,
    durationMinutes: 30,
  },
  'headlight-restoration': {
    id: 'headlight-restoration',
    name: 'Headlight Restoration',
    price: 50,
    durationMinutes: 30,
  },
  'paint-decon': {
    id: 'paint-decon',
    name: 'Paint Decon. — Clay Treat+Iron Removal',
    price: 100,
    durationMinutes: 60,
  },
  'odor-elimination': {
    id: 'odor-elimination',
    name: 'Odor Elimination Treatment',
    price: 50,
    durationMinutes: 30,
  },
  'heavy-pet-hair': {
    id: 'heavy-pet-hair',
    name: 'Heavy Pet Hair Removal',
    price: 80,
    durationMinutes: 60,
  },
  'light-pet-hair': {
    id: 'light-pet-hair',
    name: 'Light Pet Hair Removal',
    price: 40,
    durationMinutes: 30,
  },
  'fabric-spot-shampoo': {
    id: 'fabric-spot-shampoo',
    name: 'Fabric Spot Shampoo/Extraction',
    price: 50,
    durationMinutes: 30,
  },
};

export const services: ServicePackage[] = [
  {
    id: 'exterior-premium-wash-wax',
    name: 'Exterior Premium Wash & Spray Wax',
    description:
      'Hand wash, wheel and tire cleaning, and a premium spray wax for lasting shine and paint protection.',
    fromPrice: 120,
    baseDurationMinutes: 90,
    vehicleTiers: [
      { id: 'coupe-sedan', label: 'Coupe/Sedan', price: 120 },
      { id: 'truck-suv', label: 'Truck/SUV', price: 150 },
      { id: 'van-3rd-row', label: 'Van/3rd Row Vehicle', price: 180 },
    ],
    addOnGroups: [
      {
        title: 'Exterior Add-ons',
        subtitle: 'Select additional services',
        addOnIds: [
          'spray-wax-wheels',
          'ceramic-hand-wax',
          'engine-bay',
          'headlight-restoration',
          'paint-decon',
        ],
      },
    ],
  },
  {
    id: 'interior-premium-detail',
    name: 'Interior Premium Detail',
    description:
      'Deep vacuum, steam cleaning, leather and plastic conditioning, and streak-free glass throughout the cabin.',
    fromPrice: 200,
    baseDurationMinutes: 150,
    vehicleTiers: [
      { id: 'coupe-sedan', label: 'Coupe/Sedan', price: 200 },
      { id: 'truck-suv', label: 'Truck/SUV', price: 250 },
      { id: 'van-3rd-row', label: 'Van/3rd Row Vehicle', price: 300 },
    ],
    addOnGroups: [
      {
        title: 'Interior Add-ons',
        subtitle: 'Please select any additional services needed',
        addOnIds: [
          'odor-elimination',
          'heavy-pet-hair',
          'light-pet-hair',
          'fabric-spot-shampoo',
        ],
      },
    ],
  },
  {
    id: 'full-detail-exterior-interior',
    name: 'Full Detail — Exterior & Interior',
    description:
      'Our complete inside-and-out package: premium wash, wax, full interior detail, and finishing touches for a showroom-ready vehicle.',
    fromPrice: 250,
    baseDurationMinutes: 240,
    vehicleTiers: [
      { id: 'coupe-sedan', label: 'Coupe/Sedan', price: 250 },
      { id: 'truck-suv', label: 'Truck/SUV', price: 300 },
      { id: 'large-3rd-row', label: 'Large/3rd Row Vehicles', price: 350 },
    ],
    addOnGroups: [
      {
        title: 'Additional Services',
        subtitle: 'Please select any services you would like to add',
        addOnIds: [
          'engine-bay',
          'headlight-restoration',
          'fabric-spot-shampoo',
          'ceramic-hand-wax',
        ],
      },
      {
        title: 'Exterior Add-ons',
        subtitle: 'Select additional services',
        addOnIds: [
          'spray-wax-wheels',
          'ceramic-hand-wax',
          'engine-bay',
          'headlight-restoration',
          'paint-decon',
        ],
      },
      {
        title: 'Interior Add-ons',
        subtitle: 'Please select any additional services needed',
        addOnIds: [
          'odor-elimination',
          'heavy-pet-hair',
          'light-pet-hair',
          'fabric-spot-shampoo',
        ],
      },
    ],
  },
  {
    id: 'basic-full-quick-wash',
    name: 'Basic Full Quick Wash',
    description:
      'Efficient exterior wash plus a refreshed interior — vacuum, wipe-down, and glass — when you need a solid clean in less time.',
    fromPrice: 100,
    baseDurationMinutes: 60,
    vehicleTiers: [
      { id: 'coupe-sedan', label: 'Coupe/Sedan', price: 100 },
      { id: 'truck-suv-van', label: 'Truck, SUV, Van', price: 150 },
    ],
    addOnGroups: [],
  },
  {
    id: 'headlight-restoration',
    name: 'Headlight Restoration',
    description:
      'Restore cloudy or yellowed headlights with professional polishing and sealing for clearer visibility and a sharper front end.',
    fromPrice: 80,
    baseDurationMinutes: 60,
    flatPrice: 80,
    vehicleTiers: [],
    addOnGroups: [],
  },
  {
    id: 'paint-decontamination',
    name: 'Paint Decontamination',
    description:
      'Remove embedded iron, tar, and environmental fallout from paint so your finish feels smooth and ready for wax or sealant.',
    fromPrice: 50,
    baseDurationMinutes: 60,
    flatPrice: 50,
    vehicleTiers: [],
    addOnGroups: [],
  },
  {
    id: 'water-spot-removal-paint',
    name: 'Water Spot Removal (Paint)',
    description:
      'Target stubborn mineral and water spots on body panels with safe correction techniques that revive clarity and gloss.',
    fromPrice: 100,
    baseDurationMinutes: 60,
    flatPrice: 100,
    vehicleTiers: [],
    addOnGroups: [],
  },
  {
    id: 'water-spot-removal-glass',
    name: 'Water Spot Removal (Windows & Mirrors)',
    description:
      'Clear etched water spots from glass and mirrors for improved visibility and a crystal-clean reflection.',
    fromPrice: 50,
    baseDurationMinutes: 60,
    flatPrice: 50,
    vehicleTiers: [],
    addOnGroups: [],
  },
  {
    id: 'engine-bay-detail',
    name: 'Engine Bay Detail',
    description:
      'Degrease, clean, and dress engine bay components for a tidy, well-maintained look under the hood.',
    fromPrice: 50,
    baseDurationMinutes: 60,
    flatPrice: 50,
    vehicleTiers: [],
    addOnGroups: [],
  },
];

export function getServiceById(id: string): ServicePackage | undefined {
  return services.find((s) => s.id === id);
}

export function getAddOnById(id: string): AddOnDefinition | undefined {
  return addOnCatalog[id];
}

export function getServiceImage(id: string): string {
  return `/images/services/${id}.png`;
}

export function serviceHasVehicleTiers(serviceId: string): boolean {
  const service = getServiceById(serviceId);
  return (service?.vehicleTiers.length ?? 0) > 0;
}

export function getDefaultVehicleTierId(serviceId: string): string {
  const service = getServiceById(serviceId);
  return service?.vehicleTiers[0]?.id ?? '';
}

export function getVehicleTier(
  serviceId: string,
  tierId: string
): VehicleTier | undefined {
  const service = getServiceById(serviceId);
  return service?.vehicleTiers.find((t) => t.id === tierId);
}

export function getVehicleTierLabel(
  serviceId: string,
  tierId: string
): string {
  if (!tierId) return 'Standard';
  return getVehicleTier(serviceId, tierId)?.label ?? tierId;
}

export function getAllowedAddOnIds(serviceId: string): Set<string> {
  const service = getServiceById(serviceId);
  if (!service) return new Set();
  const ids = new Set<string>();
  for (const group of service.addOnGroups) {
    for (const id of group.addOnIds) ids.add(id);
  }
  return ids;
}

export function validateBookingSelections(
  serviceId: string,
  vehicleTierId: string,
  addOnIds: string[]
): boolean {
  const service = getServiceById(serviceId);
  if (!service) return false;

  if (service.vehicleTiers.length > 0) {
    if (!getVehicleTier(serviceId, vehicleTierId)) return false;
  }

  const allowed = getAllowedAddOnIds(serviceId);
  return addOnIds.every((id) => allowed.has(id));
}

export function getBaseServicePrice(
  serviceId: string,
  vehicleTierId: string
): number {
  const service = getServiceById(serviceId);
  if (!service) return 0;

  if (service.flatPrice != null) return service.flatPrice;

  const tier = getVehicleTier(serviceId, vehicleTierId);
  return tier?.price ?? 0;
}

export function calculatePrice(
  serviceId: string,
  vehicleTierId: string,
  selectedAddOnIds: string[]
): number {
  const base = getBaseServicePrice(serviceId, vehicleTierId);
  const addOnTotal = selectedAddOnIds.reduce((sum, id) => {
    const addOn = getAddOnById(id);
    return sum + (addOn?.price ?? 0);
  }, 0);
  return base + addOnTotal;
}

export function getTotalDurationMinutes(
  serviceId: string,
  selectedAddOnIds: string[]
): number {
  const service = getServiceById(serviceId);
  if (!service) return 120;

  const addOnMinutes = selectedAddOnIds.reduce((sum, id) => {
    const addOn = getAddOnById(id);
    return sum + (addOn?.durationMinutes ?? 0);
  }, 0);

  return service.baseDurationMinutes + addOnMinutes;
}

export function getTotalDurationHours(
  serviceId: string,
  selectedAddOnIds: string[]
): number {
  const minutes = getTotalDurationMinutes(serviceId, selectedAddOnIds);
  return Math.max(1, Math.ceil(minutes / 60));
}

export type PaymentMode = 'full' | 'deposit';

export function getCheckoutAmounts(
  total: number,
  paymentMode: PaymentMode
): { dueToday: number; balanceDue: number; total: number } {
  if (paymentMode === 'full') {
    return { dueToday: total, balanceDue: 0, total };
  }
  const dueToday = Math.round(total / 2);
  return { dueToday, balanceDue: total - dueToday, total };
}

export interface BookingLineItem {
  name: string;
  amountCents: number;
}

export function buildBookingLineItems(
  serviceId: string,
  vehicleTierId: string,
  addOnIds: string[]
): BookingLineItem[] {
  const service = getServiceById(serviceId);
  if (!service) return [];

  const items: BookingLineItem[] = [];
  const basePrice = getBaseServicePrice(serviceId, vehicleTierId);

  if (service.vehicleTiers.length > 0) {
    const tierLabel = getVehicleTierLabel(serviceId, vehicleTierId);
    items.push({
      name: `${service.name} (${tierLabel})`,
      amountCents: basePrice * 100,
    });
  } else {
    items.push({
      name: service.name,
      amountCents: basePrice * 100,
    });
  }

  for (const id of addOnIds) {
    const addOn = getAddOnById(id);
    if (addOn) {
      items.push({
        name: addOn.name,
        amountCents: addOn.price * 100,
      });
    }
  }

  return items;
}

export function formatPrice(dollars: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(dollars);
}

export function formatDurationFromMinutes(minutes: number): string {
  const wholeHours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0 && wholeHours > 0) return `${wholeHours} hr`;
  if (wholeHours === 0) return `${mins} min`;
  return `${wholeHours} hr ${mins} min`;
}

/** @deprecated Use formatDurationFromMinutes — kept for tiles using hours */
export function formatDuration(hours: number): string {
  return formatDurationFromMinutes(Math.round(hours * 60));
}
