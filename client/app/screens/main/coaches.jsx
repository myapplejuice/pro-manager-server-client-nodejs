import {
    Text,
    View,
    Image,
    StyleSheet,
    ScrollView,
    BackHandler,
    ImageBackground,
    TouchableOpacity,
    Animated,
} from "react-native";
import { useEffect, useContext, useState } from "react";
import { usePathname, router } from "expo-router";
import { useBackHandlerContext } from "../../utils/contexts/back-handler-context";
import { routes } from "../../utils/settings/constants";
import { scaleFont } from "../../utils/scale-fonts";
import { Images } from "../../utils/assets";
import { UserContext } from "../../utils/contexts/user-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import UserDatabaseService from "../../utils/services/database/user-db-service";
import AnimatedButton from "../../components/screen-comps/animated-button";
import HireCoachWindow from "../../components/popups/hire-coach-window";
import ApplicationDatabaseService from "../../utils/services/database/application-db-service";
import AffiliationDatabaseService from "../../utils/services/database/affiliation-db-service";
import usePopups from "../../utils/hooks/use-popups";

export default function Coaches() {
    const [filterCanApply, setFilterCanApply] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;
    const [coachesList, setCoachesList] = useState([]);
    const [userAffiliations, setUserAffiliations] = useState([]);
    const [userApplications, setUserApplications] = useState([]);
    const [selectedCoach, setSelectedCoach] = useState();
    const [arrowAnimations, setArrowAnimations] = useState({});
    const [popupVisible, setPopupVisible] = useState(false);
    const {
        createDialog,
        createSelector,
        hideSelector,
        createAlert,
        createToast,
        hideSpinner,
        showSpinner,
    } = usePopups();
    const { setBackHandler } = useBackHandlerContext();
    const { user } = useContext(UserContext);
    const insets = useSafeAreaInsets();
    const screen = usePathname();
    const total = getFilteredCount();
    const maxPage = Math.ceil(total / ITEMS_PER_PAGE) || 1;

    useEffect(() => {
        if (screen !== routes.COACHES) return;

        setBackHandler(() => {
            if (screen === routes.HOMEPAGE) BackHandler.exitApp();
            else router.back();
            return true;
        });
    }, [screen]);

    useEffect(() => {
        async function fetchCoachesList() {
            const users = await UserDatabaseService.fetchAllUsers();
            if (!Array.isArray(users)) return;

            const coaches = users.filter((user) => user.isCoach);
            setCoachesList(coaches);
        }

        async function fetchUserAffiliationsList() {
            const data = await AffiliationDatabaseService.fetchUserAffiliations(user.id);
            const affiliations = data.affiliations
            setUserAffiliations(affiliations);
        }

        async function fetchUserApplicationsList() {
            const data =
                await ApplicationDatabaseService.fetchUserApplications(user.id);
            const applications = data.applications
            setUserApplications(applications);
        }

        showSpinner();
        fetchCoachesList();
        fetchUserAffiliationsList();
        fetchUserApplicationsList();
        hideSpinner();
    }, []);

    function canHireCoach(coachId) {
        const hasApplication =
            Array.isArray(userApplications) &&
            userApplications.some(
                (app) =>
                    app.coachId === coachId &&
                    (app.status === "pending" || app.status === "active")
            );
        const hasAffiliation =
            Array.isArray(userAffiliations) &&
            userAffiliations.some((aff) => aff.coachId === coachId);

        return !(hasApplication || hasAffiliation);
    }

    function getFilteredCount() {
        if (!coachesList) return 0;
        if (filterCanApply === "canApply") {
            return coachesList.filter((coach) => canHireCoach(coach.id)).length;
        }
        return coachesList.length;
    }

    function getFilteredPaginatedCoaches() {
        let filtered = coachesList || [];
        if (filterCanApply === "canApply") {
            filtered = filtered.filter((coach) => canHireCoach(coach.id));
        }
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        return filtered.slice(start, end);
    }

    function toggleCoach(coachId) {
        const isOpening = selectedCoach !== coachId;
        const newAnimations = { ...arrowAnimations };

        if (selectedCoach && newAnimations[selectedCoach]) {
            Animated.timing(newAnimations[selectedCoach], {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }

        if (!newAnimations[coachId]) {
            newAnimations[coachId] = new Animated.Value(0);
        }

        if (isOpening) {
            Animated.timing(newAnimations[coachId], {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start();
            setSelectedCoach(coachId);
        } else {
            setSelectedCoach(null);
        }

        setArrowAnimations(newAnimations);
    }

    function handleHire(coachId) {
        if (
            (userAffiliations && Array.isArray(userAffiliations)) ||
            (userApplications && Array.isArray(userApplications))
        ) {
            const hasApplicationWithCoach = Array.isArray(userApplications)
                ? userApplications.some(
                    (app) =>
                        app.coachId === coachId &&
                        (app.status === "pending" || app.status === "active")
                )
                : false;

            const hasAffiliationWithCoach = Array.isArray(userAffiliations)
                ? userAffiliations.some((app) => app.coachId === coachId)
                : false;

            if (hasAffiliationWithCoach || hasApplicationWithCoach) {
                createToast({
                    message:
                        "You are already affiliated with this coach or have an active application with them.",
                });
                return;
            }
        }
        setSelectedCoach(coachId);
        setPopupVisible(true);
    }

    async function initRequest(coachId, message) {
        if (!user) return;

        const random = Math.floor(Math.random() * 1000000);

        const requestData = {
            applicationId: coachId + random + user.id,
            coachId: coachId,
            athleteId: user.id,
            description: message,
            dateTimeOfApplication: new Date().toISOString(),
            status: "pending",
        };

        try {
            showSpinner();
            console.log(requestData)
            const result = await ApplicationDatabaseService.createApplication(requestData);
            if (typeof result === 'object') {
                createAlert({
                    title: "Success",
                    text: `Your request has been sent successfully!\nYou will be notified once they respond.`,
                });
                if (userApplications && Array.isArray(userApplications))
                    setUserApplications((prev) => [...prev, requestData]);
                else setUserApplications([requestData]);
            }
            else
                createAlert({
                    title: "Failure",
                    text: result,
                });
        } catch (error) {
            createAlert({
                title: "Failure",
                text: `${error.message}\nFailed to send request. Please try again later.`,
            });
        }
        finally {
            hideSpinner();
        }
    }

    function renderCoachItem(coach) {
        const coachImage = { uri: `data:image/jpeg;base64,${coach.imageBase64}` };

        const rotate =
            arrowAnimations[coach.id]?.interpolate({
                inputRange: [0, 1],
                outputRange: ["0deg", "90deg"],
            }) ?? "0deg";

        return (
            <TouchableOpacity
                onPress={() => toggleCoach(coach.id)}
                activeOpacity={1}
                style={styles.applicationItem}
                key={coach.id}
            >
                <View style={styles.applicationItemDetails}>
                    <View style={styles.imageContainer}>
                        <Image style={styles.image} source={coachImage} />
                    </View>
                    <View style={styles.detailsContainer}>
                        <Text allowFontScaling={false} style={styles.detail}>
                            {coach.firstname} {coach.lastname}
                        </Text>
                        <Text allowFontScaling={false} style={styles.detail}>
                            {coach.age}, {coach.gender}
                        </Text>
                    </View>
                    <View style={styles.arrowContainer}>
                        <Animated.Image
                            style={[styles.arrow, { transform: [{ rotate }] }]}
                            source={Images.arrow}
                        />
                    </View>
                </View>

                {selectedCoach === coach.id && (
                    <View style={{ marginTop: 10 }}>
                        <View style={styles.detailsContainer}>
                            <Text allowFontScaling={false} style={styles.detail}>
                                ○ {coach.email}
                            </Text>
                            <Text allowFontScaling={false} style={styles.detail}>
                                ○ {coach.phone}
                            </Text>
                        </View>
                        <AnimatedButton
                            onPress={() => handleHire(coach.id)}
                            style={styles.button}
                            textStyle={styles.buttonText}
                            title="Hire Coach"
                        />
                    </View>
                )}
            </TouchableOpacity>
        );
    }

    return (
        <View style={styles.main}>
            {popupVisible && (
                <HireCoachWindow
                    onCancel={() => setPopupVisible(false)}
                    onSubmit={(message) => {
                        if (!message || message.trim() === "")
                            message = "This application has been sent without a message.";

                        setPopupVisible(false);
                        initRequest(selectedCoach, message);
                    }}
                />
            )}

            {coachesList && coachesList.length > 0 ? (
                <>
                    <ImageBackground
                        resizeMode="cover"
                        source={Images.darkProfileBackground}
                        style={styles.headerContainer}
                    >
                        <View style={styles.innerHeaderContainer}>
                            <Text allowFontScaling={false} style={styles.headerText}>
                                Available Coaches
                            </Text>
                            <Text allowFontScaling={false} style={styles.introText}>
                                Tap on a coach to interact and apply for their service!
                            </Text>
                        </View>
                    </ImageBackground>

                    <View
                        style={{
                            width: "100%",
                            backgroundColor: "rgb(12,12,12)",
                            padding: 10,
                            zIndex: 10,
                        }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                marginBottom: 10,
                            }}
                        >
                            <TouchableOpacity
                                disabled={currentPage === 1}
                                onPress={() => setCurrentPage((p) => p - 1)}
                            >
                                <Text
                                    style={{
                                        color: currentPage === 1 ? "gray" : "white",
                                        padding: 10,
                                    }}
                                >
                                    Prev
                                </Text>
                            </TouchableOpacity>

                            <Text style={{ color: "white", padding: 10 }}>
                                Page {currentPage}
                            </Text>

                            <TouchableOpacity
                                disabled={currentPage === maxPage}
                                onPress={() =>
                                    currentPage < maxPage && setCurrentPage((p) => p + 1)
                                }
                            >
                                <Text
                                    style={{
                                        color: currentPage === maxPage ? "gray" : "white",
                                        padding: 10,
                                    }}
                                >
                                    Next
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View
                            style={{ flexDirection: "row", justifyContent: "space-around" }}
                        >
                            {["all", "canApply"].map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    onPress={() => {
                                        setFilterCanApply(option);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <Text
                                        style={{
                                            color:
                                                filterCanApply === option ? "rgb(0,140,255)" : "white",
                                            fontWeight: "bold",
                                            padding: 10,
                                        }}
                                    >
                                        {option === "all" ? "All" : "Can Apply"}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <ScrollView
                        style={styles.scrollView}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={{ flex: 1, paddingBottom: insets.bottom + 60 }}>
                            {getFilteredPaginatedCoaches().map(renderCoachItem)}
                        </View>
                    </ScrollView>
                </>
            ) : (
                <View style={styles.noAffiliatesView}>
                    <Image
                        style={styles.noAffiliatesImage}
                        source={Images.noAffiliates}
                    />
                    <Text allowFontScaling={false} style={styles.noAffiliatesText}>
                        Empty, no coaches available...
                    </Text>
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
        backgroundColor: "rgb(20, 20, 20)",
    },
    headerContainer: {
        width: "100%",
        justifyContent: "center",
        overflow: "hidden",
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
    scrollView: {
        flex: 1,
        width: "100%",
        marginTop: 10,
    },
    introText: {
        color: "rgb(255,255,255)",
        fontWeight: "bold",
        fontSize: scaleFont(14),
        paddingHorizontal: 30,
        marginTop: 10,
    },
    applicationItem: {
        flexDirection: "column",
        backgroundColor: "rgb(12, 12, 12)",
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginHorizontal: 10,
        marginVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "rgb(0,140,255)",
    },
    applicationItemDetails: {
        flexDirection: "row",
    },
    imageContainer: {
        flex: 2,
        justifyContent: "center",
    },
    detailsContainer: {
        flex: 4,
        justifyContent: "center",
    },
    arrowContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    arrow: {
        width: 20,
        height: 20,
    },
    image: {
        borderRadius: 50,
        width: 70,
        height: 70,
    },
    detail: {
        color: "rgb(255,255,255)",
        fontSize: scaleFont(16),
        marginVertical: 2,
    },
    button: {
        marginVertical: 20,
        backgroundColor: "rgb(0, 140, 255)",
        height: 50,
        borderRadius: 20,
    },
    buttonText: {
        fontFamily: "monospace",
        fontSize: scaleFont(12),
    },
    noAffiliatesView: {
        flex: 1,
        width: "100%",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
    },
    noAffiliatesImage: {
        width: 120,
        height: 120,
    },
    noAffiliatesText: {
        textAlign: "center",
        width: "100%",
        color: "rgb(75, 75, 75)",
        fontSize: scaleFont(35),
    },
});
