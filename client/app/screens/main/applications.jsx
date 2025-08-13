import { Text, View, Image, StyleSheet, ScrollView, BackHandler, ImageBackground, TouchableOpacity, Animated } from "react-native"
import { useEffect, useState, useContext, useRef } from "react"
import { usePathname, router } from "expo-router";
import { useBackHandlerContext } from "../../utils/contexts/back-handler-context";
import { routes } from '../../utils/settings/constants'
import UserDatabaseService from "../../utils/services/database/user-db-service";
import { Images } from "../../utils/assets";
import usePopups from "../../utils/hooks/use-popups";
import { UserContext } from "../../utils/contexts/user-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { scaleFont } from "../../utils/scale-fonts";
import ApplicationDatabaseService from "../../utils/services/database/application-db-service";
import AnimatedButton from "../../components/screen-comps/animated-button";
import AffiliationDatabaseService from "../../utils/services/database/affiliation-db-service";

export default function Applications() {
    const [filterStatus, setFilterStatus] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [usersList, setUsersList] = useState([]);
    const [applicationsList, setApplicationsList] = useState([]);
    const [selectedApplication, setSelectedApplication] = useState();
    const [arrowAnimations, setArrowAnimations] = useState({});
    const { createDialog, createAlert, createToast, hideSpinner, showSpinner } = usePopups();
    const { setBackHandler } = useBackHandlerContext();
    const { user } = useContext(UserContext);
    const statusBallOpacity = useRef(new Animated.Value(1)).current;
    const animationLoopRef = useRef(null);
    const isAnimating = useRef(false);
    const insets = useSafeAreaInsets();
    const screen = usePathname();
    const filteredApplicationsCount = filterStatus === "all"
        ? applicationsList.length
        : applicationsList.filter(app => app.status === filterStatus).length;
    const ITEMS_PER_PAGE = 5;
    const totalPages = Math.ceil(filteredApplicationsCount / ITEMS_PER_PAGE);

    useEffect(() => {
        if (screen !== routes.APPLICATIONS) return;

        setBackHandler(() => {
            if (screen === routes.HOMEPAGE)
                BackHandler.exitApp()
            else
                router.back();
            return true;
        });
    }, [screen]);

    useEffect(() => {
        if (screen !== routes.APPLICATIONS) return;

        showSpinner();
        async function fetchUsersList() {
            const users = await UserDatabaseService.fetchAllUsers();
            if (!Array.isArray(users)) return;

            setUsersList(users);
        }

        async function fetchUserApplicationsList() {
            const data = await ApplicationDatabaseService.fetchUserApplications(user.id);
            const applications = data.applications
            setApplicationsList(Array.isArray(applications) ? applications : []);
        }

        fetchUsersList();
        fetchUserApplicationsList();
        setLoading(false);
        hideSpinner();
    }, []);

    useEffect(() => {
        if (screen !== routes.APPLICATIONS) return;

        startStatusBallAnimation();

        return () => {
            animationLoopRef.current?.stop();
            isAnimating.current = false;
        };
    }, []);

    useEffect(() => {
        if (screen !== routes.APPLICATIONS) return;

        startStatusBallAnimation();
    }, [filterStatus, currentPage, applicationsList]);

    function startStatusBallAnimation() {
        animationLoopRef.current?.stop();
        animationLoopRef.current = null;
        isAnimating.current = false;

        animationLoopRef.current = Animated.loop(
            Animated.sequence([
                Animated.timing(statusBallOpacity, {
                    toValue: 0.3,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(statusBallOpacity, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
            ])
        );

        animationLoopRef.current.start();
        isAnimating.current = true;
    }

    function renderApplicationItem(application) {
        let affiliate = null
        if (user.isCoach)
            affiliate = usersList.find(user => user.id === application.athleteId);
        else
            affiliate = usersList.find(user => user.id === application.coachId);

        if (!affiliate) return null;

        const affiliateImage = affiliate.imageBase64
            ? { uri: `data:image/jpeg;base64,${affiliate.imageBase64}` }
            : Images.defaultUser;

        const rotate = arrowAnimations[application.applicationId]?.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '90deg'],
        }) ?? '0deg';

        return (
            <TouchableOpacity
                onPress={() => toggleApplication(application.applicationId)}
                activeOpacity={1}
                style={styles.applicationItem}
                key={application.applicationId}
            >
                <View style={styles.applicationItemStatusDetails}>
                    <View style={[styles.row, { alignItems: 'center' }]}>
                        <Animated.View style={[
                            styles.statusBall,
                            {
                                backgroundColor:
                                    application.status === 'pending'
                                        ? 'yellow'
                                        : application.status === 'accepted'
                                            ? 'green'
                                            : 'red',
                                opacity: application.status === 'pending' ? statusBallOpacity : 1,
                            },
                        ]} />
                        <Text allowFontScaling={false} style={[styles.detail, { marginLeft: 8 }]}>
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text allowFontScaling={false} style={styles.detail}>
                            {new Date(application.dateTimeOfApplication).toLocaleDateString()}
                        </Text>
                    </View>
                </View>
                <View style={styles.applicationItemDetails}>
                    <View style={styles.imageContainer}>
                        <Image style={styles.image} source={affiliateImage} />
                    </View>
                    <View style={styles.detailsContainer}>
                        <Text allowFontScaling={false} style={styles.detail}>
                            {affiliate.firstname} {affiliate.lastname}
                        </Text>
                        <Text allowFontScaling={false} style={styles.detail}>
                            {affiliate.age}, {affiliate.gender}
                        </Text>
                    </View>

                    <View style={styles.arrowContainer}>
                        <Animated.Image
                            style={[styles.arrow, { transform: [{ rotate }] }]}
                            source={Images.arrow}
                        />
                    </View>
                </View>

                {selectedApplication === application.applicationId && (
                    <View style={{ marginTop: 10 }}>
                        <Text allowFontScaling={false} style={styles.detail}>○ {affiliate.email}</Text>
                        <Text allowFontScaling={false} style={styles.detail}>○ {affiliate.phone}</Text>
                        <Text allowFontScaling={false} style={[styles.detail, { marginVertical: 15 }]}>{application.description}</Text>

                        {user.isCoach && application.status === 'pending' ? (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 }}>
                                <AnimatedButton
                                    onPress={() => handleApplication(application.applicationId, "rejected")}
                                    style={[
                                        styles.button,
                                        { backgroundColor: 'rgb(165, 49, 49)', width: '45%' },
                                    ]}
                                    textStyle={styles.buttonText}
                                    title="Reject"
                                />
                                <AnimatedButton
                                    onPress={() => handleApplication(application.applicationId, "accepted")}
                                    style={[
                                        styles.button,
                                        { backgroundColor: 'rgb(0, 140, 255)', width: '45%' },
                                    ]}
                                    textStyle={styles.buttonText}
                                    title="Accept"
                                />
                            </View>
                        ) : application.status === "pending" ? (
                            <AnimatedButton
                                onPress={() => handleApplication(application.applicationId, "cancelled")}
                                style={[styles.button, { backgroundColor: 'rgb(165, 49, 49)', marginTop: 10 }]}
                                textStyle={styles.buttonText}
                                title="Cancel Application"
                            />
                        ) : null}
                    </View>
                )}
            </TouchableOpacity>
        );
    }

    function toggleApplication(applicationId) {
        const isOpening = selectedApplication !== applicationId;
        const newAnimations = { ...arrowAnimations };

        if (selectedApplication && newAnimations[selectedApplication]) {
            Animated.timing(newAnimations[selectedApplication], {
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
            setSelectedApplication(applicationId);
        } else {
            setSelectedApplication(null);
        }

        setArrowAnimations(newAnimations);
    }

    function handleApplication(applicationId, status) {
        const actionLabels = {
            cancelled: {
                title: "Cancel Application",
                text: "Are you sure you want to cancel this application?",
                success: "Application cancelled successfully",
            },
            accepted: {
                title: "Accept Application",
                text: "Are you sure you want to accept this application?",
                success: "Application accepted successfully, this athlete is now under your coaching.",
            },
            rejected: {
                title: "Reject Application",
                text: "Are you sure you want to reject this application?",
                success: "Application rejected successfully, athlete will be notified.",
            },
        };

        const label = actionLabels[status];

        createDialog({
            title: label.title,
            text: label.text,
            confirmText: "Yes",
            cancelText: "No",
            onConfirm: async () => {
                showSpinner();
                try {
                    if (status === "accepted") {
                        const athleteId = applicationsList.find(app => app.applicationId === applicationId).athleteId;
                        const affiliation = { applicationId: applicationId, coachId: user.id, athleteId: athleteId };
                        await AffiliationDatabaseService.createAffiliation(affiliation);
                    }

                    await ApplicationDatabaseService.setApplicationStatus(applicationId, status);
                    setApplicationsList(prev =>
                        prev.map(app =>
                            app.applicationId === applicationId
                                ? { ...app, status }
                                : app
                        )
                    );
                    createToast({ message: label.success });
                } catch (error) {
                    createAlert("Error", `Failed to ${status} application. Please try again.`);
                } finally {
                    hideSpinner();
                }
            },
        });
    }

    function getFilteredPaginatedApplications() {
        const filtered = filterStatus === "all"
            ? applicationsList
            : applicationsList.filter(app => app.status === filterStatus);

        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;

        const priority = { pending: 0, accepted: 1, rejected: 2, cancelled: 3, terminated: 4 };

        return filtered
            .slice()
            .sort((a, b) => {
                const statusA = (a.status || "").toLowerCase();
                const statusB = (b.status || "").toLowerCase();

                return (priority[statusA] ?? 999) - (priority[statusB] ?? 999);
            })
            .slice(start, end);
    }


    return (
        <View style={styles.main}>
            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' }} />
            ) : (
                (Array.isArray(applicationsList) && applicationsList.length > 0) ? (
                    <>
                        <ImageBackground
                            resizeMode="cover"
                            source={Images.darkProfileBackground}
                            style={styles.headerContainer}
                        >
                            <View style={styles.innerHeaderContainer}>
                                <Text allowFontScaling={false} style={styles.headerText}>Your Applications</Text>
                                <Text allowFontScaling={false} style={styles.introText}>
                                    {user.isCoach
                                        ? "Tab on an application to interact and review it"
                                        : "For pending applications, you must wait for a response from the coach you applied for"}
                                </Text>
                            </View>
                        </ImageBackground>
                        <View style={{ width: '100%', backgroundColor: 'rgb(12,12,12)', padding: 10, zIndex: 10 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <TouchableOpacity style={{ padding: "15" }} disabled={currentPage === 1} onPress={() => setCurrentPage(p => p - 1)}>
                                    <Text style={{ color: currentPage === 1 ? 'gray' : 'white' }}>Prev</Text>
                                </TouchableOpacity>
                                <Text style={{ color: 'white', padding: 15 }}>Page {currentPage}</Text>
                                <TouchableOpacity
                                    style={{ padding: "15" }}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    onPress={() => {
                                        if (currentPage < totalPages) {
                                            setCurrentPage((p) => p + 1);
                                        }
                                    }}
                                >
                                    <Text style={{ color: currentPage === totalPages ? "gray" : "white" }}>Next</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                {["all", "pending", "accepted", "rejected", "cancelled", "terminated"].map(status => (
                                    <TouchableOpacity style={{ paddingVertical: "15" }} key={status} onPress={() => {
                                        setFilterStatus(status);
                                        setCurrentPage(1);
                                    }}>
                                        <Text style={{
                                            color: filterStatus === status ? 'rgb(0,140,255)' : 'white',
                                            fontWeight: 'bold',
                                        }}>
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
                            <View style={{ flex: 1, paddingBottom: insets.bottom + 60 }}>
                                {getFilteredPaginatedApplications()
                                    .sort((a, b) => {
                                        const priority = { pending: 0, accepted: 1, rejected: 2, cancelled: 3, terminated: 4 };
                                        return priority[a.status] - priority[b.status];
                                    })
                                    .map(renderApplicationItem)}

                            </View>
                        </ScrollView>
                    </>
                ) : (
                    <View style={styles.noAffiliatesView}>
                        <Image style={styles.noAffiliatesImage} source={Images.noAffiliates} />
                        <Text allowFontScaling={false} style={styles.noAffiliatesText}>
                            Empty, you currently have no applications assigned...
                        </Text>
                    </View>
                )
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
    applicationItem: {
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
    applicationItemDetails: {
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
    },
    applicationItemStatusDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    statusBall: {
        width: 15,
        height: 15,
        borderRadius: 7.5
    },
})