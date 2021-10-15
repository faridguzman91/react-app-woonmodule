import * as firebase from "firebase/app";
import "firebase/firestore";
import "firebase/storage";

const config = {
  apiKey: "AIzaSyAMyuluooBF-p1ubAXgOLXqpl3DyYx6ULQ",
  authDomain: "cmlteam.com",
  databaseURL: "https://woon-test-e7a82.firebaseio.com",
  projectId: "woon-test-e7a82",
  // storageBucket: "woon-test-e7a82.appspot.com",
  storageBucket: "gs://woon-test-e7a82.appspot.com",
  messagingSenderId: "918876840835",
};
firebase.initializeApp(config);
// const databaseRef = firebase.database().ref();
// export const projectRef = databaseRef.child("project");
export const db = firebase.firestore();
export const storage = firebase.storage();
