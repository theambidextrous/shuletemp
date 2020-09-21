import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import Icon from "react-native-vector-icons/Ionicons";
import MIcon from "react-native-vector-icons/MaterialCommunityIcons";

import WelcomeScreen from "./WelcomeScreen";
import PapersScreen from "./PapersScreen";
import AssignmentsScreen from "./AssignmentsScreen";
import ProfileScreen from "./ProfileScreen";

import colors from "../config/colors";

const Tab = createMaterialBottomTabNavigator();
const HomeStack = createStackNavigator();
const PapersStack = createStackNavigator();
const AssignmentsStack = createStackNavigator();
const ProfileStack = createStackNavigator();

const MainTabScreen = () => (
  <Tab.Navigator
    initialRouteName="Home"
    activeColor={colors.white}
    style={{ backgroundColor: colors.primary }}
  >
    <Tab.Screen
      name="Home"
      component={HomeStackScreen}
      options={{
        tabBarLabel: "Subjects",
        tabBarIcon: ({ color }) => (
          <MIcon name="book" color={color} size={26} />
        ),
      }}
    />
    <Tab.Screen
      name="Papers"
      component={PapersStackScreen}
      options={{
        tabBarLabel: "Revision Papers",
        tabBarIcon: ({ color }) => (
          <Icon name="ios-book" color={color} size={26} />
        ),
      }}
    />
    <Tab.Screen
      name="Assignments"
      para
      component={AssignmentsStackScreen}
      options={{
        tabBarLabel: "Questions",
        tabBarIcon: ({ color }) => (
          <Icon name="ios-briefcase" color={color} size={26} />
        ),
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileStackScreen}
      options={{
        tabBarLabel: "Profile",
        tabBarIcon: ({ color }) => (
          <Icon name="ios-person" color={color} size={26} />
        ),
      }}
    />
  </Tab.Navigator>
);

const HomeStackScreen = ({ navigation }) => (
  <HomeStack.Navigator
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
    <HomeStack.Screen
      name="Welcome"
      component={WelcomeScreen}
      options={{
        title: "Welcome Home",
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
  </HomeStack.Navigator>
);
const PapersStackScreen = ({ navigation }) => (
  <PapersStack.Navigator
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
    <PapersStack.Screen
      name="Papers"
      component={PapersScreen}
      options={{
        title: "Revision Papers",
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
  </PapersStack.Navigator>
);

const AssignmentsStackScreen = ({ navigation }) => (
  <AssignmentsStack.Navigator
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
    <AssignmentsStack.Screen
      name="Assigments"
      component={AssignmentsScreen}
      options={{
        title: "Topical Questions",
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
  </AssignmentsStack.Navigator>
);

const ProfileStackScreen = ({ navigation }) => (
  <ProfileStack.Navigator
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
    <ProfileStack.Screen
      name="Profile"
      component={ProfileScreen}
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
  </ProfileStack.Navigator>
);

export default MainTabScreen;
