import { useAuth } from "../context/AuthContext";

export const getSubscriptionRequiredMessage = (user) => {
  if (user?.role === "employee") {
    return "Your business owner's subscription has expired or is inactive. Please contact your account owner to renew.";
  }
  return "An active subscription is required to perform this action. Please choose or renew your plan.";
};

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
  const isEmployee = user?.role === "employee";
  const hasActiveSubscription = isSuperadmin || Boolean(subscription?.active);
  const isEnforced = subscription?.enforcement === "on";

  // When enforcement is "off", writes are allowed for all authenticated users.
  // When enforcement is "on", write access strictly requires an active subscription or superadmin role.
  const canWrite = !isEnforced || hasActiveSubscription;
  const isRestricted = isEnforced && !hasActiveSubscription;

  const currentRequiredMessage = getSubscriptionRequiredMessage(user);

  return {
    hasActiveSubscription,
    isEnforced,
    canWrite,
    isRestricted,
    isEmployee,
    isSuperadmin,
    subscription,
    remainingDays: subscription?.remainingDays || 0,
    subscriptionRequiredMessage: currentRequiredMessage,
    openSubscriptionPrompt,
    closeSubscriptionPrompt,
    isPromptOpen,
    promptFeature,
  };
}

export default useSubscriptionAccess;

