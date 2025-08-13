import { View, Text, StyleSheet, TouchableOpacity, Image, ImageBackground, ScrollView, Dimensions, TextInput, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback, Platform, BackHandler } from 'react-native';
import { useContext, useState } from 'react';
import { scaleFont } from '../../utils/scale-fonts';
import { Images } from '../../utils/assets';
import usePopups from "../../utils/hooks/use-popups"
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import UserDatabaseService from '../../utils/services/database/user-db-service';
import { UserContext } from '../../utils/contexts/user-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AsyncStorageService from '../../utils/services/async-storage-service';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function PersonalDetails() {
  const { user, setUser } = useContext(UserContext)
  const [username, setUsername] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [age, setAge] = useState(0);
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const { createInput, createToast, createAlert, showSpinner, hideSpinner } = usePopups();
  const insets = useSafeAreaInsets();

  const fields = [
    { key: 'username', label: 'Username', current: user.username, value: username, setter: setUsername },
    { key: 'firstname', label: 'Firstname', current: user.firstname, value: firstname, setter: setFirstname },
    { key: 'lastname', label: 'Lastname', current: user.lastname, value: lastname, setter: setLastname },
    { key: 'age', label: 'Age', current: user.age, value: age, setter: val => setAge(Number(val)) },
    { key: 'gender', label: 'Gender', current: user.gender, value: gender, setter: setGender },
    { key: 'email', label: 'Email', current: user.email, value: email, setter: setEmail },
    { key: 'phone', label: 'Phone', current: user.phone, value: phone, setter: setPhone },
    { key: 'password', label: 'Password', current: "**************", value: password, setter: setPassword },
  ];

  const handlePopup = (field) => {
    createInput({
      title: field.label,
      text: `Please enter new ${field.key}`,
      placeholder: `${field.label}`,
      value: field.value,
      onSubmit: (val) => {
        if (field.key === 'age') {
          const num = Number(val);
          if (isNaN(num) || num < 0 || num > 99) {
            createToast({ message: 'Age must be a number between 0 and 99!' });
            return;
          }
          field.setter(num);
        } else {
          field.setter(val);
        }
      }
    });
  };

  async function updateUserInformation() {
    if (age < 0 || age > 99) {
      createToast({ message: 'Age must be between 0 and 99!' });
      return;
    }

    showSpinner();
    const result = await UserDatabaseService.updateUser(user.id, { username, firstname, lastname, age, gender, email, phone, password, undefined })
    hideSpinner();

    if (result !== true) {
      createToast({ message: result + "!" })
      return;
    }

    const profileData = await UserDatabaseService.fetchUserProfile();
    const profile = profileData.user;
    AsyncStorageService.convertImageBase64ToUri(profile);

    profile.preferences = await AsyncStorageService.getOrSetUserPreferences();

    setUser(profile)
    createToast({ message: "Information successfully updated!" })
    resetInformation(false);
  }

  function resetInformation(noToast) {
    setUsername("");
    setFirstname("");
    setLastname("");
    setAge(0);
    setGender("");
    setEmail("");
    setPhone("");
    setPassword("");
    setPasswordConfirmation("");

    if (!noToast) return;

    createToast({ message: "Information reset!" });
  }

  const styles = StyleSheet.create({
    keyboardAvoidingView: {
      flex: 1,
    },
    scrollViewContent: {
      flexGrow: 1,
    },
    background: {
      flex: 1,
    },
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.75)',
      paddingTop: insets.top + 90,
      paddingHorizontal: 20,
    },

    // Title Section
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    profileIcon: {
      width: 27,
      height: 27,
    },
    pageTitle: {
      fontSize: scaleFont(18),
      color: 'white',
      fontWeight: 'bold',
      marginLeft: 10,
    },

    // List Items
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
      justifyContent: 'space-between',
    },
    itemLeft: {
      flexDirection: 'column',
      alignItems: 'left',
    },
    itemRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    itemText: {
      fontSize: scaleFont(15),
      color: 'white',
    },
    itemValue: {
      fontSize: scaleFont(13),
      color: 'rgb(180,180,180)',
    },
    arrowIcon: {
      width: 18,
      height: 18,
      tintColor: 'rgb(120,120,120)',
    },
    divider: {
      width: SCREEN_WIDTH * 0.9,
      height: 1,
      backgroundColor: 'rgb(0,140,255)',
      alignSelf: 'center',
      marginVertical: 6,
      opacity: 0.5,
      borderRadius: 10,
    },

    // Buttons
    resetButtonContainer: {
      flexDirection: 'row',
      borderWidth: 1,
      alignItems: 'center',
      padding: 5,
      borderColor: 'rgb(0,140,255)',
      alignSelf: 'flex-start',
      marginVertical: 10
    },
    resetButton: {
      width: 15,
      height: 15
    },
    resetText: {
      marginLeft: 5,
      fontSize: scaleFont(14),
      color: 'rgb(255, 255, 255)',
    },
    confirmButton: {
      backgroundColor: 'rgb(0,140,255)',
      paddingVertical: 14,
      alignItems: 'center',
      marginVertical: 40,
      height: 50,
      borderRadius: 20,
      marginBottom: insets.bottom
    },
    confirmButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    confirmIcon: {
      width: 20,
      height: 20,
      tintColor: 'white',
      marginRight: 10,
    },
    confirmText: {
      fontSize: scaleFont(17),
      color: 'white',
      fontWeight: 'bold',
    },
  });

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ImageBackground source={Images.darkProfileBackground} resizeMode="cover" style={styles.background}>
        <View style={styles.overlay}>
          <View style={styles.titleContainer}>
            <Image source={Images.personalDetails} style={styles.profileIcon} />
            <Text allowFontScaling={false} style={styles.pageTitle}>Tap below to update your information</Text>
          </View>
          <TouchableOpacity style={styles.resetButtonContainer} onPress={resetInformation}>
            <Image source={Images.reset} style={styles.resetButton} />
            <Text allowFontScaling={false} style={styles.resetText}>Reset Information</Text>
          </TouchableOpacity>

          {fields.map((field, index) => (
            <View key={field.key}>
              <TouchableOpacity style={styles.item} onPress={() => handlePopup(field)} activeOpacity={0.7}>
                <View style={styles.itemLeft}>
                  <Text allowFontScaling={false} style={styles.itemText}>{field.label}</Text>
                  <Text allowFontScaling={false} style={[styles.itemText, { color: "rgba(79, 184, 253, 0.5)", fontSize: scaleFont(10) }]}>{field.current}</Text>
                </View>
                <View style={styles.itemRight}>
                  <Text allowFontScaling={false} style={styles.itemValue}>{field.value || "Not set"}</Text>
                  <Image source={Images.arrow} style={styles.arrowIcon} />
                </View>
              </TouchableOpacity>
              {index < fields.length - 1 && <View style={styles.divider} />}
            </View>
          ))}

          <TouchableOpacity style={styles.confirmButton} onPress={updateUserInformation}>
            <View style={styles.confirmButtonContent}>
              <Image source={Images.save} style={styles.confirmIcon} />
              <Text allowFontScaling={false} style={styles.confirmText}>Confirm Changes</Text>
            </View>
          </TouchableOpacity>

        </View>
      </ImageBackground>
    </TouchableWithoutFeedback >
  );
}