import React from "react";
import { Pressable, Text, StyleSheet, View } from "react-native";

const FilterButton = ({ onPress, title, filtered }) => {
  return (
    <View>
      {!filtered ? (
        <Pressable onPress={onPress} style={styles.unfilteredBtn}>
          <Text style={styles.unfilteredTitle}>Filter</Text>
        </Pressable>
      ) : (
        <Pressable onPress={onPress} style={styles.filteredBtn}>
          <Text style={styles.filteredTitle}>Filtered</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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

export default FilterButton;
