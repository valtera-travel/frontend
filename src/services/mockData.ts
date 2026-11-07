// Data contoh yang meniru struktur database SRS: data utama + tabel terjemahan (id/en) terpisah.
import type { Lang } from '../types/api'

type T<F> = Record<Lang, F>
const u = (id: string, w = 900) =>
  `https://images.unsplash.com/${id}?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=${w}`

export interface MDestination { id: number; imageUrl: string; isActive: boolean; tr: T<{ name: string; region: string; description: string }> }
export interface MPackage {
  id: number; destinationId: number; pricePerPerson: number; durationDays: number; imageUrl: string; isActive: boolean
  inquiryCount: number; tr: T<{ name: string; description: string; highlights: string }>
}
export interface MSchedule { id: number; packageId: number; departureDate: string; returnDate: string; isActive: boolean }
export interface MInclusion { id: number; packageId: number; order: number; tr: T<{ itemName: string; description: string }> }

export const destinations: MDestination[] = [
  { id: 1, imageUrl: u('photo-1555400038-63f5ba517a47'), isActive: true, tr: {
    id: { name: 'Bali', region: 'Indonesia', description: 'Pulau dewata dengan sawah berundak, pantai, pura, dan kuliner yang kaya budaya.' },
    en: { name: 'Bali', region: 'Indonesia', description: 'The island of the gods, with terraced rice fields, beaches, temples, and rich culinary culture.' } } },
  { id: 2, imageUrl: u('photo-1657788405193-c2039edaad6b'), isActive: true, tr: {
    id: { name: 'Labuan Bajo', region: 'Indonesia', description: 'Gerbang menuju Taman Nasional Komodo dengan pulau-pulau eksotis dan laut jernih.' },
    en: { name: 'Labuan Bajo', region: 'Indonesia', description: 'Gateway to Komodo National Park, with exotic islands and crystal-clear waters.' } } },
  { id: 3, imageUrl: u('photo-1624253321171-1be53e12f5f4'), isActive: true, tr: {
    id: { name: 'Kyoto', region: 'Jepang', description: 'Kota kuno dengan kuil, taman, dan tradisi yang terjaga, indah terutama saat sakura.' },
    en: { name: 'Kyoto', region: 'Japan', description: 'An ancient city of temples, gardens, and living traditions, loveliest in cherry blossom season.' } } },
  { id: 4, imageUrl: u('photo-1580502304784-8985b7eb7260'), isActive: true, tr: {
    id: { name: 'Santorini', region: 'Yunani', description: 'Pulau vulkanik dengan rumah putih di tebing dan matahari terbenam yang terkenal.' },
    en: { name: 'Santorini', region: 'Greece', description: 'A volcanic island of white cliffside houses and world-famous sunsets.' } } },
]

export const packages: MPackage[] = [
  { id: 1, destinationId: 1, pricePerPerson: 4850000, durationDays: 5, imageUrl: u('photo-1555400038-63f5ba517a47'), isActive: true, inquiryCount: 42, tr: {
    id: { name: 'Ubud & Pantai Selatan', description: 'Jelajahi budaya Ubud lalu bersantai di pantai selatan Bali dengan itinerary yang seimbang.', highlights: 'Sunrise Tegalalang, kelas memasak, Uluwatu' },
    en: { name: 'Ubud & Southern Beaches', description: "Explore Ubud's culture, then unwind on Bali's southern beaches with a balanced itinerary.", highlights: 'Tegalalang sunrise, cooking class, Uluwatu' } } },
  { id: 2, destinationId: 2, pricePerPerson: 6200000, durationDays: 4, imageUrl: u('photo-1657788405193-c2039edaad6b'), isActive: true, inquiryCount: 27, tr: {
    id: { name: 'Pelayaran Pulau Komodo', description: 'Berlayar dengan kapal phinisi mengunjungi pulau-pulau ikonik di Taman Nasional Komodo.', highlights: 'Padar, Pink Beach, Manta Point' },
    en: { name: 'Komodo Island Cruise', description: 'Sail on a phinisi boat to the iconic islands of Komodo National Park.', highlights: 'Padar, Pink Beach, Manta Point' } } },
  { id: 3, destinationId: 3, pricePerPerson: 18900000, durationDays: 7, imageUrl: u('photo-1624253321171-1be53e12f5f4'), isActive: true, inquiryCount: 35, tr: {
    id: { name: 'Kyoto Klasik & Sakura', description: 'Perjalanan budaya ke kuil dan taman Kyoto di musim sakura.', highlights: 'Fushimi Inari, Arashiyama, upacara teh' },
    en: { name: 'Classic Kyoto & Sakura', description: "A cultural trip through Kyoto's temples and gardens in cherry blossom season.", highlights: 'Fushimi Inari, Arashiyama, tea ceremony' } } },
  { id: 4, destinationId: 4, pricePerPerson: 31500000, durationDays: 8, imageUrl: u('photo-1580502304784-8985b7eb7260'), isActive: true, inquiryCount: 14, tr: {
    id: { name: 'Oia Senja & Kepulauan', description: 'Liburan romantis menikmati senja Oia dan pulau-pulau sekitar Santorini.', highlights: 'Sunset Oia, wine tasting, Fira' },
    en: { name: 'Oia Sunsets & Islands', description: 'A romantic escape enjoying Oia sunsets and the islands around Santorini.', highlights: 'Oia sunset, wine tasting, Fira' } } },
  { id: 5, destinationId: 1, pricePerPerson: 2900000, durationDays: 3, imageUrl: u('photo-1558005530-a7958896ec60'), isActive: true, inquiryCount: 19, tr: {
    id: { name: 'Sawah Berundak & Air Terjun', description: 'Akhir pekan hemat di Bali utara: sawah, air terjun, dan udara sejuk pegunungan.', highlights: 'Jatiluwih, Sekumpul, Munduk' },
    en: { name: 'Rice Terraces & Waterfalls', description: 'A budget-friendly getaway in North Bali: rice terraces, waterfalls, and cool mountain air.', highlights: 'Jatiluwih, Sekumpul, Munduk' } } },
  { id: 6, destinationId: 3, pricePerPerson: 16400000, durationDays: 6, imageUrl: u('photo-1558870832-c8db4b5b47d1'), isActive: true, inquiryCount: 9, tr: {
    id: { name: 'Kuil Merah & Danau', description: 'Menjelajah Kansai: Nara, Osaka, dan Danau Biwa dengan ritme santai.', highlights: 'Nara, Osaka, Lake Biwa' },
    en: { name: 'Red Shrines & Lakes', description: 'Discover Kansai: Nara, Osaka, and Lake Biwa at a relaxed pace.', highlights: 'Nara, Osaka, Lake Biwa' } } },
]

export const schedules: MSchedule[] = [
  { id: 1, packageId: 1, departureDate: '2027-01-15', returnDate: '2027-01-19', isActive: true },
  { id: 2, packageId: 1, departureDate: '2027-03-10', returnDate: '2027-03-14', isActive: true },
  { id: 3, packageId: 2, departureDate: '2027-02-05', returnDate: '2027-02-08', isActive: true },
  { id: 4, packageId: 3, departureDate: '2027-03-28', returnDate: '2027-04-03', isActive: true },
  { id: 5, packageId: 3, departureDate: '2027-04-04', returnDate: '2027-04-10', isActive: true },
  { id: 6, packageId: 4, departureDate: '2027-06-12', returnDate: '2027-06-19', isActive: true },
  { id: 7, packageId: 5, departureDate: '2027-01-22', returnDate: '2027-01-24', isActive: true },
  // paket 6 sengaja tanpa jadwal: untuk menguji empty state (SRS 4.2)
]

// Dibangun eksplisit agar mudah dibaca & diedit:
const raw: [number, [string, string, string, string][]][] = [
  [1, [['Hotel bintang 4', '4-star hotel', 'Akomodasi 4 malam', '4 nights accommodation'], ['Sarapan', 'Breakfast', 'Sarapan setiap pagi', 'Daily breakfast'], ['Antar-jemput', 'Airport transfer', 'Bandara – hotel PP', 'Airport – hotel, round trip'], ['Pemandu lokal', 'Local guide', 'Pemandu berpengalaman', 'Experienced guide']]],
  [2, [['Kapal phinisi', 'Phinisi boat', 'Kabin pribadi', 'Private cabin'], ['Makan penuh', 'Full meals', 'Tiga kali sehari', 'Three meals a day'], ['Snorkeling', 'Snorkeling', 'Peralatan disediakan', 'Equipment provided'], ['Tiket taman nasional', 'National park tickets', 'Tiket masuk Komodo', 'Komodo entrance tickets']]],
  [3, [['Tiket pesawat PP', 'Return flights', 'Kelas ekonomi', 'Economy class'], ['Hotel dekat stasiun', 'Hotel near station', '6 malam', '6 nights'], ['JR Pass 7 hari', '7-day JR Pass', 'Kereta antarkota', 'Intercity trains'], ['Asuransi', 'Insurance', 'Asuransi perjalanan dasar', 'Basic travel insurance']]],
  [4, [['Tiket pesawat PP', 'Return flights', 'Kelas ekonomi', 'Economy class'], ['Hotel kaldera', 'Caldera hotel', 'Pemandangan kaldera', 'Caldera view'], ['Tur kapal', 'Boat tour', 'Mengelilingi kepulauan', 'Island-hopping tour']]],
  [5, [['Villa privat', 'Private villa', '2 malam', '2 nights'], ['Sarapan', 'Breakfast', 'Setiap pagi', 'Every morning'], ['Sewa motor/mobil', 'Scooter/car rental', 'Selama trip', 'During the trip']]],
]
let incId = 1
export const inclusionRows: MInclusion[] = raw.flatMap(([packageId, items]) =>
  items.map(([ni, ne, di, de], i) => ({ id: incId++, packageId, order: i + 1, tr: { id: { itemName: ni, description: di }, en: { itemName: ne, description: de } } })))
