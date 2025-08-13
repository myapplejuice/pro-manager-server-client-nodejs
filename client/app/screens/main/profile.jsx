import { Text, View, StyleSheet, Image, TouchableOpacity, ImageBackground, BackHandler } from "react-native"
import { useEffect, useContext, useState, useRef } from "react"
import usePopups from "../../utils/hooks/use-popups"
import { UserContext } from '../../utils/contexts/user-context'
import { scaleFont } from '../../utils/scale-fonts'
import UserDatabaseService from '../../utils/services/database/user-db-service'
import AsyncStorageService from "../../utils/services/async-storage-service"
import { Images } from '../../utils/assets';
import { router } from "expo-router";
import { usePathname } from "expo-router"
import CameraCapture from '../../components/screen-comps/camera-capture';
import ImagePreview from '../../components/screen-comps/camera-image-preview';
import { useBackHandlerContext } from "../../utils/contexts/back-handler-context"
import { CameraContext } from "../../utils/contexts/camera-context";
import useCameraPermissionRequest from "../../utils/hooks/use-camera-permission-request";
import useMediaLibraryPermissionRequest from "../../utils/hooks/use-media-library-permission-request";
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { routes } from "../../utils/settings/constants"
import useAppStateBackHandler from '../../utils/hooks/use-app-state-back-handler';

export default function Profile() {
    const [viewMainDisplay, setViewMainDisplay] = useState(true);
    const [cameraDisplay, setCameraDisplay] = useState(false);
    const [imagePreviewDisplay, setImagePreviewDisplay] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const { user, setUser } = useContext(UserContext)
    const { setCameraActive } = useContext(CameraContext);
    const { setBackHandler } = useBackHandlerContext();
    const { createDialog, createSelector, hideSelector, createAlert, createToast, hideSpinner, showSpinner } = usePopups();
    const screen = usePathname();
    useAppStateBackHandler(() => {
        adjustBackHandler(0);

        if (cameraDisplay) {
            adjustBackHandler(1);
        }
    });

    const { requestCameraAccess } = useCameraPermissionRequest({
        onGranted: () => {
            setCameraActive(true);
            setCameraDisplay(true);
            setViewMainDisplay(false);
            adjustBackHandler(1);
        },
        onResetBackHandler: () => {
            adjustBackHandler(0);
        },
    });

    const { requestMediaAccess } = useMediaLibraryPermissionRequest({
        onGranted: () => {
            launchPicker();
            adjustBackHandler(0);
        },
        onResetBackHandler: () => {
            adjustBackHandler(0);
        },
    });

    useEffect(() => {
        if (screen !== routes.PROFILE) return;

        adjustBackHandler(0);
    }, [screen]);


    function adjustBackHandler(protocol) {
        if (protocol === 0) {
            setBackHandler(() => {
                if (screen === routes.HOMEPAGE)
                    BackHandler.exitApp()
                else
                    router.back();
                return true;
            });
        } else if (protocol === 1) {
            setBackHandler(() => {
                setCameraDisplay(false)
                setImagePreviewDisplay(false)
                setViewMainDisplay(true)
                setCameraActive(false)
                adjustBackHandler(0)
                return true;
            })
        }
    }

    function createNewPopup(protocol) {
        if (protocol === 1) {
            createSelector({
                title: "Profile Picture", text: "Do you want to take a photo using camera or upload an image?",
                optionAText: "Take a photo",
                optionBText: "Upload image",
                onPressA: async () => await requestCameraAccess(),
                onPressB: async () => await requestMediaAccess()
            })
        }
        if (protocol === 0) {
            createDialog({ title: "Sign Out", text: "Are you sure you want to sign out of this account?", onConfirm: () => AsyncStorageService.signOutUser() })
        }
    }

    async function launchPicker() {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setNewImage(result.assets[0].uri);
        }
    }

    function onCapturePhoto(photo) {
        setPreviewImage(photo);
        setCameraDisplay(false);
        setImagePreviewDisplay(true);
    }

    function onCancelPhoto() {
        setCameraActive(false);
        setImagePreviewDisplay(false);
        setViewMainDisplay(true);
        adjustBackHandler(0);
    }

    async function onConfirmPhoto() {
        setImagePreviewDisplay(false);
        setViewMainDisplay(true);
        setCameraActive(false);
        showSpinner();
        await setNewImage();
        hideSpinner();
    }

    async function setNewImage(newImage) {
        showSpinner();
        try {
            let imageBase64 = null
            if (newImage)
                imageBase64 = await FileSystem.readAsStringAsync(newImage, {
                    encoding: FileSystem.EncodingType.Base64,
                });
            else
                imageBase64 = await FileSystem.readAsStringAsync(previewImage.uri, {
                    encoding: FileSystem.EncodingType.Base64,
                });

            const result = await UserDatabaseService.updateUser(user.id, { undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, imageBase64 })

            if (result === true) {
                setUser(prev => ({ ...prev, image: { uri: `data:image/jpeg;base64,${imageBase64}` } }));
                createToast({ message: "Your profile picture successfully updated!" });
                return true;
            }
            else {
                createToast({ message: result });
                return false;
            }
        }
        catch (e) {
            createToast({ message: `${e}\nPlease try again later.` });
            return false;
        }
        finally {
            hideSpinner();
        }
    }

    return (
        <View style={styles.main}>
            {cameraDisplay && (
                <CameraCapture
                    onCapture={onCapturePhoto}
                />
            )}
            {imagePreviewDisplay && (
                <ImagePreview
                    imageUri={previewImage}
                    onConfirm={onConfirmPhoto}
                    onCancel={onCancelPhoto}
                />
            )}
            {viewMainDisplay && (
                <>
                    <View style={styles.profileWrapper}>
                        <ImageBackground
                            resizeMode="cover"
                            source={Images.darkProfileBackground}
                            style={styles.profileContainer}
                        >
                            <View style={styles.profileInnerContainer}>
                                <TouchableOpacity
                                    style={styles.imageContainer}
                                    onPress={() => { createNewPopup(1); }}
                                >
                                    <Image style={styles.image} source={user.image} />
                                </TouchableOpacity>
                                <View style={styles.verticalDivider} />
                                <View style={styles.detailsContainer}>
                                    <Text allowFontScaling={false} style={[styles.detail, { color: 'rgb(0, 140, 255)' }]}>
                                        {user.isCoach ? 'Coach Account' : 'Athlete Account'}
                                    </Text>
                                    <Text allowFontScaling={false} style={styles.detail}>
                                        {user.firstname} {user.lastname}
                                    </Text>
                                </View>
                            </View>
                        </ImageBackground>
                    </View>

                    <View style={styles.optionsContainer}>
                        <TouchableOpacity onPress={() => router.push('/screens/profile/personal-details')} style={styles.optionContainer}>
                            <View style={styles.option}>
                                <View style={styles.optionImageContainer}>
                                    <Image style={styles.optionImage} source={Images.personalDetails} />
                                </View>
                                <Text allowFontScaling={false} style={styles.optionText}>Personal Details</Text>
                            </View>
                            <View style={styles.optionArrowContainer}>
                                <Image style={styles.optionArrow} source={Images.arrow} />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => router.push('/screens/profile/settings')} style={styles.optionContainer}>
                            <View style={styles.option}>
                                <View style={styles.optionImageContainer}>
                                    <Image style={styles.optionImage} source={Images.settingsProfile} />
                                </View>
                                <Text allowFontScaling={false} style={styles.optionText}>Settings</Text>
                            </View>
                            <View style={styles.optionArrowContainer}>
                                <Image style={styles.optionArrow} source={Images.arrow} />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => router.push('/screens/profile/contact')} style={styles.optionContainer}>
                            <View style={styles.option}>
                                <View style={styles.optionImageContainer}>
                                    <Image style={styles.optionImage} source={Images.contactTwo} />
                                </View>
                                <Text allowFontScaling={false} style={styles.optionText}>Contact Us</Text>
                            </View>
                            <View style={styles.optionArrowContainer}>
                                <Image style={styles.optionArrow} source={Images.arrow} />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => router.push('/screens/profile/privacy')} style={styles.optionContainer}>
                            <View style={styles.option}>
                                <View style={styles.optionImageContainer}>
                                    <Image style={styles.optionImage} source={Images.privacy} />
                                </View>
                                <Text allowFontScaling={false} style={styles.optionText}>Privacy Policy</Text>
                            </View>
                            <View style={styles.optionArrowContainer}>
                                <Image style={styles.optionArrow} source={Images.arrow} />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => createNewPopup(0)}
                            style={[styles.optionContainer, { backgroundColor: 'rgba(0, 0, 0, 0.34)' }]}
                        >
                            <View style={styles.option}>
                                <View style={styles.optionImageContainer}>
                                    <Image style={[styles.optionImage, { width: 20, height: 20 }]} source={Images.logout} />
                                </View>
                                <Text allowFontScaling={false} style={[styles.optionText, { color: 'rgb(194, 67, 67)' }]}>
                                    Sign Out
                                </Text>
                            </View>
                            <View style={styles.optionArrowContainer} />
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    // Top-level container
    main: { flex: 1, backgroundColor: "rgb(20, 20, 20)" },

    // PROFILE CONTAINER
    profileWrapper: { flex: 1, overflow: 'hidden', borderBottomLeftRadius: 25, borderBottomRightRadius: 25 },
    profileContainer: { flex: 1, flexDirection: 'row', width: '100%', },
    profileInnerContainer: { flexDirection: 'row', width: '90%', backgroundColor: 'rgba(0, 0, 0, 0.7)', borderRadius: 25, marginVertical: 20, marginHorizontal: 'auto' },

    // Profile image
    imageContainer: { justifyContent: 'center', alignItems: 'center', flex: 1 },
    image: { borderRadius: 60, width: 120, height: 120 },

    verticalDivider: { width: 1, height: '100%', borderStyle: 'dashed', borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.3)', alignSelf: 'center', marginRight: 10 },

    // User details
    detailsContainer: { flex: 1.4, justifyContent: 'center' },
    detail: { color: 'rgb(255, 255, 255)', fontSize: scaleFont(17), marginVertical: 10, marginHorizontal: 10 },

    // Options section (bottom part)
    optionsContainer: { flex: 3 },
    optionContainer: { height: 80, justifyContent: 'center', flexDirection: 'row' },
    option: { flex: 5, flexDirection: 'row', justifyContent: 'center', alignContent: 'center', alignItems: 'center' },
    optionImageContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    optionImage: { width: 25, height: 25, marginLeft: 20 },
    optionText: { flex: 5, color: 'rgb(0,140,255)', fontSize: scaleFont(16), marginLeft: 30 },
    optionArrowContainer: { flex: 1, justifyContent: 'center', alignContent: 'center', alignItems: 'center' },
    optionArrow: { width: 20, height: 20 }
});




// <TextInput
//                   allowFontScaling={false}
//                   onChangeText={(value) => setUsername(value)}
//                   placeholder="Username"
//                   placeholderTextColor={"rgba(0, 140, 255, 0.5)"}
//                   style={styles.input}
//               />
//               <TextInput
//                   allowFontScaling={false}
//                   onChangeText={(value) => setFirstname(value)}
//                   placeholder="Firstname"
//                   placeholderTextColor={"rgba(0, 140, 255, 0.5)"}
//                   style={styles.input}
//               />
//               <TextInput
//                   allowFontScaling={false}
//                   onChangeText={(value) => setLastname(value)}
//                   placeholder="Lastname"
//                   placeholderTextColor={"rgba(0, 140, 255, 0.5)"}
//                   style={styles.input}
//               />
//               <TextInput
//                   allowFontScaling={false}
//                   onChangeText={(value) => setEmail(value)}
//                   placeholder="Email"
//                   placeholderTextColor={"rgba(0, 140, 255, 0.5)"}
//                   style={styles.input}
//               />
//               <TextInput
//                   allowFontScaling={false}
//                   onChangeText={(value) => setPhone(value)}
//                   placeholder="Phone"
//                   placeholderTextColor={"rgba(0, 140, 255, 0.5)"}
//                   style={styles.input}
//               />
//               <TextInput
//                   allowFontScaling={false}
//                   secureTextEntry={true}
//                   onChangeText={(value) => setPassword(value)}
//                   placeholder="Password"
//                   placeholderTextColor={"rgba(0, 140, 255, 0.5)"}
//                   style={styles.input}
//               />
//
//            <View style={styles.buttonContainer}>
//                <AnimatedButton
//                    style={styles.button}
//                    textStyle={styles.buttonText}
//                    title="UPDATE PERSONAL INFO"
//                />
//            </View>