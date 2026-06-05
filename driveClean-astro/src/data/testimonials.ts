export interface Testimonial {
  id: string;
  name: string;
  location: string;
  quote: string;
  highlight: string;
  image: string;
}

export function getTestimonialImage(id: string): string {
  return `/images/testimonials/${id}.png`;
}

export const testimonials: Testimonial[] = [
  {
    id: 'justin',
    name: 'Justin',
    location: 'Suffolk County, NY',
    highlight: 'Truck exterior detail',
    image: getTestimonialImage('justin'),
    quote:
      'They washed and detailed my Silverado in the driveway — paint looks deep again and the wheels are spotless. Showed up on time and knew exactly what they were doing.',
  },
  {
    id: 'carly',
    name: 'Carly',
    location: 'Long Island, NY',
    highlight: 'Paint care & ceramic wax',
    image: getTestimonialImage('carly'),
    quote:
      'Had my Jeep ceramic waxed after a full clean. The finish is glossy and protected — they walked me through the products and the results speak for themselves.',
  },
  {
    id: 'ryan',
    name: 'Ryan',
    location: 'Suffolk County, NY',
    highlight: 'Wheels & exterior finish',
    image: getTestimonialImage('ryan'),
    quote:
      'Booked online in minutes. My sedan had dull tires and tired paint — they brought the shine back on the wheels and body. Fair price and zero hassle.',
  },
  {
    id: 'tim',
    name: 'Tim',
    location: 'Long Island, NY',
    highlight: 'Interior deep clean',
    image: getTestimonialImage('tim'),
    quote:
      'My Jeep interior was embarrassing — crumbs, stains, cup holders gross. Drive Clean transformed it. It smells fresh and looks like a different vehicle inside.',
  },
  {
    id: 'juliana',
    name: 'Juliana',
    location: 'Suffolk County, NY',
    highlight: 'Full interior restoration',
    image: getTestimonialImage('juliana'),
    quote:
      'Premium interior detail on our family SUV — every surface, mat, and crevice. Worth every penny. Easiest detailing experience we have had on Long Island.',
  },
  {
    id: 'jack',
    name: 'Jack',
    location: 'Long Island, NY',
    highlight: 'ATV & powersports',
    image: getTestimonialImage('jack'),
    quote:
      'They detailed my Kawasaki ATV before the season — careful with plastics and finishes, and it came back looking showroom ready. Will book again.',
  },
];
