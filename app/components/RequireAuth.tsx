"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type RequireAuthProps = {
  children: React.ReactNode;
};

export default function RequireAuth({
  children,
}: RequireAuthProps) {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [suspended, setSuspended] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkAuthentication() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) {
          return;
        }

        if (!session) {
          setAuthenticated(false);
          setChecking(false);
          router.replace("/login");
          return;
        }

        const { data: profile, error } = await supabase
          .from("staff_profiles")
          .select("status")
          .eq("id", session.user.id)
          .single();

        if (!mounted) {
          return;
        }

        if (error || !profile) {
          setAuthenticated(false);
          setChecking(false);
          router.replace("/login");
          return;
        }

        if (profile.status === "suspended") {
          setSuspended(true);
          setAuthenticated(false);
          setChecking(false);

          await supabase.auth.signOut();

          return;
        }

        setAuthenticated(true);
        setChecking(false);
      } catch (error) {
        console.error(
          "Authentication check failed:",
          error
        );

        if (!mounted) {
          return;
        }

        setAuthenticated(false);
        setChecking(false);

        router.replace("/login");
      }
    }

    checkAuthentication();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) {
          return;
        }

        if (event === "SIGNED_OUT") {
          setAuthenticated(false);
          setChecking(false);
          router.replace("/login");
          return;
        }

        if (!session) {
          return;
        }

        const { data: profile } = await supabase
          .from("staff_profiles")
          .select("status")
          .eq("id", session.user.id)
          .single();

        if (!mounted) {
          return;
        }

        if (profile?.status === "suspended") {
          setSuspended(true);
          setAuthenticated(false);
          setChecking(false);

          await supabase.auth.signOut();

          return;
        }

        setAuthenticated(true);
        setChecking(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-white" />

          <p className="mt-4 text-sm text-slate-400">
            Checking staff access...
          </p>
        </div>
      </main>
    );
  }

  if (suspended) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
        <div className="w-full max-w-md rounded-2xl border border-red-900 bg-slate-900 p-8 text-center shadow-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-950 text-2xl">
            🔒
          </div>

          <h1 className="mt-6 text-2xl font-bold text-white">
            Staff Access Suspended
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Your ParcelPilot staff account has been
            suspended. Please contact an administrator
            if you believe this is a mistake.
          </p>

          <button
            type="button"
            onClick={() => router.replace("/login")}
            className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-200"
          >
            Return to Login
          </button>
        </div>
      </main>
    );
  }

  if (!authenticated) {
    return null;
  }

  return <>{children}</>;
}