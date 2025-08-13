import { useState, useCallback, useEffect } from 'react';
import { useBackHandlerContext } from '../contexts/back-handler-context';

export default function usePopupHandlers() {
  const [dialog, setDialog] = useState(false);
  const [dialogParams, setDialogParams] = useState({});
  const [alert, setAlert] = useState(false);
  const [alertParams, setAlertParams] = useState({});
  const [selector, setSelector] = useState(false);
  const [selectorParams, setSelectorParams] = useState({});
  const [input, setInput] = useState(false);
  const [inputParams, setInputParams] = useState({});
  const [spinner, setSpinner] = useState(false);
  const [toast, setToast] = useState(null);
  const { pauseBackHandler, resumeBackHandler, setBackHandler } = useBackHandlerContext();

  useEffect(() => {
    const anyPopupOpen = dialog || alert || spinner;
    if (!anyPopupOpen)
      resumeBackHandler();
    else
      pauseBackHandler();
  }, [dialog, alert, spinner, resumeBackHandler]);

  const createDialog = useCallback((params) => {
    setDialogParams(params);
    setDialog(true);
  }, []);

  const createAlert = useCallback((params) => {
    setAlertParams(params);
    setAlert(true);
  }, []);

  const createSelector = useCallback((params) => {
    setBackHandler(() => {
      hideSelector();
      return true;
    });
    setSelectorParams({
      ...params,
      onCancel: () => {
        hideSelector();
      }
    });
    setSelector(true);
  }, [setBackHandler]);

  const hideSelector = useCallback(() => {
    setSelector(false);
    setBackHandler(null);
  }, [setBackHandler]);

  const createInput = useCallback((params) => {
    setBackHandler(() => {
      hideInput();
      return true;
    });
    setInputParams({
      ...params,
      onCancel: () => {
        hideInput();
      }
    });
    setInput(true);
  }, []);

  const hideInput = useCallback(() => {
    setInput(false);
    setBackHandler(null);
  }, [setBackHandler]);

  const showSpinner = useCallback(() => {
    setSpinner(true);
  }, []);

  const hideSpinner = useCallback(() => {
    setSpinner(false);
  }, []);

  const createToast = useCallback((message) => { setToast(message); }, []);

  return {
    popupStates: {
      dialog, setDialog, dialogParams,
      alert, setAlert, alertParams,
      selector, setSelector, selectorParams,
      input, setInput, inputParams,
      spinner, toast, setToast
    },
    popupActions: {
      createDialog,
      createAlert,
      createSelector,
      hideSelector,
      createInput,
      hideInput,
      showSpinner,
      hideSpinner,
      createToast,
    }
  };
}
