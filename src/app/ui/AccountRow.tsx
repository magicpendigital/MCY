import { ArrowRightIcon } from "@radix-ui/react-icons";

export function AccountRow({ title, detail, onClick, danger = false }: { title: string; detail: string; onClick: () => void; danger?: boolean }) {
  return <button className={`mcy-account-row${danger ? " danger" : ""}`} onClick={onClick}><span><strong>{title}</strong><small>{detail}</small></span><ArrowRightIcon /></button>;
}
