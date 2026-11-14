import { ArrowRightIcon, InfoCircledIcon } from "@radix-ui/react-icons";

export function Action({ children, onClick, disabled = false, secondary = false }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; secondary?: boolean }) {
  return <button className={secondary ? "mcy-action secondary" : "mcy-action"} onClick={event => { event.currentTarget.blur(); onClick(); }} disabled={disabled}>{children}<ArrowRightIcon /></button>;
}
export function Choice({ selected, onClick, disabled = false, children }: { selected: boolean; onClick?: () => void; disabled?: boolean; children: React.ReactNode }) {
  return <button className={selected ? "mcy-choice selected" : "mcy-choice"} aria-pressed={selected} disabled={disabled} onClick={() => onClick?.()}>{children}</button>;
}
export function Eyebrow({ children }: { children: React.ReactNode }) { return <div className="mcy-eyebrow">{children}</div>; }
export function DemoNote({ children }: { children: React.ReactNode }) { return <p className="mcy-info-note"><InfoCircledIcon />{children}</p>; }
