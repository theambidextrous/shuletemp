import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { StyleSheet } from "react-native";

import SplashScreen from "./SplashScreen";
import SignInScreen from "./SignInScreen";
import SignUpScreen from "./SignUpScreen";
import PreviewScreen from "./PreviewScreen";
import RequestPwdResetScreen from "./RequestPwdResetScreen";
import CorpSignUpScreen from "./CorpSignUpScreen";

const RootStack = createStackNavigator();

const RootStackScreen = ({ navigation }) => (
  <RootStack.Navigator headerMode="none">
    <RootStack.Screen name="SplashScreen" component={SplashScreen} />
    <RootStack.Screen name="PreviewScreen" component={PreviewScreen} />
    <RootStack.Screen
      name="RequestPwdResetScreen"
      component={RequestPwdResetScreen}
    />
    <RootStack.Screen name="SignUpScreen" component={SignUpScreen} />
    <RootStack.Screen name="SignInScreen" component={SignInScreen} />
    <RootStack.Screen name="CorpSignUpScreen" component={CorpSignUpScreen} />
  </RootStack.Navigator>
);

export default RootStackScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
