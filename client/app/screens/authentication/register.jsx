import {
    KeyboardAvoidingView, ScrollView,
    Text, TextInput, TouchableWithoutFeedback,
    View, Keyboard, StyleSheet,
    Platform, Dimensions
} from "react-native";
import { useState, useRef, useEffect, useContext } from "react";
import { router, usePathname } from "expo-router";
import UserDatabaseService from "../../utils/services/database/user-db-service";
import 'react-native-get-random-values';
import * as FileSystem from 'expo-file-system';
import { scaleFont } from "../../utils/scale-fonts";
import usePopups from "../../utils/hooks/use-popups";
import TextButton from "../../components/screen-comps/text-button";
import AnimatedButton from '../../components/screen-comps/animated-button'
import { Images } from "../../utils/assets";
import { useBackHandlerContext } from "../../utils/contexts/back-handler-context";
import { UserContext } from "../../utils/contexts/user-context";
import AsyncStorageService from "../../utils/services/async-storage-service";
import { routes } from "../../utils/settings/constants";
import ProgressDots from "../../components/screen-comps/progress-dots";
import { Asset } from "expo-asset";
import FloatingIconsB from "../../components/layout-comps/floating-icons-b";

export default function Register() {
    const [container, setContainer] = useState(0);
    const [username, setUsername] = useState("");
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [age, setAge] = useState("");
    const [role, setRole] = useState("");
    const [gender, setGender] = useState("");
    const { setUser } = useContext(UserContext)
    const { createDialog, createAlert, showSpinner, hideSpinner, createToast } = usePopups();
    const { setBackHandler } = useBackHandlerContext()
    const scrollViewRef = useRef(null);
    const screen = usePathname();

    useEffect(() => {
        if (screen !== routes.REGISTER) return;

        setBackHandler(() => {
            createDialog({
                title: "Registration",
                text: "Are you sure you want to cancel registration",
                onConfirm: () => router.back()
            });
            return true;
        });
    }, [screen]);

    function handleAdvance() {
        if (container === 0) {
            if (!role)
                createToast({ title: "Registration", message: "You must choose a role to advance!" });
            else
                setContainer(container + 1);
        }
        else if (container === 1) {
            if (!gender) {
                createToast({ title: "Registration", message: "You must select a gender to advance!" });
            } else {
                setContainer(container + 1);
            }
        }
        else if (container === 2) {
            if (!username?.trim() || !firstname?.trim() || !lastname?.trim()) {
                createToast({ title: "Registration", message: "Please fill in all fields!" });
                return;
            }
            if (!age || isNaN(age) || Number(age) <= 0 || Number(age) > 99) {
                createToast({ title: "Registration", message: "Please enter a valid age (1-99)!" });
                return;
            }
            setContainer(container + 1);
        }
        else if (container === 3) {
            const trimmedEmail = email?.trim();
            const trimmedPhone = phone?.trim();

            if (!trimmedEmail || !trimmedPhone || !password || !confirmPass) {
                createToast({ title: "Registration", message: "Please fill in all fields!" });
                return;
            }
            if (password !== confirmPass) {
                createToast({ title: "Registration", message: "Password does not match!" });
                return;
            }
            initSignUp();
        }
    }

    async function initSignUp() {
        Keyboard.dismiss()

        showSpinner()
        try {
            const isCoach = role === "coach" ? true : false;

            const asset = Asset.fromModule(Images.profilePic);
            await asset.downloadAsync();
            const imageBase64 = await FileSystem.readAsStringAsync(asset.localUri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            const data = await UserDatabaseService.insertUser({ username, firstname, lastname, age: Number(age), gender, email, phone, password, isCoach, imageBase64 });
            if (data.token) {
                createAlert({
                    title: "Registration",
                    text: `Registration success!\nClick OK to continue`,
                    onPress: async () => {
                        const user = await AsyncStorageService.signInUser(data);
                        if (typeof user !== 'string') {
                            setUser(user);
                            router.replace(routes.HOMEPAGE);
                        }
                        else
                            createAlert({ title: 'Registration', text: user });
                    }
                })
            } else
                createAlert({ title: "Registration", text: data })
        } catch (e) {
            createAlert({ title: "Registration", text: `Internal server error\n${e.message}` })
        } finally {
            hideSpinner()
        }
    }

    const styles = StyleSheet.create({
        // === Header Title ===
        titlesContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            alignContent: "center"
        },
        title: {
            fontSize: scaleFont(35),
            color: "rgb(0, 140, 255)",
            marginVertical: 30
        },

        // === Main Content Area ===
        contentWrapper: {
            flex: 4,
            justifyContent: "flex-start",
            alignItems: "center",
            width: "100%"
        },

        // === Role Selection ===
        roleButton: {
            width: Dimensions.get("window").width * 0.9,
            height: 50,
            marginVertical: 10,
            borderRadius: 20,
            borderColor: "rgb(0,140,255)",
            borderWidth: 1
        },
        roleButtonText: {
            color: "rgb(255,255,255)",
            fontSize: scaleFont(12)
        },

        // === Cancel Button ===
        cancelButtonText: {
            color: 'rgb(0, 140, 255)',
            fontSize: scaleFont(12)
        },

        // === Advance Button ===
        stageButtonsContainer: {
            width: Dimensions.get('window').width * 0.9,
            flexDirection: container === 0 ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginVertical: 10
        },
        stageButton: {
            alignSelf: 'center',
            width: container == 0 ? Dimensions.get("window").width * 0.9
                : Dimensions.get("window").width * 0.43,
            height: 50,
            marginVertical: 10,
            borderRadius: 20,
            backgroundColor: "rgb(0, 140, 255)"
        },
        stageButtonText: {
            fontSize: scaleFont(12),
            fontFamily: 'monospace'
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
        }
    });

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                style={{ flex: 1, backgroundColor: "rgb(10, 10, 10)" }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
            >
                <FloatingIconsB />
                <ScrollView
                    contentContainerStyle={{ justifyContent: 'center', height: "100%" }}
                    keyboardShouldPersistTaps="handled"
                    ref={scrollViewRef}
                >
                    <View style={styles.titlesContainer}>
                        <ProgressDots
                            steps={[container == 0, container == 1, container == 2, container == 3]}
                            activeColor="rgb(0,140,255)"
                            inactiveColor="rgb(82, 82, 82)"
                        />
                        <Text allowFontScaling={false} style={styles.title}>
                            Register
                        </Text>
                    </View>
                    <View style={styles.contentWrapper}>
                        {container == 0 && (
                            <>
                                <Text style={{ color: "white", marginVertical: 10 }} allowFontScaling={false}>Choose your role</Text>
                                <AnimatedButton
                                    onPress={() => setRole("coach")}
                                    title="COACH"
                                    style={[styles.roleButton, { backgroundColor: role === 'coach' ? 'rgb(0, 70, 130)' : "rgb(10,10,10)" }]}
                                    textStyle={styles.roleButtonText}
                                />
                                <AnimatedButton
                                    onPress={() => setRole("athlete")}
                                    title="ATHLETE"
                                    style={[styles.roleButton, { backgroundColor: role === 'athlete' ? 'rgb(0, 70, 130)' : "rgb(10,10,10)" }]}
                                    textStyle={styles.roleButtonText} />
                            </>)}
                        {container === 1 && (
                            <>
                                <Text style={{ color: "white", marginVertical: 10 }} allowFontScaling={false}>Select your gender</Text>
                                <AnimatedButton
                                    onPress={() => setGender("Male")}
                                    title="MALE"
                                    style={[styles.roleButton, { backgroundColor: gender === 'Male' ? 'rgb(0, 70, 130)' : "rgb(10,10,10)" }]}
                                    textStyle={styles.roleButtonText}
                                />
                                <AnimatedButton
                                    onPress={() => setGender("Female")}
                                    title="FEMALE"
                                    style={[styles.roleButton, { backgroundColor: gender === 'Female' ? 'rgb(0, 70, 130)' : "rgb(10,10,10)" }]}
                                    textStyle={styles.roleButtonText}
                                />
                            </>)}
                        {container == 2 && (<>
                            <TextInput
                                allowFontScaling={false}
                                onChangeText={(value) => setUsername(value)}
                                value={username}
                                placeholder="Username"
                                placeholderTextColor={"rgba(255, 255, 255, 0.5)"}
                                style={styles.input}
                            />
                            <TextInput
                                allowFontScaling={false}
                                onChangeText={(value) => setFirstname(value)}
                                value={firstname}
                                placeholder="Firstname"
                                placeholderTextColor={"rgba(255, 255, 255, 0.5)"}
                                style={styles.input}
                            />
                            <TextInput
                                allowFontScaling={false}
                                onChangeText={(value) => setLastname(value)}
                                value={lastname}
                                placeholder="Lastname"
                                placeholderTextColor={"rgba(255, 255, 255, 0.5)"}
                                style={styles.input}
                            />
                            <TextInput
                                allowFontScaling={false}
                                onChangeText={(value) => setAge(value)}
                                value={age}
                                placeholder="Age"
                                placeholderTextColor={"rgba(255, 255, 255, 0.5)"}
                                style={styles.input}
                                keyboardType="numeric"
                            />
                        </>)}
                        {container == 3 && (<>
                            <TextInput
                                allowFontScaling={false}
                                onChangeText={(value) => setEmail(value)}
                                value={email}
                                placeholder="Email"
                                placeholderTextColor={"rgba(255, 255, 255, 0.5)"}
                                style={styles.input}
                            />
                            <TextInput
                                allowFontScaling={false}
                                onChangeText={(value) => setPhone(value)}
                                value={phone}
                                placeholder="Phone"
                                placeholderTextColor={"rgba(255, 255, 255, 0.5)"}
                                style={styles.input}
                                inputMode="tel"
                            />
                            <TextInput
                                allowFontScaling={false}
                                secureTextEntry={true}
                                onChangeText={(value) => setPassword(value)}
                                value={password}
                                placeholder="Password"
                                placeholderTextColor={"rgba(255, 255, 255, 0.5)"}
                                style={styles.input}
                            />
                            <TextInput
                                allowFontScaling={false}
                                secureTextEntry={true}
                                onChangeText={(value) => setConfirmPass(value)}
                                value={confirmPass}
                                placeholder="Confirm Password"
                                placeholderTextColor={"rgba(255, 255, 255, 0.5)"}
                                style={styles.input}
                            />
                        </>)}
                        <TextButton
                            mainText="Cancel registration"
                            mainTextStyle={styles.cancelButtonText}
                            onPress={() => {
                                createDialog({
                                    title: "Registration",
                                    text: "Are you sure you want to cancel registration",
                                    onConfirm: () => router.back()
                                });
                                return true;
                            }}
                        />
                        <View style={styles.stageButtonsContainer}>
                            {container != 0 && (<AnimatedButton
                                onPress={() => setContainer(container - 1)}
                                title="Back"
                                style={styles.stageButton}
                                textStyle={styles.stageButtonText} />)}
                            <AnimatedButton
                                onPress={handleAdvance}
                                title={container == 3 ? "Finish" : "Next"}
                                style={styles.stageButton}
                                textStyle={styles.stageButtonText} />
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    )
};