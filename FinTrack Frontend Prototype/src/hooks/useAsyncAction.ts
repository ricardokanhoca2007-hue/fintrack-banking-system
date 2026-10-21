import { useCallback, useState } from "react";
import { toast } from "sonner";

interface RunOptions {
  successTitle?: string;
  successDescription?: string;
  errorMessage?: string;
}

/**
 * Wraps an async mutation with a pending flag and toast feedback, so every
 * action in the app gets consistent loading + success/error signalling.
 */
export function useAsyncAction() {
  const [isPending, setIsPending] = useState(false);

  const run = useCallback(
    async <TResult>(task: () => Promise<TResult>, options: RunOptions = {}) => {
      setIsPending(true);
      try {
        const result = await task();
        if (options.successTitle) {
          toast.success(options.successTitle, {
            ...(options.successDescription ? { description: options.successDescription } : {}),
          });
        }
        return result;
      } catch (error) {
        console.error(error);
        // Domain errors (wrong password, duplicate email) carry a user-facing message.
        const message = error instanceof Error ? error.message : undefined;
        toast.error(message ?? options.errorMessage ?? "Não foi possível concluir a operação.");
        return null;

      } finally {
        setIsPending(false);
      }
    },
    [],
  );

  return { isPending, run } as const;
}
