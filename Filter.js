import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Modal,
  Text,
  Pressable,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

const Filter = ({
  visible,
  gamesInState,
  setGamesInState,
  setFiltered,
  setFilterVisible,
  getGames,
  games,
  sportFilterValue,
  setSportFilterValue,
  surfaceFilterValue,
  setSurfaceFilterValue,
  distanceFilterValue,
  setDistanceFilterValue,
}) => {
  const resetFilter = async () => {
    try {
      getGames();
      setSportFilterValue("");
      setSurfaceFilterValue("");
      setDistanceFilterValue(null);
      setFiltered(false);
    } catch (e) {
      console.error("there was an issue ressting the filter");
    }
  };

  const closeModal = () => {
    if (!gamesInState.length) {
      resetFilter();
      setFiltered(false);
    }
    setFilterVisible(false);
  };

  const filterGames = (games, filterType, filterValue) => {
    if (filterValue == null || filterValue == "") {
      getGames();
    }

    if (filterType == "sport") {
      setFiltered(true);
      const fGames = games.filter((game) => game.sport == filterValue);
      if (fGames.length) {
        setGamesInState(fGames);
      } else {
        setGamesInState([]);
      }
    } else if (filterType == "surface") {
      setFiltered(true);
      const fGames = games.filter((game) => game.surface == filterValue);
      if (fGames.length) {
        setFiltered(true);
        setGamesInState(fGames);
      } else {
        setGamesInState([]);
      }
    } else if (filterType == "distance") {
      setFiltered(true);
      const fGames = games.filter((game) => game.distance < filterValue);
      if (fGames.length) {
        setFiltered(true);
        setGamesInState(fGames);
      } else {
        setGamesInState([]);
      }
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      style={{ backgroundColor: "#256D1B" }}
    >
      <ScrollView
        style={{
          flex: 1,
          backgroundColor: "#256D1B",
        }}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#256D1B",
            paddingTop: 75,
            paddingBottom: 50,
          }}
        >
          {gamesInState.length == 1 ? (
            <Text
              style={{
                color: "white",
                textAlign: "center",
                fontSize: 35,
                fontFamily: "KanitReg",
              }}
            >
              {gamesInState.length} game matching
            </Text>
          ) : (
            <Text
              style={{
                color: "white",
                textAlign: "center",
                fontSize: 35,
                fontFamily: "KanitReg",
              }}
            >
              {gamesInState.length} games matching
            </Text>
          )}
          <View style={styles.hideFilter}>
            <Pressable onPress={() => closeModal()}>
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  fontSize: 20,
                  fontFamily: "KanitReg",
                }}
              >
                Hide filter menu
              </Text>
            </Pressable>
          </View>
          <View style={{ paddingHorizontal: 35 }}>
            <View>
              <Picker
                itemStyle={{
                  color: "white",
                  backgroundColor: "#256D1B",
                  fontSize: 30,
                  fontFamily: "KanitReg",
                }}
                dropdownItemStyle={{
                  color: "white",
                  backgroundColor: "#0a210f",
                  fontSize: 26,
                  fontFamily: "KanitReg",
                }}
                style={{ color: "white" }}
                dropdownIconColor="white"
                selectedValue={sportFilterValue}
                onValueChange={(itemValue, itemIndex) => {
                  setDistanceFilterValue(null);
                  setSurfaceFilterValue("");
                  setSportFilterValue(itemValue);
                  filterGames(games, "sport", itemValue);
                }}
              >
                <Picker.Item
                  label="Filter by sport"
                  value=""
                  style={{ fontSize: 30 }}
                />
                <Picker.Item
                  label="Baseball"
                  value="Baseball"
                  style={{ fontSize: 25 }}
                />
                <Picker.Item
                  label="Basketball"
                  value="Basketball"
                  style={{ fontSize: 25 }}
                />
                <Picker.Item
                  label="Football"
                  value="Football"
                  style={{ fontSize: 25 }}
                />
                <Picker.Item
                  label="Frisbee"
                  value="Frisbee"
                  style={{ fontSize: 25 }}
                />
                <Picker.Item
                  label="Golf"
                  value="Golf"
                  style={{ fontSize: 25 }}
                />
                <Picker.Item
                  label="Hockey"
                  value="Hockey"
                  style={{ fontSize: 25 }}
                />
                <Picker.Item
                  label="Kickball"
                  value="Kickball"
                  style={{ fontSize: 25 }}
                />
                <Picker.Item
                  label="Lacrosse"
                  value="Lacrosse"
                  style={{ fontSize: 25 }}
                />
                <Picker.Item
                  label="Pickleball"
                  value="Pickleball"
                  style={{ fontSize: 25 }}
                />
                <Picker.Item
                  label="Soccer"
                  value="Soccer"
                  style={{ fontSize: 25 }}
                />
                <Picker.Item
                  label="Softball"
                  value="Softball"
                  style={{ fontSize: 25 }}
                />
                <Picker.Item
                  label="Tennis"
                  value="Tennis"
                  style={{ fontSize: 25 }}
                />
                <Picker.Item
                  label="Volleyball"
                  value="Volleyball"
                  style={{ fontSize: 25 }}
                />
              </Picker>
            </View>
            <View>
              <Picker
                itemStyle={{
                  color: "white",
                  backgroundColor: "#256D1B",
                  fontSize: 30,
                  fontFamily: "KanitReg",
                }}
                dropdownItemStyle={{
                  color: "white",
                  backgroundColor: "#0a210f",
                  fontSize: 30,
                  fontFamily: "KanitReg",
                }}
                style={{ color: "white" }}
                dropdownIconColor="white"
                selectedValue={surfaceFilterValue}
                onValueChange={(itemValue, itemIndex) => {
                  setSportFilterValue("");
                  setDistanceFilterValue(null);
                  setSurfaceFilterValue(itemValue);
                  filterGames(games, "surface", itemValue);
                }}
              >
                <Picker.Item
                  label="Filter by surface"
                  value={null}
                  style={{ fontSize: 30 }}
                />
                <Picker.Item
                  label="Indoor"
                  value="Indoor"
                  style={{ fontSize: 27 }}
                />
                <Picker.Item
                  label="Outdoor"
                  value="Outdoor"
                  style={{ fontSize: 27 }}
                />
                <Picker.Item
                  label="Court (Indoor)"
                  value="Court (Indoor)"
                  style={{ fontSize: 27 }}
                />
                <Picker.Item
                  label="Court (Outdoor)"
                  value="Court (Outdoor)"
                  style={{ fontSize: 27 }}
                />
                <Picker.Item
                  label="Turf"
                  value="Turf"
                  style={{ fontSize: 27 }}
                />
              </Picker>
            </View>
            <View>
              <Picker
                itemStyle={{
                  color: "white",
                  backgroundColor: "#256D1B",
                  fontSize: 30,
                  fontFamily: "KanitReg",
                }}
                dropdownItemStyle={{
                  color: "white",
                  backgroundColor: "#256D1B",
                  fontSize: 30,
                  fontFamily: "KanitReg",
                }}
                style={{ color: "white" }}
                dropdownIconColor="white"
                selectedValue={distanceFilterValue}
                onValueChange={(itemValue, itemIndex) => {
                  setSportFilterValue("");
                  setSurfaceFilterValue("");
                  setDistanceFilterValue(itemValue);
                  filterGames(games, "distance", itemValue);
                }}
              >
                <Picker.Item
                  label="Filter by distance"
                  value={null}
                  style={{ fontSize: 30 }}
                />
                <Picker.Item
                  label="Less than 20 miles"
                  value={20}
                  style={{ fontSize: 27 }}
                />
                <Picker.Item
                  label="Less than 15 miles"
                  value={15}
                  style={{ fontSize: 27 }}
                />
                <Picker.Item
                  label="Less than 10 miles"
                  value={10}
                  style={{ fontSize: 27 }}
                />
                <Picker.Item
                  label="Less than 5 miles"
                  value={5}
                  style={{ fontSize: 27 }}
                />
              </Picker>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              paddingTop: 70,
              marginBottom: 30,
            }}
          >
            <Pressable
              onPress={() => {
                closeModal();
              }}
              style={{
                borderRadius: 5,
                borderWidth: 2,
                borderColor: "#d00000",
              }}
            >
              <Text
                style={{
                  fontSize: 25,
                  color: "white",
                  backgroundColor: "#d00000",
                  paddingHorizontal: 10,
                  textAlign: "center",
                  fontFamily: "KanitReg",
                }}
              >
                Close
              </Text>
            </Pressable>
            <Pressable
              style={{
                borderRadius: 5,
                borderWidth: 2,
                borderColor: "white",
              }}
              onPress={() => {
                resetFilter();
                setFiltered(false);
              }}
            >
              <Text
                style={{
                  fontSize: 25,
                  color: "white",
                  paddingHorizontal: 10,
                  textAlign: "center",
                  fontFamily: "KanitReg",
                }}
              >
                Reset Filter
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
};

export default Filter;

const styles = StyleSheet.create({
  hideFilter: {
    ...Platform.select({
      android: {
        marginBottom: 30,
      },
    }),
  },
});
