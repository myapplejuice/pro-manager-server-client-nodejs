import { TouchableWithoutFeedback, Keyboard, StyleSheet, Text, View, BackHandler, Platform, KeyboardAvoidingView, ScrollView, TextInput } from "react-native";
import { useState, useEffect } from "react";
import { router, usePathname } from "expo-router";
import UserDatabaseService from "../../utils/services/database/user-db-service"
import usePopups from "../../utils/hooks/use-popups";
import AnimatedButton from "../../components/screen-comps/animated-button";
import ProgressDots from "../../components/screen-comps/progress-dots";
import { scaleFont } from "../../utils/scale-fonts";
import TextButton from "../../components/screen-comps/text-button";
import { useBackHandlerContext } from "../../utils/contexts/back-handler-context";
import { routes } from "../../utils/settings/constants";
import { Dimensions } from "react-native";
import FloatingIconsB from "../../components/layout-comps/floating-icons-b";

export default function Recovery() {
    const [emailInputDisplay, setEmailInputDisplay] = useState(true);
    const [email, setEmail] = useState();
    const [recoveryCode, setRecoveryCode] = useState();
    const [recoveryCodeConfirmationDisplay, setRecoveryCodeConfirmationDisplay] = useState(false);
    const [recoveryCodeConfirmation, setRecoveryCodeConfirmation] = useState();
    const [passwordInputDisplay, setPasswordInputDisplay] = useState(false);
    const [password, setPassword] = useState();
    const [passwordConfirmation, setPasswordConfirmation] = useState();
    const { createAlert, createDialog, showSpinner, hideSpinner } = usePopups();
    const { setBackHandler } = useBackHandlerContext();
    const screen = usePathname();

    useEffect(() => {
        if (screen !== routes.RECOVERY) return;

        setBackHandler(() => {
            if (!emailInputDisplay)
                createDialog({
                    title: 'Password Recovery',
                    text: 'Are you sure you want to cancel your recovery proccess?',
                    onConfirm: () => router.back()
                })
            else
                router.back()
            return true;
        })
    }, [emailInputDisplay, screen]);

    async function initRecovery() {
        Keyboard.dismiss();
        if (!email) {
            createAlert({ title: 'Password Recovery', text: 'Please fill in your account email!' })
            return;
        }

        showSpinner();
        await sendRecoveryMail()
        hideSpinner();
    }

    async function sendRecoveryMail() {
        const code = createRecoveryCode();
        const result = await UserDatabaseService.sendRecoveryMail(email, code);

        if (result == true) {
            setEmailInputDisplay(false);
            setRecoveryCodeConfirmationDisplay(true);
            return;
        }

        createAlert({ title: 'Password Recovery', text: result });
    }

    function createRecoveryCode() {
        const code = Math.floor(100000 + Math.random() * 900000).toString()
        setRecoveryCode(code)
        return code
    }

    function validateCode() {
        Keyboard.dismiss()

        if (recoveryCode != recoveryCodeConfirmation) {
            createAlert({ title: 'Password Recovery', text: "Incorrect code!\nPlease try again" })
            return;
        }
        setRecoveryCodeConfirmationDisplay(false)
        setPasswordInputDisplay(true)
    }

    async function initPasswordChange() {
        showSpinner();
        Keyboard.dismiss();

        if (!password || !passwordConfirmation) {
            createAlert({ title: 'Password Recovery', text: "Please fill in both fields!" })
            return;
        }

        if (password != passwordConfirmation) {
            createAlert({ title: 'Password Recovery', text: "Password doesnt match!\nPlease try again" })
            return;
        }

        updateUser()
    }

    async function updateUser() {
        const result = await UserDatabaseService.updateUserByEmail({ email, password })

        hideSpinner();
        if (result) {
            createAlert({ title: 'Password Recovery', text: "Password successfully changed!\nPlease try logging in now", onPress: () => router.back() })
            return;
        }
        createAlert('Password Recovery', "Password recovery failed!\nPlease try again later");
    }

    function initCancelRecovery() {
        if (!emailInputDisplay)
            createDialog({ title: 'Password Recovery', text: 'Are you sure you want to cancel your recovery process?', onConfirm: () => router.back() })
        else
            router.back()
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <FloatingIconsB />
                <View style={styles.progressContainer}>
                    <ProgressDots
                        steps={[emailInputDisplay, recoveryCodeConfirmationDisplay, passwordInputDisplay]}
                        activeColor="rgb(0,140,255)"
                        inactiveColor="rgb(82, 82, 82)"
                    />
                </View>

                <View style={styles.titleContainer}>
                    <Text allowFontScaling={false} style={styles.screenTitle}>Password Recovery</Text>
                </View>

                {emailInputDisplay && (
                    <View style={styles.section}>
                        <Text allowFontScaling={false} style={styles.instructionText}>
                            Please enter your email to receive recovery code
                        </Text>
                        <TextInput
                            allowFontScaling={false}
                            onChangeText={setEmail}
                            placeholder="Email"
                            placeholderTextColor="rgba(255, 255, 255, 0.5)"
                            style={styles.input}
                        />
                        <View style={styles.cancelContainer}>
                            <TextButton
                                mainText={"Cancel recovery"}
                                mainTextStyle={styles.cancelButton}
                                onPress={initCancelRecovery} />
                        </View>
                        <AnimatedButton title="SEND EMAIL" onPress={initRecovery} style={styles.button} textStyle={styles.buttonText} />
                    </View>
                )}

                {recoveryCodeConfirmationDisplay && (
                    <View style={styles.section}>
                        <Text allowFontScaling={false} style={styles.instructionText}>
                            Please enter the recovery code sent to your email
                        </Text>
                        <TextInput
                            allowFontScaling={false}
                            onChangeText={setRecoveryCodeConfirmation}
                            placeholder="Recovery code"
                            placeholderTextColor="rgba(255, 255, 255, 0.5)"
                            style={styles.input}
                            inputMode="numeric"
                        />
                        <View style={styles.cancelContainer}>
                            <TextButton
                                mainText={"Cancel recovery"}
                                mainTextStyle={styles.cancelButton}
                                onPress={initCancelRecovery} />
                        </View>
                        <AnimatedButton title="SUBMIT" onPress={validateCode} style={styles.button} textStyle={{ fontSize: scaleFont(12) }} />
                    </View>
                )}

                {passwordInputDisplay && (
                    <View style={styles.section}>
                        <Text allowFontScaling={false} style={styles.instructionText}>
                            Please enter a new password
                        </Text>
                        <TextInput
                            allowFontScaling={false}
                            onChangeText={setPassword}
                            placeholder="Password"
                            placeholderTextColor="rgba(255, 255, 255, 0.5)"
                            style={styles.input}
                        />
                        <TextInput
                            allowFontScaling={false}
                            onChangeText={setPasswordConfirmation}
                            placeholder="Confirm password"
                            placeholderTextColor="rgba(255, 255, 255, 0.5)"
                            style={styles.input}
                        />
                        <View style={styles.cancelContainer}>
                            <TextButton
                                mainText={"Cancel recovery"}
                                mainTextStyle={styles.cancelButton}
                                onPress={initCancelRecovery} />
                        </View>
                        <AnimatedButton title="UPDATE PASSWORD" onPress={initPasswordChange} style={styles.button} textStyle={{ fontSize: scaleFont(12) }} />
                    </View>
                )}
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "rgb(10, 10, 10)",

    },

    // Top: Progress Dots
    progressContainer: {
        flex: 0.5,
        marginTop: 15,

    },

    // Middle: Title and Screen Header
    titleContainer: {
        justifyContent: "flex-start",
        flex: 2,
    },
    title: {
        fontFamily: "Monospace",
        fontWeight: "bold",
        fontSize: scaleFont(40),
        color: "rgb(0, 140, 255)"
    },
    screenTitle: {
        fontSize: scaleFont(35),
        color: "rgb(0, 140, 255)",
        marginVertical: 30,
    },

    cancelContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: "100%",
        alignSelf: 'center',
        marginVertical: 10,
    },
    cancelButton: {
        textAlign: 'center',
        color: 'rgb(0,140,255)'
    },

    // Sections: Forms
    section: {
        flex: 8,
    },
    instructionText: {
        paddingHorizontal: 10,
        fontSize: scaleFont(13),
        color: "rgb(255,255,255)",
    },
    input: {
        width: Dimensions.get('window').width * 0.9,
        height: 50,
        color: "rgb(255, 255, 255)",
        borderColor: "black",
        borderWidth: 1,
        marginVertical: 15,
        borderRadius: 15,
        padding: 7,
        backgroundColor: "rgb(39, 40, 56)",
    },
    button: {
        marginVertical: 15,
        backgroundColor: 'rgb(0, 140, 255)',
        width: Dimensions.get('window').width * 0.9,
        height: 50,
        borderRadius: 20
    },
    buttonText: {
        fontFamily: 'monospace',
        fontSize: scaleFont(12)
    }
});