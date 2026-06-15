import crypto from 'crypto'

/** Default founders — matches website FOUNDERS_INFO */
export const INITIAL_STAFF = [
  {
    id: crypto.randomUUID(),
    name: 'Anil Kumar Ghorakavi',
    role: 'Founder',
    credentials: 'Ex-Oracle, Amazon',
    bgClass: 'from-[#ff8541]/10 to-[#ff8541]/20',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&h=300&q=80',
    companies: ['Oracle', 'Amazon'],
  },
  {
    id: crypto.randomUUID(),
    name: 'Rakesh Kumar',
    role: 'Founder',
    credentials: 'Founder, Engrip & 10000 Coders',
    bgClass: 'from-[#e84975]/10 to-[#e84975]/20',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&h=300&q=80',
    companies: ['engrip', 'Revid'],
  },
  {
    id: crypto.randomUUID(),
    name: 'Praveen Kumar',
    role: 'Co-Founder',
    credentials: 'Ex-Microsoft',
    bgClass: 'from-[#00a86b]/10 to-[#00a86b]/20',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300&q=80',
    companies: ['Microsoft'],
  },
]
