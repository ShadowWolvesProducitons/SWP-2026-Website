// Mock data for Shadow Wolves Productions

export const films = [
  {
    id: 1,
    title: "Midnight Eclipse",
    tagline: "When darkness falls, legends rise",
    genre: ["Thriller", "Drama"],
    year: 2024,
    duration: "118 min",
    rating: "R",
    synopsis: "A psychological thriller that follows a detective's descent into madness as she investigates a series of murders that mirror an ancient prophecy. Set against the backdrop of a city shrouded in perpetual twilight, the line between reality and nightmare blurs.",
    director: "Sarah Chen",
    producer: "Marcus Rodriguez",
    writer: "Emily Watson",
    cinematographer: "James Morrison",
    cast: [
      { name: "Alexandra Pierce", role: "Detective Maya Rivers" },
      { name: "Thomas Blake", role: "Dr. Adrian Cross" },
      { name: "Jessica Hart", role: "Elizabeth Kane" },
      { name: "Michael Storm", role: "Captain Reynolds" }
    ],
    posterColor: "#8B0000",
    trailerUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    featured: true
  },
  {
    id: 2,
    title: "The Last Horizon",
    tagline: "Beyond the edge lies truth",
    genre: ["Sci-Fi", "Adventure"],
    year: 2024,
    duration: "142 min",
    rating: "PG-13",
    synopsis: "In a post-apocalyptic world where humanity has retreated underground, a group of explorers ventures to the surface seeking a new home. What they discover challenges everything they believed about their past and future.",
    director: "David Kumar",
    producer: "Lisa Chang",
    writer: "Robert Jenkins",
    cinematographer: "Maria Santos",
    cast: [
      { name: "Chris Anderson", role: "Captain Erik Stone" },
      { name: "Nina Patel", role: "Dr. Aria Chen" },
      { name: "Marcus Johnson", role: "Tech Officer Cole" },
      { name: "Sofia Martinez", role: "Navigator Luna" }
    ],
    posterColor: "#1a4d6f",
    trailerUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    featured: true
  },
  {
    id: 3,
    title: "Crimson Oath",
    tagline: "Blood binds. Honor divides.",
    genre: ["Action", "Crime"],
    year: 2023,
    duration: "105 min",
    rating: "R",
    synopsis: "Two rival families control the city's underworld, bound by an ancient oath. When a new generation seeks to break free from the cycle of violence, they must confront the ghosts of their past and redefine what loyalty truly means.",
    director: "Anthony Russo",
    producer: "Jennifer Lee",
    writer: "Michael Grant",
    cinematographer: "Daniel Park",
    cast: [
      { name: "Vincent Kane", role: "Marco Valentino" },
      { name: "Isabella Rose", role: "Elena Moretti" },
      { name: "Derek Stone", role: "Tommy V" },
      { name: "Carla Martinez", role: "Sofia" }
    ],
    posterColor: "#5a0000",
    trailerUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    featured: false
  },
  {
    id: 4,
    title: "Whispers in the Dark",
    tagline: "Some secrets should stay buried",
    genre: ["Horror", "Mystery"],
    year: 2023,
    duration: "98 min",
    rating: "R",
    synopsis: "A paranormal investigator returns to her childhood home after her sister's mysterious disappearance. As she uncovers dark family secrets, she realizes the house has been waiting for her return.",
    director: "Rebecca Thornton",
    producer: "William Chen",
    writer: "Amanda Cross",
    cinematographer: "Luke Harrison",
    cast: [
      { name: "Emma Blackwood", role: "Dr. Catherine Wells" },
      { name: "James Mitchell", role: "Sheriff Grant" },
      { name: "Olivia Stevens", role: "Young Catherine" },
      { name: "Richard Kane", role: "The Voice" }
    ],
    posterColor: "#0f0f1a",
    trailerUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    featured: false
  },
  {
    id: 5,
    title: "Golden Age",
    tagline: "Dream big. Fight bigger.",
    genre: ["Drama", "Biography"],
    year: 2023,
    duration: "134 min",
    rating: "PG-13",
    synopsis: "The inspiring true story of a visionary filmmaker who revolutionized cinema in the 1960s, battling industry giants and societal prejudice to create art that would change the world forever.",
    director: "Michelle Roberts",
    producer: "Gregory Hall",
    writer: "Patricia Moore",
    cinematographer: "Andrew Wilson",
    cast: [
      { name: "Jonathan Blake", role: "Victor Castellano" },
      { name: "Rachel Green", role: "Margaret Ross" },
      { name: "Daniel Foster", role: "Studio Executive" },
      { name: "Linda Hayes", role: "Eleanor" }
    ],
    posterColor: "#D4AF37",
    trailerUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    featured: true
  },
  {
    id: 6,
    title: "Shadow Protocol",
    tagline: "Trust no one. Question everything.",
    genre: ["Spy", "Thriller"],
    year: 2024,
    duration: "126 min",
    rating: "PG-13",
    synopsis: "An elite intelligence operative discovers a conspiracy that reaches the highest levels of government. Racing against time, she must decide between following orders and exposing the truth.",
    director: "Kevin Park",
    producer: "Sandra Liu",
    writer: "Thomas Wright",
    cinematographer: "Carlos Rodriguez",
    cast: [
      { name: "Natalie Storm", role: "Agent Sarah Cross" },
      { name: "Bradley Cooper", role: "Director Hayes" },
      { name: "Michelle Wong", role: "Analyst Kim" },
      { name: "Peter Grant", role: "Senator Morrison" }
    ],
    posterColor: "#1a1a2e",
    trailerUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    featured: false
  }
];

export const services = [
  {
    id: 1,
    name: "Development",
    tagline: "From concept to script",
    description: "We transform raw ideas into compelling narratives. Our development team works closely with writers, directors, and stakeholders to craft stories that resonate with audiences and achieve your creative vision.",
    features: [
      "Script Development & Analysis",
      "Story Consulting",
      "Concept Design",
      "Budget Planning",
      "Pitch Deck Creation",
      "Screenplay Writing & Editing"
    ],
    color: "#DC143C"
  },
  {
    id: 2,
    name: "Pre-Production",
    tagline: "Planning perfection",
    description: "Meticulous planning is the foundation of every successful production. We handle every detail from casting to location scouting, ensuring your project is ready to shoot efficiently and effectively.",
    features: [
      "Casting & Talent Management",
      "Location Scouting & Management",
      "Production Design",
      "Storyboarding & Previsualization",
      "Crew Assembly",
      "Scheduling & Logistics"
    ],
    color: "#D4AF37"
  },
  {
    id: 3,
    name: "Post-Production",
    tagline: "Where magic happens",
    description: "Our post-production suite brings your vision to life with cutting-edge editing, color grading, visual effects, and sound design. We polish every frame until it shines.",
    features: [
      "Film Editing & Assembly",
      "Color Grading & Correction",
      "Visual Effects (VFX)",
      "Sound Design & Mixing",
      "Music Composition & Licensing",
      "Final Mastering & Delivery"
    ],
    color: "#4a90e2"
  }
];

export const apps = [
  {
    id: 1,
    name: "CineTrack Pro",
    platform: "Web & iOS",
    description: "Comprehensive production management tool for tracking shoots, schedules, and crew communications in real-time.",
    features: ["Real-time Scheduling", "Crew Management", "Budget Tracking", "Shot Lists"],
    downloadLink: "#",
    color: "#DC143C"
  },
  {
    id: 2,
    name: "StoryBoard Studio",
    platform: "Web & Android",
    description: "Digital storyboarding application with collaborative features and AI-assisted shot composition tools.",
    features: ["AI Shot Suggestions", "Collaboration Tools", "Asset Library", "Export Options"],
    downloadLink: "#",
    color: "#D4AF37"
  },
  {
    id: 3,
    name: "Script Analyzer",
    platform: "Web",
    description: "Advanced screenplay analysis tool that provides insights on structure, pacing, character development, and dialogue.",
    features: ["Scene Analysis", "Character Tracking", "Pacing Metrics", "Industry Reports"],
    downloadLink: "#",
    color: "#4a90e2"
  }
];

export const templates = [
  {
    id: 1,
    name: "Production Call Sheet Template",
    description: "Professional call sheet template used by major studios. Includes all essential information for cast and crew.",
    format: "PDF & Excel",
    downloadLink: "#",
    category: "Production"
  },
  {
    id: 2,
    name: "Film Budget Template",
    description: "Comprehensive budget template covering all aspects of film production from pre to post-production.",
    format: "Excel",
    downloadLink: "#",
    category: "Production"
  },
  {
    id: 3,
    name: "Shooting Schedule Template",
    description: "Industry-standard shooting schedule template with automated scene breakdowns and day-out-of-days.",
    format: "PDF & Excel",
    downloadLink: "#",
    category: "Production"
  },
  {
    id: 4,
    name: "Location Agreement Template",
    description: "Legal template for securing filming locations with all necessary clauses and protections.",
    format: "Word & PDF",
    downloadLink: "#",
    category: "Legal"
  }
];

export const ebooks = [
  {
    id: 1,
    title: "The Modern Filmmaker's Guide",
    description: "Complete guide to independent filmmaking in the digital age, from concept to distribution.",
    pages: 280,
    format: "PDF & EPUB",
    downloadLink: "#",
    cover: "#8B0000",
    category: "Filmmaking"
  },
  {
    id: 2,
    title: "Cinematic Storytelling Secrets",
    description: "Master the art of visual storytelling with techniques used by award-winning directors.",
    pages: 195,
    format: "PDF & EPUB",
    downloadLink: "#",
    cover: "#D4AF37",
    category: "Directing"
  },
  {
    id: 3,
    title: "Post-Production Mastery",
    description: "Advanced techniques for editing, color grading, and sound design from industry professionals.",
    pages: 340,
    format: "PDF",
    downloadLink: "#",
    cover: "#4a90e2",
    category: "Post-Production"
  },
  {
    id: 4,
    title: "Screenplay Structure Blueprint",
    description: "Proven frameworks for crafting compelling screenplays that sell and resonate with audiences.",
    pages: 156,
    format: "PDF & EPUB",
    downloadLink: "#",
    cover: "#2a4a5a",
    category: "Writing"
  },
  {
    id: 5,
    title: "Cinematography Fundamentals",
    description: "Essential techniques for camera operation, lighting, and composition for aspiring cinematographers.",
    pages: 218,
    format: "PDF",
    downloadLink: "#",
    cover: "#5a3a1a",
    category: "Cinematography"
  }
];

export const testimonials = [
  {
    id: 1,
    name: "Jessica Martinez",
    role: "Independent Director",
    text: "Shadow Wolves Productions transformed my vision into reality. Their attention to detail and creative expertise is unmatched.",
    rating: 5
  },
  {
    id: 2,
    name: "David Chen",
    role: "Producer",
    text: "Working with Shadow Wolves was seamless from start to finish. They delivered beyond our expectations on time and on budget.",
    rating: 5
  },
  {
    id: 3,
    name: "Amanda Roberts",
    role: "Screenwriter",
    text: "The development team helped refine my script into something truly special. Their insights were invaluable.",
    rating: 5
  }
];