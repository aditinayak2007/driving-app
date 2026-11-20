# DRIVE INDIA 3D – Experience Indian Roads
**Coastal Karnataka Edition (Mangaluru • Surathkal • BC Road • Bantwal • Puttur)**

> **Engineering Project by Aditi Nayak**  
> **Technologies:** React 19, Vite 8, Three.js, MediaPipe Computer Vision, Web Audio API  
> **Live GitHub Pages URL:** [https://aditinayak2007.github.io/driving-app/](https://aditinayak2007.github.io/driving-app/)  
> **Repository:** [https://github.com/aditinayak2007/driving-app](https://github.com/aditinayak2007/driving-app)

---

## 🚗 Project Vision

**DRIVE INDIA 3D** is an advanced, immersive 3D car driving simulator where users drive an authentic Indian Right-Hand-Drive (RHD) vehicle using **ONLY real-world hand gestures** captured through their webcam.

- ❌ No physical steering wheel
- ❌ No gaming controller
- ❌ No keyboard required during gameplay
- ❌ No touchscreen interaction
- ❌ No external sensors
- ✅ **100% Real-Time AI Computer Vision Hand Tracking**

---

## 🖐️ Hand Gesture Controls

| Control | Gesture | Response |
| :--- | :--- | :--- |
| **Steering (Right Turn)** | Rotate hands **Clockwise** | Virtual 3D steering wheel turns right; front wheels turn; car steers right |
| **Steering (Left Turn)** | Rotate hands **Counter-Clockwise** | Virtual 3D steering wheel turns left; front wheels turn; car steers left |
| **Neutral Return** | Both hands level at 9 & 3 o'clock | Steering returns smoothly to center |
| **Accelerator** | Clench **Right Hand into a Fist** | Smooth torque acceleration and turbo whistle |
| **Brake** | Extend **Left Hand Open Palm** facing camera | Activates rear brake lights and brings vehicle to a smooth stop |
| **Gear Shift** | **Pinch** Right Hand Thumb & Index together | Shifts through Reverse (`R`), Neutral (`N`), 1st, 2nd, 3rd, 4th, 5th |
| **Indian Horn** | Form **Double Fists** with both hands simultaneously | Blasts the authentic dual-tone Indian vehicle horn (*PAAAM-PAAAM!*) |
| **Turn Indicators** | Raise **Left Hand** (Left) / Raise **Right Hand** (Right) | Flashes corner indicator lamps with relay tick-tock audio |
| **Camera View** | Show **3 Fingers Extended** (Index, Middle, Ring) | Toggles Cockpit (1st Person) → Chase Cam → Hood Cam → Side View |

*Note: For accessibility and dev testing, full keyboard controls (`W/A/S/D`, `Arrow Keys`, `1-5`, `Space`, `H`) and an on-screen virtual steering deck are also included.*

---

## 🏎️ Selectable Right-Hand Drive (RHD) Indian Cars

1. **Mahindra Scorpio-N (`D175 4Xplor Diesel`)**
   - 175 HP, 400 Nm Torque, ladder frame chassis, high ground clearance, signature chrome grille, diesel turbo rumble.
2. **Tata Nexon (`Fearless+ 1.2L Revotron Turbo`)**
   - 120 HP, 170 Nm Torque, dual-tone roof, signature X-factor rear styling, 5-Star NCAP safety icon.
3. **Maruti Suzuki Swift (`ZXi+ 1.2L DualJet`)**
   - 90 HP, 113 Nm Torque, ultra-lightweight and zippy city handling, twin-pod digital-analog cluster.

---

## 🌴 Dakshina Kannada, Karnataka Environment

- **Strict Indian Left-Hand Driving Orientation**
- **Coastal Scenery:** Coconut palms (*Thengina mara*), Areca nut plantations (*Adike mara*), Mangalorean terracotta red-tiled houses (*Guthu mane*), roadside tea stalls (*Kadale baji & chai*), petrol pumps, roadside temple shrines with saffron flag, KSRTC bus stops with Kannada & English boards (*ಸುರತ್ಕಲ್ / Surathkal, ಮಂಗಳೂರು / Mangaluru, ಬಿ.ಸಿ. ರೋಡ್ / BC Road*), and NH-66 highway milestones.
- **Dynamic AI Traffic:** Auto-Rickshaws, KSRTC express buses, Indian commuter cars, and motorcycles moving in left-side lanes.

---

## 🎮 Driving Game Modes

1. **Mode 1: Free Drive** – Relaxed coastal highway exploration without timers or restrictions.
2. **Mode 2: City Driving** – Mangaluru city scenario with traffic signals, auto-rickshaw traffic, and municipal speed limits.
3. **Mode 3: Indian RTO Driving Test** – Official Karnataka RTO Form 4 Automated Skill Test with S-curves, 8-track, signal stop, reverse bay parking, and a final Smart DL Scorecard with confetti!

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite 8, Tailwind CSS
- **3D Graphics:** Three.js (Procedural vehicles, RHD cockpit, lighting, dynamic shadows)
- **Computer Vision:** MediaPipe Hands / MediaPipe Tasks Vision
- **Audio Engine:** Web Audio API procedural synthesis (Engine RPM, dual-tone horn, relay clicks, gear shifts)

---

## 🚀 Running Locally

```bash
# Clone the repository
git clone https://github.com/aditinayak2007/driving-app.git
cd driving-app

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser. Allow webcam access when prompted, hold both hands in front of the screen, and drive!
