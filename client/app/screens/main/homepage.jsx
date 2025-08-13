import { Text, View, StyleSheet, BackHandler, ScrollView, Image, TouchableOpacity, ImageBackground, Animated } from "react-native"
import { useEffect, useContext, useState } from "react"
import { UserContext } from '../../utils/contexts/user-context'
import { scaleFont } from '../../utils/scale-fonts'
import { Images } from "../../utils/assets"
import { useBackHandlerContext } from "../../utils/contexts/back-handler-context"
import { router, usePathname } from "expo-router"
import { routes } from "../../utils/settings/constants"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import AffiliationDatabaseService from "../../utils/services/database/affiliation-db-service"
import ApplicationDatabaseService from "../../utils/services/database/application-db-service"
import UserDatabaseService from "../../utils/services/database/user-db-service"
import AnimatedButton from "../../components/screen-comps/animated-button"
import usePopups from "../../utils/hooks/use-popups"

export default function Homepage() {
    const [headerText, setHeaderText] = useState();
    const [introText, setIntroText] = useState();
    const [loading, setLoading] = useState(true)
    const [usersList, setUsersList] = useState([])
    const [userAffiliates, setUserAffiliates] = useState([])
    const [selectedApplicationId, setSelectedApplicationId] = useState(null);
    const [arrowAnimations, setArrowAnimations] = useState({});
    const { createDialog, createAlert, createToast, hideSpinner, showSpinner } = usePopups();
    const { user } = useContext(UserContext)
    const { setBackHandler } = useBackHandlerContext();
    const insets = useSafeAreaInsets();
    const screen = usePathname()

    useEffect(() => {
        if (screen !== routes.HOMEPAGE) return;

        setBackHandler(() => {
            if (screen === routes.HOMEPAGE)
                BackHandler.exitApp()
            else
                router.back();
            return true;
        });
    }, [screen])

    useEffect(() => {
        if (screen !== routes.HOMEPAGE) return;

        function definePageText() {
            if (user.isCoach) setHeaderText('Your Athletes')
            else setHeaderText('Your Coaches')

            if (user.isCoach) setIntroText('Here is the list of athletes under your service,\nClick on any of them to interact with them.')
            else setIntroText('Here is the list of coaches you have employed,\nClick on any of them to interact with them.')
        }

        definePageText();
    }, [screen, user]);

    useEffect(() => {
        if (screen !== routes.HOMEPAGE) return;

        async function fetchUsersList() {
            const users = await UserDatabaseService.fetchAllUsers();
            setUsersList(users);
        }

        async function fetchUserAffiliates() {
            const data = await AffiliationDatabaseService.fetchUserAffiliations(user.id);
            const affiliations = data.affiliations
            setUserAffiliates(affiliations);
        }

        try {
            fetchUsersList();
            fetchUserAffiliates();
        } catch (error) {
            console.error("Error fetching users or affiliations:", error);
            setUserAffiliates([]);
        }
        finally {
            setLoading(false);
        }
    }, [screen])

    function renderAffiliateItem(affiliation) {
        let affiliate = null;

        if (user.isCoach)
            affiliate = usersList.find(user => user.id === affiliation.athleteId);
        else
            affiliate = usersList.find(user => user.id === affiliation.coachId);

        if (!affiliate) {
            console.warn("Affiliate not found for affiliation:", affiliation);
            return null;
        }

        const image = { uri: `data:image/jpeg;base64,${affiliate.imageBase64}` };

        const rotate = arrowAnimations[affiliation.applicationId]?.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '90deg'],
        }) ?? '0deg';

        return (
            <TouchableOpacity
                onPress={() => toggleAffiliate(affiliation.applicationId)}
                activeOpacity={1}
                style={styles.affiliateItem}
                key={affiliation.applicationId}
            >
                <View style={styles.affiliateItemDetails}>
                    <View style={styles.imageContainer}>
                        <Image style={styles.image} source={image} />
                    </View>
                    <View style={styles.detailsContainer}>
                        <Text allowFontScaling={false} style={styles.detail}>{affiliate.firstname} {affiliate.lastname}</Text>
                        <Text allowFontScaling={false} style={styles.detail}>{affiliate.email}</Text>
                        <Text allowFontScaling={false} style={styles.detail}>{affiliate.phone}</Text>
                    </View>
                    <View style={styles.arrowContainer}>
                        <Animated.Image
                            style={[styles.arrow, { transform: [{ rotate }] }]}
                            source={Images.arrow}
                        />
                    </View>
                </View>

                {selectedApplicationId === affiliation.applicationId && (
                    <View style={{ marginTop: 10 }}>
                        <AnimatedButton
                            onPress={() => handleTermination(affiliation.applicationId)}
                            style={styles.button}
                            textStyle={styles.buttonText}
                            title="Terminate Affiliation"
                        />
                    </View>
                )}
            </TouchableOpacity>
        );
    }

    function toggleAffiliate(applicationId) {
        const isOpening = selectedApplicationId !== applicationId;
        const newAnimations = { ...arrowAnimations };

        if (selectedApplicationId && newAnimations[selectedApplicationId]) {
            Animated.timing(newAnimations[selectedApplicationId], {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }

        if (!newAnimations[applicationId]) {
            newAnimations[applicationId] = new Animated.Value(0);
        }

        if (isOpening) {
            Animated.timing(newAnimations[applicationId], {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start();
            setSelectedApplicationId(applicationId);
        } else {
            setSelectedApplicationId(null);
        }

        setArrowAnimations(newAnimations);
    }

    async function handleTermination(applicationId) {
        createDialog({
            title: "Terminate Affiliation",
            text: "Are you sure you want to terminate this affiliation?",
            confirmText: "Yes",
            cancelText: "No",
            onConfirm: async () => {
                try {
                    showSpinner();
                    await ApplicationDatabaseService.setApplicationStatus(applicationId, 'terminated');
                    await AffiliationDatabaseService.endAffiliation(applicationId);
                    createToast({ message: "Affiliation terminated successfully!" });
                    setSelectedApplicationId(null);
                    const affiliations = await AffiliationDatabaseService.fetchUserAffiliations(user.id);
                    console.log(affiliations)
                    setUserAffiliates(affiliations);
                    hideSpinner();
                }
                catch (error) {
                    console.error("Error terminating affiliation:", error);
                    hideSpinner();
                    createAlert({
                        title: "Error",
                        text: "Failed to terminate affiliation. Please try again later.",
                        confirmText: "OK",
                    });
                }
            },
        });
    }

    return (
        <View style={styles.main}>
            {!loading && Array.isArray(userAffiliates) && userAffiliates.length > 0 ? (
                <>
                    <ImageBackground
                        resizeMode="cover"
                        source={Images.darkProfileBackground}
                        style={styles.headerContainer}
                    >
                        <View style={styles.innerHeaderContainer}>
                            <Text allowFontScaling={false} style={styles.headerText}>
                                {headerText}
                            </Text>
                            <Text allowFontScaling={false} style={styles.introText}>
                                {introText}
                            </Text>
                        </View>
                    </ImageBackground>

                    <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
                        <View style={{ flex: 1, paddingBottom: insets.bottom + 60 }}>
                            {userAffiliates.map(renderAffiliateItem)}
                        </View>
                    </ScrollView>
                </>
            ) : (
                <View style={styles.noAffiliatesView}>
                    <Image style={styles.noAffiliatesImage} source={Images.noAffiliates} />
                    <Text allowFontScaling={false} style={styles.noAffiliatesText}>
                        Empty, no affiliates...
                    </Text>
                    <Text allowFontScaling={false} style={[styles.noAffiliatesText, { fontSize: scaleFont(18) }]}>
                        {user.isCoach
                            ? "As coach, if any athletes sent you requests for your service, you will be notified!"
                            : "Click below to find a coach suited for you!"}
                    </Text>
                    <AnimatedButton
                        title={user.isCoach ? "View Applications" : "Browse Coaches"}
                        onPress={() => {
                            if (user.isCoach) {
                                router.push(routes.APPLICATIONS);
                            } else {
                                router.push(routes.COACHES);
                            }
                        }}
                        style={{
                            marginVertical: 20,
                            minWidth: 300,
                            backgroundColor: 'rgb(0, 140, 255)',
                            height: 50,
                            borderRadius: 20
                        }}
                        textStyle={{ fontSize: scaleFont(18) }}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgb(20, 20, 20)"
    },
    headerContainer: {
        width: "100%",
        justifyContent: 'center',
        overflow: 'hidden',
    },
    innerHeaderContainer: {
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        borderRadius: 25,
        paddingVertical: 15,
        margin: 15,
    },
    headerText: {
        color: "rgb(0, 140, 255)",
        fontWeight: "bold",
        paddingHorizontal: 30,
        fontSize: scaleFont(20),
    },
    scrollViewContainer: {
        height: '80%',
        width: '100%',
    },
    scrollView: {
        flex: 1,
        width: '100%',
        marginTop: 10,
    },
    introText: {
        color: "rgb(255,255,255)",
        fontWeight: "bold",
        fontSize: scaleFont(14),
        paddingHorizontal: 30,
        marginTop: 10,
    },
    affiliateItem: {
        flexDirection: 'column',
        backgroundColor: "rgb(12, 12, 12)",
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginHorizontal: 10,
        marginVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "rgb(0,140,255)",
    },
    affiliateItemDetails: {
        flexDirection: 'row',
    },
    imageContainer: {
        flex: 2,
        justifyContent: 'center'
    },
    detailsContainer: {
        flex: 4,
        justifyContent: 'center',
    },
    arrowContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    arrow: {
        width: 20,
        height: 20
    },
    image: {
        borderRadius: 50,
        width: 70,
        height: 70
    },
    detail: {
        color: "rgb(255,255,255)",
        fontSize: scaleFont(16),
        marginVertical: 2,
    },
    button: {
        marginVertical: 20,
        backgroundColor: 'rgb(0, 140, 255)',
        height: 50,
        borderRadius: 20
    },
    buttonText: {
        fontFamily: 'monospace',
        fontSize: scaleFont(12)
    },
    noAffiliatesView: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center'
    },
    noAffiliatesImage: {
        width: 120,
        height: 120
    },
    noAffiliatesText: {
        textAlign: 'center',
        width: '100%',
        color: 'rgb(75, 75, 75)',
        fontSize: scaleFont(35)
    }
})