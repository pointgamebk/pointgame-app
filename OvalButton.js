import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";

const OvalButton = ({ onPress, title, filtered }) => {
  return (
    <Pressable onPress={onPress} style={styles.button}>
      <Text style={styles.title}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 20, // This value will make it oval
    paddingHorizontal: 16,
    backgroundColor: "#032b43",
    alignItems: "center",
    justifyContent: "center",
    height: "50%",
  },
  title: {
    fontSize: 16,
    color: "white",
  },
});

export default OvalButton;
