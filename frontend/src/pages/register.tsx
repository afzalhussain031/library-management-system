import { Link } from "react-router-dom";

import { z } from "zod";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAuth } from "../hooks";

import { cn } from "../utils/cn";

import { SignWrapper } from "../components/sign-wrapper";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export default function Page() {
  return (
    <SignWrapper>
      <RegisterForm />
    </SignWrapper>
  );
}

type FormField = {
  name: string;
  fatherName: string;
  motherName: string;
  enrollmentNo: string;
  phoneNo: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type Key = keyof FormField;

const defaultValues: FormField = { name: "", fatherName: "", motherName: "", enrollmentNo: "", phoneNo: "", email: "", password: "", confirmPassword: "" };

const formSchema = z.object({
  name: z.string().trim().min(3, "Min. 3 characters").max(50, "Max. 50 characters"),
  fatherName: z.string().trim().min(3, "Min. 3 characters").max(50, "Max. 50 characters"),
  motherName: z.string().trim().min(3, "Min. 3 characters").max(50, "Max. 50 characters"),
  enrollmentNo: z.string().trim().min(3, "Min. 3 characters").max(50, "Max. 50 characters"),
  phoneNo: z.string().trim().min(3, "Min. 3 characters").max(50, "Max. 50 characters"),
  email: z.email(),
  password: z.string().trim().min(3, "Min. 3 characters").max(50, "Max. 50 characters"),
  confirmPassword: z.string().trim().min(3, "Min. 3 characters").max(50, "Max. 50 characters")
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });
  }
});

const labels: Record<Key, string> = {
  name: "Name",
  fatherName: "Father Name",
  motherName: "Mother Name",
  enrollmentNo: "Enrollment Number",
  phoneNo: "Phone Number",
  email: "Email",
  password: "Password",
  confirmPassword: "Confirm Password"
};

function RegisterForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const auth = useAuth();

  return (
    <form
      className="my-auto border border-border rounded-xl bg-background p-4 space-y-2"
      onSubmit={form.handleSubmit(async (data) => {
        try {
          await auth.register({
            username: data.enrollmentNo,
            email: data.email,
            password: data.password,
            password2: data.confirmPassword
          });
        } catch (e) {
          const message = "You are offline. Connect to internet and try again!";
          form.setError("root", { message });
          // TODO:
          alert(message);
        }
      })}
    >
      <h2 className="text-center text-3xl font-bold">Create Account</h2>

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
            {...form.register(key as Key)}
          />

          <span className="text-destructive text-sm">{form.formState.errors[key as Key]?.message} &nbsp;</span>
        </label>
      ))}

      <Button
        className="w-full"
        type="submit"
        disabled={form.formState.isSubmitting || form.formState.isSubmitSuccessful}
      >Register{form.formState.isSubmitting && "..."}</Button>

      <p className="text-center">
        Already have an account?
        &nbsp;
        <Link
          className="text-primary"
          to="/login"
        >Login</Link>
      </p>
    </form>
  );
}
