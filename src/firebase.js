import firebase from "firebase/app"
import "firebase/auth"


const app = firebase.initializeApp({
    apiKey: "AIzaSyAyc3VrOy8Jh4N6VVaC5ItbUas1KbaSJCY",
    authDomain: "cabinsite-e8b6b.firebaseapp.com",
    databaseURL: "https://cabinsite-e8b6b.firebaseio.com",
    projectId: "cabinsite-e8b6b",
    storageBucket: "cabinsite-e8b6b.appspot.com",
    messagingSenderId: "950596908057",
    appId: "1:950596908057:web:6d74fe15aa56b69d5da688",
    measurementId: "G-G35VNWGXGR"
})


export const auth = app.auth()
export default app