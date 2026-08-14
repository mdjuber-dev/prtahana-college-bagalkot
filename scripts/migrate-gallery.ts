import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_QGtvELB0r4ah@ep-polished-dew-az3hy7h1.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const GALLERY_IMAGES = [
  { src: '/images/gallery/gallery-1.jpg', alt: 'Prarthana PU Science College - Main Campus Building', title: 'Main Campus Building', category: 'Campus', sort_order: 1 },
  { src: '/images/gallery/gallery-2.jpg', alt: 'Prarthana PU Science College - Campus Entrance Gardens', title: 'Campus Entrance Gardens', category: 'Campus', sort_order: 2 },
  { src: '/images/gallery/gallery-3.jpg', alt: 'Prarthana PU Science College - Biology Laboratory', title: 'Biology Laboratory', category: 'Laboratories', sort_order: 3 },
  { src: '/images/gallery/gallery-4.jpg', alt: 'Prarthana PU Science College - Chemistry Laboratory', title: 'Chemistry Laboratory', category: 'Laboratories', sort_order: 4 },
  { src: '/images/gallery/gallery-5.jpg', alt: 'Prarthana PU Science College - Physics Laboratory', title: 'Physics Laboratory', category: 'Laboratories', sort_order: 5 },
  { src: '/images/gallery/gallery-6.jpg', alt: 'Prarthana PU Science College - Smart Digital Classroom', title: 'Smart Digital Classroom', category: 'Classrooms', sort_order: 6 },
  { src: '/images/gallery/gallery-7.jpg', alt: 'Prarthana PU Science College - Lecture Hall Overview', title: 'Lecture Hall Overview', category: 'Classrooms', sort_order: 7 },
  { src: '/images/gallery/gallery-8.jpg', alt: 'Prarthana PU Science College - Computer Science Lab', title: 'Computer Science Lab', category: 'Laboratories', sort_order: 8 },
  { src: '/images/gallery/gallery-9.jpg', alt: 'Prarthana PU Science College - Central College Library', title: 'Central College Library', category: 'Library', sort_order: 9 },
  { src: '/images/gallery/gallery-10.jpg', alt: 'Prarthana PU Science College - Library Quiet Reading Area', title: 'Library Quiet Reading Area', category: 'Library', sort_order: 10 },
  { src: '/images/gallery/gallery-11.jpg', alt: 'Prarthana PU Science College - Annual Cultural Day', title: 'Annual Cultural Day', category: 'Events', sort_order: 11 },
  { src: '/images/gallery/gallery-12.jpg', alt: 'Prarthana PU Science College - Sports Meet Competition', title: 'Sports Meet Competition', category: 'Events', sort_order: 12 },
  { src: '/images/gallery/gallery-13.jpg', alt: 'Prarthana PU Science College - State Level Science Exhibition', title: 'State Level Science Exhibition', category: 'Events', sort_order: 13 },
  { src: '/images/gallery/gallery-14.jpg', alt: 'Prarthana PU Science College - Student Cultural Performance', title: 'Student Cultural Performance', category: 'Events', sort_order: 14 },
  { src: '/images/gallery/gallery-15.jpg', alt: 'Prarthana PU Science College - Graduation Ceremony', title: 'Graduation Ceremony', category: 'Events', sort_order: 15 },
  { src: '/images/gallery/gallery-16.jpg', alt: 'Prarthana PU Science College - Green Walkway & Courtyard', title: 'Green Walkway & Courtyard', category: 'Campus', sort_order: 16 },
  { src: '/images/gallery/gallery-17.jpg', alt: 'Prarthana PU Science College - Campus Landscape Garden', title: 'Campus Landscape Garden', category: 'Campus', sort_order: 17 },
  { src: '/images/gallery/gallery-18.jpg', alt: 'Prarthana PU Science College - Multipurpose Seminar Hall', title: 'Multipurpose Seminar Hall', category: 'Classrooms', sort_order: 18 },
  { src: '/images/gallery/gallery-19.jpg', alt: 'Prarthana PU Science College - Robotics & AI Innovation Lab', title: 'Robotics & AI Innovation Lab', category: 'Laboratories', sort_order: 19 },
  { src: '/images/gallery/gallery-20.jpg', alt: 'Prarthana PU Science College - Student Lounge & Discussion Area', title: 'Student Lounge & Discussion Area', category: 'Campus', sort_order: 20 },
];

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Clear existing gallery records (safe for re-run)
    await client.query('DELETE FROM public.gallery');

    for (const img of GALLERY_IMAGES) {
      await client.query(
        `INSERT INTO public.gallery (src, alt, title, category, type, is_active, sort_order, width, height)
         VALUES ($1, $2, $3, $4, $5, true, $6, 800, 600)`,
        [img.src, img.alt, img.title, img.category, 'image', img.sort_order]
      );
    }

    await client.query('COMMIT');
    console.log(`Successfully migrated ${GALLERY_IMAGES.length} gallery images to database.`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
