import { StyleSheet, Text, View, Pressable } from "react-native";
import React from "react";

const JoinButton = ({ id, onPress, joins, joined, userId }) => {
  const handlePress = () => {
    onPress(id);
  };

  function getJoinIdByUserId(joins, userId) {
    const foundJoin = joins.find((join) => join.user.id === userId);
    return foundJoin ? foundJoin.id : null;
  }
  return (
    <View>
      {joined ? (
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
          id={getJoinIdByUserId(joins, userId)}
          onPress={(e) => {
            console.log(e.target.id);
            deleteJoin({
              variables: {
                id: e.target.id,
              },
            });
          }}
        >
          <Text
            style={{
              color: "#26A96C",
              fontSize: 18,
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
          onPress={(e) => {
            console.log(e.target.id);
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 18,
            }}
          >
            Join
          </Text>
        </Pressable>
      )}
    </View>
  );
};

export default JoinButton;

const styles = StyleSheet.create({});
