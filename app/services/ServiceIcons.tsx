"use client";

import {
  ArrowRight,
  Blueprint,
  CalendarBlank,
  ClipboardText,
  Cube,
  Fan,
  ForkKnife,
  Scales,
  SquaresFour,
  UsersThree,
  Wallet,
} from "@phosphor-icons/react";
import type { FeatureIconName } from "../entero-content";

export function ServiceFeatureIcon({ name }: { name: FeatureIconName }) {
  const props = { size: 34, weight: "light" as const, "aria-hidden": true as const };
  if (name === "format") return <SquaresFour {...props} />;
  if (name === "menu") return <ForkKnife {...props} />;
  if (name === "seats") return <UsersThree {...props} />;
  if (name === "budget") return <Wallet {...props} />;
  if (name === "zones") return <Blueprint {...props} />;
  if (name === "engineering") return <Fan {...props} />;
  if (name === "specification") return <ClipboardText {...props} />;
  if (name === "compare") return <Scales {...props} />;
  if (name === "timing") return <CalendarBlank {...props} />;
  return <Cube {...props} />;
}

export function ServiceArrow() {
  return <ArrowRight size={22} weight="light" aria-hidden="true" />;
}
