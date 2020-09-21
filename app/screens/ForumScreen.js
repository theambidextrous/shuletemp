import React from "react";
import {
  Text,
  View,
  ScrollView,
  Image,
  FlatList,
  Alert,
  Picker,
  RefreshControl,
  TouchableOpacity,
  Platform,
  StatusBar,
  StyleSheet,
  TextInput,
  Linking,
  SafeAreaView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Paragraph, TouchableRipple } from "react-native-paper";
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import Constants from "expo-constants";

import { Dialog } from "react-native-simple-dialogs";
import { ConfirmDialog } from "react-native-simple-dialogs";
import Lightbox from "react-native-lightbox";
import { Video } from "expo-av";
import Moment from "react-moment";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Feather from "react-native-vector-icons/Feather";
import * as Animatable from "react-native-animatable";
import { useTheme } from "@react-navigation/native";
import { AuthContext } from "../components/context";
import AsyncStorage from "@react-native-community/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { apiGetUserStatus, apiPostForum } from "../utils/network";
import globalStyle from "../utils/styles";
import colors from "../config/colors";
import configs from "../config/configs";

const logo = require("../assets/ask.png");
const pricon = require("../assets/preload.gif");

const wait = (timeout) => {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
};
function ForumScreen({ navigation }) {
  const { signOut } = React.useContext(AuthContext);
  const { themeColors } = useTheme();
  const theme = useTheme();
  const [forum, updateForum] = React.useState([]);
  const [topics, updateTopics] = React.useState([]);
  const [forumsubject, updateForumSubject] = React.useState("none");
  const [refreshing, setRefreshing] = React.useState(false);
  const [preload, setPreload] = React.useState({ visible: false });
  const [dialog, setDialog] = React.useState({ visible: false, text: null });
  const [rerender, updateRerender] = React.useState(false);
  const [xxtoken, UpdateXtoken] = React.useState(null);
  const [pickedimage, setPickedImage] = React.useState({
    uri: null,
    preview: false,
  });
  const [empty, setEmpty] = React.useState(false);
  const [data, setData] = React.useState({
    asked: "",
    topic: "nn",
    isValidQuestion: false,
  });
  /** check if user is still active */
  useFocusEffect(
    React.useCallback(() => {
      // Do something when the screen is focused
      async function fetchUserStatus() {
        await AsyncStorage.getItem("userToken")
          .then(async (token) => {
            UpdateXtoken(token);
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
      setPreload({ visible: false });
      return () => {
        // Do something when the screen is un-focused
        setPreload({ visible: false });
      };
    }, [])
  );
  /** end user check */

  const onRefresh = React.useCallback(() => {
    let ignore = false;
    let s = null;
    let myforum = [];
    let mytopics = [];
    let the_subject = null;
    async function fetchForums() {
      await AsyncStorage.getItem("forum_data")
        .then((response) => {
          if (!response) {
            console.log("empty resp");
          }
          s = JSON.parse(response);
          myforum = s.payload.data;
          mytopics = s.payload.topics;
          the_subject = s.payload.subject;
          //   console.log("topic list = " + JSON.parse(JSON.stringify(myTopics)));
          if (!ignore) {
            if (Object.keys(JSON.parse(JSON.stringify(myforum))).length == 0) {
              setEmpty(true);
            }
            updateForum(JSON.parse(JSON.stringify(myforum)));
            updateTopics(JSON.parse(JSON.stringify(mytopics)));
            updateForumSubject(the_subject);
            setPreload({ visible: false });
          }
        })
        .catch((error) => {
          setEmpty(true);
          updateForum([]);
          updateForumSubject("None");
          console.log("storage err: " + error);
        });
    }
    fetchForums();
    setRefreshing(true);
    wait(2000).then(() => setRefreshing(false));
    return () => {
      ignore = true;
    };
  }, []);
  React.useEffect(() => {
    // setPreload({ visible: true });
    let ignore = false;
    let s = null;
    let myforum = [];
    let mytopics = [];
    let the_subject = null;
    async function fetchForums() {
      await AsyncStorage.getItem("forum_data")
        .then((response) => {
          if (!response) {
            console.log("empty resp");
          }
          // console.log(response);
          s = JSON.parse(response);
          myforum = s.payload.data;
          mytopics = s.payload.topics;
          the_subject = s.payload.subject;
          if (!ignore) {
            if (Object.keys(JSON.parse(JSON.stringify(myforum))).length == 0) {
              setEmpty(true);
            }
            updateForum(JSON.parse(JSON.stringify(myforum)));
            updateTopics(JSON.parse(JSON.stringify(mytopics)));
            updateForumSubject(the_subject);
            setPreload({ visible: false });
          }
        })
        .catch((error) => {
          setEmpty(true);
          updateForum([]);
          updateForumSubject("None");
          console.log("storage err: " + error);
        });
    }
    fetchForums();
    setRefreshing(false);
    return () => {
      ignore = true;
    };
  }, [forumsubject, rerender]);

  const handleDialog = () => {
    setDialog({ ...dialog, visible: false });
  };
  const getPermissionAsync = async () => {
    if (Constants.platform.ios || Constants.platform.android) {
      const { cameraStatus } = await Permissions.askAsync(
        Permissions.CAMERA_ROLL,
        Permissions.CAMERA
      );
      if (cameraStatus !== "granted") {
        Alert.alert(
          "Permission Error!",
          "You may want to enable camera permissions",
          [{ text: "Okay" }]
        );
        return;
      }
    }
  };
  const textInputChange = (val) => {
    if (val.length > 20) {
      setData({
        ...data,
        asked: val,
        isValidQuestion: true,
      });
    } else {
      setData({
        ...data,
        asked: val,
        isValidQuestion: false,
      });
    }
  };
  const topicInputChange = (val) => {
    if (val !== "nn") {
      setData({
        ...data,
        topic: val,
      });
    } else {
      setData({
        ...data,
        topic: "nn",
      });
    }
  };
  const handleValidQuestion = (val) => {
    if (val.length > 20) {
      setData({
        ...data,
        asked: val,
        isValidQuestion: true,
      });
    } else {
      setData({
        ...data,
        asked: val,
        isValidQuestion: false,
      });
    }
  };

  const pickImage = async () => {
    setPreload({ visible: true });
    try {
      //let result = await ImagePicker.launchImageLibraryAsync({
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      // console.log(result);
      if (!result.cancelled) {
        setPickedImage({ uri: result.uri, preview: true });
        setPreload({ visible: false });
        return;
      } else {
        setPickedImage({ uri: null, preview: false });
        setPreload({ visible: false });
        Alert.alert(
          "Image error",
          "Could not upload photo, try again or type the question",
          [{ text: "Okay" }]
        );
        return;
      }
      // console.log(result);
    } catch (e) {
      setPickedImage({ uri: null, preview: false });
      setPreload({ visible: false });
      Alert.alert("Image error", "Logic error", [{ text: "Okay" }]);
      return;
    }
  };
  const handlePostQuestion = async (subject, topic) => {
    if (isNaN(parseInt(subject))) {
      navigation.navigate("HomePoint");
      return;
    }
    if (data.isValidQuestion === false) {
      Alert.alert("Input Error!", "Enter a valid question(min 20 characters)", [
        { text: "Okay" },
      ]);
      return;
    }
    if (data.topic === "nn") {
      Alert.alert("Input Error!", "Select a valid topic", [{ text: "Okay" }]);
      return;
    }
    setPreload({ visible: true });
    await getPermissionAsync()
      .then(async () => {
        // console.log("gggggggg");
        await AsyncStorage.multiGet(["userToken", "IS_PAID"])
          .then(async (multiple) => {
            if (multiple[1][1] == "0") {
              navigation.navigate("Packages");
            }
            let postData = new FormData();
            let xtoken = multiple[0][1];
            let s;
            let newforum = [];
            if (pickedimage.uri !== null) {
              let localUri = pickedimage.uri;
              let filename = localUri.split("/").pop();
              let match = /\.(\w+)$/.exec(filename);
              let type = match ? `image/${match[1]}` : `image`;
              postData.append("q_image", {
                uri: localUri,
                name: filename,
                type,
              });
            }
            postData.append("subject", parseInt(subject));
            postData.append("topic", topic);
            postData.append("question", data.asked);
            /** post the question */
            await apiPostForum(xtoken, postData)
              .then(async (response) => {
                if (!response) {
                  signOut();
                }
                s = response;
                newforum = s.payload.data;
                if (s.status !== 0) {
                  Alert.alert(
                    "Post Error!",
                    "Your question was not submitted. Try again",
                    [{ text: "Okay" }]
                  );
                  setPreload({ visible: false });
                  return;
                } else {
                  // console.log(newforum);
                  await AsyncStorage.setItem(
                    "forum_data",
                    JSON.stringify(response)
                  );
                  // updateForum(JSON.parse(JSON.stringify(newforum)));
                  setPickedImage({ uri: null, preview: false });
                  setData({ asked: "", topic: "nn", isValidQuestion: false });
                  setPreload({ visible: false });
                  Alert.alert(
                    "Post Success!",
                    "Your question was posted. Your teacher will answer you soon.",
                    [{ text: "Okay" }]
                  );
                  setTimeout(() => {
                    updateRerender(!rerender);
                  }, 2000);
                  return;
                }
              })
              .catch((error) => {
                console.log("post error: " + error);
                signOut();
              });
            /** end post */
          })
          .catch((error) => {
            signOut();
          });
      })
      .catch((err) => {
        setPreload({ visible: false });
        console.log("perm error:: " + err);
      });
    setPreload({ visible: false });
  };
  const Item = ({
    subject,
    topic,
    question,
    answer,
    user,
    posted,
    qimage,
    aimage,
    btoken,
  }) => (
      <TouchableRipple style={globalStyle.listItem} underlayColor="#f1f1f1">
        <Animatable.View animation="bounceIn" duration={10}>
          <View style={[globalStyle.row, { marginBottom: 4 }]}>
            <Image
              style={[globalStyle.thumb, { height: 20, width: 20 }]}
              source={logo}
            />
            <View style={globalStyle.text}>
              <Text
                style={[
                  globalStyle.name,
                  {
                    color: colors.primary_dark,
                    textTransform: "capitalize",
                    fontSize: 14,
                  },
                ]}
              >
                {question}
              </Text>
            </View>
          </View>
          {/* question image */}
          {qimage !== null && (
            <View style={{ flex: 1 }}>
              {/* <Text>{btoken}</Text> */}
              <Lightbox
                activeProps={{
                  resizeMode: "contain",
                  flex: 1,
                  width: "100%",
                  minHeight: 600,
                }}
                style={{
                  borderColor: colors.black_light,
                  borderWidth: 1,
                  width: "98%",
                  borderRadius: 4,
                  marginBottom: 8,
                }}
                backgroundColor={colors.black}
                underlayColor={colors.primary}
                springConfig={{ tension: 15, friction: 7 }}
                swipeToDismiss={true}
              >
                <Image
                  resizeMode="cover"
                  style={{
                    width: "100%",
                    minHeight: 200,
                    marginBottom: 10,
                  }}
                  source={{
                    uri: configs.base_api + "topics/doc/forum/stream/" + qimage,
                    headers: {
                      Authorization: "Bearer " + btoken,
                    },
                  }}
                />
              </Lightbox>
            </View>
          )}
          {/* end image */}
          <View
            style={[
              globalStyle.row,
              { marginBottom: 15, alignContent: "flex-start" },
            ]}
          >
            {/* action */}
            <View style={{ flexDirection: "column" }}>
              <Text style={styles.answerTitle}>Answer:</Text>
              {answer !== null && (
                <Text style={styles.answer}>{" " + answer}</Text>
              )}
              {answer === null && (
                <Text style={styles.answer}>{" " + "Not answered"}</Text>
              )}
              {aimage !== null && (
                <View style={{ flex: 1 }}>
                  <Lightbox
                    activeProps={{
                      resizeMode: "contain",
                      flex: 1,
                      width: "100%",
                      minHeight: 600,
                    }}
                    style={{
                      marginTop: 15,
                      borderColor: colors.black_light,
                      borderWidth: 1,
                      width: "100%",
                      borderRadius: 4,
                      marginBottom: 8,
                    }}
                    backgroundColor={colors.black}
                    underlayColor={colors.primary}
                    springConfig={{ tension: 15, friction: 7 }}
                    swipeToDismiss={true}
                  >
                    <Image
                      resizeMode="cover"
                      style={{
                        width: "100%",
                        minHeight: 200,
                        marginBottom: 10,
                      }}
                      source={{
                        uri:
                          configs.base_api + "topics/doc/forum/stream/" + aimage,
                        headers: {
                          Authorization: "Bearer " + btoken,
                        },
                      }}
                    />
                  </Lightbox>
                </View>
              )}
            </View>

            {/* end action */}
          </View>
          <View style={[globalStyle.row, { marginBottom: 15 }]}>
            <View style={{ flexDirection: "row", marginLeft: 5 }}>
              <Icon
                name="clock-outline"
                style={[
                  styles.iconButton,
                  { marginRight: 2, color: colors.primary },
                ]}
                size={15}
              />
              <Moment element={Text} format="MMMM Do" style={styles.meta}>
                {posted}
              </Moment>
            </View>
            <View style={{ flexDirection: "row", marginLeft: 5 }}>
              <Icon
                name="account-outline"
                style={[
                  styles.iconButton,
                  { marginRight: 2, color: colors.primary },
                ]}
                size={15}
              />
              <Text style={styles.meta}>{user}</Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                marginLeft: 5,
                width: "35%",
              }}
            >
              <Icon
                name="book-outline"
                style={[
                  styles.iconButton,
                  { marginRight: 2, color: colors.primary },
                ]}
                size={15}
              />
              <Text numberOfLines={1} style={[styles.meta, { flexWrap: "wrap" }]}>
                {topic}
              </Text>
            </View>
          </View>
        </Animatable.View>
      </TouchableRipple>
    );
  const renderItem = ({ item }) => (
    <Item
      subject={item.subject}
      topic={item.topic}
      question={item.question}
      answer={item.answer}
      user={item.asked_by}
      posted={item.created_at}
      qimage={item.q_image}
      aimage={item.a_image}
      btoken={item.token}
    />
  );
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
                name="account-group"
                size={30}
                style={{ color: colors.white_dark, marginLeft: 15 }}
              />
              <Text
                style={[
                  globalStyle.nameLeft,
                  { fontSize: 22, marginBottom: 20, color: colors.white_dark },
                ]}
              >
                {forumsubject.split("~")[1]}
              </Text>
            </View>
            <View
              style={[
                globalStyle.listItem,
                {
                  height: 300,
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
            >
              <View>
                <Text style={styles.qtitle}>Ask a Question</Text>
              </View>
              {/* input */}
              <View style={[styles.action, { padding: 4 }]}>
                <FontAwesome
                  name="question-circle"
                  color={colors.primary}
                  size={20}
                />
                <TextInput
                  value={data.asked}
                  placeholder="type your question here"
                  style={[styles.textInput, { paddingRight: 10 }]}
                  autoCapitalize="none"
                  onChangeText={(val) => textInputChange(val)}
                  onEndEditing={(e) => handleValidQuestion(e.nativeEvent.text)}
                />
              </View>
              {/* select topic */}
              <View style={styles.action}>
                <Picker
                  selectedValue={data.topic}
                  style={{
                    height: 50,
                    width: "80%",
                    color: colors.black_light,
                  }}
                  onValueChange={(val, itemIndex) => topicInputChange(val)}
                >
                  <Picker.Item label="Pick topic from here" value="nn" />
                  {topics.map((item, index) => {
                    return (
                      <Picker.Item
                        label={item.topic}
                        value={item.id}
                        key={index}
                      />
                    );
                  })}
                </Picker>
              </View>
              {/* end select */}
              <View style={styles.action}>
                <TouchableOpacity
                  onPress={() => {
                    pickImage();
                  }}
                >
                  <LinearGradient
                    colors={[colors.white, colors.white]}
                    style={{
                      flexDirection: "row",
                      borderColor: colors.white,
                      marginTop: 10,
                    }}
                  >
                    <Icon
                      name="image"
                      style={{ marginRight: 5 }}
                      color={colors.primary}
                      size={25}
                    />
                    <Text
                      style={[
                        styles.textSign,
                        { color: colors.primary, fontWeight: "400" },
                      ]}
                    >
                      Add Image
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
                {pickedimage.preview === true && (
                  <Image
                    source={{ uri: pickedimage.uri }}
                    style={[styles.iconButton, { width: 60, height: 60 }]}
                  />
                )}
              </View>
              <View>
                <TouchableOpacity
                  onPress={() => {
                    handlePostQuestion(forumsubject.split("~")[0], data.topic);
                  }}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.primary_dark]}
                    style={{
                      flexDirection: "row",
                      marginTop: 10,
                      borderRadius: 6,
                      width: "100%",
                    }}
                  >
                    <Text
                      style={[
                        styles.textSign,
                        {
                          color: colors.white,
                          fontWeight: "200",
                          fontSize: 12,
                          padding: 10,
                        },
                      ]}
                    >
                      Post Your Question
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
            <View>
              <FlatList
                data={forum}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
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
                  No discussions found. Please check back later
                </Text>
              </View>
            )}
          </View>
          <View style={{ marginTop: 40 }}></View>
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
  qtitle: {
    color: colors.black,
    fontSize: 16,
  },
  action: {
    flexDirection: "row",
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
    paddingBottom: 5,
  },
  textInput: {
    flex: 1,
    marginTop: Platform.OS === "ios" ? 0 : -12,
    paddingLeft: 10,
    height: 50,
    // textAlign: "center",
    color: "#05375a",
  },
  answer: {
    fontSize: 12,
    lineHeight: 14,
    color: colors.black_light,
    // width: "80%",
  },
  answerTitle: {
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 14,
    color: colors.primary,
  },
  meta: {
    color: colors.black_light,
    textTransform: "capitalize",
    fontSize: 10,
  },
  qSubject: {
    fontSize: 9,
    fontWeight: "300",
    textTransform: "capitalize",
    lineHeight: 14,
    color: colors.secondary,
  },
  qTopic: {
    fontSize: 9,
    lineHeight: 14,
    color: colors.black_light,
    fontWeight: "300",
    textTransform: "capitalize",
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
  caption: {
    fontSize: 14,
    lineHeight: 14,
  },
  signIn: {
    width: "50%",
    height: 30,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  signInHalf: {
    width: "100%",
    height: 30,
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    borderColor: colors.primary,
    borderWidth: 1,
    marginTop: 0,
  },
  textSign: {
    fontSize: 18,
    fontWeight: "bold",
  },
  iconButton: {
    marginRight: 10,
    color: colors.secondary,
  },
});

export default ForumScreen;
