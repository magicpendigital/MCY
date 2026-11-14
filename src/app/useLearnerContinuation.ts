import { useEffect, useRef } from "react";
import { useFlow } from "../mobile";
import { learnerSessionGeneration } from "../backend/learnerSession";
import { useDemo } from "./state";

export function useLearnerContinuation() {
  const { state } = useDemo();
  const flow = useFlow();
  const latest = useRef(state); latest.current = state;
  const route = useRef({ key: flow.current.key, generation: 0 });
  if (route.current.key !== flow.current.key) route.current = { key: flow.current.key, generation: route.current.generation + 1 };
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  return () => {
    const expected = latest.current, generation = learnerSessionGeneration(), routeGeneration = route.current.generation;
    return (value = latest.current) => mounted.current && generation === learnerSessionGeneration()
      && routeGeneration === route.current.generation
      && value.userId === expected.userId && value.signedIn === expected.signedIn;
  };
}
