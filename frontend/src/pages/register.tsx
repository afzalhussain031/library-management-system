import { Link } from "react-router-dom";

import { z } from "zod";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { cn } from "../utils/cn";

import { SignWrapper } from "../components/sign-wrapper";
import { Button } from "../components/ui/button";

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
  confirmPassword: z.string().trim().min(3, "Min. 3 characters").max(50, "Max. 50 characters"),
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
  const {
    register,
    handleSubmit,
    formState,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  return (
    <form
      className="my-auto border border-border rounded-xl bg-background p-4 space-y-2"
      onSubmit={handleSubmit((e) => { alert(JSON.stringify(e)); })}
    >
      <h2 className="text-center text-3xl font-bold">Create Account</h2>

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

      <Button className="w-full">Register</Button>

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
