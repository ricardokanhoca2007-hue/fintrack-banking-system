import { DEFAULT_PREFERENCES } from "@/lib/constants";
import { useAuth } from "@/store/auth-store";
import type { User, UserPreferences } from "@/types";

interface UseUserProfileResult {
  user: User;
  fullName: string;
  preferences: UserPreferences;
  updateProfile: (patch: Partial<User>) => Promise<void>;
  updatePreferences: (patch: Partial<UserPreferences>) => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  setAvatar: (dataUrl: string | null) => void;
}

const EMPTY_USER: User = {
  id: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  avatarUrl: null,
  memberSince: new Date().toISOString().slice(0, 10),
  preferences: { ...DEFAULT_PREFERENCES },
};

/** Reads the signed-in user from the auth session — never from mock data. */
export function useUserProfile(): UseUserProfileResult {
  const { currentUser, updateCurrentUser, changePassword } = useAuth();
  const user = currentUser ?? EMPTY_USER;
  const preferences = user.preferences ?? DEFAULT_PREFERENCES;

  return {
    user,
    fullName: `${user.firstName} ${user.lastName}`.trim(),
    preferences,
    updateProfile: async (patch) => {
      await new Promise((resolve) => setTimeout(resolve, 400));
      updateCurrentUser(patch);
    },
    updatePreferences: (patch) =>
      updateCurrentUser({ preferences: { ...preferences, ...patch } }),
    changePassword,
    setAvatar: (dataUrl) => updateCurrentUser({ avatarUrl: dataUrl }),
  };
}
