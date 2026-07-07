package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
)

func helloHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Hello World",
	})
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	http.HandleFunc("/api/hello", helloHandler)

	log.Println("Server running on http://localhost:" + port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
