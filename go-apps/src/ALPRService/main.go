package main

import (
	"fmt"
	"ALPRService/Config"
	"os"
)
func main() {
	err := config.Init()
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
	AlprCloudConfig := config.Getconfig()
	fmt.Println("URL: " + AlprCloudConfig.Settings.AlprCloud.URL)
}
