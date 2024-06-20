/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios";
import L from "leaflet";
import "leaflet.fullscreen";
import "leaflet.fullscreen/Control.FullScreen.css";
import "leaflet/dist/leaflet.css";
import React, { useEffect, useRef, useState } from "react";
import { Card, Container, Row } from "react-bootstrap";
import Swal from "sweetalert2";
import IconPengirim from "../assets/images.png";
import IconPengirim2 from "../assets/images2.png";
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
  const [newMarkers, setNewMarkers] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  const fetchData = async (page) => {
    try {
      const response = await axios.get(
        `https://backend-pettracker.vercel.app/lora/pageLora?limit=1&page=0`
      );
      if (response.data.length > 0) {
        setSensorData((prevData) => [...prevData, ...response.data]);
      }
      console.log(response);
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
    }, 1000);

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

  useEffect(() => {
    if (sensorData.length > 0 && mapRef.current) {
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

        const latestData = sensorData[sensorData.length - 1];
        const latestGPS = parseGPSData(latestData.loraData);
        if (
          !isNaN(parseFloat(latestGPS.latitude)) &&
          !isNaN(parseFloat(latestGPS.longitude))
        ) {
          const marker = L.marker(
            [parseFloat(latestGPS.latitude), parseFloat(latestGPS.longitude)],
            { icon: customIcon }
          ).addTo(map);

          marker.bindPopup(
            `Latitude: ${latestGPS.latitude}<br>Longitude: ${
              latestGPS.longitude
            }<br>Date & Time: ${new Date(
              latestData.createdAt
            ).toLocaleString()}`
          );
          markersRef.current.push(marker);
        }
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

        map.on("click", function (e) {
          addNewMarker(e.latlng);
        });
      }
    }
  }, [sensorData]);

  const sendMarkerToBackend = async (latlng) => {
    try {
      const response = await axios.post(
        "https://backend-pettracker.vercel.app/marker/addMarkers",
        latlng
      );
      Swal.fire({
        icon: "success",
        title: "Marker berhasil dikirim",
        text: response.data.message,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal mengirim marker ",
        text: "Please try again later",
      });
    }
  };

  const addNewMarker = (latlng) => {
    if (mapRef.current) {
      const map = mapRef.current;
      const newMarkerIcon = L.icon({
        iconUrl: IconPengirim2,
        iconSize: [50, 50],
        iconAnchor: [25, 37],
        popupAnchor: [5, -34],
      });

      map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });

      const newMarker = L.marker([latlng.lat, latlng.lng], {
        icon: newMarkerIcon,
      }).addTo(map);

      newMarker.bindPopup(
        `<div>Pengirim<br>Latitude: ${latlng.lat}<br>Longitude: ${latlng.lng}<br><button id="sendMarkerBtn">Kirim Marker</button></div>`
      );

      newMarker.on("popupopen", function () {
        document
          .getElementById("sendMarkerBtn")
          .addEventListener("click", function () {
            sendMarkerToBackend({
              latitude: latlng.lat,
              longitude: latlng.lng,
            });
          });
      });

      setNewMarkers([newMarker]);
    }
  };

  useEffect(() => {
    if (mapRef.current) {
      newMarkers.forEach((marker) => {
        if (!mapRef.current.hasLayer(marker)) {
          marker.addTo(mapRef.current);
        }
      });
    }
  }, [sensorData]);

  const hitungJarak = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const totalJarak = () => {
    const latestCoords = getLatestCoordinates();
    if (latestCoords && newMarkers.length > 0) {
      const { latitude: lat1, longitude: lon1 } = latestCoords;
      return newMarkers.reduce((total, marker) => {
        const { lat: lat2, lng: lon2 } = marker.getLatLng();
        return total + hitungJarak(lat1, lon1, lat2, lon2);
      }, 0);
    }
    return 0;
  };

  return (
    <Row className="justify-content-md-center">
      <div className="product-catagories-wrapper pt-3">
        <Container>
          <div className="product-catagory-wrap">
            <Container>
              <Card className="login">
                <div id="map"></div>
                <div>
                  <p>Jarak: {totalJarak().toFixed(2)} km</p>
                </div>
              </Card>
            </Container>
          </div>
        </Container>
      </div>
    </Row>
  );
}
