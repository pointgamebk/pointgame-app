import { StyleSheet, Text, View } from "react-native";
import React from "react";
import moment from "moment";

const Comment = ({ item }) => {
  return (
    <View
      style={{
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 10,
        backgroundColor: "white",
        marginBottom: 15,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <View>
          <Text
            style={{
              color: "black",
              fontSize: 18,
              fontFamily: "KanitReg",
            }}
          >
            {item.user.userName}
          </Text>
        </View>
        <View>
          <Text
            style={{
              color: "black",
              fontSize: 18,
              fontFamily: "KanitLight",
            }}
          >
            {moment(item.createdAt).format("M/DD")}{" "}
            {moment(item.createdAt).format("h:mm A")}
          </Text>
        </View>
      </View>
      <View>
        <View style={styles.dividerLine}></View>
        <Text
          style={{ color: "black", fontSize: 19, fontFamily: "KanitLight" }}
        >
          {item.text}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dividerLine: {
    borderBottomColor: "gray",
    borderBottomWidth: 1,
    marginHorizontal: 7,
    marginBottom: 10,
  },
});

export default Comment;
