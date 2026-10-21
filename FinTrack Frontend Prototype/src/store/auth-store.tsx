import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { mockUser } from "@/data/mock";
import { DEFAULT_PREFERENCES } from "@/lib/constants";
import type { User } from "@/types";

/**
 * Prototype auth layer.
 *
 * Registered accounts and the active session live in localStorage so the
 * "current user" survives reloads without a backend. When the Spring Boot API
 * arrives, only the bodies of `register` / `login` change — every consumer
 * reads the session through `useAuth()`.
 */

const USERS_KEY = "fintrack.auth.users";
const SESSION_KEY = "fintrack.auth.session";

/** Stored account: the domain user plus the prototype-only credential. */
interface StoredAccount extends User {
  password: string;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthContextValue {
  currentUser: User | null;
  /** False until localStorage has been read (avoids SSR/hydration mismatch). */
  isReady: boolean;
  register: (input: RegisterInput) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  updateCurrentUser: (patch: Partial<User>) => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Seed account so the demo credentials on the login screen keep working. */
const seedAccount: StoredAccount = { ...mockUser, password: "demo1234" };

const normalizeEmail = (email: string) => email.trim().toLowerCase();

function readAccounts(): StoredAccount[] {
  if (typeof window === "undefined") return [seedAccount];
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    const parsed = raw ? (JSON.parse(raw) as StoredAccount[]) : [];
    return parsed.some((account) => normalizeEmail(account.email) === normalizeEmail(seedAccount.email))
      ? parsed
      : [seedAccount, ...parsed];
  } catch {
    return [seedAccount];
  }
}

function persistAccounts(accounts: StoredAccount[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USERS_KEY, JSON.stringify(accounts));
}

function persistSession(userId: string | null) {
  if (typeof window === "undefined") return;
  if (userId) window.localStorage.setItem(SESSION_KEY, userId);
  else window.localStorage.removeItem(SESSION_KEY);
}

/** Accounts persisted before preferences existed are backfilled on read. */
const toUser = ({ password: _password, ...user }: StoredAccount): User => ({
  ...user,
  preferences: { ...DEFAULT_PREFERENCES, ...user.preferences },
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<StoredAccount[]>([seedAccount]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const stored = readAccounts();
    setAccounts(stored);
    const sessionId = window.localStorage.getItem(SESSION_KEY);
    setCurrentUserId(stored.some((account) => account.id === sessionId) ? sessionId : null);
    setIsReady(true);
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const email = normalizeEmail(input.email);
    const existing = readAccounts();
    if (existing.some((account) => normalizeEmail(account.email) === email)) {
      throw new Error("Já existe uma conta com este email.");
    }

    const account: StoredAccount = {
      id: `usr-${Date.now()}`,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email: input.email.trim(),
      phone: "",
      address: "",
      avatarUrl: null,
      memberSince: new Date().toISOString().slice(0, 10),
      preferences: { ...DEFAULT_PREFERENCES },
      password: input.password,
    };

    const next = [...existing, account];
    persistAccounts(next);
    persistSession(account.id);
    setAccounts(next);
    setCurrentUserId(account.id);
    return toUser(account);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const existing = readAccounts();
    const account = existing.find(
      (candidate) => normalizeEmail(candidate.email) === normalizeEmail(email),
    );
    if (!account) throw new Error("Não existe conta com este email. Cria uma conta primeiro.");
    if (account.password !== password) throw new Error("Password incorreta.");

    persistAccounts(existing);
    persistSession(account.id);
    setAccounts(existing);
    setCurrentUserId(account.id);
    return toUser(account);
  }, []);

  const logout = useCallback(() => {
    persistSession(null);
    setCurrentUserId(null);
  }, []);

  const updateCurrentUser = useCallback(
    (patch: Partial<User>) => {
      setAccounts((prev) => {
        const next = prev.map((account) =>
          account.id === currentUserId ? { ...account, ...patch } : account,
        );
        persistAccounts(next);
        return next;
      });
    },
    [currentUserId],
  );

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      const account = accounts.find((candidate) => candidate.id === currentUserId);
      if (!account) throw new Error("Sessão expirada. Inicia sessão novamente.");
      if (account.password !== currentPassword) throw new Error("A password atual não coincide.");
      setAccounts((prev) => {
        const next = prev.map((candidate) =>
          candidate.id === currentUserId ? { ...candidate, password: newPassword } : candidate,
        );
        persistAccounts(next);
        return next;
      });
    },
    [accounts, currentUserId],
  );

  const currentUser = useMemo(() => {
    const account = accounts.find((candidate) => candidate.id === currentUserId);
    return account ? toUser(account) : null;
  }, [accounts, currentUserId]);

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      isReady,
      register,
      login,
      logout,
      updateCurrentUser,
      changePassword,
    }),
    [currentUser, isReady, register, login, logout, updateCurrentUser, changePassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
