'use client'

import Image from 'next/image'
import {
  FaEnvelope,
  FaFileDownload,
  FaGithub,
  FaLinkedin,
} from 'react-icons/fa'
import { siteConfig } from '@/config/site'

type SiteHeaderProps = {
  compact?: boolean
}

export default function SiteHeader({ compact = false }: SiteHeaderProps) {
  const { name, shortName, tagline, location, skills, links } = siteConfig

  return (
    <header className="relative z-10 mx-auto w-full max-w-5xl shrink-0 px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8">
      <div className="flex flex-col items-center gap-3">
        <Image
          src="/vince-ai.png"
          alt={`Portrait of ${name}`}
          width={144}
          height={144}
          priority
          className={`ring-foreground/10 rounded-full ring-2 transition-all ${
            compact
              ? 'h-16 w-16 sm:h-20 sm:w-20'
              : 'h-24 w-24 sm:h-32 sm:w-32'
          }`}
        />

        <div className="text-center">
          <h1 className="text-foreground/90 text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
            Hi, I&apos;m {shortName}
          </h1>
          <p className="text-muted mt-1 text-sm sm:text-base">{tagline}</p>
          <p className="text-muted/80 mt-0.5 text-xs">{location}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="border-border bg-accent-subtle font-mono rounded-full border px-2.5 py-1 text-xs text-foreground/80"
            >
              {skill}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <a
            href={links.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="text-foreground/70 hover:text-foreground cursor-pointer p-2 transition-colors"
          >
            <FaGithub className="h-5 w-5" aria-hidden />
          </a>
          <a
            href={links.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="text-foreground/70 hover:text-foreground cursor-pointer p-2 transition-colors"
          >
            <FaLinkedin className="h-5 w-5" aria-hidden />
          </a>
          <a
            href={links.email}
            aria-label="Email"
            className="text-foreground/70 hover:text-foreground cursor-pointer p-2 transition-colors"
          >
            <FaEnvelope className="h-5 w-5" aria-hidden />
          </a>
          {links.resumeUrl && (
            <a
              href={links.resumeUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Download resume"
              className="text-foreground/70 hover:text-foreground cursor-pointer p-2 transition-colors"
            >
              <FaFileDownload className="h-5 w-5" aria-hidden />
            </a>
          )}
        </div>
      </div>
    </header>
  )
}
