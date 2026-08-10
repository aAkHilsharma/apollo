import { z } from "zod";
import type { InferResponseType } from "hono";
import { useParams, useLocation, useNavigate } from "react-router";

import { SessionShell } from "../components/session-shell";
import { apiClient } from "../../lib/api-client";
import { BotMessage, ErrorMessage, UserMessage } from "../components/messages";
import { useToast } from "../providers/toast";
import { useEffect, useMemo, useState } from "react";
import { getErrorMessage } from "../../lib/http-errors";

type SessionData = InferResponseType<
  (typeof apiClient.sessions)[":id"]["$get"],
  200
>;

const sessionLocationSchema = z.object({
  session: z.custom<SessionData>(
    (val) => val !== null && typeof val === "object" && "id" in val,
  ),
});

function ChatMessage({ msg }: { msg: SessionData["messages"][number] }) {
  if (msg.role === "USER") return <UserMessage message={msg.content} />;
  if (msg.role === "ERROR") return <ErrorMessage message={msg.content} />;

  return <BotMessage model={msg.model} content={msg.content} />;
}

export function Session() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const prefectched = useMemo(() => {
    const parsed = sessionLocationSchema.safeParse(location.state);
    return parsed.success ? parsed.data.session : null;
  }, [location.state]);

  const [session, setSession] = useState<SessionData | null>(prefectched);

  useEffect(() => {
    // Skip fetch if session was passed via location state
    if (prefectched) return;

    setSession(null);
    if (!id) return;

    let ignore = false;
    const fetchSession = async () => {
      try {
        const res = await apiClient.sessions[":id"].$get({
          param: { id },
        });

        if (ignore) return;
        if (!res.ok) throw new Error(await getErrorMessage(res));

        const resolved = await res.json();
        setSession(resolved);
      } catch (error) {
        if (ignore) return;
        toast.show({
          variant: "error",
          message:
            error instanceof Error ? error.message : "Failed to load session",
        });
        navigate("/", { replace: true });
      }
    };

    fetchSession();
    return () => {
      ignore = true;
    };
  }, [id, prefectched, toast, navigate]);

  if (!session)
    return <SessionShell onSubmit={() => {}} inputDisabled loading />;

  return (
    <SessionShell onSubmit={() => {}} inputDisabled>
      {session.messages.map((msg) => (
        <ChatMessage key={msg.id} msg={msg} />
      ))}
    </SessionShell>
  );
}
