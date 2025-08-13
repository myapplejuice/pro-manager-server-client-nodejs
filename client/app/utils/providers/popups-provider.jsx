import DialogContext from "../contexts/dialog-context";
import AlertContext from "../contexts/alert-context";
import SelectorContext from "../contexts/selector-context";
import SpinnerContext from "../contexts/spinner-context";
import ToastContext from "../contexts/toast-context";
import InputContext from "../contexts/input-context";

export default function PopupsProvider({ children, popups }) {
  const { createDialog, createAlert, createSelector, hideSelector, createInput, hideInput, createToast, showSpinner, hideSpinner } = popups;

  return (
    <DialogContext.Provider value={{ createDialog }}>
      <AlertContext.Provider value={{ createAlert }}>
        <SelectorContext.Provider value={{ createSelector, hideSelector }}>
          <InputContext.Provider value={{ createInput, hideInput }}>
            <ToastContext.Provider value={{ createToast }}>
              <SpinnerContext.Provider value={{ showSpinner, hideSpinner }}>
                {children}
              </SpinnerContext.Provider>
            </ToastContext.Provider>
          </InputContext.Provider>
        </SelectorContext.Provider>
      </AlertContext.Provider>
    </DialogContext.Provider>
  );
}