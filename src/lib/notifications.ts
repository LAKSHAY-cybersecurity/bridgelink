import { supabase } from "@/integrations/supabase/client";

export const createNotification = async (
  userId: string,
  type: string,
  title: string,
  message?: string,
  relatedId?: string
) => {
  await supabase.from("notifications").insert({
    user_id: userId,
    type,
    title,
    message: message || null,
    related_id: relatedId || null,
  } as any);
};
