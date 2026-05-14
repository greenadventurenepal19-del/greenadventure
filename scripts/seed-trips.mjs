import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const seedData = [
  // Nepal
  {
    title: "Annapurna Base Camp Trek",
    region: "Nepal",
    duration: "6 to 12 Days",
    price: "$750",
    difficulty: "moderate",
    desc: "Trek Highlights:\n• Close view of Annapurna I (8,091m)\n• Machhapuchhre (Fishtail) mountain scenery\n• Natural hot springs at Jhinu Danda\n• Traditional Gurung villages\n• Sunrise from Annapurna Sanctuary",
    image: "/images/hero-snow.jpg",
    isFeatured: true
  },
  {
    title: "Annapurna Circuit Trek",
    region: "Nepal",
    duration: "14 Days",
    price: "$1450",
    difficulty: "challenging",
    desc: "The Annapurna Circuit Trek is a journey full of challenges that combines the classic Annapurna routes with stunning alpine lakes.",
    image: "/images/annapurna.png",
    isFeatured: true
  },
  {
    title: "Night with Nomads",
    region: "Nepal",
    duration: "7 Days",
    price: "$850",
    difficulty: "moderate",
    desc: "Our unique Indigenous Experiences in Nepal offer more than just mountain trekking. We provide an immersive journey into traditional culture.",
    image: "/images/everest.png",
    isFeatured: true
  },
  // Bhutan
  {
    title: "Tiger's Nest Monastery Trek",
    region: "Bhutan",
    duration: "7 Days",
    price: "$1500",
    difficulty: "moderate",
    desc: "Hike to the iconic Paro Taktsang, perched on a cliffside, and immerse yourself in the rich Buddhist culture of Bhutan.",
    image: "/images/hero-grass.jpg",
    isFeatured: true
  },
  {
    title: "Druk Path Trek",
    region: "Bhutan",
    duration: "6 Days",
    price: "$1200",
    difficulty: "moderate",
    desc: "A beautiful short trek crossing the chain of mountains that separates the two valleys of Paro and Thimphu.",
    image: "/images/hero-night.jpg",
    isFeatured: true
  },
  // India
  {
    title: "Markha Valley Trek",
    region: "India",
    duration: "8 Days",
    price: "$900",
    difficulty: "challenging",
    desc: "Trek through the stunning cold desert landscape of Ladakh, crossing high passes and traditional villages.",
    image: "/images/hero-snow.jpg",
    isFeatured: true
  },
  {
    title: "Roopkund Trek",
    region: "India",
    duration: "8 Days",
    price: "$850",
    difficulty: "challenging",
    desc: "A high-altitude glacial trek famous for the mysterious skeletons found at the lake, offering magnificent views of Mount Trishul.",
    image: "/images/annapurna.png",
    isFeatured: true
  }
];

async function seed() {
  console.log("Seeding trips to Firestore...");
  let count = 0;
  for (const trip of seedData) {
    const newDocRef = doc(collection(db, "trips"));
    await setDoc(newDocRef, { ...trip, createdAt: new Date() });
    console.log(`Added trip: ${trip.title}`);
    count++;
  }
  console.log(`Successfully seeded ${count} trips!`);
  process.exit(0);
}

seed().catch(console.error);
