import { Link } from "react-router-dom";

import { z } from "zod";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { cn } from "../utils/cn";

import { Button } from "../components/ui/button";

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
  enrollmentNo: "Enrollment Nubmer",
  password: "Password"
};

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  return (
    <form
      className="my-auto border border-border rounded-xl bg-background p-4 space-y-2"
      onSubmit={handleSubmit((e) => { alert(JSON.stringify(e)); })}
    >
      <h2 className="text-center text-3xl font-bold">Login</h2>

      {Object.keys(defaultValues).map(key => (
        <label
          key={key}
          className={cn(
            "flex flex-col capitalize",
            formState.errors[key as Key]?.message && "text-destructive *:outline-destructive *:border-destructive"
          )}
        >
          <span>{labels[key as Key]}</span>

          <input
            className="border border-border rounded-md px-3 py-1 bg-input focus:outline-accent "
            placeholder={labels[key as Key]}
            {...register(key as Key)}
          />

          <span className="text-destructive text-sm">{formState.errors[key as Key]?.message} &nbsp;</span>
        </label>
      ))}

      <Button className="w-full">Login</Button>

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
