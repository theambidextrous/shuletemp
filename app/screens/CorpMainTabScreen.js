import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import Icon from "react-native-vector-icons/Ionicons";
import MIcon from "react-native-vector-icons/MaterialCommunityIcons";

import CorpWelcomeScreen from "./CorpWelcomeScreen";
import CorpLessonsScreen from "./CorpLessonsScreen";
import CorpTransactionsScreen from "./CorpTransactionsScreen";
import CorpProfileScreen from "./CorpProfileScreen";

import colors from "../config/colors";

const Tab = createMaterialBottomTabNavigator();
const CorpHomeStack = createStackNavigator();
const CorpLessonsStack = createStackNavigator();
const CorpTransactionsStack = createStackNavigator();
const CorpProfileStack = createStackNavigator();

const CorpMainTabScreen = () => (
  <Tab.Navigator
    initialRouteName="CorpHome"
    activeColor={colors.white}
    style={{ backgroundColor: colors.primary }}
  >
    <Tab.Screen
      name="CorpHome"
      component={CorpHomeStackScreen}
      options={{
        tabBarLabel: "Live Sessions",
        tabBarIcon: ({ color }) => (
          <MIcon name="webcam" color={color} size={26} />
        ),
      }}
    />
    <Tab.Screen
      name="CorpLessons"
      component={CorpLessonsStackScreen}
      options={{
        tabBarLabel: "Purchases",
        tabBarIcon: ({ color }) => (
          <MIcon name="shopping" color={color} size={26} />
        ),
      }}
    />
    <Tab.Screen
      name="CorpTransactions"
      para
      component={CorpTransactionsStackScreen}
      options={{
        tabBarLabel: "Transactions",
        tabBarIcon: ({ color }) => (
          <MIcon name="chart-areaspline" color={color} size={26} />
        ),
      }}
    />
    <Tab.Screen
      name="CorpProfile"
      component={CorpProfileStackScreen}
      options={{
        tabBarLabel: "Profile",
        tabBarIcon: ({ color }) => (
          <Icon name="ios-person" color={color} size={26} />
        ),
      }}
    />
  </Tab.Navigator>
);

const CorpHomeStackScreen = ({ navigation }) => (
  <CorpHomeStack.Navigator
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
    <CorpHomeStack.Screen
      name="CorpWelcome"
      component={CorpWelcomeScreen}
      options={{
        title: "Live Sessions",
        headerLeft: () => (
          <Icon.Button
            name="ios-menu"
            size={40}
            backgroundColor={colors.primary}
            onPress={() => navigation.openDrawer()}
          ></Icon.Button>
        ),
      }}
    />
  </CorpHomeStack.Navigator>
);
const CorpLessonsStackScreen = ({ navigation }) => (
  <CorpLessonsStack.Navigator
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
    <CorpLessonsStack.Screen
      name="CorpLessons"
      component={CorpLessonsScreen}
      options={{
        title: "Session Purchases",
        headerLeft: () => (
          <Icon.Button
            name="ios-menu"
            size={40}
            backgroundColor={colors.primary}
            onPress={() => navigation.openDrawer()}
          ></Icon.Button>
        ),
      }}
    />
  </CorpLessonsStack.Navigator>
);

const CorpTransactionsStackScreen = ({ navigation }) => (
  <CorpTransactionsStack.Navigator
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
    <CorpTransactionsStack.Screen
      name="CorpTransactions"
      component={CorpTransactionsScreen}
      options={{
        title: "Transactions",
        headerLeft: () => (
          <Icon.Button
            name="ios-menu"
            size={40}
            backgroundColor={colors.primary}
            onPress={() => navigation.openDrawer()}
          ></Icon.Button>
        ),
      }}
    />
  </CorpTransactionsStack.Navigator>
);

const CorpProfileStackScreen = ({ navigation }) => (
  <CorpProfileStack.Navigator
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
    <CorpProfileStack.Screen
      name="CorpProfile"
      component={CorpProfileScreen}
      options={{
        title: "Profile",
        headerLeft: () => (
          <Icon.Button
            name="ios-menu"
            size={40}
            backgroundColor={colors.primary}
            onPress={() => navigation.openDrawer()}
          ></Icon.Button>
        ),
      }}
    />
  </CorpProfileStack.Navigator>
);

export default CorpMainTabScreen;
