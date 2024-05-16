import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useEffect, useState } from "react";
import { Button, Card, Container, Row } from "react-bootstrap";

import blueMarkerIcon from "../assets/images.jpeg";

function Home() {
  return (
    <Container>
      <h2 className="judul text-center">Pet Tracker</h2>
      <div className=" mb-5">
        <DataTabel />
      </div>
    </Container>
  );
}

export default Home;

export function DataTabel() {
  const [sensorData, setSensorData] = useState([]);
  const [mapInitialized, setMapInitialized] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://backend-pettracker.vercel.app/lora/limitLora?limit=2"
        );
        setSensorData(response.data);
        console.log("Total data yang terambil:", response.data.length);
      } catch (error) {
        console.error("Error fetching sensor data:", error);
        setSensorData([]);
      }
    };

    fetchData();
  }, []);

  const parseGPSData = (loraData) => {
    const gpsIndex = loraData.indexOf("GPS Data:");
    if (gpsIndex !== -1) {
      const gpsString = loraData.substring(gpsIndex + 10).trim();
      const [latitude, longitude, datetime] = gpsString.split(",");
      const parsedDate = new Date(datetime).toLocaleString();
      return { latitude, longitude, datetime: parsedDate };
    }
    return { latitude: "NaN", longitude: "NaN", datetime: "Invalid" };
  };

  useEffect(() => {
    if (!mapInitialized && sensorData.length > 0) {
      const map = L.map("map").setView([-6.866059, 107.57455], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      const blueIcon = L.icon({
        iconUrl: blueMarkerIcon,
        iconSize: [15, 15],
        iconAnchor: [15, 50],
        popupAnchor: [1, -34],
      });
      sensorData.forEach((data) => {
        const gps = parseGPSData(data.loraData);
        if (
          !isNaN(parseFloat(gps.latitude)) &&
          !isNaN(parseFloat(gps.longitude))
        ) {
          const marker = L.marker(
            [parseFloat(gps.latitude), parseFloat(gps.longitude)],
            {
              icon: blueIcon,
            }
          ).addTo(map);

          marker.bindPopup(
            `Latitude: ${gps.latitude}<br>Longitude: ${
              gps.longitude
            }<br>Date & Time: ${new Date(data.createdAt).toLocaleString()}`
          );
        }
      });

      setMapInitialized(true);
    }
  }, [sensorData, mapInitialized]);

  const toggleFullScreen = () => {
    const mapElement = document.getElementById("map");
    if (!document.fullscreenElement) {
      mapElement.requestFullscreen().catch((err) => {
        console.error(
          `errorrrrrrr ${err.message}`
        );
      });
    } else {
      document.exitFullscreen();
    }
  };

return (
  <Row className="justify-content-md-center">
    <div className="product-catagories-wrapper pt-3">
      <Container>
        <div className="product-catagory-wrap">
          <Container>
            <Card className="login">
              <div id="map" style={{ height: "300px", width: "100%" }}></div>
              <div className="text-center mt-3">
                <Button onClick={toggleFullScreen}>View on Fullscreen</Button> 
              </div>
            </Card>
          </Container>
        </div>
      </Container>
    </div>
  </Row>
);

}