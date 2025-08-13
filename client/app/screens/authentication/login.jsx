import {
    TouchableWithoutFeedback, Platform, Keyboard,
    KeyboardAvoidingView, ScrollView,
    StyleSheet, Text, TextInput,
    View, Dimensions, Animated, Image
} from "react-native";
import { useState, useEffect, useContext, useMemo } from "react";
import { router, usePathname } from "expo-router";
import UserDatabaseService from '../../utils/services/database/user-db-service'
import usePopups from "../../utils/hooks/use-popups";
import AnimatedButton from "../../components/screen-comps/animated-button";
import TextButton from "../../components/screen-comps/text-button"
import { scaleFont } from '../../utils/scale-fonts';
import { UserContext } from "../../utils/contexts/user-context";
import { useBackHandlerContext } from "../../utils/contexts/back-handler-context";
import AsyncStorageService from "../../utils/services/async-storage-service";
import { routes } from '../../utils/settings/constants'
import FloatingIconsB from "../../components/layout-comps/floating-icons-b";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Login() {
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const { createAlert, showSpinner, hideSpinner, } = usePopups();
    const { setUser, user } = useContext(UserContext);
    const { setBackHandler } = useBackHandlerContext();
    const screen = usePathname();

    useEffect(() => {
        if (screen !== routes.LOGIN) return;

        setBackHandler(() => {
            router.back();
            return true;
        })
    }, [screen]);

    async function initSignIn() {
        Keyboard.dismiss();
        const data = await fetchData();

        if (data.token) {
            const user = await AsyncStorageService.signInUser(data);

            if (typeof user !== 'string') {
                setUser(user);
                router.replace(routes.HOMEPAGE);
            }
            else
                createAlert({ title: 'Sign In', text: userProfile });
        }
        else
            createAlert({ title: 'Sign In', text: data });
        hideSpinner();
    }

    async function fetchData() {
        showSpinner();
        const data = await UserDatabaseService.fetchUser(email, password);
        return data;
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1, width: '100%', height: '100%' }}>
                <KeyboardAvoidingView
                    style={styles.keyboardAvoidingView}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollViewContent}
                        keyboardShouldPersistTaps="handled"
                    >
                        <FloatingIconsB />
                        <View style={styles.titleContainer}>
                            <Text allowFontScaling={false} style={styles.screenTitle}>Sign in</Text>
                        </View>
                        <View style={styles.formContainer}>
                            <TextInput
                                allowFontScaling={false}
                                onChangeText={(value) => setEmail(value)}
                                placeholder="Email"
                                placeholderTextColor={"rgba(255, 255, 255, 0.5)"}
                                style={styles.input}
                            />
                            <TextInput
                                allowFontScaling={false}
                                secureTextEntry={true}
                                onChangeText={(value) => setPassword(value)}
                                placeholder="Password"
                                placeholderTextColor={"rgba(255, 255, 255, 0.5)"}
                                style={styles.input}
                            />
                            <TextButton
                                allowFontScaling={false}
                                onPress={() => router.push(routes.RECOVERY)}
                                mainText="I forgot my password"
                                mainTextStyle={styles.recovery}
                            />
                            <TextButton
                                allowFontScaling={false}
                                onPress={() => router.push(routes.REGISTER)}
                                mainText="Don't have an account?"
                                linkText="Click here"
                                mainTextStyle={styles.registerText}
                                linkTextStyle={styles.registerLink}
                            />
                            <AnimatedButton
                                title="SIGN IN"
                                onPress={initSignIn}
                                style={styles.button}
                                textStyle={styles.buttonText}
                            />
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </TouchableWithoutFeedback>
    )
};

const styles = StyleSheet.create({
    keyboardAvoidingView: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: "rgb(10, 10, 10)",
    },
    scrollViewContent: {
        flexGrow: 1,
        backgroundColor: "rgb(10, 10, 10)",
    },
    titleContainer: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
        alignContent: "center",
    },
    screenTitle: {
        fontSize: scaleFont(35),
        color: "rgb(0, 140, 255)",
        marginVertical: 30,
    },
    formContainer: {
        flex: 10,
        justifyContent: "flex-start",
        alignItems: "center",
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
    recovery: {
        color: 'rgb(0, 140, 255)',
        fontSize: scaleFont(12)
    },
    registerText: {
        color: 'white',
        fontSize: scaleFont(12)
    },
    registerLink: {
        color: 'rgb(0, 140, 255)',
        fontSize: scaleFont(12)
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