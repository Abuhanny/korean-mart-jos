import { createClient } from "@/lib/supabase/server";
import { ExperienceFormDialog } from "@/components/admin/experience-form-dialog";
import { SessionFormDialog } from "@/components/admin/session-form-dialog";
import { SessionRow } from "@/components/admin/session-row";
import { Pencil } from "lucide-react";
import { formatNaira } from "@/lib/utils";
import type { Experience } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminExperiencesPage() {
  const supabase = createClient();
  const { data: experiences } = await supabase
    .from("experiences")
    .select("*")
    .order("created_at", { ascending: false });

  const experiencesWithSessions = await Promise.all(
    ((experiences as Experience[]) ?? []).map(async (exp) => {
      const { data: sessions } = await supabase
        .from("experience_sessions")
        .select("*")
        .eq("experience_id", exp.id)
        .order("session_date", { ascending: true });

      const sessionsWithCounts = await Promise.all(
        (sessions ?? []).map(async (s) => {
          const { data: bookings } = await supabase
            .from("experience_bookings")
            .select("guests")
            .eq("session_id", s.id)
            .in("status", ["pending", "confirmed"]);
          const booked = (bookings ?? []).reduce((sum, b) => sum + b.guests, 0);
          return { ...s, booked };
        })
      );

      return { ...exp, sessions: sessionsWithCounts };
    })
  );

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Experiences & Sessions</h1>
          <p className="text-sm text-muted-foreground">
            Manage bookable experiences like "Eat & Cook" and schedule available time slots.
          </p>
        </div>
        <ExperienceFormDialog />
      </div>

      <div className="mt-6 space-y-6">
        {experiencesWithSessions.length === 0 && (
          <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No experiences yet. Click "Add Experience" to create your first one (e.g. "Eat & Cook").
          </p>
        )}

        {experiencesWithSessions.map((exp) => (
          <div key={exp.id} className="rounded-2xl border border-border/60 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold">{exp.name}</h2>
                  {!exp.is_active && <span className="text-xs text-muted-foreground">(inactive)</span>}
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatNaira(exp.default_price)} · {exp.default_duration_minutes} mins · capacity {exp.default_capacity}
                </p>
              </div>
              <div className="flex gap-2">
                <ExperienceFormDialog
                  experience={exp}
                  trigger={
                    <button className="rounded-full p-2 hover:bg-accent" aria-label="Edit experience">
                      <Pencil className="h-4 w-4" />
                    </button>
                  }
                />
                <SessionFormDialog experience={exp} />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {exp.sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sessions scheduled yet.</p>
              ) : (
                exp.sessions.map((s) => <SessionRow key={s.id} session={s} />)
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
