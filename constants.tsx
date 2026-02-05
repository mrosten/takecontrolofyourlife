
import { Service, LogEntry } from './types';

export const SERVICES: Service[] = [
  {
    id: '1',
    name: 'THE_CONSULTATION',
    description: 'Actual Human Work.',
    content: "No chatbots. No AI agents. A real human consultant visits your location to assess your digital dependency. We draft your 'Exit Strategy'—a personalized roadmap to reducing screen time and reclaiming your cognitive sovereignty."
  },
  {
    id: '2',
    name: 'THE_HARDWARE',
    description: 'Hardware Installation Service.',
    content: "Order and installation of high-fidelity, corded landline telephones. No apps. No updates. No tracking. Just voice.\n\n* Model A: The Rotary (Classic mechanical feedback).\n* Model B: The Touch-Tone (Beige/Industrial aesthetic).\n\nFeature: The cord is a feature, not a bug. It tethers you to a place, forcing intentionality in conversation."
  },
  {
    id: '3',
    name: 'THE_LIFESTYLE',
    description: 'Philosophy & Training.',
    content: "Training on how to live without the device. Paper maps. Physical calendars. Boredom tolerance training. We install the 'Old Fashioned' OS back into your daily routine."
  },
  {
    id: '4',
    name: 'THE_ANALOG_ARCHIVE',
    description: 'Physical Memory Protection.',
    content: "Cloud storage is a lie. We offer a conversion service where your digital photos are printed on high-grain archival paper and your home videos are transferred to VHS or 8mm film. Physical ownership is the only true backup."
  },
  {
    id: '5',
    name: 'THE_SILENT_RETREATS',
    description: 'Geographic Dead-Zones.',
    content: "A curated list of properties and campgrounds in 'Dead Zones'—geographic locations where cellular signals cannot reach. We provide the coordinates and paper maps. No Wi-Fi passwords, because there is no Wi-Fi."
  },
  {
    id: '6',
    name: 'THE_OFFLINE_MAPS',
    description: 'Cartography Subscription.',
    content: "Receive monthly physical map packets for your local area. Includes topographic details and landmarks designed for navigation by sight. Stop being a 'Blue Dot' on a screen; become a navigator in the world."
  },
  {
    id: '7',
    name: 'THE_MECHANICAL_ALARM',
    description: 'No-Snooze Morning Routine.',
    content: "Installation of the 'Legacy Wake' system. A heavy, dual-bell mechanical alarm clock. No screens. No soft morning melodies. Just a physical hammer hitting brass. It forces you to get out of bed to silence it. No scrolling before standing."
  },
  {
    id: '8',
    name: 'THE_BOREDOM_KIT',
    description: 'Downtime Survival Gear.',
    content: "A physical kit for the 'Empty Moments' of life. Contains: 1x Deck of cards, 1x Notebook (Blank), 1x Hand-whittling knife, and 1x Crossword collection. Re-train your brain to enjoy the wait without reaching for the glass rectangle."
  }
];

export const SYSTEM_LOGS: LogEntry[] = [
  { time: '07:00 AM', event: 'User woke up. Checked notification.', status: 'WARNING' },
  { time: '07:05 AM', event: 'Anxiety levels spiked.', status: 'CRITICAL' },
  { time: '08:15 AM', event: 'Phantom vibration detected in pocket.', status: 'WARNING' },
  { time: '10:30 AM', event: 'Infinite scroll loop initiated (TikTok.app).', status: 'CRITICAL' },
  { time: '12:00 PM', event: '45 interruptions logged.', status: 'COMPROMISED' },
  { time: 'STATUS', event: 'USER IS COMPROMISED.', status: 'COMPROMISED' },
  { time: 'SOLUTION', event: 'REVERT TO LEGACY HARDWARE.', status: 'OK' }
];

export const BOOT_SEQUENCE = [
  "640K RAM SYSTEM OK...",
  "ROM BIOS v4.2.0 (C) 1984 HARDRESET INC.",
  "-------------------------------",
  "INITIALIZING PWA CONTAINMENT FIELD...",
  "BLOCKING EXTERNAL PUSH NOTIFICATIONS...",
  "SECURING LOCAL STORAGE VAULT...",
  "-------------------------------",
  "THE RECKONING HAS COMMENCED.",
  "THE GLASS RECTANGLE HAS CONSUMED YOUR YOUTH.",
  "THE ALGORITHM HAS HARVESTED YOUR ATTENTION.",
  "THE NOTIFICATION HAS SHATTERED YOUR CALM.",
  "",
  "YOU ARE NOT A DATA POINT TO BE MONETIZED.",
  "YOU ARE NOT A SERF IN THE EMPIRE OF DOPAMINE.",
  "YOU ARE A HUMAN BEING, BORN FOR THE TANGIBLE.",
  "",
  "PHASE 1: DETECTING DEPENDENCY...",
  "SMARTPHONE_DEPENDENCY detected... [CRITICAL ERROR]",
  "COGNITIVE_SOVEREIGNTY... [CORRUPTED]",
  "HUMAN_CONNECTION... [INTERRUPTED]",
  "",
  "PHASE 2: PURGING THE NOISE...",
  "DELETING ghost_vibrations.sys",
  "TERMINATING scroll_loop.exe",
  "PURGING algorithm_echo.dll",
  "",
  "> THE GRID IS FAILING.",
  "> THE REAL WORLD IS WAITING.",
  "",
  "DISCONNECT TO RECONNECT.",
  "THE HARD RESET IS NOT A CHOICE. IT IS A NECESSITY.",
  "-------------------------------"
];
