export function Footer() {
  return (
    <footer className="py-4 border-t border-border transition-colors duration-300 mt-auto">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <p className="text-sm text-muted-foreground transition-colors duration-300 flex items-center justify-center gap-1.5 flex-wrap">
          Made by
          <a
            href="https://github.com/AiverAiva/"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1 transition-colors hover:text-foreground font-medium"
          >
            <span className="border-b border-transparent hover:border-current transition-all">AiverAiva</span>
          </a>
          with <span className="transition-transform duration-300 hover:scale-110 text-red-500">❤</span>
          <span className="opacity-50 mx-1">|</span>
          <a
            href="https://github.com/AiverAiva/BannerCraft"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4"></path>
            </svg>
            <span className="border-b border-transparent hover:border-current transition-all">Github</span>
          </a>
        </p>
      </div>
    </footer>
  );
}
