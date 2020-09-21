import React from "react";
import {
  Text,
  View,
  ScrollView,
  Image,
  StatusBar,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Dialog } from "react-native-simple-dialogs";
import Moment from "react-moment";
import { useTheme } from "@react-navigation/native";
import { AuthContext } from "../components/context";
import AsyncStorage from "@react-native-community/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import globalStyle from "../utils/styles";
import colors from "../config/colors";
import conf from "../config/configs";

const logo = require("../assets/icon_scorecard.png");
const pricon = require("../assets/preload.gif");
const wait = (timeout) => {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
};

function CorpProfileScreen({ navigation }) {
  const { signOut } = React.useContext(AuthContext);
  const { themeColors } = useTheme();
  const theme = useTheme();

  const [preload, setPreload] = React.useState({ visible: true });
  const [person, updatePerson] = React.useState([]);
  const [subData, updateSubData] = React.useState([]);

  React.useEffect(() => {
    let ignore = false;
    async function fetchPerson() {
      await AsyncStorage.getItem("subscription_data")
        .then((dt) => {
          if (!ignore) {
            updateSubData(JSON.parse(dt));
          }
        })
        .catch((err) => {
          updateSubData([]);
          console.log(err);
        });
      await AsyncStorage.getItem(conf.secret)
        .then((response) => {
          if (!ignore) {
            updatePerson(JSON.parse(response));
            setPreload({ visible: false });
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
  return (
    <View style={globalStyle.container}>
      <StatusBar barStyle={theme.dark ? "light-content" : "default"} />
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
          setPreload({ visible: true });
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
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={globalStyle.scrollContainer}>
          <LinearGradient
            style={globalStyle.header}
            colors={[colors.secondary_dark, colors.secondary]}
            start={{ x: 0.0, y: 0.25 }}
            end={{ x: 0.5, y: 1.0 }}
          ></LinearGradient>
          <View style={globalStyle.marginTopValue}>
            <View style={styles.section}>
              <Icon
                name="account"
                size={30}
                style={{ color: colors.white_dark, marginLeft: 15 }}
              />
              <Text
                style={[
                  globalStyle.nameLeft,
                  { fontSize: 22, marginBottom: 20, color: colors.white_dark },
                ]}
              >
                Profile
              </Text>
            </View>
            <View style={[globalStyle.listItem, { paddingBottom: 30 }]}>
              <View style={{ paddingBottom: 20 }}>
                <Text style={globalStyle.slideTite}>Profile Information</Text>
                <Text style={styles.property_label}>Organization Name</Text>
                <Text style={styles.property_value}>{person.school}</Text>

                <Text style={styles.property_label}>Contact Person</Text>
                <Text style={styles.property_value}>{person.name}</Text>

                <Text style={styles.property_label}>Email</Text>
                <Text style={styles.property_value}>{person.email}</Text>

                <Text style={styles.property_label}>Phone</Text>
                <Text style={styles.property_value}>{person.phone}</Text>

                <Text style={styles.property_label}>Date Joined</Text>
                <Moment
                  style={styles.property_value}
                  element={Text}
                  format="MMMM Do Y"
                >
                  {person.created_at}
                </Moment>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  item: {
    backgroundColor: "#f9c2ff",
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 32,
  },
  property_label: {
    color: colors.black_light,
    fontSize: 11,
    fontWeight: "300",
  },
  property_value: {
    color: colors.black,
    fontSize: 14,
    fontWeight: "500",
  },
  section: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  signIn: {
    width: "50%",
    height: 30,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  textSign: {
    fontSize: 18,
    fontWeight: "bold",
  },
  iconButton: {
    marginRight: 10,
  },
});

export default CorpProfileScreen;
