import { initializeApp } from "firebase/app";
import { getFirestore, collection, writeBatch, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const seedData = [
  {
    title: "Annapurna Base Camp Trek",
    region: "Nepal",
    duration: "6 to 12 Days",
    price: "USD 750 – 1,100 per person",
    difficulty: "Moderate",
    desc: "Trek Highlights\n• Close view of Annapurna I (8,091m)\n• Machhapuchhre (Fishtail) mountain scenery\n• Natural hot springs at Jhinu Danda\n• Traditional Gurung villages\n• Sunrise from Annapurna Sanctuary\n\nRoute: Pokhara → Ghandruk → Chhomrong → Bamboo → ABC → return",
    image: "/images/hero-snow.jpg",
    isFeatured: true
  },
  {
    title: "Annapurna Circuit Trek",
    region: "Nepal",
    duration: "12 to 18 Days",
    price: "USD 1,100 – 1,600 per person",
    difficulty: "Challenging",
    desc: "Trek Highlights\n• Thorong La Pass (5,416m)\n• Muktinath Temple visit\n• Kali Gandaki Gorge\n• Changing landscapes (tropical to alpine desert)\n\nRoute: Besisahar → Manang → Thorong La → Muktinath → Jomsom",
    image: "/images/annapurna.png",
    isFeatured: true
  },
  {
    title: "Everest Base Camp Trek",
    region: "Nepal",
    duration: "12 to 14 Days",
    price: "USD 1,200 – 1,800 per person",
    difficulty: "Challenging",
    desc: "Trek Highlights\n• Everest Base Camp (5,364m)\n• Kala Patthar viewpoint\n• Sherpa culture in Namche Bazaar\n• Scenic flight to Lukla\n\nRoute: Lukla → Namche → Tengboche → Lobuche → EBC → Kala Patthar",
    image: "/images/everest.png",
    isFeatured: true
  },
  {
    title: "Bhutan Himalayan Culture Escape",
    region: "Bhutan",
    duration: "4 Nights / 5 Days",
    price: "USD 950 – 1,250 per person",
    difficulty: "Easy",
    desc: "Trip Highlights\n• Explore the capital city Thimphu\n• Visit the iconic Tiger's Nest Monastery in Paro\n• Experience traditional Bhutanese culture and architecture\n• Scenic drives through Himalayan valleys",
    image: "/images/hero-grass.jpg",
    isFeatured: true
  },
  {
    title: "Varanasi • Taj Mahal • Ayodhya",
    region: "India",
    duration: "5 to 8 Days",
    price: "USD 450 – 700 per person",
    difficulty: "Easy",
    desc: "India Spiritual & Cultural\n• Evening Ganga Aarti in Varanasi\n• Sunrise boat ride on the Ganges\n• Visit to the Taj Mahal\n• Sacred temples and ghats of Varanasi",
    image: "/images/hero-night.jpg",
    isFeatured: true
  }
];

async function seed() {
  const batch = writeBatch(db);
  seedData.forEach((trip) => {
    const newDocRef = doc(collection(db, "trips"));
    batch.set(newDocRef, { ...trip, createdAt: new Date() });
  });
  await batch.commit();
  console.log("Seed data pushed to Firestore.");
}

seed().catch(console.error);
