import { useToast } from "primevue/usetoast";

export const useToastHelper = () => {
  const toast = useToast();

  const showSuccess = (message, summary = "Sukces") => {
    toast.add({
      severity: "success",
      summary,
      detail: message,
      life: 3000,
    });
  };

  const showError = (error, summary = "Błąd") => {
    const message =
      typeof error === "string" ? error : error?.message || "Wystąpił błąd";
    toast.add({
      severity: "error",
      summary,
      detail: message,
      life: 3000,
    });
  };

  const showInfo = (message, summary = "Informacja") => {
    toast.add({
      severity: "info",
      summary,
      detail: message,
      life: 3000,
    });
  };

  const showWarning = (message, summary = "Uwaga") => {
    toast.add({
      severity: "warn",
      summary,
      detail: message,
      life: 3000,
    });
  };

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
};
