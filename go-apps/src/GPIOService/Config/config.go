package config

import (
	"encoding/json"
	"io/ioutil"
	"os"
	"errors"
)
type GPIO struct {
	Type         string   `json:"type"`
	Name         string   `json:"name"`
	ID           int      `json:"id"`
	Mode         string   `json:"mode"`
	DynamicState int      `json:"dynamic_state"`
	State        int      `json:"state"`
	Monitor      string   `json:"monitor"`
	StateText    []string `json:"state_text"`
	Timer        int      `json:"timer"`
}
type GPIOSettings struct {
	Gpios []GPIO `json:"GPIOS"`
}

var GpioSettings GPIOSettings

func Init()(error) {
	jsonFile, err := os.Open("Config/config.json")
	if err != nil {
		return errors.New("Unable to read file." + err.Error())
	}
	defer jsonFile.Close()
	byteValue, _ := ioutil.ReadAll(jsonFile)
	json.Unmarshal(byteValue, &GpioSettings)
	return nil
}
func Getconfig() (GPIOSettings){
	return GpioSettings
}