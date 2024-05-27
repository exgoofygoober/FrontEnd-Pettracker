import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.fullscreen/Control.FullScreen.css";
import "leaflet.fullscreen";
import React, { useEffect, useState } from "react";
import { Card, Container, Row } from "react-bootstrap";
import IconPengirim from "../assets/images.png";
import "../index.css";

function Home() {
  return (
    <Container>
      <h2 className="judul text-center">Pet Tracker</h2>
      <div className="mb-5">
        <DataTabel />
      </div>
    </Container>
  );
}

export default Home;

function DataTabel() {
  const [sensorData, setSensorData] = useState([]);
  const [mapInitialized, setMapInitialized] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://backend-pettracker.vercel.app/lora/limitLora?limit=1"
        );
        setSensorData(response.data);
        console.log("Total data yang terambil:", response.data.length);
      } catch (error) {
        console.error("Error fetching sensor data:", error);
        setSensorData([]);
      }
    };

    const openGoogleMaps = () => {
      const coords = getLatestCoordinates();
      if (coords) {
        const { latitude, longitude } = coords;
        const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
        window.open(url, '_blank');
      } else {
        alert("No valid coordinates available");
      }
    };
    
    const getLatestCoordinates = () => {
      if (sensorData.length > 0) {
        const latestData = sensorData[0];
        const gps = parseGPSData(latestData.loraData);
        if (!isNaN(parseFloat(gps.latitude)) && !isNaN(parseFloat(gps.longitude))) {
          return { latitude: gps.latitude, longitude: gps.longitude };
        }
      }
      return null;
    };

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

    if (!mapInitialized && sensorData.length > 0) {
      const coords = getLatestCoordinates();
      if (coords) {
        const { latitude, longitude } = coords;
        const map = L.map("map").setView([latitude, longitude], 18);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
          maxZoom: 30,
        }).addTo(map);

        L.control.fullscreen({
          position: 'topleft',
          title: 'Show me the fullscreen!',
          titleCancel: 'Exit fullscreen mode',
          forceSeparateButton: true,
          forcePseudoFullscreen: true,
        }).addTo(map);

        map.on('enterFullscreen', function () {
          console.log('entered fullscreen');
        });

        map.on('exitFullscreen', function () {
          console.log('exited fullscreen');
        });

        const customIcon = L.icon({
          iconUrl: IconPengirim,
          iconSize: [50, 50],
          iconAnchor: [25, 37],
          popupAnchor: [5, -34],
        });

        sensorData.forEach((data) => {
          const gps = parseGPSData(data.loraData);
          if (!isNaN(parseFloat(gps.latitude)) && !isNaN(parseFloat(gps.longitude))) {
            const marker = L.marker(
              [parseFloat(gps.latitude), parseFloat(gps.longitude)],
              { icon: customIcon }
            ).addTo(map);

            marker.bindPopup(
              `Latitude: ${gps.latitude}<br>Longitude: ${gps.longitude}<br>Date & Time: ${new Date(data.createdAt).toLocaleString()}`
            );
          }
        });

        const customControl = L.Control.extend({
          options: { position: 'bottomleft' },
          onAdd: function () {
            const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
            container.innerHTML = '<button class="btn btn-primary btn-sm">Rute</button>';

            container.onclick = function () {
              openGoogleMaps();
            };

            return container;
          }
        });

        map.addControl(new customControl());
        map.setMaxZoom(20);
        setMapInitialized(true);
      }
    }
    
    fetchData();

    const interval = setInterval(fetchData, 1000); // Polling every 1 second

    return () => clearInterval(interval);
  }, [sensorData, mapInitialized]);

  return (
    <Row className="justify-content-md-center">
      <div className="product-catagories-wrapper pt-3">
        <Container>
          <div className="product-catagory-wrap">
            <Container>
              <Card className="login">
                <div id="map"></div>
              </Card>
            </Container>
          </div>
        </Container>
      </div>
    </Row>
  );
}
