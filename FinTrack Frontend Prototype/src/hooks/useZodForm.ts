import { useCallback, useMemo, useState } from "react";
import type { z } from "zod";

type FieldErrors<TValues> = Partial<Record<keyof TValues & string, string>>;

/**
 * Small zod-backed form helper.
 *
 * Validation runs against the whole schema on every change, but a field only
 * shows its error once it has been touched or the form has been submitted —
 * that gives inline feedback without shouting at the user while they type.
 */
export function useZodForm<TValues extends Record<string, unknown>>(
  schema: z.ZodType<TValues, z.ZodTypeDef, unknown>,
  initialValues: TValues,
) {
  const [values, setValues] = useState<TValues>(initialValues);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  const allErrors = useMemo<FieldErrors<TValues>>(() => {
    const result = schema.safeParse(values);
    if (result.success) return {};
    const errors: FieldErrors<TValues> = {};
    for (const issue of result.error.issues) {
      const key = String(issue.path[0]) as keyof TValues & string;
      if (key && !errors[key]) errors[key] = issue.message;
    }
    return errors;
  }, [schema, values]);

  const visibleErrors = useMemo<FieldErrors<TValues>>(() => {
    if (submitted) return allErrors;
    const errors: FieldErrors<TValues> = {};
    for (const [key, message] of Object.entries(allErrors)) {
      if (touched[key] && message) errors[key as keyof TValues & string] = message;
    }
    return errors;
  }, [allErrors, touched, submitted]);

  const setField = useCallback(
    <TKey extends keyof TValues & string>(key: TKey, value: TValues[TKey]) =>
      setValues((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const touch = useCallback(
    (key: keyof TValues & string) => setTouched((prev) => ({ ...prev, [key]: true })),
    [],
  );

  const reset = useCallback(
    (next: TValues = initialValues) => {
      setValues(next);
      setTouched({});
      setSubmitted(false);
    },
    [initialValues],
  );

  const handleSubmit = useCallback(
    (onValid: (parsed: TValues) => void | Promise<void>) => async (event: React.FormEvent) => {
      event.preventDefault();
      setSubmitted(true);
      const result = schema.safeParse(values);
      if (!result.success) return;
      await onValid(result.data);
    },
    [schema, values],
  );

  return {
    values,
    errors: visibleErrors,
    isValid: Object.keys(allErrors).length === 0,
    setField,
    touch,
    reset,
    handleSubmit,
  } as const;
}
