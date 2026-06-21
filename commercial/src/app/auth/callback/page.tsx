"use client";

import { useEffect } from "react";
import { createKasamSupabaseClient } from "@/lib/supabase";

export default function AuthCallbackPage() {
  useEffect(() => {
    const client = createKasamSupabaseClient();
    if (!client) {
      window.location.replace("/");
      return;
    }

    client.auth.getSession().finally(() => {
      window.location.replace("/?resetPassword=1");
    });
  }, []);

  return (
    <main className="app-shell">
      <section className="card auth-card">
        <p>Oturum hazırlanıyor...</p>
      </section>
    </main>
  );
}
