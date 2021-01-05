import React, { useState, useEffect } from 'react';

import '../App.css';
import Axios from 'axios';
import '../components/component.css';
import "react-datepicker/dist/react-datepicker.css";
import { Line } from 'react-chartjs-2';
import ErrorModal from '../components/error-modal.component';
import { Container, Button, Col, Row } from 'react-bootstrap';

export default function SymbolDashboard() {
    const [searchItem, setSearchItem] = useState("");
    const [symbolName, setSymbolName] = useState("");
    const [dailyHistory, setDailyHistory] = useState({ x: [], y: [] });
    const [details, setDetails] = useState({ name: "", description: "", address: "", revenuepershare: ""});
    const [errorModalShow, setErrorModalShow] = useState(false);
    const [error, setError] = useState();
    const [latlong, setLatLong] = useState({ lat: "45.50", long: "-73.56"}); 

    let element = latlong.lat === "45.50" && latlong.long === "-73.56" ? <p></p> : <a href={'https://www.google.com/maps/search/?api=1&query='+latlong.lat+','+latlong.long} rel="noopener noreferrer" target="_blank">Link to google Maps</a>;

    useEffect(() => {
        const checkLoggedIn = async () => {
            if (localStorage.getItem('jwt')) {
                Axios({
                    method: 'get',
                    url: 'http://localhost:3001/api/users/isAuthenticated',
                    headers: {
                        'Authorization': localStorage.getItem('jwt'),
                    }
                }).catch(err => {
                    window.location = '/';
                    localStorage.removeItem('jwt');
                });
            } else {
                window.location = '/';
            }
        }
        checkLoggedIn();
    }, []);

    const getLatLong = async (address) => {
        try {
            //console.log(address);
            //'https://nominatim.openstreetmap.org/search/'+address+'?format=json&addressdetails=0&limit=1&polygon_svg=0)
            const trimAddress = address.substring(0, address.lastIndexOf(","));
            await Axios({
                method: 'get',
                url: 'https://nominatim.openstreetmap.org/search/'+trimAddress+'?format=json&addressdetails=0&limit=1&polygon_svg=0'
            }).then(res => {
                console.log(res);
                const lat = res.data[0].lat;
                const long = res.data[0].lon;
                //console.log(lat, long);
                setLatLong({lat: lat, long: long});
                //console.log(latlong);
            })
        } catch (err) {
            console.log(err);
        }
    }

    const getDailyPriceHistory = async () => {
        try {
            await Axios({
                method: 'post',
                url: 'http://localhost:3001/api/protected/vantage-api/getSymbolHistory',
                headers: {
                    'Authorization': localStorage.getItem('jwt'),
                },
                data: {
                    "symbol": searchItem,
                }
            }).then(res => {
                const dailySeries = res.data["Time Series (Daily)"]
                var series = Object.keys(dailySeries).map(day => {
                    return { day: day, value: dailySeries[day]["4. close"] }
                });
                var x_axis = [];
                var y_axis = [];
                var days;
                if (series.length < 100) {
                    days = series.length;
                } else {
                    days = 100;
                }
                for (var index = 0; index < days; index++) {
                    x_axis.push(series[index].day);
                    y_axis.push(series[index].value)
                }
                x_axis.reverse();
                y_axis.reverse();
                setDailyHistory({ x: x_axis, y: y_axis });
            });
        } catch (err) {
            resetGraphs(err);
        }
    }

    const getSymbolOverView = async () => {
        try {
            await Axios({
                method: 'post',
                url: 'http://localhost:3001/api/protected/vantage-api/getSymbolOverview',
                headers: {
                    'Authorization': localStorage.getItem('jwt'),
                },
                data: {
                    "symbol": searchItem,
                }
            }).then(res => {
                const name = res.data["Name"];
                const description = res.data["Description"];
                const address = res.data["Address"];
                const revenuepershare = res.data["RevenuePerShareTTM"];
                setDetails({ name: name, description: description, address: address, revenuepershare: revenuepershare});
                getLatLong(address);
            });
        } catch (err) {
            resetGraphs(err);
        }
    }

    const resetGraphs = (err) => {
        setSymbolName("Invalid Symbol");
        setError(err.response.data.Error);
        setErrorModalShow(true);
        setDailyHistory({ x: [], y: [] });
    }
    
    const onSubmit = async (e) => {
        try {
            setSymbolName(searchItem);
            e.preventDefault();
            e.target.reset();

            console.log(symbolName);
            getDailyPriceHistory();
            getSymbolOverView();
            setSearchItem("");
        } catch (err) {
            console.log("reach");
            console.log(err);
        }
    }
    
    return (
        <Container>
            <ErrorModal
                show={errorModalShow}
                onHide={() => setErrorModalShow(false)}
                error={error}
            />
            <form onSubmit={onSubmit} className="form-search-coin-group">
                <Row>
                    <Col xs={8}>
                        <div className="form-group">
                            <input type="text" className="form-control currency-search" placeholder="Enter Symbol Name e.g AAPL" onChange={(e) => setSearchItem(e.target.value)} />
                        </div>
                    </Col>
                    <Col xs={4}>
                        <Button className="text-uppercase search-btn" variant="dark" type="submit" disabled={searchItem <= 0}>Search</Button>
                    </Col>
                </Row>
            </form>
            <Row>
                <Col xs={12} >
                    <div className="history-chart">
                    <Line
                        data={{
                            labels: dailyHistory.x,
                            datasets: [
                                {
                                    label: 'Amount (USD)',
                                    fill: false,
                                    lineTension: 0,
                                    backgroundColor: 'rgba(87, 191, 186,1)',
                                    borderColor: 'rgba(0,0,0,1)',
                                    borderWidth: 2,
                                    data: dailyHistory.y
                                }
                            ]
                        }}
                        options={{
                            title: {
                                display: true,
                                text: symbolName + ' Daily price',
                                fontSize: 20
                            },
                            legend: {
                                display: false,
                            },
                            responsive: true,
                            maintainAspectRatio: false,
                        }}
                        width={600}
                        height={600}
                        className="charts"
                    />
                    </div>
                </Col>
            </Row>
            <Row>
                <Col xs={12}>
                    <div>
                        <h1>{details.name}</h1>
                        <br />
                        <p>{details.description}</p>
                        <br />
                        {element}
                    </div>
                </Col>
            </Row>
            <Row>
                <div className="pt-3 pb-3"></div>
            </Row>
        </Container>
    );
}