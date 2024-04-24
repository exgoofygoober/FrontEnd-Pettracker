import axios from "axios";
import React, { useEffect, useState } from "react";
import { Card, Container, Row, Table } from "react-bootstrap";

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://lora-server.vercel.app/lora/dataLora"
        );
        setSensorData(response.data);
      } catch (error) {
        console.error("Error fetching sensor data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <Row className="justify-content-md-center">
      <div class="product-catagories-wrapper pt-3">
        <Container>
          <div class="product-catagory-wrap">
            <Container>
              <Card className="mb-3 catagory-card">
                <Table responsive bordered>
                  <thead>
                    <tr>
                      <th scope="col">No</th>
                      <th scope="col">Latitude</th>
                      <th scope="col">Longitude</th>
                      <th scope="col">RSSI</th>
                      <th scope="col">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sensorData.map((data, index) => (
                      <tr key={index}>
                        {/* <td>{index + 1}</td> */}
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
                        <td>{new Date(data.createdAt).toLocaleString()}</td>
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
    return data.loraData
      .split("GPS Data:")[1]
      .split(",")[0]
      .trim()
      .replace(/,/g, "");
  } else {
    return "Unknown";
  }
}

function getLongitude(data) {
  if (data.loraData && data.loraData.includes("GPS Data:")) {
    return data.loraData
      .split("GPS Data:")[1]
      .split(",")[1]
      .trim()
      .replace(/,/g, "");
  } else {
    return "Unknown";
  }
}
