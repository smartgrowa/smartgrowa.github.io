importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js"
);

const firebaseConfig = {
  apiKey: "AIzaSyA6ebPPPecvjFK6JPTUfAHMVlJbf-HHQe0",
  authDomain: "smartgrowa-app.firebaseapp.com",
  projectId: "smartgrowa-app",
  storageBucket: "smartgrowa-app.firebasestorage.app",
  messagingSenderId: "849584934306",
  appId: "1:849584934306:web:e87b91a194a3831d1f36fb",
  measurementId: "G-780D27B8BC",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/logo-1.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
