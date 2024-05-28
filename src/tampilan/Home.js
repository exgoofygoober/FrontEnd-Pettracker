/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios";
import L from "leaflet";
import "leaflet.fullscreen";
import "leaflet.fullscreen/Control.FullScreen.css";
import "leaflet/dist/leaflet.css";
import React, { useEffect, useRef, useState } from "react";
import { Card, Container, Row } from "react-bootstrap";
import IconPengirim from "../assets/images.png";
import IconPenerima from "../assets/images2.png";
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
  const [currentPage, setCurrentPage] = useState(0);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  

  const fetchData = async (page) => {
    try {
      const response = await axios.get(
        `https://backend-pettracker.vercel.app/lora/limitLora?limit=1`
      );
      if (response.data.length > 0) {
        setSensorData((prevData) => [...prevData, ...response.data]);
        console.log("Total data fetched:", response.data.length);
      }
    } catch (error) {
      console.error("Error fetching sensor data:", error);
    }
  };

  const openGoogleMaps = () => {
    const coords = getLatestCoordinates();
    if (coords) {
      const { latitude, longitude } = coords;
      const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
      window.open(url, "_blank");
    } else {
      alert("No valid coordinates available");
    }
  };

  const getLatestCoordinates = () => {
    if (sensorData.length > 0) {
      const latestData = sensorData[sensorData.length - 1];
      const gps = parseGPSData(latestData.loraData);
      if (
        !isNaN(parseFloat(gps.latitude)) &&
        !isNaN(parseFloat(gps.longitude))
      ) {
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
      const parsedLatitude = parseFloat(latitude);
      const parsedLongitude = parseFloat(longitude);

      if (!isNaN(parsedLatitude) && !isNaN(parsedLongitude)) {
        const parsedDate = new Date(datetime).toLocaleString();
        return {
          latitude: parsedLatitude,
          longitude: parsedLongitude,
          datetime: parsedDate,
        };
      } else {
        console.error("Invalid GPS coordinates:", latitude, longitude);
        return { latitude: "NaN", longitude: "NaN", datetime: "Invalid" };
      }
    }
    return { latitude: "NaN", longitude: "NaN", datetime: "Invalid" };
  };

  useEffect(() => {
    fetchData(currentPage);

    const interval = setInterval(() => {
      setCurrentPage((prevPage) => prevPage + 1);
    }, 15000); //delay 15 detik

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchNextPage = async () => {
      await fetchData(currentPage);
    };

    if (currentPage > 0) {
      fetchNextPage();
    }
  }, [currentPage]);

  const uniqueCoordinates = new Set();

  useEffect(() => {
    if (sensorData.length > 0 && mapRef.current) {
      console.log("Sensor data:", sensorData);
      const coords = getLatestCoordinates();
      if (coords) {
        const { latitude, longitude } = coords;
        const map = mapRef.current;
        map.setView([latitude, longitude], 18);

        const customIcon = L.icon({
          iconUrl: IconPengirim,
          iconSize: [50, 50],
          iconAnchor: [25, 37],
          popupAnchor: [5, -34],
        });

        markersRef.current.forEach((marker) => map.removeLayer(marker));
        markersRef.current = [];

        const latestData = sensorData[0]; 
        const latestGPS = parseGPSData(latestData.loraData);
        if (
          !isNaN(parseFloat(latestGPS.latitude)) &&
          !isNaN(parseFloat(latestGPS.longitude))
        )
        // {
        //   if (markersRef.current.length === 0) {
        //     const startMarker = L.marker(
        //       [parseFloat(latestGPS.latitude), parseFloat(latestGPS.longitude)],
        //       {
        //         icon: L.icon({
        //            iconUrl: IconPenerima, 
        //            iconSize: [50, 50]
        //           }) }
        //     ).addTo(map);

        //     startMarker.bindPopup(
        //       `Latitude: ${latestGPS.latitude}<br>Longitude: ${
        //         latestGPS.longitude
        //       }<br>Date & Time: ${new Date(
        //         latestData.createdAt
        //       ).toLocaleString()}`
        //     );
        //     markersRef.current.push(startMarker);
        //   }
        // }

        sensorData.forEach((data) => {
          const gps = parseGPSData(data.loraData);
          if (
            !isNaN(parseFloat(gps.latitude)) &&
            !isNaN(parseFloat(gps.longitude))
          ) {
            const coordinateKey = `${gps.latitude},${gps.longitude}`;
            if (!uniqueCoordinates.has(coordinateKey)) {
              const marker = L.marker(
                [parseFloat(gps.latitude), parseFloat(gps.longitude)],
                { icon: customIcon }
              ).addTo(map);

              marker.bindPopup(
                `Latitude: ${gps.latitude}<br>Longitude: ${
                  gps.longitude
                }<br>Date & Time: ${new Date(data.createdAt).toLocaleString()}`
              );
              markersRef.current.push(marker);
              uniqueCoordinates.add(coordinateKey);
            }
          }
        });
      }
    }
  }, [sensorData]);

  useEffect(() => {
    if (sensorData.length > 0 && !mapRef.current) {
      const coords = getLatestCoordinates();
      if (coords) {
        const { latitude, longitude } = coords;
        const map = L.map("map").setView([latitude, longitude], 18);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
          maxZoom: 30,
        }).addTo(map);

        L.control
          .fullscreen({
            position: "topleft",
            title: "Show me the fullscreen!",
            titleCancel: "Exit fullscreen mode",
            forceSeparateButton: true,
            forcePseudoFullscreen: true,
          })
          .addTo(map);

        map.on("enterFullscreen", function () {
          console.log("entered fullscreen");
        });

        map.on("exitFullscreen", function () {
          console.log("exited fullscreen");
        });

        const customControl = L.Control.extend({
          options: { position: "bottomleft" },
          onAdd: function () {
            const container = L.DomUtil.create(
              "div",
              "leaflet-bar leaflet-control leaflet-control-custom"
            );
            container.innerHTML =
              '<button class="btn btn-primary btn-sm">Rute</button>';

            container.onclick = function () {
              openGoogleMaps();
            };

            return container;
          },
        });

        map.addControl(new customControl());
        map.setMaxZoom(20);
        mapRef.current = map;
      }
    }
  }, [sensorData]);

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
