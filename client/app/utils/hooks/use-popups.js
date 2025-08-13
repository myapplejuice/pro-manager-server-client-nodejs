import { useContext } from "react";
import DialogContext from "../contexts/dialog-context";
import AlertContext from "../contexts/alert-context";
import SelectorContext from "../contexts/selector-context";
import InputContext from "../contexts/input-context";
import SpinnerContext from "../contexts/spinner-context";
import ToastContext from "../contexts/toast-context";

export default function usePopups() {
  const { createDialog } = useContext(DialogContext);
  const { createAlert } = useContext(AlertContext);
  const { createSelector, hideSelector } = useContext(SelectorContext);
  const { createInput, hideInput } = useContext(InputContext);
  const { createToast } = useContext(ToastContext);
  const { showSpinner, hideSpinner } = useContext(SpinnerContext);

  return {
    createDialog,
    createAlert,
    createSelector,
    hideSelector,
    createInput,
    hideInput,
    createToast,
    showSpinner,
    hideSpinner,
  };
}