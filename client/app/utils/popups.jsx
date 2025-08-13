import Toast from "../components/popups/toast";
import Spinner from "../components/popups/spinner";
import Dialog from "../components/popups/dialog";
import Alert from "../components/popups/alert";
import Selector from "../components/popups/selector";
import Input from "../components/popups/input";
import { StyleSheet, View } from "react-native";

export default function Popups({
  toast, setToast, spinner,
  dialog, setDialog, dialogParams,
  alert, setAlert, alertParams,
  selector, setSelector, selectorParams,
  input, setInput, inputParams
}) {
  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          onFinish={() => {
            if (toast.onFinish) {
              toast.onFinish();
            }
            setToast(null);
          }}
        />
      )}

      {spinner && <Spinner />}

      {dialog && (
        <Dialog
          title={dialogParams.title}
          text={dialogParams.text}
          abortText={dialogParams.abortText}
          confirmText={dialogParams.confirmText}
          onPressAbort={() => {
            setDialog(false);
            if (dialogParams.onAbort) {
              dialogParams.onAbort();
            }
          }}
          onPressConfirmation={() => {
            setDialog(false);
            if (dialogParams.onConfirm) {
              dialogParams.onConfirm();
            }
          }}
        />
      )}

      {alert && (
        <Alert
          title={alertParams.title}
          text={alertParams.text}
          buttonText={alertParams.buttonText}
          onPress={() => {
            setAlert(false);
            if (alertParams.onPress) {
              alertParams.onPress();
            }
          }}
        />
      )}

      {selector && (
        <Selector
          title={selectorParams.title}
          text={selectorParams.text}
          optionAText={selectorParams.optionAText}
          optionBText={selectorParams.optionBText}
          onPressA={() => {
            setSelector(false);
            if (selectorParams.onPressA) {
              selectorParams.onPressA();
            }
          }}
          onPressB={() => {
            setSelector(false);
            if (selectorParams.onPressB) {
              selectorParams.onPressB();
            }
          }}
          onCancel={() => {
            setSelector(false);
            if (selectorParams.onCancel) {
              selectorParams.onCancel();
            }
          }}
        />
      )}

      {input && (
        <Input
          confirmButtonStyle={inputParams.confirmButtonStyle}
          confirmText={inputParams.confirmText}
          title={inputParams.title}
          text={inputParams.text}
          placeholder={inputParams.placeholder}
          value={inputParams.value}
          onChangeText={(val) => {
            if (inputParams.onChangeText) {
              inputParams.onChangeText(val);
            }
          }}
          onSubmit={(val) => {
            setInput(false);
            if (inputParams.onSubmit) {
              inputParams.onSubmit(val);
            }
          }}
          onCancel={() => {
            setInput(false);
            if (inputParams.onCancel) {
              inputParams.onCancel();
            }
          }}
        />
      )}
    </>
  );
}
