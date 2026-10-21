import { DEFAULT_PREFERENCES } from "@/lib/constants";
import type { User } from "@/types";

export const mockUser: User = {
  id: "usr-1",
  firstName: "Ana",
  lastName: "Moreira",
  email: "ana.moreira@fintrack.app",
  phone: "+351 912 345 678",
  address: "Rua das Flores 42, 4050-262 Porto",
  avatarUrl: null,
  memberSince: "2023-09-01",
  preferences: { ...DEFAULT_PREFERENCES },
};
