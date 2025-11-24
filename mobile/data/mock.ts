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
    },
    {
        id: '9',
        title: 'Exiting the Mosque',
        arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
        transliteration: 'Allahumma inni as\'aluka min fadlik',
        translation: 'O Allah, I ask You of Your bounty.',
        category: 'Mosque'
    },
    {
        id: '10',
        title: 'At the Black Stone',
        arabic: 'بِسْمِ اللَّهِ وَاللَّهُ أَكْبَرُ',
        transliteration: 'Bismillahi Wallahu Akbar',
        translation: 'In the name of Allah, and Allah is the Greatest.',
        category: 'Tawaf'
    },
    {
        id: '11',
        title: 'Between Rukn Yamani and Black Stone',
        arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
        transliteration: 'Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina \'adhaban-nar',
        translation: 'Our Lord, grant us good in this world and good in the Hereafter, and save us from the punishment of the Fire.',
        category: 'Tawaf'
    },
    {
        id: '12',
        title: 'During Sa\'i',
        arabic: 'رَبِّ اغْفِرْ وَارْحَمْ إِنَّكَ أَنْتَ الْأَعَزُّ الْأَكْرَمُ',
        transliteration: 'Rabbighfir warham innaka antal-a\'azzul-akram',
        translation: 'O Lord, forgive and have mercy, for You are the Most Mighty, the Most Generous.',
        category: 'Sa\'i'
    },
    {
        id: '13',
        title: 'At Multazam',
        arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْجَنَّةَ وَأَعُوذُ بِكَ مِنَ النَّارِ',
        transliteration: 'Allahumma inni as\'alukal-jannata wa a\'udhu bika minan-nar',
        translation: 'O Allah, I ask You for Paradise and I seek refuge in You from the Fire.',
        category: 'Kaaba'
    },
    {
        id: '14',
        title: 'Morning Protection',
        arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
        transliteration: 'A\'udhu bikalimatillahit-tammati min sharri ma khalaq',
        translation: 'I seek refuge in the perfect words of Allah from the evil of what He has created.',
        category: 'Morning'
    },
    {
        id: '15',
        title: 'Evening Protection',
        arabic: 'بِسْمِ اللَّهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
        transliteration: 'Bismillahil-ladhi la yadurru ma\'asmihi shay\'un fil-ardi wa la fis-sama\'i wa huwas-Sami\'ul-\'Alim',
        translation: 'In the name of Allah with whose name nothing is harmed on earth nor in the heavens, and He is the Hearing, the Knowing.',
        category: 'Evening'
    },
    {
        id: '16',
        title: 'Traveling Dua',
        arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ',
        transliteration: 'Subhanal-ladhi sakhkhara lana hadha wa ma kunna lahu muqrinin',
        translation: 'Glory to Him who has subjected this to us, and we could never have it by our efforts.',
        category: 'General'
    },
    {
        id: '17',
        title: 'For Forgiveness',
        arabic: 'رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ',
        transliteration: 'Rabbighfir li wa tub \'alayya innaka antat-Tawwabur-Rahim',
        translation: 'My Lord, forgive me and accept my repentance, for You are the Accepter of repentance, the Merciful.',
        category: 'General'
    },
    {
        id: '18',
        title: 'After Wudu',
        arabic: 'أَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
        transliteration: 'Ashhadu an la ilaha illallah wa ashhadu anna Muhammadan \'abduhu wa rasuluh',
        translation: 'I bear witness that there is no deity worthy of worship except Allah, and I bear witness that Muhammad is His servant and messenger.',
        category: 'General'
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
        description: 'The first mosque built by Prophet Muhammad (ﷺ) upon his arrival in Madinah during the Hijrah. This blessed mosque holds a special place in Islamic history as the foundation was laid by the Prophet himself alongside his companions. The mosque has been expanded several times throughout history and now accommodates thousands of worshippers.',
        location: 'Madinah',
        distance: '6.5 km from Masjid Nabawi',
        visitTime: '30-45 minutes',
        significance: 'The Prophet (ﷺ) said: "Whoever purifies himself at his home, then comes to Masjid Quba and prays in it, will have a reward like that of an Umrah." (Ibn Majah). This makes it one of the most rewarding places to visit in Madinah. The mosque is mentioned in the Quran as "the mosque founded on piety" (Surah At-Tawbah 9:108).',
        tips: [
            'Best to visit early morning after Fajr prayer',
            'Pray at least 2 rakats to receive the reward of Umrah',
            'Make Wudu from the well if possible for added blessings',
            'Free shuttle service available from Masjid Nabawi',
            'Wear modest clothing - women should wear abaya',
            'Take time to reflect on the history of this blessed place'
        ]
    },
    {
        id: '2',
        title: 'Mount Uhud',
        description: 'The site of the famous Battle of Uhud which took place in 625 CE (3 AH). This mountain witnessed one of the most significant battles in Islamic history where the Muslims faced the Quraysh army. Despite initial success, the battle ended with the martyrdom of 70 companions including Hamza ibn Abdul-Muttalib (RA), the beloved uncle of the Prophet (ﷺ). The mountain stands as a testament to sacrifice and devotion.',
        location: 'Madinah',
        distance: '5 km from Masjid Nabawi',
        visitTime: '1-2 hours',
        significance: 'The Prophet (ﷺ) said: "Uhud is a mountain that loves us and we love it." This battle taught important lessons about obedience, patience, and trust in Allah. The martyrs of Uhud, including Hamza (RA), Mus\'ab ibn Umair (RA), and Abdullah ibn Jahsh (RA), are buried at the foot of the mountain, making it a place of great spiritual significance.',
        tips: [
            'Visit the cemetery of the martyrs (Shuhada Uhud) and make dua',
            'Send peace and blessings upon the martyrs',
            'Learn about the battle history before visiting',
            'Modest dress required - cover properly',
            'Best visited in the morning to avoid heat',
            'Reflect on the sacrifices made by the companions',
            'Do not climb the mountain as it has no religious significance'
        ]
    },
    {
        id: '3',
        title: 'Jannat al-Baqi',
        description: 'The main cemetery of Madinah and one of the most sacred graveyards in Islam. Located adjacent to Masjid Nabawi, this blessed cemetery is the final resting place of many members of the Prophet\'s family and thousands of his companions. Notable figures buried here include Uthman ibn Affan (RA), Fatimah bint Muhammad (RA), Hassan ibn Ali (RA), and many others.',
        location: 'Madinah',
        distance: 'Adjacent to Masjid Nabawi (Eastern side)',
        visitTime: '15-30 minutes',
        significance: 'The Prophet (ﷺ) would frequently visit this cemetery and pray for those buried here. He said: "Peace be upon you, O abode of believing people. What you were promised has come to you... and we, if Allah wills, will join you." This cemetery represents the temporary nature of this worldly life and reminds us of the Hereafter.',
        tips: [
            'Only men are permitted to enter the cemetery',
            'Best time to visit is after Fajr or Asr prayer',
            'Make dua for the deceased companions and family members',
            'Send salaam to all those buried here',
            'Entry is only through specific gates',
            'Reflect on mortality and the temporary nature of life',
            'Women can make dua from outside the cemetery walls'
        ]
    },
    {
        id: '4',
        title: 'Cave of Hira',
        description: 'The cave where Prophet Muhammad (ﷺ) received the first revelation of the Quran through Angel Jibreel (Gabriel). Located on Jabal an-Nour (Mountain of Light), this small cave witnessed the beginning of prophethood when the Angel commanded "Read!" (Iqra). The Prophet would retreat here for meditation and contemplation before receiving revelation. The cave is approximately 4 meters in length and just over 1.5 meters wide.',
        location: 'Makkah',
        distance: '4 km northeast of Masjid al-Haram',
        visitTime: '2-3 hours (including hike)',
        significance: 'This is where the first verses of Surah Al-Alaq were revealed: "Read in the name of your Lord who created..." (96:1). This marked the beginning of Islam and the final revelation to mankind. The cave represents the moment that changed human history forever and the beginning of the prophetic mission.',
        tips: [
            'Requires hiking - wear comfortable, sturdy shoes',
            'Visit very early morning (before sunrise) to avoid extreme heat',
            'Bring plenty of water and stay hydrated',
            'The climb takes 30-45 minutes for average fitness',
            'There is no religious merit in entering the cave itself',
            'Avoid visiting in summer months due to extreme heat',
            'Not recommended for elderly or those with health conditions',
            'The view of Makkah from the mountain is breathtaking'
        ]
    },
    {
        id: '5',
        title: 'Jannat al-Mualla',
        description: 'The ancient cemetery of Makkah where many of the Prophet\'s closest family members and early Muslims are buried. This historic graveyard witnessed the burial of Khadijah bint Khuwaylid (RA), the Prophet\'s beloved first wife, as well as his grandfather Abdul-Muttalib, his uncle Abu Talib, and other members of Banu Hashim. Despite later modifications removing grave markers, the cemetery remains a powerful reminder of Islamic history.',
        location: 'Makkah',
        distance: '1 km north of Masjid al-Haram',
        visitTime: '20-30 minutes',
        significance: 'This cemetery holds profound historical importance as it contains the graves of those who supported and protected the Prophet (ﷺ) during the most difficult years of his mission. Khadijah (RA), who was the first to believe in him and stood by him through persecution, rests here. The cemetery serves as a reminder of the sacrifices made by the early Muslims.',
        tips: [
            'Open only at specific hours - check before visiting',
            'Make dua for all those buried here, especially Khadijah (RA)',
            'Reflect on the lives and sacrifices of early Muslims',
            'No structures remain on graves following Islamic tradition',
            'Entry times are limited, so plan accordingly',
            'Women are permitted to visit during designated hours',
            'Take time to learn about those buried here before visiting'
        ]
    },
    {
        id: '6',
        title: 'Masjid al-Qiblatayn',
        description: 'The Mosque of the Two Qiblas, where the direction of prayer was changed from Jerusalem to the Kaaba in Makkah. During a prayer led by the Prophet (ﷺ), revelation came commanding the Muslims to face the Kaaba instead of Jerusalem. The Prophet immediately turned mid-prayer, and the congregation followed, making this the only mosque where prayer was offered facing both qiblas.',
        location: 'Madinah',
        distance: '4.5 km from Masjid Nabawi',
        visitTime: '20-30 minutes',
        significance: 'This mosque marks the fulfillment of the Prophet\'s wish as mentioned in the Quran: "We have certainly seen the turning of your face toward the heaven, and We will surely turn you to a qiblah with which you will be pleased..." (Quran 2:144). This event unified the Muslim identity and established the Kaaba as the eternal direction of prayer.',
        tips: [
            'Pray 2 rakats to commemorate this historic event',
            'Learn about the story of the qibla change before visiting',
            'Mosque is beautifully renovated and well-maintained',
            'Free transportation available from Masjid Nabawi',
            'Good time to visit is between prayers',
            'Take photos to remember this historic site'
        ]
    },
    {
        id: '7',
        title: 'Masjid al-Jinn',
        description: 'The mosque built at the location where Prophet Muhammad (ﷺ) recited the Quran to a group of jinn who came to listen to him. This event is mentioned in the Quran in Surah Al-Jinn and Surah Al-Ahqaf. The jinn accepted Islam after hearing the recitation and returned to their people as warners.',
        location: 'Makkah',
        distance: '2 km from Masjid al-Haram',
        visitTime: '15-20 minutes',
        significance: 'The Quran mentions this event: "Say, [O Muhammad], it has been revealed to me that a group of the jinn listened and said, \'Indeed, we have heard an amazing Quran\'" (Quran 72:1). This demonstrates that the message of Islam extends beyond humans to all of Allah\'s creation.',
        tips: [
            'Small mosque, suitable for quick visit',
            'Pray 2 rakats and reflect on the universality of Islam',
            'Located in a residential area',
            'Best to visit during non-prayer times',
            'Combine with other Makkah ziyarat locations'
        ]
    },
    {
        id: '8',
        title: 'Masjid al-Ijabah',
        description: 'A historic mosque in Madinah known as the "Mosque of the Answered Prayer." It is believed that prayers made here are readily accepted. The mosque was originally the location where a clan of the Ansar lived who embraced Islam.',
        location: 'Madinah',
        distance: '2 km from Masjid Nabawi',
        visitTime: '20-30 minutes',
        significance: 'Many scholars recommend making sincere dua at this mosque due to its name and historical significance. It represents the early Muslim community in Madinah and the Ansar who supported the Prophet (ﷺ) and the Muhajirun.',
        tips: [
            'Make sincere dua for yourself and others',
            'Pray 2 rakats before making dua',
            'Less crowded than other major sites',
            'Good place for quiet reflection',
            'Take time for extended dua and remembrance'
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
