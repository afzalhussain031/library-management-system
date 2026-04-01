import { useEffect } from "react";

/**
 * Hook to warn user about unsaved changes when leaving the page
 * Shows browser native warning if user tries to close/navigate with unsaved changes
 */
export const useUnsavedChanges = (isDirty: boolean, isSubmitting: boolean) => {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only warn if there are unsaved changes and we're not currently submitting
      if (isDirty && !isSubmitting) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, isSubmitting]);
};