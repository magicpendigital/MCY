import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { CheckIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { mobileDevices, useMobileDevice, type MobileDeviceId } from "./Device";

export function DevicePicker() {
  const { device, deviceId, setDeviceId, native, webMode } = useMobileDevice();

  if (native || webMode) return null;

  return (
    <DropdownMenu.Root>
      <div className="device-menu-bar" data-testid="device-menu-bar">
        <DropdownMenu.Trigger asChild>
          <button
            className="device-picker-trigger"
            data-testid="device-picker"
            aria-label={`Preview device: ${device.label}`}
            type="button"
          >
            <span>{device.label}</span>
            <ChevronDownIcon aria-hidden="true" />
          </button>
        </DropdownMenu.Trigger>
      </div>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="device-picker-menu" align="end" sideOffset={8} collisionPadding={12}>
          <DropdownMenu.RadioGroup
            value={deviceId}
            onValueChange={(value) => setDeviceId(value as MobileDeviceId)}
          >
            {Object.values(mobileDevices).map((option) => (
              <DropdownMenu.RadioItem
                key={option.id}
                className="device-picker-item"
                value={option.id}
                data-testid={`device-option-${option.id}`}
              >
                <span>{option.label}</span>
                <DropdownMenu.ItemIndicator className="device-picker-check">
                  <CheckIcon aria-hidden="true" />
                </DropdownMenu.ItemIndicator>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
