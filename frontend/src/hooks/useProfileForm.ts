import { useState, useCallback } from "react";
import type { UserProfile } from "../types";
import { validateProfileForm } from "../utils/validators";

interface FormState {
  data: Omit<UserProfile, "id" | "username">;
  isDirty: boolean;
  isSubmitting: boolean;
  fieldErrors: { [key: string]: string };
  generalError: string;
  success: string;
}

export const useProfileForm = (initialData: UserProfile) => {
  const [formState, setFormState] = useState<FormState>({
    data: {
      email: initialData.email,
      first_name: initialData.first_name,
      last_name: initialData.last_name,
      bio: initialData.bio,
    },
    isDirty: false,
    isSubmitting: false,
    fieldErrors: {},
    generalError: "",
    success: "",
  });

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormState((prev) => ({
        ...prev,
        data: { ...prev.data, [name]: value },
        isDirty: true,
        fieldErrors: { ...prev.fieldErrors, [name]: "" }, // Clear field error on change
      }));
    },
    []
  );

  const validateForm = useCallback((): boolean => {
    const errors = validateProfileForm(formState.data);
    if (Object.keys(errors).length > 0) {
      setFormState((prev) => ({ ...prev, fieldErrors: errors }));
      return false;
    }
    setFormState((prev) => ({ ...prev, fieldErrors: {} }));
    return true;
  }, [formState.data]);

  const setSubmitting = useCallback((isSubmitting: boolean) => {
    setFormState((prev) => ({ ...prev, isSubmitting }));
  }, []);

  const setGeneralError = useCallback((error: string) => {
    setFormState((prev) => ({ ...prev, generalError: error }));
  }, []);

  const setSuccess = useCallback((message: string) => {
    setFormState((prev) => ({ ...prev, success: message }));
  }, []);

  const resetForm = useCallback((newData: UserProfile) => {
    setFormState({
      data: {
        email: newData.email,
        first_name: newData.first_name,
        last_name: newData.last_name,
        bio: newData.bio,
      },
      isDirty: false,
      isSubmitting: false,
      fieldErrors: {},
      generalError: "",
      success: "",
    });
  }, []);

  const getFieldError = useCallback(
    (fieldName: string): string => formState.fieldErrors[fieldName] || "",
    [formState.fieldErrors]
  );

  return {
    ...formState,
    handleChange,
    validateForm,
    setSubmitting,
    setGeneralError,
    setSuccess,
    resetForm,
    getFieldError,
  };
};
