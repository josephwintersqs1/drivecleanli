import {
  calculatePrice,
  formatDurationFromMinutes,
  formatPrice,
  getAddOnById,
  getServiceById,
  serviceHasVehicleTiers,
} from '../../data/services';
import { BookingServiceMedia } from './BookingServiceMedia';

interface ConfigureStepProps {
  serviceId: string;
  vehicleTierId: string;
  addOnIds: string[];
  onVehicleChange: (tierId: string) => void;
  onAddOnToggle: (id: string) => void;
}

export function ConfigureStep({
  serviceId,
  vehicleTierId,
  addOnIds,
  onVehicleChange,
  onAddOnToggle,
}: ConfigureStepProps) {
  const service = getServiceById(serviceId);
  if (!service) {
    return <p className="text-white/70">Select a service to continue.</p>;
  }

  const total = calculatePrice(serviceId, vehicleTierId, addOnIds);
  const hasTiers = serviceHasVehicleTiers(serviceId);
  const renderedAddOns = new Set<string>();

  return (
    <div>
      <BookingServiceMedia service={service} variant="hero" />

      {hasTiers && (
        <fieldset className="mb-8">
          <legend className="mb-4 text-base font-medium text-white">
            Select type of vehicle
          </legend>
          <ul className="divide-y divide-white/10 rounded-xl border border-white/10 bg-white/[0.03]">
            {service.vehicleTiers.map((tier) => (
              <li key={tier.id}>
                <label className="flex cursor-pointer items-center justify-between gap-4 px-4 py-4">
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="vehicleTier"
                      value={tier.id}
                      checked={vehicleTierId === tier.id}
                      onChange={() => onVehicleChange(tier.id)}
                      className="h-4 w-4 border-white/30 text-red-600 focus:ring-red-600"
                    />
                    <span className="font-medium text-white">{tier.label}</span>
                  </span>
                  <span className="shrink-0 font-semibold text-white">
                    {formatPrice(tier.price)}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
      )}

      {service.addOnGroups.map((group) => {
        const groupAddOns = group.addOnIds
          .filter((id) => !renderedAddOns.has(id))
          .map((id) => getAddOnById(id))
          .filter((a): a is NonNullable<typeof a> => !!a);
        groupAddOns.forEach((a) => renderedAddOns.add(a.id));
        if (groupAddOns.length === 0) return null;

        return (
        <fieldset key={group.title} className="mb-8">
          <legend className="mb-1 text-base font-medium text-white">{group.title}</legend>
          {group.subtitle && (
            <p className="mb-4 text-sm text-white/55">{group.subtitle}</p>
          )}
          <ul className="divide-y divide-white/10 rounded-xl border border-white/10 bg-white/[0.03]">
            {groupAddOns.map((addOn) => {
              const checked = addOnIds.includes(addOn.id);
              return (
                <li key={addOn.id}>
                  <label className="flex cursor-pointer items-start justify-between gap-4 px-4 py-4">
                    <span className="flex gap-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onAddOnToggle(addOn.id)}
                        className="mt-1 h-4 w-4 rounded border-white/30 text-red-600 focus:ring-red-600"
                      />
                      <span>
                        <span className="block font-medium text-white">{addOn.name}</span>
                        <span className="mt-0.5 block text-sm text-white/50">
                          {formatDurationFromMinutes(addOn.durationMinutes)}
                        </span>
                      </span>
                    </span>
                    <span className="shrink-0 font-semibold text-white">
                      {formatPrice(addOn.price)}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
        );
      })}

      <div
        className="rounded-xl border border-red-600/30 bg-red-600/10 px-6 py-4"
        aria-live="polite"
      >
        <span className="text-sm text-white/60">Estimated total</span>
        <p className="text-3xl font-bold text-white">{formatPrice(total)}</p>
      </div>
    </div>
  );
}
