import React from 'react'
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import styles from './Header.module.css'
function Header() {
    return (
        <>
            <Navbar className={styles.headerNavbar}>
                <Container>
                    <Navbar.Brand href="/" className={styles.brand}>
                        <img
                            alt="Logo"
                            src="https://i.ibb.co/RGrvX3ps/icons8-notes-app-50.png"
                            width="30"
                            height="30"
                            className={styles.logo}
                        />
                        Pocket Pad
                    </Navbar.Brand>
                </Container>
            </Navbar>
        </>
    )
}

export default Header