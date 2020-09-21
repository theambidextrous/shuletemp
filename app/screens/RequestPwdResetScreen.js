import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Platform,
  StyleSheet,
  StatusBar,
  Image,
  Alert,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { Dialog } from "react-native-simple-dialogs";
import globalStyle from "../utils/styles";
import { LinearGradient } from "expo-linear-gradient";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Feather from "react-native-vector-icons/Feather";
import { AuthContext } from "../components/context";
import { ScrollView } from "react-native-gesture-handler";

import { useTheme } from "react-native-paper";

import colors from "../config/colors";
import {
  apiRequestReset,
  apiValidateCode,
  apiResetPassword,
} from "../utils/network";

const logo = require("../assets/icon_book.png");
const pricon = require("../assets/preload.gif");

function RequestPwdResetScreen({ navigation }) {
  const [preload, setPreload] = React.useState({ visible: false });
  const [fieldvisible, setFieldVisible] = React.useState({
    phone: true,
    code: false,
    passwordResetFields: false,
  });

  const { signIn } = React.useContext(AuthContext);
  const [data, setData] = React.useState({
    phone: "",
    code: "",
    password: "",
    confirm_password: "",
    check_textInputChange: false,
    isValidUser: true,
    secureTextEntry: true,
    confirm_secureTextEntry: true,
  });
  const textInputChange = (val) => {
    if (val.length === 10) {
      setData({
        ...data,
        phone: val,
        check_textInputChange: true,
        isValidUser: true,
      });
    } else {
      setData({
        ...data,
        phone: val,
        check_textInputChange: false,
        isValidUser: false,
      });
    }
  };
  const handleValidUser = (val) => {
    if (val.length === 10) {
      setData({
        ...data,
        isValidUser: true,
      });
    } else {
      setData({
        ...data,
        isValidUser: false,
      });
    }
  };
  const handlePasswordChange = (val) => {
    setData({
      ...data,
      password: val,
    });
  };
  const handleConfirmPasswordChange = (val) => {
    setData({
      ...data,
      confirm_password: val,
    });
  };
  const updateSecureTextEntry = () => {
    setData({
      ...data,
      secureTextEntry: !data.secureTextEntry,
    });
  };
  const updateConfirmSecureTextEntry = () => {
    setData({
      ...data,
      confirm_secureTextEntry: !data.confirm_secureTextEntry,
    });
  };

  const codeInputChange = (val) => {
    if (val.length === 6) {
      /** veirify code */
      if (data.phone.length !== 10) {
        Alert.alert("Account Error", "Phone number is missing", [
          { text: "Okay" },
        ]);
        return;
      }
      let foundUser;
      console.log(data.phone + " " + val);
      setPreload({ visible: true });
      apiValidateCode(data.phone, val)
        .then((found) => {
          foundUser = found;
          // console.log("from api " + foundUser);
          if (foundUser.status === 2) {
            Alert.alert("Code validation error", "Invalid code, try again", [
              { text: "Okay" },
            ]);
            setPreload({ visible: false });
            return;
          }
          if (foundUser.status !== 0) {
            Alert.alert(
              "Code validation error",
              "Could not validate code, try again",
              [{ text: "Okay" }]
            );
            setPreload({ visible: false });
            return;
          }
          setFieldVisible({
            ...fieldvisible,
            phone: false,
            code: false,
            passwordResetFields: true,
          });
          setPreload({ visible: false });
        })
        .catch((error) => {
          console.log(error);
          Alert.alert("Access error!", "Network request error", [
            { text: "Okay" },
          ]);
          setPreload({ visible: false });
          return;
        });
    } else {
      setData({
        ...data,
        code: val,
      });
    }
  };
  const resendHandler = () => {
    setFieldVisible({
      phone: true,
      code: false,
      passwordResetFields: false,
    });
  };
  const requestHandler = () => {
    if (data.phone.length !== 10) {
      Alert.alert("Empty fields!", "Valid Phone must be provided", [
        { text: "Okay" },
      ]);
      return;
    }
    let foundUser;
    setPreload({ visible: true });
    apiRequestReset(data.phone)
      .then((found) => {
        foundUser = found;
        // console.log("from api " + foundUser);
        if (foundUser.status === 2) {
          Alert.alert("Account error!", "Phone number not found", [
            {
              text: "Sign up today",
              onPress: () => {
                navigation.navigate("SignUpScreen");
              },
            },
          ]);
          setPreload({ visible: false });
          return;
        }
        if (foundUser.status !== 0) {
          Alert.alert(
            "Account error!",
            "The phone you provided does not exist",
            [{ text: "Okay" }]
          );
          setPreload({ visible: false });
          return;
        }
        setFieldVisible({
          ...fieldvisible,
          phone: false,
          code: true,
          passwordResetFields: false,
        });
        setPreload({ visible: false });
      })
      .catch((error) => {
        console.log(error);
        Alert.alert("Access error!", "Network request error", [
          { text: "Okay" },
        ]);
        setPreload({ visible: false });
        return;
      });
  };

  const changePasswordHandler = () => {
    if (data.password !== data.confirm_password) {
      Alert.alert("Password error", "Provided password must match", [
        { text: "Okay" },
      ]);
      return;
    }
    let foundUser;
    setPreload({ visible: true });
    console.log("the phone" + data.phone);
    let postData = {
      phone: data.phone,
      password: data.password,
      c_password: data.confirm_password,
    };
    apiResetPassword(postData)
      .then((found) => {
        foundUser = found;
        // console.log("from api " + foundUser);
        if (foundUser.status !== 0) {
          Alert.alert(
            "Account error!",
            "Password reset failed, try again later",
            [{ text: "Okay" }]
          );
          setPreload({ visible: false });
          return;
        }
        setFieldVisible({
          ...fieldvisible,
          phone: false,
          code: false,
          passwordResetFields: false,
        });
        Alert.alert("Success!", "Password Changed!", [
          {
            text: "Okay, take me to login",
            onPress: () => {
              navigation.navigate("SignInScreen");
            },
          },
        ]);
        setPreload({ visible: false });
      })
      .catch((error) => {
        console.log(error);
        Alert.alert("Access error!", "Network request error", [
          { text: "Okay" },
        ]);
        setPreload({ visible: false });
        return;
      });
  };
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      {/* dialog */}
      <Dialog
        dialogStyle={[
          globalStyle.listItem,
          {
            width: "90%",
            borderWidth: 0,
          },
        ]}
        visible={preload.visible}
        onTouchOutside={() => {
          setPreload({ visible: false });
        }}
      >
        <View
          style={{
            backgroundColor: colors.white,
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            height: 50,
          }}
        >
          <Image
            style={[styles.iconButton, { width: 60, height: 60 }]}
            source={pricon}
          />
        </View>
      </Dialog>
      {/* end dialog */}
      <View style={styles.header}>
        <Text style={[styles.text_header, { textAlign: "center" }]}>
          Request Reset Password
        </Text>
      </View>
      <Animatable.View animation="fadeInUpBig" style={styles.footer}>
        <ScrollView>
          {/* phone */}
          {fieldvisible.phone === true && (
            <View>
              <Text style={styles.text_footer}>Enter Phone Number</Text>
              <View style={styles.action}>
                <FontAwesome name="phone" color={colors.secondary} size={20} />
                <TextInput
                  value={data.phone}
                  placeholder="e.g. 0722002200"
                  style={styles.textInput}
                  autoCapitalize="none"
                  onChangeText={(val) => textInputChange(val)}
                  onEndEditing={(e) => handleValidUser(e.nativeEvent.text)}
                />
                {data.check_textInputChange ? (
                  <Animatable.View animation="bounceIn">
                    <Feather
                      name="check-circle"
                      color={colors.primary}
                      size={20}
                    />
                  </Animatable.View>
                ) : null}
              </View>
              {data.isValidUser ? null : (
                <Animatable.View animation="fadeInLeft" duration={500}>
                  <Text style={styles.errorMsg}>Provide a valid phone</Text>
                </Animatable.View>
              )}
              <View style={styles.button}>
                {/* login button */}
                <TouchableOpacity
                  style={styles.signIn}
                  onPress={() => {
                    requestHandler();
                  }}
                >
                  <LinearGradient
                    colors={[colors.secondary, colors.secondary_dark]}
                    style={styles.signIn}
                  >
                    <Text style={(styles.textSign, { color: colors.white })}>
                      Request Password Reset
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {/* reset fields */}
          {fieldvisible.passwordResetFields === true && (
            <View>
              {/* password */}
              <Text style={[styles.text_footer, { marginTop: 20 }]}>
                New Password
              </Text>
              <View style={styles.action}>
                <FontAwesome name="lock" color={colors.secondary} size={20} />
                <TextInput
                  placeholder="enter new password"
                  secureTextEntry={data.secureTextEntry ? true : false}
                  style={styles.textInput}
                  autoCapitalize="none"
                  onChangeText={(val) => handlePasswordChange(val)}
                />
                <TouchableOpacity onPress={updateSecureTextEntry}>
                  {data.secureTextEntry ? (
                    <Feather name="eye-off" color={colors.grey} size={20} />
                  ) : (
                    <Feather name="eye" color={colors.primary} size={20} />
                  )}
                </TouchableOpacity>
              </View>
              {/* confirm password */}
              <Text style={[styles.text_footer, { marginTop: 20 }]}>
                Confirm New Password
              </Text>
              <View style={styles.action}>
                <FontAwesome name="lock" color={colors.secondary} size={20} />
                <TextInput
                  placeholder="confirm new password"
                  secureTextEntry={data.confirm_secureTextEntry ? true : false}
                  style={styles.textInput}
                  autoCapitalize="none"
                  onChangeText={(val) => handleConfirmPasswordChange(val)}
                />
                <TouchableOpacity onPress={updateConfirmSecureTextEntry}>
                  {data.confirm_secureTextEntry ? (
                    <Feather name="eye-off" color={colors.grey} size={20} />
                  ) : (
                    <Feather name="eye" color={colors.primary} size={20} />
                  )}
                </TouchableOpacity>
              </View>
              <View style={styles.button}>
                {/* login button */}
                <TouchableOpacity
                  style={styles.signIn}
                  onPress={() => {
                    changePasswordHandler();
                  }}
                >
                  <LinearGradient
                    colors={[colors.secondary, colors.secondary_dark]}
                    style={styles.signIn}
                  >
                    <Text style={(styles.textSign, { color: colors.white })}>
                      Reset Password
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {/* code enter */}
          {fieldvisible.code === true && (
            <View>
              <Text style={styles.text_footer}>
                Enter verification code send to your number
              </Text>
              <View style={styles.action}>
                <FontAwesome name="lock" color={colors.secondary} size={20} />
                <TextInput
                  placeholder=""
                  style={styles.textInput}
                  autoCapitalize="none"
                  onChangeText={(val) => codeInputChange(val)}
                />
              </View>
              <View>
                <TouchableOpacity
                  style={styles.signIn}
                  onPress={() => {
                    resendHandler();
                  }}
                >
                  <Text style={(styles.textSign, { color: colors.primary })}>
                    Resend Code
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {/* buttons */}
          <View style={styles.button}>
            {/* create account */}
            <View style={[globalStyle.row, { flex: 1 }]}>
              {/* student account */}
              <TouchableOpacity
                onPress={() => navigation.navigate("SignInScreen")}
                style={[
                  styles.signInHalf,
                  {
                    borderColor: colors.secondary,
                    borderWidth: 1,
                    marginTop: 0,
                    marginRight: 10,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.textSign,
                    {
                      color: colors.secondary,
                      textAlign: "center",
                      marginRight: 5,
                    },
                  ]}
                >
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
            {/* end create account */}
          </View>
        </ScrollView>
      </Animatable.View>
    </View>
  );
}
export default RequestPwdResetScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  header: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  footer: {
    flex: 3,
    backgroundColor: colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  text_header: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 30,
  },
  text_footer: {
    color: "#05375a",
    fontSize: 18,
  },
  action: {
    flexDirection: "row",
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
    paddingBottom: 5,
  },
  actionError: {
    flexDirection: "row",
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#FF0000",
    paddingBottom: 5,
  },
  textInput: {
    flex: 1,
    marginTop: Platform.OS === "ios" ? 0 : -12,
    paddingLeft: 10,
    color: "#05375a",
  },
  errorMsg: {
    color: "#FF0000",
    fontSize: 14,
  },
  button: {
    alignItems: "center",
    marginTop: 50,
    flex: 1,
    width: "100%",
  },
  signIn: {
    width: "100%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  signInHalf: {
    width: "48%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
  },
  textSign: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
