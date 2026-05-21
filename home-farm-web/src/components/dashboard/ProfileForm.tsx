"use client";

import { updateProfileAction } from "@/actions/profile";
import { useActionState } from "react";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

type ActionState = { error?: string; success?: string } | null;

type ProfileFormProps = {
  initial: {
    name: string;
    email: string;
    shippingCity?: string | null;
    shippingStreet?: string | null;
    shippingPostalCode?: string | null;
    shippingCountry?: string | null;
  };
};

export default function ProfileForm({ initial }: ProfileFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const successRef = useRef<string | null>(null);
  const errorRef = useRef<string | null>(null);

  const [state, action, isPending] = useActionState<ActionState | null, FormData>(updateProfileAction, null);

  useEffect(() => {
    if (state?.success && state.success !== successRef.current) {
      successRef.current = state.success;
      showToast(state.success, "success");
      router.refresh();
    }
  }, [state?.success, router, showToast]);

  useEffect(() => {
    if (state?.error && state.error !== errorRef.current) {
      errorRef.current = state.error;
      showToast(state.error, "error");
    }
  }, [state?.error, showToast]);

  return (
    <form action={action} className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2 text-sm">
          <span>Име</span>
          <input name="name" defaultValue={initial.name} className="w-full rounded-xl border border-slate-200 px-4 py-3" />
        </label>

        <label className="block space-y-2 text-sm">
          <span>Имейл</span>
          <input name="email" defaultValue={initial.email} className="w-full rounded-xl border border-slate-200 px-4 py-3" />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2 text-sm">
          <span>Град</span>
          <input name="shippingCity" defaultValue={initial.shippingCity ?? ""} className="w-full rounded-xl border border-slate-200 px-4 py-3" />
        </label>

        <label className="block space-y-2 text-sm">
          <span>Улица / Адрес</span>
          <input name="shippingStreet" defaultValue={initial.shippingStreet ?? ""} className="w-full rounded-xl border border-slate-200 px-4 py-3" />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2 text-sm">
          <span>Пощенски код</span>
          <input name="shippingPostalCode" defaultValue={initial.shippingPostalCode ?? ""} className="w-full rounded-xl border border-slate-200 px-4 py-3" />
        </label>

        <label className="block space-y-2 text-sm">
          <span>Държава</span>
          <input name="shippingCountry" defaultValue={initial.shippingCountry ?? ""} className="w-full rounded-xl border border-slate-200 px-4 py-3" />
        </label>
      </div>

      <div className="flex gap-3">
        <button className="btn btn-primary" type="submit" disabled={isPending}>
          {isPending ? "Запазване..." : "Запази профил"}
        </button>
      </div>
    </form>
  );
}
