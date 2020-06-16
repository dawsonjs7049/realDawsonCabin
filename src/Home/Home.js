import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { Calendar } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import googleCalendarPlugin from '@fullcalendar/google-calendar';
import styles from './styles.css';
import Comments from "../Comments/Comments";
import Pictures from "../Pictures/Pictures";

const firebase = require('firebase');


const Home = (props) => {

    let storageRef = firebase.storage().ref()
    let calendarRef = React.createRef()

    const position = props.location.state.name.indexOf("@")
    let username = props.location.state.name.substring(0, position);
    username = username.charAt(0).toUpperCase() + username.slice(1)

    const [simpleDate, setSimpleDate] = useState(null)
    const [selectedDate, setSelectedDate] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [showCancelModal, setShowCancelModal] = useState(false)
    const [expectedPeople, setExpectedPeople] = useState(null)
    const [events, setEvents] = useState([])
    const [helpModal, showHelpModal] = useState(false)
    const [imageData, setImageData] = useState([])


    useEffect(() => {
        
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
                        return {title: reservation.username + " - " + reservation.numPeople + " total", date: dateString, id: reservation.id, totalPeople: reservation.numPeople, month: month}
                    })
                console.log(fetchedEvents)
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

        setExpectedPeople(null)
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

    const checkPeopleInput = (people) => {
        let regex = /[A-Za-z]/
        return regex.test(people)
    }

    return (
        <div className="home-container">
            <div className="header">
                <span>The Pigeon Koop</span>
                <div className="header-buttons-container">
                    <button className="help-btn" onClick={() => showHelpModal(!helpModal)}>
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
                <div className="calendar-div">
                    <FullCalendar 
                        ref={calendarRef}
                        defaultView="dayGridMonth" 
                        plugins={[ dayGridPlugin, interactionPlugin, googleCalendarPlugin ]}
                        googleCalendarApiKey="AIzaSyATsMPLPyPHnbg-gmZqtQPT1a_sdZk-aE8"
                        eventSources={[
                            {events},
                            {
                                googleCalendarId: 'en.usa#holiday@group.v.calendar.google.com',
                                color: 'green'
                            }
                        ]}
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
                                    setExpectedPeople(event.target.value)
                                }}>
                            </input>
                            <div className="modal-btn-div">
                                <button 
                                    className="modal-button"
                                    onClick={() => {
                                        if(expectedPeople !== null && !checkPeopleInput(expectedPeople)) {
                                            handleSubmit()
                                            setShowModal(false)
                                        }
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
                                        setExpectedPeople(event.target.value)
                                    }}
                                    >
                                </input>
                                <button 
                                    className="modal-button" 
                                    onClick={() => {
                                        if(expectedPeople !== null && !checkPeopleInput(expectedPeople)) {
                                            updatePeople()
                                            setShowCancelModal(false)
                                        }
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
                    {helpModal &&
                    <div className="help-modal-container">
                        <div className="help-modal">
                            <h4 className="help-h4">Weather</h4>
                            <p>You can access more detailed weather forcasts by clicking anywhere on the weather banner</p>

                            <h4 className="help-h4">Calendar</h4>
                            <p>
                                To select a date to reserve, click any open square and then enter the expected number of people that 
                                will be there on that day, then select the top green button to book it or the bottom red button to exit                            
                            </p>
                            <p>
                                To update a date you've already reserved, click on that date square and either re-enter the number of
                                expected people and press the green "update" button, or select the "yes" button at the bottom of the 
                                pop-up to delete your reservation. Cancel will close the modal. Please note that you can only update/delete
                                your own reservations
                            </p>

                            <h4 className="help-h4">Comments</h4>
                            <p>
                                Use the comments section to update others on cabin issues, projects, or anything else
                                that you all might find useful. Post a comment by clicking on the white rectangle input box next to the 
                                submit button and typing your comment, then press submit when you're ready to post it. 
                            </p>
                            <p>
                                If you would like to edit 
                                a post you've previously made, you can select the green edit button on the right of the post and then select the 
                                text on the comment to edit its content. When you're finished, press the green save button on the right to save your
                                changes. You can also delete your comment entirely by pressing the red trash button. Please note that you may only 
                                edit/delete your own comments and that only the 10 most recent comments are currently displayed on the website
                            </p>

                            <h4 className="help-h4">Pictures</h4>
                            <p>
                                To upload a photo, press the "select photo" button and navigate to the photo you would 
                                like to select and press "open" (on a Windows computer). Then press the "upload" button
                                that appears to actually send the file. The name of the selected file is shown in the 
                                "upload" button, if you selected the wrong photo, simply press the "select photo" button
                                again and select the correct photo and then press the "upload" button. A progess bar will 
                                appear above the photos to let you know the completion status of your upload.
                            </p>

                            <h4 className="help-h4">Notice a Problem?</h4>
                            <p>
                                Email me at jake906@charter.net and I will maybe possibly try to fix it
                            </p>

                            <button className="modal-cancel help-modal-close" onClick={() => showHelpModal(false)}>Close</button>
                        </div>
                    </div>
                        
                    }
                </div>
                <div className="map-div">
                    <div className="gmap_canvas">
                        <iframe 
                            width="600" 
                            height="500" 
                            id="gmap_canvas" 
                            src="https://maps.google.com/maps?q=29035%20Pardun%20Road%20Danbury%20Wi&t=k&z=13&ie=UTF8&iwloc=&output=embed" 
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

