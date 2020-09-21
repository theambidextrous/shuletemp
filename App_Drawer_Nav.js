import { StatusBar } from "expo-status-bar";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";

import MainTabScreen from "./app/screens/MainTabScreen";
import DrawerContentScreen from "./app/screens/DrawerContentScreen";
import SupportScreen from "./app/screens/SupportScreen";
import SettingsScreen from "./app/screens/SettingsScreen";
import BookMarkScreen from "./app/screens/BookMarkScreen";
const Drawer = createDrawerNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        drawerContent={(props) => <DrawerContentScreen {...props} />}
      >
        <Drawer.Screen name="HomePoint" component={MainTabScreen} />
        <Drawer.Screen name="SupportScreen" component={SupportScreen} />
        <Drawer.Screen name="SettingsScreen" component={SettingsScreen} />
        <Drawer.Screen name="BookMarkScreen" component={BookMarkScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
