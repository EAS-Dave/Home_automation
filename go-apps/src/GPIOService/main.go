package main

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"GPIOService/Config"
	//"fmt"
	"strconv"
	// "time"
	"github.com/stianeikeland/go-rpio"
)
type Response struct {
	Address int	`json:"address"`
	Status int `json:"status"`
}
func main(){
	r := NewRouter()
  	r.Run(":8026")
}
func InitiateConfig(c *gin.Context){
	err := config.Init()
	if err != nil {
		c.String(http.StatusOK, "Unable to Open Config!", err.Error())
	}
	GpioSettings := config.Getconfig()
	c.JSON(http.StatusOK, GpioSettings)
}
func NewRouter() *gin.Engine {
	router := gin.New()
	router.Use(gin.Logger())
	router.Use(gin.Recovery())
	router.GET("/setGPIO/address/:address/status/:status",SetGPIO)
	router.GET("/readGPIO/address/:address",ReadGPIO)
	router.GET("/showConfig",InitiateConfig)
	return router
  }

func SetGPIO(c *gin.Context) {
	address,_ := strconv.Atoi(c.Param("address"))
	status := c.Param("status")
	var resp Response

	//c.JSON(http.StatusOK, gin.H{"address":address, "status":status})
	err :=rpio.Open()
	if err != nil {
		//panic (c.String ("Unable to Open GPIO!", err.Error()))
		c.String(http.StatusOK, "Unable to Open GPIO!", err.Error())
	}
	defer rpio.Close()
	
	pin := rpio.Pin(address)
	resp.Address = address
	if status == "on"{
		pin.High()
	}
	if status == "off"{
		pin.Low()
	}
	res := pin.Read()
	if res == rpio.High{
		resp.Status = 1
	}else {
		resp.Status = 0
		//c.JSON(http.StatusOK, gin.H{ "status":ret})
	}
	c.JSON(http.StatusOK, resp)
	pin.Output()
  }
  //Read GPIO passing in Pin number, returning pin state
  func ReadGPIO(c *gin.Context) {
	address,_ := strconv.Atoi(c.Param("address"))
	var resp Response

	//c.JSON(http.StatusOK, gin.H{"address":address, "status":status})
	err :=rpio.Open()
	if err != nil {
		//panic (c.String ("Unable to Open GPIO!", err.Error()))
		c.String(http.StatusOK, "Unable to Open GPIO!", err.Error())
	}
	defer rpio.Close()
	
	pin := rpio.Pin(address)
	pin.Output()
	resp.Address = address
	res := pin.Read()
	if res == rpio.High{
		resp.Status = 1
	}else {
		resp.Status = 0
		//c.JSON(http.StatusOK, gin.H{ "status":ret})
	}
	c.JSON(http.StatusOK, resp)
  }