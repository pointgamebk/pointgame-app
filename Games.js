import {
  FlatList,
  PanResponder,
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import moment from "moment";
import { EB_URL } from "@env";

const Games = ({
  gamesInState,
  getGames,
  navigation,
  userId,
  userLevel,
  timeFormatter,
}) => {
  let timer = useRef(null);
  const [loading, setLoading] = useState(false);
  const [joinButtonDisabled, setJoinButtonDisabled] = useState(false);

  const handlePanResponderGrant = (e, gestureState) => {
    // This callback is triggered when the touch gesture starts
    // You can start a timer here to detect long hold
    timer.current = setTimeout(() => {
      // Perform the action for long hold
      // For example, reload the FlatList data
      reloadFlatListData();
    }, 2000); // Change the duration according to your requirements
  };

  const handlePanResponderRelease = () => {
    // This callback is triggered when the touch gesture is released
    // Clear the timer if it's still running
    setLoading(false);
    clearTimeout(timer.current);
  };

  const handlePanResponderTerminate = () => {
    // This callback is triggered when the touch gesture is interrupted
    // Clear the timer if it's still running
    setLoading(false);
    clearTimeout(timer.current);
  };

  const reloadFlatListData = () => {
    // Perform the action for long hold
    // For example, reload the FlatList data
    setLoading(true);
    getGames();
    console.log("Reloading games...");
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: handlePanResponderGrant,
      onPanResponderRelease: handlePanResponderRelease,
      onPanResponderTerminate: handlePanResponderTerminate,
    })
  );

  useEffect(() => {
    return () => {
      // Clear the timer when the component unmounts
      clearTimeout(timer.current);
    };
  }, []);

  const getJoinIdByUserId = (joins, userId) => {
    const foundJoin = joins.find((join) => join.user.id == userId);
    return foundJoin ? foundJoin.id : null;
  };
  const join = async (userId, gameId) => {
    try {
      await fetch(`${EB_URL}/addJoin/${userId}/${gameId}`, {
        method: "PUT",
      });
      getGames();
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
  const unjoin = async (joinId) => {
    try {
      await fetch(`${EB_URL}/deleteJoin/${joinId}`, {
        method: "DELETE",
      });
      getGames();
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
        },
      },
    ]);
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
          },
        },
      ]
    );
  };
  const deleteGame = async (gameId) => {
    try {
      await fetch(`${EB_URL}/deleteGame/${gameId}`, {
        method: "DELETE",
      });
      getGames();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View>
      <View>
        {loading ? (
          <View style={{ padding: 20 }}>
            <Text
              style={{
                color: "white",
                textAlign: "center",
                fontSize: 25,
                fontFamily: "KanitReg",
              }}
            >
              Reloading games...
            </Text>
          </View>
        ) : null}
      </View>
      <FlatList
        {...panResponder.current.panHandlers}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        data={gamesInState}
        renderItem={({ item }) => {
          return (
            <View style={styles.gameCard}>
              <Text style={styles.gamecardSportText}>{item.sport}</Text>
              <View style={styles.dividerLine}></View>
              <Text style={styles.gamecardSecondaryText}>{item.surface}</Text>
              {item.facilityId == 2 ? (
                <Text style={styles.gamecardTertiaryText}>
                  {item.number} {item.street} {item.city}, {item.state}
                </Text>
              ) : (
                <Text style={styles.gamecardTertiaryText}>
                  {item.facility.name}
                </Text>
              )}
              <Text style={styles.gamecardTertiaryText}>
                {moment.utc(item.date).format("M/DD")} @{" "}
                {timeFormatter(item.time)}
              </Text>
              <Text style={styles.gamecardText}>
                {item.distance} miles away
              </Text>
              <Text style={styles.gamecardText}>{item.details}</Text>
              <Pressable
                onPress={() => {
                  navigation.navigate("Profile", {
                    profileUserId: item.user.id,
                    currentUserId: userId,
                  });
                }}
              >
                <Text style={styles.gamecardLinkText}>
                  By: {item.user.userName}
                </Text>
              </Pressable>

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
                        currentUserId: userId,
                      });
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontSize: 18,
                        fontFamily: "KanitReg",
                      }}
                    >
                      More
                    </Text>
                  </Pressable>
                  <View>
                    {userId ? (
                      <View>
                        {item.user.id == userId ? null : (
                          <View>
                            {getJoinIdByUserId(item.joins, userId) != null ? (
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
                                onPress={() => handleUnjoin(item.joins, userId)}
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
                                disabled={joinButtonDisabled}
                                onPress={() => handleJoin(userId, item.id)}
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
                  {userId ? (
                    <View>
                      {item.user.id == userId ||
                      userLevel == "Administrator" ? (
                        <Pressable
                          style={{
                            borderWidth: 1,
                            borderRadius: 5,
                            backgroundColor: "#d00000",
                            borderColor: "#d00000",
                            marginRight: 10,
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                          }}
                          onPress={() => handleDelete(item.id)}
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
                  ) : null}
                </View>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
};

export default Games;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#032b43",
    paddingTop: 60,
    paddingBottom: 30,
  },
  header: {
    alignContent: "center",
  },
  logoText: {
    color: "white",
    fontFamily: "Kanit",
    fontSize: 40,
    textAlign: "center",
    alignSelf: "center",
  },
  logoText2: {
    color: "white",
    fontFamily: "Kanit",
    fontSize: 20,
    textAlign: "center",
    alignSelf: "center",
  },
  aboutText: {
    color: "white",
    fontFamily: "KanitLight",
    fontSize: 20,
    textAlign: "center",
    alignSelf: "center",
  },
  headerButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    height: 60,
  },
  headerButtons2: {
    flexDirection: "row",
    justifyContent: "space-around",
    height: 60,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  gameContainer: {
    flex: 3,
    paddingHorizontal: 40,
    paddingVertical: 5,
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
  gamecardTertiaryText: {
    fontFamily: "KanitReg",
    fontSize: 19,
    color: "black",
  },

  gamecardText: {
    fontFamily: "KanitLight",
    fontSize: 18,
    color: "black",
  },
  gamecardLinkText: {
    fontFamily: "KanitReg",
    fontSize: 20,
    color: "black",
  },
  dividerLine: {
    borderBottomColor: "gray",
    borderBottomWidth: 1,
    marginHorizontal: 3,
    marginTop: 5,
    marginBottom: 5,
  },
  unfilteredBtn: {
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 20, // This value will make it oval
    paddingHorizontal: 16,
    backgroundColor: "#032b43",
    alignItems: "center",
    justifyContent: "center",
    height: "50%",
  },
  filteredBtn: {
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 20, // This value will make it oval
    paddingHorizontal: 16,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    height: "50%",
  },
  unfilteredTitle: {
    fontSize: 16,
    color: "white",
  },
  filteredTitle: {
    fontSize: 16,
    color: "#032b43",
  },
});
