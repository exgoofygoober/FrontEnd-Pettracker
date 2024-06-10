import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, Card, Container, Row, Table } from "react-bootstrap";

function History() {
  return (
    <Container>
      <h1 className="judul text-center">Data Lora</h1>
      <div className=" mb-5">
        <DataTabel />
      </div>
    </Container>
  );
}

export default History;

export function DataTabel() {
  const [sensorData, setSensorData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [markersData, setMarkersData] = useState([]);
  const [dataPerPage] = useState(25);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/lora/dataLora");
        setSensorData(response.data);
      } catch (error) {
        console.error("Error fetching sensor data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/marker/getLatestMarker"
        );
        setMarkersData([response.data]);
      } catch (error) {
        console.error("Error fetching markers data:", error);
      }
    };

    fetchMarkers();
  }, []);

  const indexOfLastData = currentPage * dataPerPage;
  const indexOfFirstData = indexOfLastData - dataPerPage;
  const currentData = sensorData.slice(indexOfFirstData, indexOfLastData);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  function derajat(degrees) {
    return degrees * (Math.PI / 180);
  }

  function hitungJarak(lat1, lon1, lat2, lon2) {
    const earthRadiusKm = 6371;

    const dLat = derajat(lat2 - lat1);
    const dLon = derajat(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(derajat(lat1)) *
        Math.cos(derajat(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadiusKm * c;

    return distance;
  }

  const markerLat =
    markersData.length > 0 ? markersData.map((marker) => marker.latitude) : [];
  const markerLon =
    markersData.length > 0 ? markersData.map((marker) => marker.longitude) : [];

  return (
    <Row className="justify-content-md-center">
      <div className="product-catagories-wrapper pt-3">
        <Container>
          <div className="product-catagory-wrap">
            <Container>
              <Card className="mb-3 catagory-card">
                <Table responsive bordered>
                  <thead>
                    <tr>
                      <th scope="col">No</th>
                      <th scope="col">Lora Data</th>
                      <th scope="col">Latitude</th>
                      <th scope="col">Longitude</th>
                      <th scope="col">RSSI</th>
                      <th scope="col">Jarak</th>
                      <th scope="col">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.map((data, index) => (
                      <tr key={index}>
                        <td>{(currentPage - 1) * dataPerPage + index + 1}</td>
                        <td>
                          {data.loraData && data.loraData.includes("GPS Data:")
                            ? data.loraData
                                .split("GPS Data:")[0]
                                .trim()
                                .replace(/,/g, "")
                            : data.loraData}
                        </td>
                        <td>{getLatitude(data)}</td>
                        <td>{getLongitude(data)}</td>
                        <td>{data.rssiString}</td>
                        <td>
                          {getLatitude(data) &&
                          getLongitude(data) &&
                          markerLat.length > 0 &&
                          markerLon.length > 0
                            ? hitungJarak(
                                getLatitude(data),
                                getLongitude(data),
                                markerLat[0],
                                markerLon[0]
                              ).toFixed(2) + " KM"
                            : "n/a"}
                        </td>

                        <td>{new Date(data.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <Pagination
                  dataPerPage={dataPerPage}
                  totalData={sensorData.length}
                  paginate={paginate}
                  currentPage={currentPage}
                />
              </Card>
            </Container>
          </div>
        </Container>
      </div>
      <div className="product-catagories-wrapper pt-3">
        <Container>
          <div className="product-catagory-wrap">
            <Container>
              <Card className="mb-3 catagory-card">
                <h3 className="judul text-center">Data Marker</h3>
                <Table responsive bordered>
                  <thead>
                    <tr>
                      <th scope="col">No</th>
                      <th scope="col">Latitude</th>
                      <th scope="col">Longitude</th>
                      <th scope="col">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {markersData.map((marker, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{marker.latitude}</td>
                        <td>{marker.longitude}</td>
                        <td>{new Date(marker.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card>
            </Container>
          </div>
        </Container>
      </div>
    </Row>
  );
}

function getLatitude(data) {
  if (data.loraData && data.loraData.includes("GPS Data:")) {
    const lat = data.loraData
      .split("GPS Data:")[1]
      ?.split(",")[0]
      ?.trim()
      ?.replace(/,/g, "");
    return lat ? parseFloat(lat) : "";
  } else {
    return "";
  }
}

function getLongitude(data) {
  if (data.loraData && data.loraData.includes("GPS Data:")) {
    const lon = data.loraData
      .split("GPS Data:")[1]
      ?.split(",")[1]
      ?.trim()
      ?.replace(/,/g, "");
    return lon ? parseFloat(lon) : "";
  } else {
    return "";
  }
}

const Pagination = ({ dataPerPage, totalData, paginate, currentPage }) => {
  const pageNumbers = [];
  const maxPagesToShow = 5;
  for (let i = 1; i <= Math.ceil(totalData / dataPerPage); i++) {
    pageNumbers.push(i);
  }

  let startPage, endPage;
  if (pageNumbers.length <= maxPagesToShow) {
    startPage = 1;
    endPage = pageNumbers.length;
  } else {
    const maxPagesBeforeCurrentPage = Math.floor(maxPagesToShow / 2);
    const maxPagesAfterCurrentPage = Math.ceil(maxPagesToShow / 2) - 1;
    if (currentPage <= maxPagesBeforeCurrentPage) {
      startPage = 1;
      endPage = maxPagesToShow;
    } else if (currentPage + maxPagesAfterCurrentPage >= pageNumbers.length) {
      startPage = pageNumbers.length - maxPagesToShow + 1;
      endPage = pageNumbers.length;
    } else {
      startPage = currentPage - maxPagesBeforeCurrentPage;
      endPage = currentPage + maxPagesAfterCurrentPage;
    }
  }

  return (
    <nav>
      <ul className="pagination justify-content-center">
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <Button
            className="page-link"
            onClick={() => paginate(currentPage - 1)}
          >
            Previous
          </Button>
        </li>
        {pageNumbers.slice(startPage - 1, endPage).map((number) => (
          <li
            key={number}
            className={`page-item ${currentPage === number ? "active" : ""}`}
          >
            <Button className="page-link" onClick={() => paginate(number)}>
              {number}
            </Button>
          </li>
        ))}
        <li
          className={`page-item ${
            currentPage === Math.ceil(totalData / dataPerPage) ? "disabled" : ""
          }`}
        >
          <Button
            className="page-link"
            onClick={() => paginate(currentPage + 1)}
          >
            Next
          </Button>
        </li>
      </ul>
    </nav>
  );
};
