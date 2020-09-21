import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import {
  NavigationContainer,
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from "@react-navigation/native";
import AsyncStorage from "@react-native-community/async-storage";
import * as SplashScreen from "expo-splash-screen";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";
import RootStackScreen from "./app/screens/RootStackScreen";
import Icon from "react-native-vector-icons/Ionicons";
import { ActivityIndicator, View } from "react-native";
import {
  Provider as PaperProvider,
  DarkTheme as PaperDarkTheme,
  DefaultTheme as PaperDefaultTheme,
} from "react-native-paper";

import { AuthContext } from "./app/components/context";

import { keep, find, del } from "./app/utils/storage";
import conf from "./app/config/configs";
import colors from "./app/config/colors";

import MainTabScreen from "./app/screens/MainTabScreen";
import DrawerContentScreen from "./app/screens/DrawerContentScreen";
import CorpDrawerContentScreen from "./app/screens/CorpDrawerContentScreen";
import SupportScreen from "./app/screens/SupportScreen";
import AboutScreen from "./app/screens/AboutScreen";
import SubjectTopicsScreen from "./app/screens/SubjectTopicsScreen";
import TopicLessonsScreen from "./app/screens/TopicLessonsScreen";
import ForumScreen from "./app/screens/ForumScreen";
import PackagesScreen from "./app/screens/PackagesScreen";
import OrderPaymentScreen from "./app/screens/OrderPaymentScreen";
// corp screens
import CorpMainTabScreen from "./app/screens/CorpMainTabScreen";
import CorpAboutScreen from "./app/screens/CorpAboutScreen";
import CorpSupportScreen from "./app/screens/CorpSupportScreen";

const Drawer = createDrawerNavigator();
const AboutStack = createStackNavigator();
const SupportStack = createStackNavigator();
const SubjectTopicsStack = createStackNavigator();
const TopicLessonsStack = createStackNavigator();
const ForumStack = createStackNavigator();
const PackageStack = createStackNavigator();
const OrderPaymentStack = createStackNavigator();
// corp stacks
const CorpAboutStack = createStackNavigator();
const CorpSupportStack = createStackNavigator();
const CorpOrderPaymentStack = createStackNavigator();

export default function App() {
  const [isDarkTheme, setIsDarkTheme] = React.useState(false);
  const [showSplash, updateShowSplash] = React.useState(true);

  const CustomDefaultTheme = {
    ...NavigationDefaultTheme,
    ...PaperDefaultTheme,
    colors: {
      ...NavigationDefaultTheme.colors,
      // ...PaperDefaultTheme.colors,
    },
  };

  const CustomDarkTheme = {
    ...NavigationDarkTheme,
    ...PaperDarkTheme,
    colors: {
      ...NavigationDarkTheme.colors,
      ...PaperDarkTheme.colors,
    },
  };

  const theme = isDarkTheme ? CustomDarkTheme : CustomDefaultTheme;

  const initialLoginState = {
    isLoading: true,
    userName: null,
    userToken: null,
    userData: null,
    userType: null,
  };

  const loginReducer = (prevState, action) => {
    // console.log(action);
    switch (action.type) {
      case "RETRIEVE_TOKEN":
        return {
          ...prevState,
          userToken: action.token,
          userData: action.data,
          userType: action.uType,
          isLoading: false,
        };
      case "LOGIN":
        return {
          ...prevState,
          userName: action.id,
          userToken: action.token,
          userData: action.data,
          userType: action.uType,
          isLoading: false,
        };
      case "LOGOUT":
        return {
          ...prevState,
          userName: null,
          userData: null,
          userToken: null,
          userType: null,
          isLoading: false,
        };
      case "REGISTER":
        return {
          ...prevState,
          userName: action.id,
          userData: action.data,
          userToken: action.token,
          userType: action.uType,
          isLoading: false,
        };
    }
  };
  const [loginState, dispatch] = React.useReducer(
    loginReducer,
    initialLoginState
  );
  const authContext = React.useMemo(
    () => ({
      signIn: async (foundUser) => {
        try {
          const userToken = String(foundUser.payload.token);
          const defaultOrder = String(foundUser.payload.order);
          const userName = String(foundUser.payload.data.email);
          const userData = String(foundUser.payload.data);
          const userType = String(foundUser.payload.data.usertype);
          keep("userToken", userToken);
          keep("defaultOrder", defaultOrder);
          keep(conf.secret, JSON.stringify(foundUser.payload.data));
          keep(
            "subscription_data",
            JSON.stringify(foundUser.payload.subscription_data)
          );
          keep("IS_PAID", JSON.stringify(foundUser.payload.data.is_paid));
          keep("userType", userType);
          dispatch({
            type: "LOGIN",
            id: userName,
            token: userToken,
            data: userData,
            uType: userType,
          });
        } catch (error) {
          console.log("sign in error: " + error);
          return;
        }
      },
      signOut: async () => {
        try {
          del("userToken");
          del(conf.secret);
          del("defaultOrder");
          del("subscription_data");
          del("userType");
        } catch (error) {
          console.log("sign out error: " + error);
        }
        dispatch({
          type: "LOGOUT",
          id: null,
          token: null,
          data: null,
          uType: null,
        });
      },
      signUp: async (foundUser) => {
        try {
          console.log("user " + foundUser);
          const userToken = String(foundUser.payload.token);
          const defaultOrder = String(foundUser.payload.order);
          const userName = String(foundUser.payload.data.email);
          const userData = String(foundUser.payload.data);
          const userType = String(foundUser.payload.data.usertype);
          keep("userToken", userToken);
          keep("defaultOrder", defaultOrder);
          keep(conf.secret, JSON.stringify(foundUser.payload.data));
          keep(
            "subscription_data",
            JSON.stringify(foundUser.payload.subscription_data)
          );
          keep("IS_PAID", JSON.stringify(foundUser.payload.data.is_paid));
          keep("userType", userType);
          dispatch({
            type: "REGISTER",
            id: userName,
            token: userToken,
            data: userData,
            uType: userType,
          });
        } catch (error) {
          console.log("sign in error: " + error);
          return;
        }
      },
      toggleTheme: () => {
        setIsDarkTheme((isDarkTheme) => !isDarkTheme);
      },
    }),
    []
  );
  const preventSplash = async () => {
    // await SplashScreen.preventAutoHideAsync().catch((e) => {
    //   console.warn(e);
    // });
  };
  const hideSplash = async () => {
    if (!showSplash) {
      await SplashScreen.hideAsync().catch((e) => {
        console.warn(e);
      });
    }
  };
  useEffect(() => {
    // console.log("stttt::  " + JSON.stringify(loginState));
    preventSplash();
    setTimeout(async () => {
      let userToken;
      let uType;
      userToken = null;
      uType = null;
      await AsyncStorage.multiGet(["userToken", "userType"])
        .then((multiple) => {
          // console.log("====== " + found);
          userToken = multiple[0][1];
          uType = multiple[1][1];
          // console.log(uType);
          updateShowSplash(false);
          dispatch({ type: "REGISTER", token: userToken, uType: uType });
          // console.log("st::: " + JSON.stringify(loginState));
        })
        .catch((error) => {
          updateShowSplash(false);
          del("userToken");
          del(conf.secret);
          dispatch({ type: "LOGOUT", token: null, userType: null });
        });
    }, 1000);
    hideSplash();
  }, []);

  if (loginState.isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const AboutStackScreen = ({ navigation }) => (
    <AboutStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleAlign: "center",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <AboutStack.Screen
        name="About"
        component={AboutScreen}
        options={{
          title: "About ShuleBora",
          headerLeft: () => (
            <Icon.Button
              name="ios-arrow-back"
              size={40}
              backgroundColor={colors.primary}
              onPress={() => navigation.goBack()}
            ></Icon.Button>
          ),
        }}
      />
    </AboutStack.Navigator>
  );
  const SupportStackScreen = ({ navigation }) => (
    <SupportStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleAlign: "center",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <SupportStack.Screen
        name="Support"
        component={SupportScreen}
        options={{
          title: "Technical Support",
          headerLeft: () => (
            <Icon.Button
              name="ios-arrow-back"
              size={40}
              backgroundColor={colors.primary}
              onPress={() => navigation.goBack()}
            ></Icon.Button>
          ),
        }}
      />
    </SupportStack.Navigator>
  );
  const SubjectTopicsStackScreen = ({ navigation }) => (
    <SubjectTopicsStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleAlign: "center",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <SubjectTopicsStack.Screen
        name="SubjectTopics"
        initialParams={{ id: 123, name: "myname" }}
        component={SubjectTopicsScreen}
        options={{
          title: "Single Subject Topics",
          headerLeft: () => (
            <Icon.Button
              name="ios-arrow-back"
              size={40}
              backgroundColor={colors.primary}
              onPress={() => navigation.navigate("HomePoint")}
            ></Icon.Button>
          ),
        }}
      />
    </SubjectTopicsStack.Navigator>
  );
  const TopicLessonsStackScreen = ({ navigation }) => (
    <TopicLessonsStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleAlign: "center",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <TopicLessonsStack.Screen
        name="TopicsLesson"
        initialParams={{ id: 123, name: "myname" }}
        component={TopicLessonsScreen}
        options={{
          title: "Single Topic Lessons",
          headerLeft: () => (
            <Icon.Button
              name="ios-arrow-back"
              size={40}
              backgroundColor={colors.primary}
              onPress={() => navigation.navigate("SubjectTopics")}
            ></Icon.Button>
          ),
        }}
      />
    </TopicLessonsStack.Navigator>
  );
  const ForumStackScreen = ({ navigation }) => (
    <ForumStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleAlign: "center",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <ForumStack.Screen
        name="Forum"
        component={ForumScreen}
        options={{
          title: "Subject Forum",
          headerLeft: () => (
            <Icon.Button
              name="ios-arrow-back"
              size={40}
              backgroundColor={colors.primary}
              onPress={() => navigation.navigate("HomePoint")}
            ></Icon.Button>
          ),
        }}
      />
    </ForumStack.Navigator>
  );
  const PackageStackScreen = ({ navigation }) => (
    <PackageStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleAlign: "center",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <PackageStack.Screen
        name="Packages"
        component={PackagesScreen}
        options={{
          title: "Subscription",
          headerLeft: () => (
            <Icon.Button
              name="ios-arrow-back"
              size={40}
              backgroundColor={colors.primary}
              onPress={() => authContext.signOut()}
            ></Icon.Button>
          ),
        }}
      />
    </PackageStack.Navigator>
  );
  const OrderPaymentStackScreen = ({ navigation }) => (
    <OrderPaymentStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleAlign: "center",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <OrderPaymentStack.Screen
        name="OrderPayment"
        component={OrderPaymentScreen}
        options={{
          title: "Payment",
          headerLeft: () => (
            <Icon.Button
              name="ios-arrow-back"
              size={40}
              backgroundColor={colors.primary}
              onPress={() => navigation.navigate("Packages")}
            ></Icon.Button>
          ),
        }}
      />
    </OrderPaymentStack.Navigator>
  );
  /** ============================================== */
  /** ======== Corp stacks ========================= */
  /** ============================================== */
  const CorpAboutStackScreen = ({ navigation }) => (
    <CorpAboutStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleAlign: "center",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <CorpAboutStack.Screen
        name="CorpAbout"
        component={CorpAboutScreen}
        options={{
          title: "About ShuleBora",
          headerLeft: () => (
            <Icon.Button
              name="ios-arrow-back"
              size={40}
              backgroundColor={colors.primary}
              onPress={() => navigation.goBack()}
            ></Icon.Button>
          ),
        }}
      />
    </CorpAboutStack.Navigator>
  );
  const CorpSupportStackScreen = ({ navigation }) => (
    <CorpSupportStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleAlign: "center",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <CorpSupportStack.Screen
        name="CorpAbout"
        component={CorpSupportScreen}
        options={{
          title: "Technical Support",
          headerLeft: () => (
            <Icon.Button
              name="ios-arrow-back"
              size={40}
              backgroundColor={colors.primary}
              onPress={() => navigation.goBack()}
            ></Icon.Button>
          ),
        }}
      />
    </CorpSupportStack.Navigator>
  );
  return (
    <PaperProvider theme={theme}>
      <AuthContext.Provider value={authContext}>
        <NavigationContainer theme={theme}>
          {/* unsecured */}
          {loginState.userToken === null && <RootStackScreen />}
          {/* student area */}
          {loginState.userToken !== null && loginState.userType == "112" && (
            <Drawer.Navigator
              drawerContent={(props) => <DrawerContentScreen {...props} />}
            >
              <Drawer.Screen name="HomePoint" component={MainTabScreen} />
              <Drawer.Screen name="AboutScreen" component={AboutStackScreen} />
              <Drawer.Screen
                name="SupportScreen"
                component={SupportStackScreen}
              />
              <Drawer.Screen
                name="SubjectTopics"
                component={SubjectTopicsStackScreen}
              />
              <Drawer.Screen
                name="TopicLessons"
                component={TopicLessonsStackScreen}
              />
              <Drawer.Screen name="SubjectForum" component={ForumStackScreen} />
              <Drawer.Screen name="Packages" component={PackageStackScreen} />
              <Drawer.Screen
                name="OrderPayment"
                component={OrderPaymentStackScreen}
              />
            </Drawer.Navigator>
          )}
          {/* corporate */}
          {loginState.userToken !== null && loginState.userType == "111" && (
            <Drawer.Navigator
              drawerContent={(props) => <CorpDrawerContentScreen {...props} />}
            >
              <Drawer.Screen
                name="CorpHomePoint"
                component={CorpMainTabScreen}
              />
              <Drawer.Screen
                name="CorpAbout"
                component={CorpAboutStackScreen}
              />
              <Drawer.Screen
                name="CorpSupport"
                component={CorpSupportStackScreen}
              />
            </Drawer.Navigator>
          )}
        </NavigationContainer>
      </AuthContext.Provider>
    </PaperProvider>
  );
}
