-- Unique connection between two users (regardless of direction)
CREATE UNIQUE INDEX IF NOT EXISTS connections_pair_unique
  ON public.connections (LEAST(requester_id, receiver_id), GREATEST(requester_id, receiver_id));

-- Decrement slots_remaining when an application is accepted; restore on revert
CREATE OR REPLACE FUNCTION public.handle_application_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'UPDATE') AND NEW.status = 'accepted' AND OLD.status <> 'accepted' THEN
    UPDATE public.referral_slots
       SET slots_remaining = GREATEST(slots_remaining - 1, 0),
           is_active = CASE WHEN slots_remaining - 1 <= 0 THEN false ELSE is_active END,
           updated_at = now()
     WHERE id = NEW.slot_id;
  ELSIF (TG_OP = 'UPDATE') AND OLD.status = 'accepted' AND NEW.status <> 'accepted' THEN
    UPDATE public.referral_slots
       SET slots_remaining = LEAST(slots_remaining + 1, total_slots),
           is_active = true,
           updated_at = now()
     WHERE id = NEW.slot_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_application_status ON public.applications;
CREATE TRIGGER trg_application_status
AFTER UPDATE OF status ON public.applications
FOR EACH ROW EXECUTE FUNCTION public.handle_application_status_change();

-- Recompute aggregate trust_score / credibility on profile sub-score change
CREATE OR REPLACE FUNCTION public.recompute_profile_scores()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Trust score: weighted avg of 4 sub-scores
  NEW.trust_score := ROUND((
    COALESCE(NEW.github_integrity_score, 0) * 0.30 +
    COALESCE(NEW.leetcode_authenticity_score, 0) * 0.25 +
    COALESCE(NEW.behavioral_score, 0) * 0.20 +
    COALESCE(NEW.portfolio_strength_score, 0) * 0.25
  ));

  -- Credibility for referrers: based on profile completeness
  NEW.credibility_score := (
    CASE WHEN NEW.work_email IS NOT NULL AND NEW.work_email <> '' THEN 30 ELSE 0 END +
    CASE WHEN NEW.linkedin_url IS NOT NULL AND NEW.linkedin_url <> '' THEN 30 ELSE 0 END +
    CASE WHEN NEW.company IS NOT NULL AND NEW.company <> '' THEN 15 ELSE 0 END +
    CASE WHEN NEW.job_title IS NOT NULL AND NEW.job_title <> '' THEN 15 ELSE 0 END +
    CASE WHEN NEW.verified THEN 10 ELSE 0 END
  );

  -- Auto-verify referrer when both work_email and linkedin_url are present
  IF NEW.role = 'referrer'
     AND NEW.work_email IS NOT NULL AND NEW.work_email <> ''
     AND NEW.linkedin_url IS NOT NULL AND NEW.linkedin_url <> '' THEN
    NEW.verified := true;
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_recompute_scores ON public.profiles;
CREATE TRIGGER trg_recompute_scores
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.recompute_profile_scores();