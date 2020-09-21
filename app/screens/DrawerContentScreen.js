import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { AuthContext } from "../components/context";
import AsyncStorage from "@react-native-community/async-storage";

import {
  useTheme,
  Avatar,
  Title,
  Caption,
  Paragraph,
  Drawer,
  Text,
  TouchableRipple,
  Switch,
} from "react-native-paper";

import conf from "../config/configs";
import colors from "../config/colors";

export default function DrawerContentScreen(props) {
  const { signOut, toggleTheme } = React.useContext(AuthContext);

  const [person, updatePerson] = React.useState([]);

  useEffect(() => {
    let ignore = false;
    async function fetchPerson() {
      await AsyncStorage.getItem(conf.secret)
        .then((response) => {
          if (!ignore) {
            updatePerson(JSON.parse(response));
          }
        })
        .catch((error) => {
          signOut();
        });
    }
    fetchPerson();
    return () => {
      ignore = true;
    };
  }, []);
  const paperTheme = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        <View style={styles.drawerContent}>
          <View
            style={[
              styles.userInfoSection,
              {
                backgroundColor: colors.primary,
                borderBottomLeftRadius: 4,
                borderBottomRightRadius: 4,
              },
            ]}
          >
            <View style={{ flexDirection: "row", marginTop: 15 }}>
              <Avatar.Image
                source={{
                  uri: conf.media_api + "avatar.png",
                }}
                size={50}
              />
              <View style={{ flexDirection: "column", marginLeft: 15 }}>
                <Title style={[styles.title, { color: colors.white }]}>
                  {person.name}
                </Title>
                <Caption style={[styles.caption, { color: colors.white_dark }]}>
                  {person.phone}
                </Caption>
              </View>
            </View>
            <View style={[styles.row, { paddingBottom: 10 }]}>
              <View style={styles.section}>
                <Paragraph
                  style={[
                    styles.paragraph,
                    styles.caption,
                    { color: colors.white },
                  ]}
                >
                  <Icon name="book" size={10} />
                </Paragraph>
                <Caption
                  style={[
                    styles.caption,
                    {
                      color: colors.white_dark,
                      fontSize: 13,
                      textTransform: "capitalize",
                    },
                  ]}
                >
                  {person.formname}
                </Caption>
              </View>
              <View style={[styles.section]}>
                <Paragraph
                  style={[
                    styles.paragraph,
                    styles.caption,
                    { color: colors.white },
                  ]}
                >
                  <Icon name="flag" size={15} />
                </Paragraph>
                <Caption
                  style={[
                    styles.caption,
                    {
                      color: colors.white_dark,
                      fontSize: 13,
                      textTransform: "capitalize",
                      flexShrink: 1,
                      paddingRight: 20,
                    },
                  ]}
                >
                  {person.school}
                </Caption>
              </View>
            </View>
          </View>

          <Drawer.Section style={styles.drawerSection}>
            <DrawerItem
              icon={({ color, size }) => (
                <Icon name="book" color={color} size={size} />
              )}
              label="My Subjects"
              onPress={() => {
                props.navigation.navigate("Home");
              }}
            />
            <DrawerItem
              icon={({ color, size }) => (
                <Icon name="book-open-variant" color={color} size={size} />
              )}
              label="Revision Papers"
              onPress={() => {
                props.navigation.navigate("Papers");
              }}
            />
            <DrawerItem
              icon={({ color, size }) => (
                <Icon name="briefcase" color={color} size={size} />
              )}
              label="Topical Questions"
              onPress={() => {
                props.navigation.navigate("Assignments");
              }}
            />
            <DrawerItem
              icon={({ color, size }) => (
                <Icon name="account-circle" color={color} size={size} />
              )}
              label="Profile"
              onPress={() => {
                props.navigation.navigate("Profile");
              }}
            />
            <DrawerItem
              icon={({ color, size }) => (
                <Icon name="information" color={color} size={size} />
              )}
              label="About ShuleBora"
              onPress={() => {
                props.navigation.navigate("AboutScreen");
              }}
            />
            <DrawerItem
              icon={({ color, size }) => (
                <Icon name="account-question" color={color} size={size} />
              )}
              label="Support"
              onPress={() => {
                props.navigation.navigate("SupportScreen");
              }}
            />
          </Drawer.Section>
          <Drawer.Section title="Preferences">
            <TouchableRipple
              onPress={() => {
                toggleTheme();
              }}
            >
              <View style={styles.preference}>
                <Text>Dark Theme</Text>
                <View pointerEvents="none">
                  <Switch value={paperTheme.dark} />
                </View>
              </View>
            </TouchableRipple>
          </Drawer.Section>
        </View>
      </DrawerContentScrollView>
      <Drawer.Section style={styles.bottomDrawerSection}>
        <DrawerItem
          icon={({ color, size }) => (
            <Icon name="exit-to-app" color={color} size={size} />
          )}
          label="Sign Out"
          onPress={() => {
            signOut();
          }}
        />
      </Drawer.Section>
    </View>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  userInfoSection: {
    paddingLeft: 20,
    marginTop: "-2%",
  },
  title: {
    fontSize: 16,
    marginTop: 3,
    fontWeight: "bold",
  },
  caption: {
    fontSize: 14,
    lineHeight: 14,
  },
  row: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  section: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  paragraph: {
    fontWeight: "bold",
    marginRight: 3,
  },
  drawerSection: {
    marginTop: 15,
  },
  bottomDrawerSection: {
    marginBottom: 15,
    borderTopColor: "#f4f4f4",
    borderTopWidth: 1,
  },
  preference: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});
