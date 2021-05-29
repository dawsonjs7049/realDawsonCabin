import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { Calendar } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import googleCalendarPlugin from '@fullcalendar/google-calendar';
import styles from './styles.css';
import Comments from "../Comments/Comments";
import Pictures from "../Pictures/Pictures";
import CancelModal from "../CancelModal/CancelModal";
import HelpModal from "../HelpModal/HelpModal";
import BookingModal from "../BookingModal/BookingModal";
import bookingDemo from "./booking-demo.mp4";

const firebase = require('firebase');

// firebase.auth().onAuthStateChanged(function(user) {
//     this.setState({ user: user });
// });

const Home = (props) => {

    let calendarRef = React.createRef()

    const position = props.location.state.name.indexOf("@")
    let username = props.location.state.name.substring(0, position);
    username = username.charAt(0).toUpperCase() + username.slice(1)

    const [simpleDate, setSimpleDate] = useState(null)
    const [selectedDate, setSelectedDate] = useState()
    const [showModal, setShowModal] = useState(false)
    const [showCancelModal, setShowCancelModal] = useState(false)
    const [expectedPeople, setExpectedPeople] = useState(null)
    const [events, setEvents] = useState([])
    const [helpModal, showHelpModal] = useState(false)
    const [imageData, setImageData] = useState([])
    const [sawTip, setSawTip] = useState(false);
    const [tipId, setTipId] = useState();

    useEffect(() => {

        // fetch tips
        firebase
            .firestore()
            .collection('tips')
            .onSnapshot(serverUpdate => {
                let tips = serverUpdate.docs.map(_doc => {
                    let data = _doc.data();
                    // data['user'] = _doc.user;
                    // data['hasSeen'] = _doc.tipSeen;
                    data['id'] = _doc.id;
                    return data;
                    // return { user: _doc.data.user, hasSeen: _doc.data.tipSeen };
                })
                
                tips = tips.filter(tip => tip.user == username);
                
                setSawTip(tips[0].tipSeen);
                setTipId(tips[0].id);

                console.log("TIPS: " + JSON.stringify(tips, null, " "));
            })
        
        //fetch reservations
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
                        const month = ("0" + (date.getUTCMonth() + 1))
                        let dateString = date.getUTCFullYear() + "-" + ("0" + (date.getUTCMonth()+1)).slice(-2) + "-" + ("0" + date.getUTCDate()).slice(-2)
                        return {title: reservation.username + " - " + reservation.numPeople + " total", date: dateString, id: reservation.id, totalPeople: reservation.numPeople, month: month, fullDate: new Date(date) }
                    })
                console.log("SETTING EVENTS");
                setEvents(fetchedEvents)
            });

        //fetch images
        firebase
            .firestore()
            .collection('images')
            .orderBy('date')
            .onSnapshot(serverUpdate => {
                const images = serverUpdate.docs.map(_doc => {
                    const data = _doc.data();
                    data['id'] = _doc.id;
                    return data;
                });

                let fetchedImages = images.map(image => {
                    let date, dateString
                    if(image.date) {
                        date = image.date.toDate()
                    } else {
                        //another workaround for pictures just added, doesn't get date correctly from firebase?
                        date = new Date()
                    }

                    dateString = date.getUTCFullYear() + "-" + ("0" + (date.getUTCMonth()+1)).slice(-2) + "-" + ("0" + date.getUTCDate()).slice(-2)

                    return {comment: image.comment, date: dateString, id: image.id, imageURL: image.imageURL, owner: image.owner, filename: image.filename}
                })
                console.log("SETTING IMAGES...");
                setImageData(fetchedImages)
            })
    }, [])    



    /* 
    Example of promises and async for future me...

    const fetchImages = async () => {
        //fetch all references to images in storage
        let result = await storageRef.child('cabinPictures').listAll();
        let urlPromises;
       
        //if there are more than 20 images, set make new array of only first 20 images
        if(result.items.length > 20) {
            let newResult = result.items.slice(0,20)

            urlPromises = newResult.map(imageRef => imageRef.getDownloadURL())

        } else {
            //less than 20 images in storage, so map through original fetched items
            urlPromises = result.items.map(imageRef => imageRef.getDownloadURL())
        }

        return Promise.all(urlPromises)
    }

    const loadImages = async () => {
        const urls = await fetchImages()
        setPictureURLs(urls)
    }
    */

    const toggleModalAnimation = () =>
    {
        const modals = Array.from(document.getElementsByClassName('modalWrapper'));
        
        modals.forEach((element) => {
            console.log("MODAL: " + element);
            element.classList.toggle('modal-show');
        });
    }

    const logout = (e) => {
        e.preventDefault();

        firebase
            .auth()
            .signOut().then(() => {
                console.log("logged user out");
                props.history.push('/login');
            })
    }

    const handleSubmit = () => {
    
        selectedDate.forEach(date => {
            let newDate = firebase.firestore.Timestamp.fromDate(new Date(date))

            firebase
                .firestore()
                .collection('reservations')
                .add({
                    numPeople: expectedPeople,
                    reservationDate: newDate,
                    username: username,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                })
        })
        
        setExpectedPeople(null)
    }

    const cancelBooking = () => {

        selectedDate.forEach(event => {
            firebase
                .firestore()
                .collection('reservations')
                .doc(event.id)
                .delete();
        })
       
    }

    const updatePeople = () => {

        selectedDate.forEach(event => {
            firebase
                .firestore()
                .collection('reservations')
                .doc(event.id) 
                .update({
                    numPeople: expectedPeople,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                })
        })

        setExpectedPeople(null)
    }

    const cancelAllInMonth = () => {
       
        let calendarApi = calendarRef.current.getApi()

        const date = calendarApi.view.currentStart;
        const month = ("0" + (date.getUTCMonth() + 1));

        let eventsInMonth = events.filter(event => event.month === month && event.title.includes(username))

        eventsInMonth.forEach(event => {
            firebase
                .firestore()
                .collection('reservations')
                .doc(event.id)
                .delete();
        })
    }

    const getDateRange = (start, end) => {
        
        for(var arr=[],dt=new Date(start); dt<=end; dt.setDate(dt.getDate()+1)){
            arr.push(new Date(dt));
        }

        arr.pop();

        return arr;
    }

    const checkPeopleInput = (people) => {
        let regex = /[A-Za-z]/
        return regex.test(people)
    }

    const formatDate = (date) => {
        
        var d = new Date(date);
        var month = '' + (d.getMonth() + 1);
        var day = '' + d.getDate();
        var year = d.getFullYear();
    
        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;
    
        return [month, day, year].join('-');
    }

    const handleSawTip = () => {
        setSawTip(true);

        firebase
            .firestore()
            .collection('tips')
            .doc(tipId) 
            .update({
                tipSeen: true,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            })
    }

    return (
        <div className="home-container">
            <div className="header">
                <span>The Pigeon Koop</span>
                <div className="header-buttons-container">
                    <button className="help-btn" onClick={() => { showHelpModal(!helpModal); toggleModalAnimation(); } }>
                        Help
                    </button>
                    <button className="logout-btn" onClick={(e) => logout(e)}>
                        Logout &nbsp; <i className="fas fa-sign-out-alt"></i>
                    </button>
                </div>
            </div>
            <div className="widget-div">
                <a 
                    className="weatherwidget-io" 
                    href="https://forecast7.com/en/45d88n92d37/webster/?unit=us" 
                    data-label_1="WEBSTER" 
                    data-label_2="WEATHER" 
                    data-theme="original" 
                    >WEBSTER WEATHER
                </a>
            </div>
            <div className="home-body">
                <div className="welcome-div">
                    <h1>Welcome, you are signed in as {username}</h1>
                    <button className="clear-all-button" onClick={() => cancelAllInMonth()}>Clear All Reservations in Month</button>
                </div>

                {
                    !sawTip &&
                    <div>
                        <h4 style={{textAlign: 'center'}}>New! You can now click and drag to select multiple days at once</h4>
                        <video width="360" height="415" autoPlay muted loop style={{ display: 'block', margin: 'auto', borderRadius: '5px', boxShadow: '0px 0px 10px 3px teal'}}>
                            <source src={bookingDemo} type="video/mp4"></source>
                            <source src={bookingDemo} type="video/ogg"></source>
                            Your browser does not support the video tag.
                        </video>
                        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignContent: 'center', marginTop: '2rem'}}>
                            <button className="accept-btn"  onClick={() => handleSawTip() }>Got it!</button>
                            <span style={{ padding: '4px 2rem 0 2rem'}}>OR</span>
                            <button className="rude-btn" onClick={() => handleSawTip() }>Took you long enough...</button>
                        </div>
                    </div>
                }
                
                <div className="calendar-div">
                    <FullCalendar 
                        plugins={[ dayGridPlugin, interactionPlugin, googleCalendarPlugin ]}
                        ref={calendarRef}
                        defaultView="dayGridMonth" 
                        selectable={true}
                        googleCalendarApiKey="AIzaSyATsMPLPyPHnbg-gmZqtQPT1a_sdZk-aE8"
                        select={(info) => {
                            let dates = getDateRange(info.start, info.end);

                            // if selected dates has dates user already booked, filter out all non-user booked dates and open cancellation modal
                            let userEvents = [];
                            dates.forEach(date => {
                                let event = events.filter(event => {
                                    return ((String(event.fullDate) === String(date)) && (event.title.includes(username)))
                                })

                                if(event[0])
                                {
                                    // if an event was returned, then this date is taken by the user already
                                    userEvents.push(event[0]);
                                    setExpectedPeople(event[0].totalPeople);
                                }
                            });
                            if(userEvents.length > 0)
                            {
                                // open cancellation modal with userDates

                                var dateRangeString = (userEvents.length > 1 ? formatDate(userEvents[0].fullDate) + "  ->  " + formatDate(userEvents[userEvents.length - 1].fullDate) : formatDate(userEvents[0].fullDate));
                                setSimpleDate(dateRangeString);
                                setSelectedDate(userEvents);
                                setShowCancelModal(true);
                                toggleModalAnimation();
                            }
                            else
                            {
                                // do another filter to check that selected dates don't belong to anyone else
                                let takenDates = [];
                                dates.forEach(date => {
                                    let event = events.filter(event => {
                                        return ((String(event.fullDate) === String(date)) && !(event.title.includes(username)))
                                    })
                                    
                                    if(event[0])
                                    {
                                        // if an event was returned, then this date is taken by someone else already
                                        takenDates.push(date);
                                        setExpectedPeople(event[0].totalPeople);
                                    }
                                })
                                if(takenDates.length > 0)
                                {
                                    // the selected dates included dates already taken by someone else, just do nothing
                                }
                                else
                                {
                                    // the selected dates were not taken by the user or by anyone else, open booking modal 

                                    var dateRangeString = (dates.length > 1 ? formatDate(dates[0]) + "  ->  " + formatDate(dates[dates.length - 1]) : formatDate(dates[0]));
                                    setSimpleDate(dateRangeString);
                                    setSelectedDate(dates);
                                    setShowModal(true);
                                    toggleModalAnimation();
                                }
                            }
                        }}
                        eventSources={[
                            {events},
                            {
                                googleCalendarId: 'en.usa#holiday@group.v.calendar.google.com',
                                color: 'green'
                            }
                        ]}
                    >
                    </FullCalendar>
                </div>

                {/* MODALS */}
                {showModal &&
                    <div className="modalWrapper">
                        <BookingModal 
                            expectedPeople={expectedPeople}
                            simpleDate={simpleDate}
                            setExpectedPeople={setExpectedPeople}
                            checkPeopleInput={checkPeopleInput}
                            handleSubmit={handleSubmit}
                            setShowModal={setShowModal}
                        />
                    </div>
                }
                
                {showCancelModal &&
                    <div className="modalWrapper">
                        <CancelModal 
                            simpleDate={simpleDate} 
                            expectedPeople={expectedPeople} 
                            setExpectedPeople={setExpectedPeople}
                            checkPeopleInput={checkPeopleInput}
                            updatePeople={updatePeople}
                            setShowCancelModal={setShowCancelModal}
                            cancelBooking={cancelBooking}
                        />
                    </div>
                }

                {helpModal &&
                    <HelpModal showHelpModal={showHelpModal}/>
                }
                    
                <div className="map-div">
                    <div className="gmap_canvas">
                        <iframe 
                            title="gmap"
                            width="600" 
                            height="500" 
                            id="gmap_canvas" 
                            src="https://www.google.com/maps/embed/v1/place?key=AIzaSyBEWYCWX0NQa09g3-ccxoE72Aqg3ADJYe0&q=29035%20Pardun%20Road%20Danbury%20Wi&maptype=satellite"
                            frameBorder="0" 
                            scrolling="no" 
                            marginHeight="0" 
                            marginWidth="0">
                        </iframe>
                    </div>
                </div>
            </div>
            <div className="comments-div-container">
                <div className="comments-div">
                    <Comments username={username}>
                    
                    </Comments>
                </div>
            </div>
            <div className="pictures-div-container">
                <Pictures imageData={imageData} username={username}>

                </Pictures>
            </div>
            <div className="footer">
                Notice a Problem? Email me &nbsp; -> &nbsp;&nbsp; <a style={{textDestylecoration: "none"}} href="mailto:jake906@charter.net">jake906@charter.net</a>
            </div>
        </div>
    )
}

export default Home;

