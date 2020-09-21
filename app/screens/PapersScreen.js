import React from "react";
import {
  Text,
  View,
  ScrollView,
  RefreshControl,
  Image,
  Alert,
  FlatList,
  TouchableHighlight,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as Animatable from "react-native-animatable";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as Permissions from "expo-permissions";
import { Dialog } from "react-native-simple-dialogs";
import { ConfirmDialog } from "react-native-simple-dialogs";

import { useTheme } from "@react-navigation/native";
import { AuthContext } from "../components/context";
import AsyncStorage from "@react-native-community/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { apiGetPaper, apiGetUserStatus } from "../utils/network";
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

function PapersScreen({ navigation }) {
  const { signOut } = React.useContext(AuthContext);
  const { themeColors } = useTheme();
  const theme = useTheme();

  const [paper, updatePaper] = React.useState([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const [preload, setPreload] = React.useState({ visible: true });
  const [dialog, setDialog] = React.useState({ visible: false, text: null });
  const [empty, setEmpty] = React.useState(false);
  const [access, setAccess] = React.useState(true);

  /** check if user is still active */
  useFocusEffect(
    React.useCallback(() => {
      // Do something when the screen is focused
      async function fetchUserStatus() {
        await AsyncStorage.getItem("userToken")
          .then(async (token) => {
            await apiGetUserStatus(token)
              .then((res) => {
                //all is well
              })
              .catch((error) => {
                //user access denied
                signOut();
              });
          })
          .catch((error) => {
            signOut();
          });
      }
      fetchUserStatus();
      return () => {
        // Do something when the screen is un-focused
        setPreload({ visible: false });
      };
    }, [])
  );
  /** end user check */
  const handleDialog = () => {
    setDialog({ ...dialog, visible: false });
  };
  const handleDownload = async (file, flname) => {
    if (!access) {
      navigation.navigate("Packages");
      return;
    }
    flname = flname.replace("'", "");
    setPreload({ visible: true });
    /** check if CAMERA_ROLL perm is allowed */
    const status = await Permissions.getAsync(Permissions.CAMERA_ROLL);
    // console.log("perm status " + status.status);
    if (status.status === "granted") {
      const dirname = file.split(".")[0];
      const extension = file.split(".")[1];
      let temp_file_url =
        FileSystem.documentDirectory +
        dirname +
        "/" +
        flname.toLowerCase() +
        "." +
        extension;
      const exits_info = await FileSystem.getInfoAsync(temp_file_url);
      if (!exits_info.exists) {
        await FileSystem.makeDirectoryAsync(temp_file_url, {
          intermediates: true,
        })
          .then(() => {
            // console.log("local file created at " + temp_file_url);
          })
          .catch((error) => {
            setPreload({ visible: false });
            Alert.alert(
              "Directory Error!",
              "Could not create file. Try again later",
              [{ text: "Okay" }]
            );
            return;
          });
      }
      await AsyncStorage.getItem("userToken").then(async (xtoken) => {
        await FileSystem.downloadAsync(
          conf.base_api + "topics/doc/stream/" + file,
          temp_file_url,
          {
            headers: {
              Accept: "application/octet-stream",
              Authorization: "Bearer " + xtoken,
            },
          }
        )
          .then(async ({ uri, status, http_headers }) => {
            /** send to media library */
            await MediaLibrary.saveToLibraryAsync(uri)
              .then(() => {
                setPreload({ visible: false });
                setDialog({
                  visible: true,
                  text: flname + " has been saved to Documents on your phone",
                });
                // Alert.alert(
                //   "Success",
                //   flname + " has been saved to Documents on your phone",
                //   [{ text: "Okay" }]
                // );
                // console.log("file saved to media library " + uri);
              })
              .catch((error) => {
                // console.log(error);
                setPreload({ visible: false });
                Alert.alert(
                  "File Saving Error!",
                  "Could not save file to storage . Try again later",
                  [{ text: "Okay" }]
                );
              });
            /** end send */
          })
          .catch((error) => {
            setPreload({ visible: false });
            Alert.alert(
              "Download Error!",
              "Could not download file. Try again later",
              [{ text: "Okay" }]
            );
            // console.error(error);
          });
      });
    } else {
      const ask_status = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (ask_status.status !== "granted") {
        setPreload({ visible: false });
        Alert.alert("Permission Error!", "ShuleBora needs to access storage", [
          { text: "Okay" },
        ]);
      }
    }
    setPreload({ visible: false });
    // await FileSystem.downloadAsync(url, FileSystem.documentDirectory + file);
  };
  const onRefresh = React.useCallback(() => {
    let ignore = false;
    let s = null;
    let myPapers = [];
    async function fetchPapers() {
      await AsyncStorage.multiGet(["userToken", "IS_PAID"])
        .then(async (multiple) => {
          if (multiple[1][1] == "0") {
            setAccess(false);
            navigation.navigate("Packages");
            return;
          }
          await apiGetPaper(multiple[0][1])
            .then((response) => {
              if (!response) {
                signOut();
              }
              s = response;
              myPapers = s.payload.data;
              // console.log(
              //   "paper list = " + JSON.parse(JSON.stringify(myPapers))
              // );
              if (!ignore) {
                if (
                  Object.keys(JSON.parse(JSON.stringify(myPapers))).length == 0
                ) {
                  setEmpty(true);
                }
                updatePaper(JSON.parse(JSON.stringify(myPapers)));
              }
            })
            .catch((error) => {
              setEmpty(true);
              console.log("fetch paper error error: " + error);
              signOut();
            });
        })
        .catch((error) => {
          signOut();
        });
    }
    fetchPapers();
    setRefreshing(true);
    wait(2000).then(() => setRefreshing(false));
    return () => {
      ignore = true;
    };
  }, []);
  React.useEffect(() => {
    let ignore = false;
    let s = null;
    let myPapers = [];
    async function fetchPapers() {
      await AsyncStorage.multiGet(["userToken", "IS_PAID"])
        .then(async (multiple) => {
          if (multiple[1][1] == "0") {
            setAccess(false);
            navigation.navigate("Packages");
            return;
          }
          await apiGetPaper(multiple[0][1])
            .then((response) => {
              if (!response) {
                signOut();
              }
              s = response;
              myPapers = s.payload.data;
              // console.log(
              //   "paper list = " + JSON.parse(JSON.stringify(myPapers))
              // );
              if (!ignore) {
                if (
                  Object.keys(JSON.parse(JSON.stringify(myPapers))).length == 0
                ) {
                  setEmpty(true);
                }
                updatePaper(JSON.parse(JSON.stringify(myPapers)));
                setPreload({ visible: false });
              }
            })
            .catch((error) => {
              setEmpty(true);
              console.log("fetch paper error error: " + JSON.stringify(error));
              signOut();
            });
        })
        .catch((error) => {
          signOut();
        });
    }
    fetchPapers();
    return () => {
      ignore = true;
    };
  }, []);
  const Item = ({ title, file }) => (
    <TouchableHighlight style={globalStyle.listItem} underlayColor="#f1f1f1">
      <Animatable.View animation="bounceIn" duration={10}>
        <View style={[globalStyle.row, { marginBottom: 4 }]}>
          <Image style={globalStyle.thumb} source={logo} />
          <View style={globalStyle.text}>
            <Text
              style={[
                globalStyle.name,
                { color: colors.primary, textTransform: "uppercase" },
              ]}
            >
              {title}
            </Text>
          </View>
        </View>
        <View style={[globalStyle.row, { marginBottom: 15 }]}>
          {/* action */}
          <TouchableOpacity
            style={styles.signIn}
            onPress={() => {
              handleDownload(file, title.replace(/\s/g, "-"));
            }}
          >
            <LinearGradient
              colors={[colors.secondary, colors.secondary_dark]}
              style={[styles.signIn, { flexDirection: "row" }]}
            >
              <Icon
                name="cloud-download"
                size={20}
                style={[styles.iconButton, { color: colors.white }]}
              />
              <Text style={(styles.textSign, { color: colors.white })}>
                Download
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          {/* end action */}
        </View>
      </Animatable.View>
    </TouchableHighlight>
  );
  const renderItem = ({ item }) => (
    <Item title={item.title} file={item.file_content} />
  );
  return (
    <View style={globalStyle.container}>
      <StatusBar barStyle={theme.dark ? "light-content" : "default"} />
      {/* dialog */}
      <ConfirmDialog
        titleStyle={{ color: colors.white }}
        buttonsStyle={{
          backgroundColor: colors.white,
          width: "30%",
          justifyContent: "center",
          alignItems: "center",
          margin: 10,
          borderRadius: 10,
          height: 30,
          shadowColor: colors.secondary,
        }}
        dialogStyle={[
          globalStyle.listItem,
          {
            borderRadius: 20,
            width: "90%",
            backgroundColor: colors.primary,
          },
        ]}
        title="Download Success"
        visible={dialog.visible}
        onTouchOutside={() =>
          setDialog({ ...dialog, visible: false, text: null })
        }
        positiveButton={{
          title: "Got it",
          onPress: () => handleDialog(),
        }}
      >
        <View>
          <Text>{dialog.text}</Text>
        </View>
      </ConfirmDialog>
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
        <ScrollView
          style={globalStyle.scrollContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <LinearGradient
            style={globalStyle.header}
            colors={[colors.secondary_dark, colors.secondary]}
            start={{ x: 0.0, y: 0.25 }}
            end={{ x: 0.5, y: 1.0 }}
          ></LinearGradient>
          <View style={globalStyle.marginTopValue}>
            <View style={styles.section}>
              <Icon
                name="book-open-variant"
                size={30}
                style={{ color: colors.white_dark, marginLeft: 15 }}
              />
              <Text
                style={[
                  globalStyle.nameLeft,
                  { fontSize: 22, marginBottom: 20, color: colors.white_dark },
                ]}
              >
                Revision Center
              </Text>
            </View>
            <View>
              <FlatList
                data={paper}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
              />
            </View>
            {empty == true && (
              <View
                style={[
                  globalStyle.listItem,
                  {
                    height: 100,
                    justifyContent: "center",
                    alignItems: "center",
                  },
                ]}
              >
                <Text style={{ margin: 15 }}>
                  No revision papers found. Please check back later
                </Text>
              </View>
            )}
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

export default PapersScreen;
