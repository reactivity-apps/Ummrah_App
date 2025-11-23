/**
 * Mock Data for Umrah Guide Mobile App
 * 
 * This file contains all the mock data used throughout the application.
 * In production, this would be replaced with API calls to a backend service.
 */

// ============================================================================
// DUAS - Islamic Supplications
// ============================================================================

export const DUAS = [
    {
        id: '1',
        title: 'Entering the Mosque',
        arabic: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
        transliteration: 'Allahumma iftah li abwaba rahmatik',
        translation: 'O Allah, open the gates of Your mercy for me.',
        category: 'Mosque'
    },
    {
        id: '2',
        title: 'Seeing the Kaaba',
        arabic: 'اللَّهُمَّ زِدْ هَذَا الْبَيْتَ تَشْرِيفًا وَتَعْظِيمًا وَتَكْرِيمًا وَمَهَابَةً',
        transliteration: 'Allahumma zid hadhal-bayta tashrifan wa ta\'ziman wa takriman wa mahabah',
        translation: 'O Allah, increase this House in honor, esteem, respect and reverence.',
        category: 'Kaaba'
    },
    {
        id: '3',
        title: 'Drinking Zamzam',
        arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا وَاسِعًا وَشِفَاءً مِنْ كُلِّ دَاءٍ',
        transliteration: 'Allahumma inni as\'aluka \'ilman nafi\'an wa rizqan wasi\'an wa shifa\'an min kulli da\'',
        translation: 'O Allah, I ask You for beneficial knowledge, abundant provision, and a cure from every illness.',
        category: 'General'
    },
    {
        id: '4',
        title: 'Talbiyah',
        arabic: 'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لاَ شَرِيكَ لَكَ لَبَّيْكَ',
        transliteration: 'Labbayk Allahumma Labbayk, Labbayka la sharika laka Labbayk',
        translation: 'Here I am, O Allah, here I am. Here I am, You have no partner, here I am.',
        category: 'Tawaf'
    },
    {
        id: '5',
        title: 'During Tawaf',
        arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
        transliteration: 'Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina \'adhaban-nar',
        translation: 'Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.',
        category: 'Tawaf'
    },
    {
        id: '6',
        title: 'At Safa and Marwa',
        arabic: 'إِنَّ الصَّفَا وَالْمَرْوَةَ مِن شَعَائِرِ اللَّهِ',
        transliteration: 'Inna as-Safa wal-Marwata min sha\'a\'irillah',
        translation: 'Indeed, Safa and Marwa are among the symbols of Allah.',
        category: 'Sa\'i'
    },
    {
        id: '7',
        title: 'Morning Dhikr',
        arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ',
        transliteration: 'Asbahna wa asbahal-mulku lillah',
        translation: 'We have entered the morning and the dominion belongs to Allah.',
        category: 'Morning'
    },
    {
        id: '8',
        title: 'Evening Dhikr',
        arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ',
        transliteration: 'Amsayna wa amsal-mulku lillah',
        translation: 'We have entered the evening and the dominion belongs to Allah.',
        category: 'Evening'
    }
];

// ============================================================================
// GUIDES - Step-by-step Instructions for Umrah Rituals
// ============================================================================

export const GUIDES = [
    {
        id: '1',
        title: 'Ihram',
        description: 'Entering the sacred state',
        status: 'completed',
        steps: [
            {
                title: 'Perform Ghusl',
                description: 'Take a ritual bath to purify yourself before entering the state of Ihram.',
                details: 'The ghusl is Sunnah. It cleanses and prepares you spiritually for this blessed journey.'
            },
            {
                title: 'Wear Ihram Garments',
                description: 'Men wear two white seamless cloths. Women wear modest clothing.',
                details: 'Men: Two white unstitched sheets (izar and rida). Women: Regular modest Islamic clothing.'
            },
            {
                title: 'Make Niyyah',
                description: 'Form the intention in your heart for performing Umrah.',
                details: 'Say: "Allahumma labbayka bi \'umrah" (O Allah, I am here to perform Umrah).'
            },
            {
                title: 'Recite Talbiyah',
                description: 'Begin reciting the Talbiyah frequently.',
                details: 'Labbayk Allahumma Labbayk... Continue until you reach the Kaaba.'
            }
        ]
    },
    {
        id: '2',
        title: 'Tawaf',
        description: 'Circumambulating the Kaaba',
        status: 'current',
        steps: [
            {
                title: 'Face the Black Stone',
                description: 'Begin at the Black Stone (Hajar al-Aswad).',
                details: 'Raise your hands and say "Bismillahi Allahu Akbar". Kiss it if possible, or point to it.'
            },
            {
                title: 'Circle the Kaaba',
                description: 'Walk counter-clockwise around the Kaaba 7 times.',
                details: 'Keep the Kaaba on your left. Men should do Idhtiba (expose right shoulder) and Raml (brisk walking) in first 3 circuits.'
            },
            {
                title: 'Pray at Maqam Ibrahim',
                description: 'Pray 2 rakats behind the Station of Ibrahim.',
                details: 'If crowded, pray anywhere in the Haram. Recite Surah Al-Kafirun and Al-Ikhlas.'
            },
            {
                title: 'Drink Zamzam',
                description: 'Drink Zamzam water and make dua.',
                details: 'Make sincere dua while drinking. The Prophet (ﷺ) said: "Zamzam water is for whatever purpose it is drunk."'
            }
        ]
    },
    {
        id: '3',
        title: 'Sa\'i',
        description: 'Walking between Safa and Marwa',
        status: 'upcoming',
        steps: [
            {
                title: 'Go to Safa',
                description: 'Walk to the hill of Safa to begin Sa\'i.',
                details: 'Face the Kaaba and raise your hands in dua. Recite: "Inna as-Safa wal-Marwata min sha\'a\'irillah"'
            },
            {
                title: 'Walk to Marwa',
                description: 'Walk at a normal pace from Safa to Marwa.',
                details: 'Between the green lights, men should run/jog. Make dhikr and dua throughout.'
            },
            {
                title: 'Complete 7 Laps',
                description: 'Go back and forth between Safa and Marwa 7 times.',
                details: 'Safa to Marwa is 1. Marwa to Safa is 2. Continue until you end at Marwa on the 7th lap.'
            },
            {
                title: 'Final Dua',
                description: 'Make dua at Marwa after completing the 7th lap.',
                details: 'This completes the Sa\'i. Now proceed to shave or trim your hair.'
            }
        ]
    },
    {
        id: '4',
        title: 'Halq or Taqsir',
        description: 'Shaving or trimming hair',
        status: 'upcoming',
        steps: [
            {
                title: 'Men: Shave or Trim',
                description: 'Shave your entire head (Halq) or trim your hair (Taqsir).',
                details: 'Shaving the head is more rewarding. If trimming, cut at least an inch from all over.'
            },
            {
                title: 'Women: Trim',
                description: 'Women should cut a fingertip\'s length from their hair.',
                details: 'Take a small portion of hair and cut about an inch. This can be done privately.'
            },
            {
                title: 'Exit Ihram',
                description: 'You have now completed Umrah and exited the state of Ihram.',
                details: 'All restrictions of Ihram are now lifted. You may wear regular clothes and use perfume.'
            },
            {
                title: 'Make Final Dua',
                description: 'Thank Allah for enabling you to complete this blessed journey.',
                details: 'Make dua for yourself, your family, and all Muslims. May Allah accept your Umrah!'
            }
        ]
    }
];

// ============================================================================
// ZIYARAT - Holy Sites to Visit in Makkah and Madinah
// ============================================================================

export const ZIYARAT = [
    {
        id: '1',
        title: 'Masjid Quba',
        description: 'The first mosque built by the Prophet (PBUH) in Madinah.',
        location: 'Madinah',
        distance: '6.5 km from Masjid Nabawi',
        visitTime: '30-45 minutes',
        significance: 'Praying 2 rakats here equals the reward of Umrah.',
        tips: [
            'Best to visit in the morning',
            'Pray 2 rakats upon entering',
            'Make Wudu from the well if possible',
            'Free shuttle available from Masjid Nabawi'
        ]
    },
    {
        id: '2',
        title: 'Mount Uhud',
        description: 'Site of the Battle of Uhud and the resting place of the martyrs.',
        location: 'Madinah',
        distance: '5 km from Masjid Nabawi',
        visitTime: '1-2 hours',
        significance: 'Location of the famous battle where 70 companions were martyred including Hamza (RA).',
        tips: [
            'Visit the cemetery of the martyrs',
            'Make dua for the shuhada',
            'Learn about the battle history',
            'Modest dress required'
        ]
    },
    {
        id: '3',
        title: 'Jannat al-Baqi',
        description: 'The main cemetery of Madinah where many companions are buried.',
        location: 'Madinah',
        distance: 'Adjacent to Masjid Nabawi',
        visitTime: '15-30 minutes',
        significance: 'Burial place of family members of the Prophet (ﷺ) and many companions.',
        tips: [
            'Only men can enter',
            'Visit after Fajr or Asr',
            'Make dua for the deceased',
            'Send salaam to the companions'
        ]
    },
    {
        id: '4',
        title: 'Cave of Hira',
        description: 'Where Prophet Muhammad (ﷺ) received the first revelation.',
        location: 'Makkah',
        distance: '4 km from Masjid Haram',
        visitTime: '2-3 hours (including hike)',
        significance: 'The cave where Angel Jibreel first appeared to the Prophet (ﷺ).',
        tips: [
            'Requires hiking - wear comfortable shoes',
            'Visit early morning to avoid heat',
            'Bring water',
            'No religious significance to entering the cave itself'
        ]
    },
    {
        id: '5',
        title: 'Jannat al-Mualla',
        description: 'Historic cemetery in Makkah where many of the Prophet\'s relatives are buried.',
        location: 'Makkah',
        distance: '1 km from Masjid Haram',
        visitTime: '20-30 minutes',
        significance: 'Burial place of Khadijah (RA), the Prophet\'s first wife, and other relatives.',
        tips: [
            'Open specific hours only',
            'Make dua for the deceased',
            'Reflect on mortality',
            'No structures remain on graves'
        ]
    }
];

// ============================================================================
// SCHEDULE - Daily Itinerary for the Umrah Trip
// ============================================================================

export const SCHEDULE = [
    {
        id: '1',
        date: '2025-02-08',
        day: 'Day 1',
        location: 'Madinah',
        activities: [
            { time: '10:00 AM', title: 'Arrival at Madinah Airport', type: 'travel' },
            { time: '12:00 PM', title: 'Check-in at Hotel', type: 'accommodation' },
            { time: '01:30 PM', title: 'Dhuhr Prayer at Masjid Nabawi', type: 'prayer' },
            { time: '03:00 PM', title: 'Orientation Session', type: 'group' },
            { time: '08:00 PM', title: 'Group Dinner', type: 'meal' }
        ]
    },
    {
        id: '2',
        date: '2025-02-09',
        day: 'Day 2',
        location: 'Madinah',
        activities: [
            { time: '06:00 AM', title: 'Fajr at Masjid Nabawi', type: 'prayer' },
            { time: '09:00 AM', title: 'Breakfast', type: 'meal' },
            { time: '10:30 AM', title: 'Visit to Masjid Quba', type: 'ziyarat' },
            { time: '03:00 PM', title: 'Free time for worship', type: 'free' },
            { time: '06:00 PM', title: 'Maghrib Prayer', type: 'prayer' }
        ]
    },
    {
        id: '3',
        date: '2025-02-10',
        day: 'Day 3',
        location: 'Makkah',
        activities: [
            { time: '08:00 AM', title: 'Breakfast and Check-out', type: 'meal' },
            { time: '09:00 AM', title: 'Depart for Makkah', type: 'travel' },
            { time: '01:00 PM', title: 'Arrive Makkah - Hotel Check-in', type: 'accommodation' },
            { time: '03:00 PM', title: 'Rest', type: 'free' },
            { time: '08:30 PM', title: 'Group Dinner at Hotel', type: 'meal' }
        ]
    }
];

// ============================================================================
// DOCUMENTS - Important Travel Documents and Information
// ============================================================================

export const DOCUMENTS = [
    {
        id: '1',
        title: 'Passport',
        description: 'Valid for at least 6 months',
        status: 'verified',
        category: 'Travel'
    },
    {
        id: '2',
        title: 'Umrah Visa',
        description: 'Electronic visa confirmation',
        status: 'verified',
        category: 'Travel'
    },
    {
        id: '3',
        title: 'Flight Tickets',
        description: 'Round trip confirmation',
        status: 'verified',
        category: 'Travel'
    },
    {
        id: '4',
        title: 'Hotel Vouchers',
        description: 'Madinah and Makkah accommodation',
        status: 'pending',
        category: 'Accommodation'
    },
    {
        id: '5',
        title: 'Travel Insurance',
        description: 'Emergency medical coverage',
        status: 'verified',
        category: 'Insurance'
    },
    {
        id: '6',
        title: 'Vaccination Certificate',
        description: 'Required immunizations',
        status: 'verified',
        category: 'Health'
    }
];

// ============================================================================
// PROFILE - User Profile Information and Preferences
// ============================================================================

export const PROFILE = {
    name: 'Ahmed Hassan',
    email: 'ahmed.hassan@example.com',
    phone: '+1 (555) 123-4567',
    completedUmrahs: 2,
    nextTrip: 'February 8, 2025',
    emergencyContact: {
        name: 'Fatima Hassan',
        relationship: 'Spouse',
        phone: '+1 (555) 123-4568'
    },
    preferences: {
        language: 'English',
        notifications: true,
        prayerReminders: true
    }
};
