import { Link } from "react-router-dom";

import { z } from "zod";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAuth } from "../hooks";

import { cn } from "../utils/cn";
import { getAuthSubmitError } from "../utils/errorHandler";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

import { SignWrapper } from "../components/sign-wrapper";

export default function Page() {
  return (
    <SignWrapper>
      <LoginForm />
    </SignWrapper>
  );
}

type FormField = {
  enrollmentNo: string;
  password: string;
};

type Key = keyof FormField;

const defaultValues: FormField = { enrollmentNo: "", password: "" };

const formSchema = z.object({
  enrollmentNo: z.string().trim().min(3, "Min. 3 characters").max(50, "Max. 50 characters"),
  password: z.string().trim().min(3, "Min. 3 characters").max(50, "Max. 50 characters")
});

const labels: Record<Key, string> = {
  enrollmentNo: "Enrollment Number",
  password: "Password"
};

function LoginForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const auth = useAuth();

  return (
    <form
      className="my-auto border border-border rounded-xl bg-background p-4 space-y-2"
      onSubmit={form.handleSubmit(async ({ enrollmentNo, password }) => {
        try {
          await auth.login(enrollmentNo, password);
        } catch (e) {
          const { generalMessage, fieldErrors } = getAuthSubmitError(e);

          if (fieldErrors.username) {
            form.setError("enrollmentNo", { message: fieldErrors.username });
          }

          if (fieldErrors.password) {
            form.setError("password", { message: fieldErrors.password });
          }

          form.setError("root", { message: generalMessage });
        }
      })}
    >
      <h2 className="text-center text-3xl font-bold">Login</h2>

      {Object.keys(defaultValues).map(key => (
        <label
          key={key}
          className={cn(
            "flex flex-col capitalize",
            form.formState.errors[key as Key]?.message && "text-destructive *:outline-destructive *:border-destructive"
          )}
        >
          <span>{labels[key as Key]}</span>

          <Input
            placeholder={labels[key as Key]}
            type={key === "password" ? "password" : "text"}
            {...form.register(key as Key)}
          />

          <span className="text-destructive text-sm">{form.formState.errors[key as Key]?.message} &nbsp;</span>
        </label>
      ))}

      {form.formState.errors.root?.message && (
        <p
          className="text-destructive text-sm text-center"
          role="alert"
          aria-live="polite"
        >
          {form.formState.errors.root.message}
        </p>
      )}

      <Button
        className="w-full"
        type="submit"
        disabled={form.formState.isSubmitting}
      >Login{form.formState.isSubmitting && "..."}</Button>

      <p className="text-center">
        Don't have an account?
        &nbsp;
        <Link
          className="text-primary"
          to="/register"
        >Register</Link>
      </p>
    </form>
  );
}
