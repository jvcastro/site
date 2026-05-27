export type Project = {
  title: string
  description: string
  url: string
  tech: string[]
}

export type SiteLinks = {
  github: string
  linkedin: string
  email: string
  resumeUrl?: string
}

export type SiteConfig = {
  name: string
  shortName: string
  tagline: string
  location: string
  bio: string
  skills: string[]
  projects: Project[]
  links: SiteLinks
  chat: {
    heroPrompt: string
    suggestions: string[]
  }
  seo: {
    siteUrl: string
    ogImage: string
    description: string
  }
  builtWith: string[]
}

// Set NEXT_PUBLIC_SITE_URL in .env for production (e.g. https://your-domain.com)
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://johnvincentcastro.dev'

export const siteConfig: SiteConfig = {
  name: 'John Vincent Castro',
  shortName: 'Vince',
  tagline: 'Software Engineer',
  location: 'Philippines',
  bio: 'Software engineer focused on building reliable web applications and developer-friendly experiences. I enjoy working across the stack—from polished frontends to scalable APIs—and exploring how AI can augment how we build and learn.',
  skills: ['TypeScript', 'React', 'Next.js', 'Node.js', 'PostgreSQL', 'AWS'],
  projects: [
    {
      title: 'Personal AI Portfolio',
      description:
        'This site — an AI-powered portfolio chat built with Next.js and Dify.',
      url: 'https://github.com/jvcastro/site',
      tech: ['Next.js', 'Dify', 'Tailwind CSS'],
    },
    {
      title: 'Project Two',
      description:
        'Replace with a short description of a featured project you are proud of.',
      url: 'https://github.com/jvcastro',
      tech: ['React', 'Node.js'],
    },
    {
      title: 'Project Three',
      description:
        'Replace with another highlight — open source, work sample, or side project.',
      url: 'https://github.com/jvcastro',
      tech: ['TypeScript'],
    },
  ],
  links: {
    github: 'https://github.com/jvcastro',
    linkedin: 'https://www.linkedin.com/in/johnvincentcastro/',
    email: 'mailto:johnvincentcastro@gmail.com',
    resumeUrl:
      'https://drive.google.com/file/d/11t4guFVnYcboaG6jdbJZUKOBCccFCmu9/view?usp=drive_link',
  },
  chat: {
    heroPrompt: 'Ask about me, my experience, or stack.',
    suggestions: [
      'What is your work experience?',
      'What is your tech stack and skill set?',
      'What is your educational background?',
    ],
  },
  seo: {
    siteUrl,
    ogImage: '/vince-ai.png',
    description:
      'Personal website of John Vincent Castro — software engineer. Explore experience, skills, projects, and background via AI chat.',
  },
  builtWith: ['Next.js', 'Dify', 'Vercel'],
}

export function getPersonJsonLd() {
  const { name, tagline, links, seo } = siteConfig
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    jobTitle: tagline.split('·')[0]?.trim() ?? tagline,
    url: seo.siteUrl,
    sameAs: [links.github, links.linkedin],
  }
}
