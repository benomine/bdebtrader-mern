import React, { useEffect } from 'react';
import '../App.css';

import Axios from 'axios';
import { Container, Col, Row } from 'react-bootstrap';

export default function HomePage() {
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
            }
        }
        checkLoggedIn();
    }, []);

    return (
        <Container fluid>
            <div className="section-1">
                <Row>
                    <Col xs={12} lg={6}>
                        <img className="section-1-img" src={require("./assets/bg.jpg")} alt="Freepik" />
                    </Col>
                    <Col xs={12} lg={6} >            
                <div className="text-container">
                        <Row>
                            <Col xs={12}>
                            <h1 id="Header">BdebTrader</h1>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12}>
                            <h2 id="Sub-Header">Search Symbols</h2>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12}>
                                <p id="description">Simple Crypto/Symbols tracker</p>
                            </Col>
                        </Row>
                        </div>
                    </Col>
                </Row>
            </div>
        </Container>
    );
}
