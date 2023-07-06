import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Platform,
  FlatList,
  Alert,
  Animated,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import moment from "moment";
import Settings from "./Settings.js";
import { Auth } from "aws-amplify";
import { EB_URL } from "@env";

const Profile = ({ route, navigation }) => {
  const [pageLoading, setPageLoading] = useState(true);
  const [postedSelected, setPostedSelected] = useState(true);
  const [joinedSelected, setJoinedSelected] = useState(false);
  const [userData, setUserData] = useState(null);
  const [userGames, setUserGames] = useState([]);
  const [joinedGames, setJoinedGames] = useState([]);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [deleteButtonDisabled, setDeleteButtonDisabled] = useState(false);

  const { profileUserId, currentUserId, userLevel } = route.params;

  const signOut = async () => {
    try {
      await Auth.signOut();
    } catch (error) {
      console.log("error signing out: ", error);
    }
  };

  const handlePosted = () => {
    setJoinedSelected(false);
    setPostedSelected(true);
  };
  const handleJoined = () => {
    setPostedSelected(false);
    setJoinedSelected(true);
  };

  const timeFormatter = (timeStr) => {
    const [hour, minute] = timeStr.split(":");
    // Convert military time to 12-hour time
    const hour12 = (hour % 12 || 12).toString();
    // Determine AM/PM suffix
    const suffix = hour < 12 ? "AM" : "PM";
    // Format the time with the suffix
    const formattedTime = `${hour12}:${minute.replace(/:00$/, "")}${suffix}`;

    return formattedTime;
  };

  const deleteGame = async (gameId) => {
    try {
      await fetch(`${EB_URL}/deleteGame/${gameId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = (gameId) => {
    Alert.alert(
      "Delete Game",
      "Are you sure you want to delete this game? This action cannot be reversed.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteGame(gameId);
            getUserGames();
          },
        },
      ]
    );
  };

  const getUserGames = async () => {
    try {
      const response = await fetch(`${EB_URL}/user/${profileUserId}`, {
        credentials: "include",
      });
      const userData = await response.json();
      setUserGames(userData.games);
    } catch (error) {
      console.error(error);
    }
  };

  const getJoinedGames = async () => {
    try {
      const response = await fetch(`${EB_URL}/user/${profileUserId}`, {
        credentials: "include",
      });
      const userData = await response.json();
      setJoinedGames(userData.joins);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    try {
      const apiCall = async () => {
        const response = await fetch(`${EB_URL}/user/${profileUserId}`, {
          credentials: "include",
        });
        const userData = await response.json();

        setUserData({
          id: userData.id,
          userName: userData.userName,
          userLevel: userData.userLevel,
        });
        setUserGames(userData.games);
        setJoinedGames(userData.joins);
        setPageLoading(false);
      };
      apiCall();
    } catch (error) {
      console.error(error);
    }
  }, [profileUserId]);

  function getJoinIdByUserId(joins, userId) {
    const foundJoin = joins.find((join) => join.user.id == userId);
    return foundJoin ? foundJoin.id : null;
  }
  const unjoin = async (joinId) => {
    try {
      await fetch(`${EB_URL}/deleteJoin/${joinId}`, {
        method: "DELETE",
      });
      getUserGames();
      getJoinedGames();
    } catch (error) {
      console.error(error);
    }
  };
  const handleUnjoin = (joins, userId) => {
    Alert.alert("Unjoin Game", "Unjoin this game?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Unjoin",
        style: "destructive",
        onPress: () => {
          unjoin(getJoinIdByUserId(joins, userId));
          getJoinedGames();
        },
      },
    ]);
  };
  const join = async (userId, gameId) => {
    try {
      await fetch(`${EB_URL}/addJoin/${userId}/${gameId}`, {
        method: "PUT",
      });
      getUserGames();
      getJoinedGames();
    } catch (error) {
      console.error(error);
    }
  };
  const handleJoin = (userId, gameId) => {
    Alert.alert("Join Game", "Join this game?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Join",
        onPress: () => {
          join(userId, gameId);
        },
      },
    ]);
  };
  const handleSignOut = () => {
    Alert.alert("Sign Out", "Would you like to sign out?", [
      {
        text: "Cancel",
        style: "destructive",
      },
      {
        text: "Yes",
        onPress: () => {
          signOut();
        },
      },
    ]);
  };

  const FadeInView = (props) => {
    const fadeAnim = useRef(new Animated.Value(0)).current; // Initial value for opacity: 0

    useEffect(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      }).start();
    }, [fadeAnim]);

    return (
      <Animated.View // Special animatable View
        style={{
          ...props.style,
          opacity: fadeAnim, // Bind opacity to animated value
        }}
      >
        {props.children}
      </Animated.View>
    );
  };

  if (pageLoading) {
    return (
      <View style={styles.container}>
        <FadeInView style={{ marginTop: 30 }}>
          <Text
            style={{
              color: "white",
              fontSize: 40,
              textAlign: "center",
              fontFamily: "Kanit2",
            }}
          >
            Loading...
          </Text>
        </FadeInView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Settings
        visible={settingsVisible}
        setVisible={setSettingsVisible}
        userId={currentUserId}
        signOut={signOut}
        userName={userData.userName}
        userLevel={userLevel}
      />
      <View style={{ marginBottom: 20 }}>
        {Platform.OS === "ios" ? (
          <View
            style={{
              paddingTop: 50,
            }}
          >
            <View style={{ paddingTop: 20 }}>
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  fontSize: 30,
                  fontFamily: "KanitReg",
                }}
              >
                {userData.userName}
              </Text>
              <View style={{ paddingHorizontal: 50 }}>
                {userData.id == currentUserId ? (
                  <View
                    style={{
                      marginTop: 10,
                      flexDirection: "row",
                      justifyContent: "space-around",
                    }}
                  >
                    <Pressable
                      //style={styles.button}
                      onPress={() => handleSignOut()}
                    >
                      <Text style={styles.title2}>Sign Out</Text>
                    </Pressable>
                    <Pressable
                      //style={styles.button}
                      onPress={() => setSettingsVisible(true)}
                    >
                      <Text style={styles.title2}>Settings</Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
                paddingTop: 30,
                paddingBottom: 10,
              }}
            >
              {postedSelected ? (
                <Pressable style={styles.selectedButton} onPress={handlePosted}>
                  <Text style={styles.selectedTitle}>Posted</Text>
                </Pressable>
              ) : (
                <Pressable style={styles.button} onPress={handlePosted}>
                  <Text style={styles.title}>Posted</Text>
                </Pressable>
              )}
              {joinedSelected ? (
                <Pressable style={styles.selectedButton} onPress={handleJoined}>
                  <Text style={styles.selectedTitle}>Joined</Text>
                </Pressable>
              ) : (
                <Pressable style={styles.button} onPress={handleJoined}>
                  <Text style={styles.title}>Joined</Text>
                </Pressable>
              )}
            </View>
          </View>
        ) : (
          <View
            style={{
              paddingTop: 10,
            }}
          >
            <View style={{ paddingTop: 20 }}>
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  fontSize: 33,
                  fontFamily: "KanitReg",
                }}
              >
                {userData.userName}
              </Text>
            </View>
            <View style={{ paddingHorizontal: 50 }}>
              {userData.id == currentUserId ? (
                <View
                  style={{
                    marginTop: 10,
                    flexDirection: "row",
                    justifyContent: "space-around",
                  }}
                >
                  <Pressable
                    //style={styles.button}
                    onPress={() => setSettingsVisible(true)}
                  >
                    <Text style={styles.title2}>Settings</Text>
                  </Pressable>
                  <Pressable
                    //style={styles.button}
                    onPress={() => handleSignOut()}
                  >
                    <Text style={styles.title2}>Sign Out</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingTop: 25,
                paddingBottom: 5,
                paddingHorizontal: 50,
              }}
            >
              {postedSelected ? (
                <Pressable style={styles.selectedButton} onPress={handlePosted}>
                  <Text style={styles.selectedTitle}>Posted</Text>
                </Pressable>
              ) : (
                <Pressable style={styles.button} onPress={handlePosted}>
                  <Text style={styles.title}>Posted</Text>
                </Pressable>
              )}
              {joinedSelected ? (
                <Pressable style={styles.selectedButton} onPress={handleJoined}>
                  <Text style={styles.selectedTitle}>Joined</Text>
                </Pressable>
              ) : (
                <Pressable style={styles.button} onPress={handleJoined}>
                  <Text style={styles.title}>Joined</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}
      </View>
      <View style={styles.gameContainer}>
        {postedSelected ? (
          <View>
            {userGames.length > 0 ? (
              <FlatList
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                data={userGames}
                renderItem={({ item }) => {
                  return (
                    <View style={styles.gameCard}>
                      <Text style={styles.gamecardSportText}>{item.sport}</Text>
                      <View style={styles.dividerLine}></View>
                      <Text style={styles.gamecardSecondaryText}>
                        {item.surface}
                      </Text>
                      {item.facility.id == 2 ? (
                        <Text style={styles.gamecardTertiaryText}>
                          {item.number} {item.street} {item.city}, {item.state}
                        </Text>
                      ) : (
                        <Text style={styles.gamecardTertiaryText}>
                          {item.facility.name}
                        </Text>
                      )}
                      <Text style={styles.gamecardText}>
                        Playing on {moment.utc(item.date).format("M/DD")} @{" "}
                        {timeFormatter(item.time)}
                      </Text>
                      <Text style={styles.gamecardText}>{item.details}</Text>
                      {item.joins.length ? (
                        <Text style={styles.gamecardText}>
                          Playing: {item.joins.length}
                        </Text>
                      ) : null}
                      <View style={styles.dividerLine}></View>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          marginTop: 10,
                        }}
                      >
                        <View style={{ flexDirection: "row" }}>
                          <Pressable
                            style={{
                              borderWidth: 1,
                              borderRadius: 5,
                              backgroundColor: "#032b43",
                              borderColor: "#032b43",
                              marginRight: 10,
                              paddingHorizontal: 10,
                              paddingVertical: 5,
                            }}
                            onPress={() => {
                              navigation.navigate("Game", {
                                gameId: item.id,
                                currentUserId: currentUserId,
                              });
                            }}
                          >
                            <Text
                              style={{
                                color: "white",

                                fontSize: 18,
                              }}
                            >
                              More
                            </Text>
                          </Pressable>
                          <View>
                            {currentUserId ? (
                              <View>
                                {userData.id == currentUserId ? null : (
                                  <View>
                                    {getJoinIdByUserId(
                                      item.joins,
                                      currentUserId
                                    ) != null ? (
                                      <Pressable
                                        style={{
                                          borderWidth: 2,
                                          borderRadius: 5,
                                          backgroundColor: "white",
                                          borderColor: "#26A96C",
                                          marginRight: 10,
                                          paddingHorizontal: 10,
                                          paddingVertical: 5,
                                        }}
                                        onPress={() =>
                                          handleUnjoin(
                                            item.joins,
                                            currentUserId
                                          )
                                        }
                                      >
                                        <Text
                                          style={{
                                            color: "#26A96C",
                                            fontSize: 18,
                                            fontFamily: "KanitReg",
                                          }}
                                        >
                                          Joined
                                        </Text>
                                      </Pressable>
                                    ) : (
                                      <Pressable
                                        style={{
                                          borderWidth: 1,
                                          borderRadius: 5,
                                          backgroundColor: "#26A96C",
                                          borderColor: "#26A96C",
                                          marginRight: 10,
                                          paddingHorizontal: 10,
                                          paddingVertical: 5,
                                        }}
                                        onPress={() =>
                                          handleJoin(currentUserId, item.id)
                                        }
                                      >
                                        <Text
                                          style={{
                                            color: "white",
                                            fontSize: 18,
                                            fontFamily: "KanitReg",
                                          }}
                                        >
                                          Join
                                        </Text>
                                      </Pressable>
                                    )}
                                  </View>
                                )}
                              </View>
                            ) : null}
                          </View>
                        </View>
                        <View>
                          {userData.id == currentUserId ? (
                            <Pressable
                              disabled={deleteButtonDisabled}
                              style={{
                                borderWidth: 1,
                                borderRadius: 5,
                                backgroundColor: "#d00000",
                                borderColor: "#d00000",
                                marginRight: 10,
                                paddingHorizontal: 10,
                                paddingVertical: 5,
                              }}
                              onPress={() => {
                                handleDelete(item.id);
                              }}
                            >
                              <Text
                                style={{
                                  color: "white",
                                  paddingHorizontal: 3,
                                  fontSize: 18,
                                  fontWeight: "bold",
                                  textAlign: "center",
                                }}
                              >
                                X
                              </Text>
                            </Pressable>
                          ) : null}
                        </View>
                      </View>
                    </View>
                  );
                }}
              />
            ) : (
              <View style={{ paddingTop: 30 }}>
                <Text
                  style={{
                    color: "white",
                    textAlign: "center",
                    fontSize: 30,
                  }}
                >
                  No games posted
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View>
            {joinedGames.length > 0 ? (
              <FlatList
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                data={joinedGames}
                renderItem={({ item }) => {
                  return (
                    <View style={styles.gameCard}>
                      <Text style={styles.gamecardTertiaryText}>
                        Playing on {moment.utc(item.game.date).format("M/DD")} @{" "}
                        {timeFormatter(item.game.time)}
                      </Text>
                      <View style={styles.dividerLine}></View>
                      <Text style={styles.gamecardTertiaryText}>
                        {item.game.sport}
                      </Text>
                      <Text style={styles.gamecardText}>
                        {item.game.surface}
                      </Text>
                      {item.game.facility.id == 2 ? (
                        <Text style={styles.gamecardText}>
                          {item.game.number} {item.game.street} {item.game.city}
                          , {item.game.state}
                        </Text>
                      ) : (
                        <Text style={styles.gamecardText}>
                          {item.game.facility.name}
                        </Text>
                      )}
                      {item.game.joins.length ? (
                        <Text style={styles.gamecardText}>
                          Playing: {item.game.joins.length}
                        </Text>
                      ) : null}
                      <Pressable
                        onPress={() => {
                          navigation.navigate("Profile", {
                            profileUserId: item.game.user.id,
                            currentUserId: currentUserId,
                          });
                        }}
                      >
                        <Text style={styles.gamecardLinkText}>
                          By: {item.game.user.userName}
                        </Text>
                      </Pressable>
                      <View style={styles.dividerLine}></View>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          marginTop: 10,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                          }}
                        >
                          <Pressable
                            style={{
                              borderWidth: 1,
                              borderRadius: 5,
                              backgroundColor: "#032b43",
                              borderColor: "#032b43",
                              marginRight: 10,
                              paddingHorizontal: 10,
                              paddingVertical: 5,
                            }}
                            onPress={() => {
                              navigation.navigate("Game", {
                                gameId: item.game.id,
                                currentUserId: currentUserId,
                              });
                            }}
                          >
                            <Text
                              style={{
                                color: "white",
                                fontFamily: "KanitReg",
                                fontSize: 18,
                              }}
                            >
                              More
                            </Text>
                          </Pressable>
                          <View>
                            {currentUserId ? (
                              <View>
                                <View>
                                  {getJoinIdByUserId(
                                    item.game.joins,
                                    currentUserId
                                  ) != null ? (
                                    <Pressable
                                      style={{
                                        borderWidth: 2,
                                        borderRadius: 5,
                                        backgroundColor: "white",
                                        borderColor: "#26A96C",
                                        marginRight: 10,
                                        paddingHorizontal: 10,
                                        paddingVertical: 5,
                                      }}
                                      onPress={() =>
                                        handleUnjoin(
                                          item.game.joins,
                                          currentUserId
                                        )
                                      }
                                    >
                                      <Text
                                        style={{
                                          color: "#26A96C",
                                          fontSize: 18,
                                          fontFamily: "KanitReg",
                                        }}
                                      >
                                        Joined
                                      </Text>
                                    </Pressable>
                                  ) : (
                                    <Pressable
                                      style={{
                                        borderWidth: 1,
                                        borderRadius: 5,
                                        backgroundColor: "#26A96C",
                                        borderColor: "#26A96C",
                                        marginRight: 10,
                                        paddingHorizontal: 10,
                                        paddingVertical: 5,
                                      }}
                                      onPress={() =>
                                        handleJoin(currentUserId, item.game.id)
                                      }
                                    >
                                      <Text
                                        style={{
                                          color: "white",
                                          fontSize: 18,
                                          fontFamily: "KanitReg",
                                        }}
                                      >
                                        Join
                                      </Text>
                                    </Pressable>
                                  )}
                                </View>
                              </View>
                            ) : null}
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                }}
              />
            ) : (
              <View style={{ paddingTop: 30 }}>
                <Text
                  style={{
                    color: "white",
                    textAlign: "center",
                    fontSize: 30,
                  }}
                >
                  No games joined
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#032b43",
    paddingBottom: 30,
    ...Platform.select({
      android: {
        paddingTop: 50,
      },
    }),
  },
  button: {
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 20, // This value will make it oval
    paddingHorizontal: 16,
    paddingVertical: 1,
    backgroundColor: "#032b43",
    justifyContent: "center",
  },
  button2: {
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 20, // This value will make it oval
    paddingHorizontal: 16,
    paddingVertical: 1,
    backgroundColor: "#032b43",
  },
  selectedButton: {
    borderWidth: 1,
    borderColor: "#032b43",
    borderRadius: 20, // This value will make it oval
    paddingHorizontal: 16,
    paddingVertical: 1,
    backgroundColor: "white",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    color: "white",
    fontFamily: "KanitReg",
  },
  title2: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    fontFamily: "KanitReg",
  },
  selectedTitle: {
    fontSize: 22,
    color: "#032b43",
    fontFamily: "KanitReg",
  },
  gameContainer: {
    flex: 1,
    paddingHorizontal: 40,
    paddingVertical: 5,
    paddingBottom: 30,
  },
  gameCard: {
    flexDirection: "column",
    padding: 10,
    backgroundColor: "white",
    borderColor: "white",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20,
  },
  gamecardText: {
    fontFamily: "KanitLight",
    fontSize: 18,
    color: "black",
  },
  gamecardSportText: {
    fontFamily: "Kanit2",
    fontSize: 20,
    color: "black",
  },
  gamecardSecondaryText: {
    fontFamily: "KanitMed",
    fontSize: 19,
    color: "black",
  },
  gamecardLinkText: {
    fontFamily: "KanitReg",
    fontSize: 20,
    color: "black",
  },
  gamecardTertiaryText: {
    fontFamily: "KanitReg",
    fontSize: 19,
    color: "black",
  },
  dividerLine: {
    borderBottomColor: "gray",
    borderBottomWidth: 1,
    marginHorizontal: 3,
    marginBottom: 5,
  },
});
