import { useAuth } from "../context/AuthContext";

export const subscriptionRequiredMessage =
  "An active subscription is required to perform this action. Please choose or renew your plan.";

export function useSubscriptionAccess() {
  const {
    subscription,
    user,
    openSubscriptionPrompt,
    closeSubscriptionPrompt,
    isPromptOpen,
    promptFeature,
  } = useAuth();

  const isSuperadmin = user?.role === "superadmin";
  const hasActiveSubscription = isSuperadmin || Boolean(subscription?.active);
  const isEnforced = subscription?.enforcement === "on";

  // When enforcement is "off", writes are allowed for all authenticated users.
  // When enforcement is "on", write access strictly requires an active subscription or superadmin role.
  const canWrite = !isEnforced || hasActiveSubscription;
  const isRestricted = isEnforced && !hasActiveSubscription;

  return {
    hasActiveSubscription,
    isEnforced,
    canWrite,
    isRestricted,
    subscription,
    remainingDays: subscription?.remainingDays || 0,
    subscriptionRequiredMessage,
    openSubscriptionPrompt,
    closeSubscriptionPrompt,
    isPromptOpen,
    promptFeature,
  };
}

export default useSubscriptionAccess;

