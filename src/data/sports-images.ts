/**
 * ============================================================================
 * SPORTS IMAGES CONFIGURATION
 * ============================================================================
 * HOW TO CHANGE SPORTS IMAGES:
 * 1. Place sports images inside: public/images/sports/
 *    Files: sports-1.jpg through sports-20.jpg
 * 2. Update sports event titles and descriptions below.
 * 3. NO REACT/COMPONENT CODE NEEDS TO BE TOUCHED.
 * ============================================================================
 */

export interface SportsImage {
  id: number;
  image: string;
  src: string; // Alias for component compatibility
  title: string;
  description: string;
  alt: string;
}

export const sportsImages: SportsImage[] = Array.from({ length: 20 }, (_, index) => {
  const num = index + 1;
  const titles = [
    'Annual Sports Meet Opening',
    'Cricket Tournament',
    'Volleyball Championship',
    'Basketball Match',
    'Badminton Tournament',
    'Athletics 100m Sprint',
    'Table Tennis Final',
    'Chess Championship',
    'Kabaddi Tournament',
    'Football Championship',
    'Relay Race Event',
    'Long Jump Event',
    'Shot Put Competition',
    'Yoga & Fitness Session',
    'March Past Ceremony',
    'Trophies & Award Ceremony',
    'Inter-College Sports League',
    'Indoor Games Room',
    'Track & Field Training',
    'Team Sports Celebration',
  ];

  const imagePath = `/images/sports/sports-${num}.jpg`;

  return {
    id: num,
    image: imagePath,
    src: imagePath,
    title: titles[index],
    description: `Sports event ${titles[index]} at Prarthana PU Science College, Bagalkot.`,
    alt: `Prarthana PU Science College - ${titles[index]}`,
  };
});
