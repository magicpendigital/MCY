import { msg } from "../../i18n";
import { useFlow, useKeyboard } from "../../mobile";
import { useDemo } from "../../app/state";
import { savedReflectionState } from "../../app/reflectionSave";
import { Action } from "../../app/ui/controls";
import { useRoutes } from "../../app/navigation";

export function ReflectionFooter() {
  const flow = useFlow();
  const routes = useRoutes();
  const keyboard = useKeyboard();
  const { state, setState } = useDemo();
  const locale = state.locale;
  const save = (skip: boolean) => {
    keyboard.hide();
    const recordedAt = new Date();
    setState(previous => savedReflectionState(previous, skip, recordedAt));
    flow.replace(routes.sync);
  };
  return <div className="mcy-flow-footer"><button className="mcy-quiet-link" onClick={() => save(true)}>{msg(locale, "reflection.skip")}</button><Action onClick={() => save(false)}>{msg(locale, "reflection.save")}</Action></div>;
}
