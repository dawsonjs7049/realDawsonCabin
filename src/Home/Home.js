import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { Calendar } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import styles from './styles.css';

const firebase = require('firebase');

const Home = (props) => {

    // console.log(props.location.state.name)
    const position = props.location.state.name.indexOf("@")
    const username = props.location.state.name.substring(0, position);

    const [simpleDate, setSimpleDate] = useState(null)
    const [selectedDate, setSelectedDate] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [showCancelModal, setShowCancelModal] = useState(false)
    const [expectedPeople, setExpectedPeople] = useState(null)
    const [reservations, setReservations] = useState([])
    const [events, setEvents] = useState([])

    useEffect(() => {
        firebase
            .firestore()
            .collection('reservations')
            .onSnapshot(serverUpdate => {
                const reservations = serverUpdate.docs.map(_doc => {
                    const data = _doc.data();
                    data['id'] = _doc.id;
                    return data;
                });
      
                let fetchedEvents = reservations.map(reservation => {
                        let date = reservation.reservationDate.toDate()
                        let dateString = date.getUTCFullYear() + "-" + ("0" + (date.getUTCMonth()+1)).slice(-2) + "-" + ("0" + date.getUTCDate()).slice(-2)
                        return {title: reservation.username + " - " + reservation.numPeople + " total", date: dateString, id: reservation.id, totalPeople: reservation.numPeople}
                    })
                console.log(fetchedEvents)
                setEvents(fetchedEvents)
            });
    }, [])    

    const logout = (e) => {
        e.preventDefault();

        firebase
            .auth()
            .signOut().then(() => {
                console.log("logged user out");
                props.history.push('/login');
            })
    }

    const handleSubmit = async () => {
        let newDate = firebase.firestore.Timestamp.fromDate(new Date(selectedDate))

        const newFromDB = await firebase
            .firestore()
            .collection('reservations')
            .add({
                numPeople: expectedPeople,
                reservationDate: newDate,
                username: username,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            })
    }

    const cancelBooking = () => {
        let myEvent = events.filter(event => event.date === simpleDate)

        firebase
        .firestore()
        .collection('reservations')
        .doc(myEvent[0].id)
        .delete();
    }

    const updatePeople = () => {
        let myEvent = events.filter(event => event.date === simpleDate)
        
        firebase
            .firestore()
            .collection('reservations')
            .doc(myEvent[0].id) 
            .update({
                numPeople: expectedPeople,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            })
    }

    return (
        <div className="home-container">
            <div className="header">
                <span>The Pigeon Koop</span>
                <button className="logout-btn" onClick={(e) => logout(e)}>
                    Logout &nbsp; <i class="fas fa-sign-out-alt"></i>
                </button>
            </div>
            <div className="widget-div">
                <a 
                    class="weatherwidget-io" 
                    href="https://forecast7.com/en/45d88n92d37/webster/?unit=us" 
                    data-label_1="WEBSTER" 
                    data-label_2="WEATHER" 
                    data-theme="original" 
                    >WEBSTER WEATHER
                </a>
            </div>
            <div className="welcome-div">
                <h1>Welcome, you are signed in as {username}</h1>
            </div>
            <div className="calendar-div">
                <FullCalendar 
                    defaultView="dayGridMonth" 
                    plugins={[ dayGridPlugin, interactionPlugin ]}
                    events={events}
                    dateClick={(info) => {
                        setSimpleDate(info.dateStr)
                        setSelectedDate(info.date)
                        
                        let myEvent = events.filter(event => event.date === info.dateStr)
                        
                        if(myEvent[0]){
                            // so we can access expected people in the update/cancel modal
                            setExpectedPeople(myEvent[0].totalPeople)

                            if(myEvent[0].title.includes(username)) {
                                //this is a date that i "own" - show cancel modal
                                setShowCancelModal(true)
                            } else {
                                //this is not adate that i "own" - can't cancel or take
                            }
                        } else {
                            //date is not owned by anyone - show booking modal
                            setShowModal(true)
                        }
                    }}
                >
                </FullCalendar>
                {showModal &&
                    <div className="modal">
                        <div className="modal-header-div">
                            <h3 className="modal-top-header">Selected Date: {simpleDate}</h3>
                            <h3>Expected Total People?</h3>
                        </div>
                        <input 
                            required
                            className="modal-input" 
                            type="text"
                            onChange={(event) => {
                                if(typeof parseInt(event.target.value) === 'number') {
                                    setExpectedPeople(event.target.value)
                                }
                            }}>
                        </input>
                        <div className="modal-btn-div">
                            <button 
                                className="modal-button"
                                onClick={() => {
                                    handleSubmit()
                                    setShowModal(false)
                                }}
                                >Book'em Danno
                            </button>
                            <button 
                                className="modal-cancel"
                                onClick={() => {
                                    setShowModal(false)
                                }}
                                >Cancel
                            </button>
                        </div>
                    </div>
                }
                {showCancelModal &&
                    <div className="modal-update">
                        <div className="modal-header-div">
                            <h3 className="modal-top-header">Selected Date: {simpleDate}</h3>
                        </div>
                        <div className="modal-update-body">
                            <h3>Update People Count</h3>
                            <input 
                                value={expectedPeople}
                                className="modal-input" 
                                type="text"
                                onChange={(event) => {
                                    if(typeof parseInt(event.target.value) === 'number') {
                                        setExpectedPeople(event.target.value)
                                    }
                                }}
                                >
                            </input>
                            <button 
                                className="modal-button" 
                                onClick={() => {
                                    updatePeople()
                                    setShowCancelModal(false)
                                }}>Update
                            </button>
                        </div>
                        <div>
                            <h3>OR</h3>
                        </div>
                        <div className="modal-update-body">
                            <h3>Delete Booking?</h3>
                            <button 
                                className="modal-button"
                                onClick={() => {
                                    cancelBooking()
                                    setShowCancelModal(false)
                                }}
                                >Yes
                            </button>
                            <button 
                                className="modal-cancel"
                                onClick={() => {
                                    console.log("clicked no")
                                    setShowCancelModal(false)
                                }}
                                >Cancel
                            </button>
                        </div>
                    </div>
                }
            </div>
            <div className="map-div">
                <div class="gmap_canvas">
                    <iframe 
                        width="600" 
                        height="500" 
                        id="gmap_canvas" 
                        src="https://maps.google.com/maps?q=29035%20Pardun%20Road%20Danbury%20Wi&t=k&z=13&ie=UTF8&iwloc=&output=embed" 
                        frameborder="0" 
                        scrolling="no" 
                        marginheight="0" 
                        marginwidth="0">
                    </iframe>
                </div>
            </div>
            <div className="footer">
                Notice a Problem? Email me &nbsp; -> &nbsp;&nbsp; <a style={{textDecoration: "none"}} href="mailto:jake906@charter.net">jake906@charter.net</a>
            </div>
        </div>
    )
}

export default Home;

