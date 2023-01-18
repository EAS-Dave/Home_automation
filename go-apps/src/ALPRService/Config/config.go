package config

import (
	"encoding/json"
	"io/ioutil"
	"os"
	"errors"
)

type ALPRSettings struct {
	Settings struct {
		Port      string `json:"port"`
		Path      string `json:"path"`
		AlprCloud struct {
			URL              string `json:"url"`
			SecretKey        string `json:"secret_key"`
			RecognizeVehicle int    `json:"recognize_vehicle"`
			Country          string `json:"country"`
			ReturnImage      int    `json:"return_image"`
			Topn             int    `json:"Topn"`
			State            string `json:"state"`
			ImagePath        string `json:"image_path"`
		} `json:"ALPR_CLOUD"`
	} `json:"SETTINGS"`
}

var AlprSettings ALPRSettings

func Init() (error) {
	jsonFile, err := os.Open("config.json")
	if err != nil {
		return errors.New("Unable read file.")
	}
	defer jsonFile.Close()
	byteValue, _ := ioutil.ReadAll(jsonFile)
	json.Unmarshal(byteValue, &AlprSettings)
	return nil
}
func Getconfig() (ALPRSettings){
	return AlprSettings
}
