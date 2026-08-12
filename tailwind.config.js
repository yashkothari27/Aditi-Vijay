/**
 * Source of truth for the site's Tailwind theme.
 *
 * tailwind.css is a prebuilt artifact and IS committed, so the site stays a
 * plain static deploy with no build step on Vercel. Regenerate it after adding
 * or removing utility classes in the HTML:
 *
 *   npx tailwindcss@3.4.17 -c tailwind.config.js -i tailwind.input.css -o tailwind.css --minify
 */
module.exports = {
  content: ['./index.html', './photography.html'],
  theme: {
    extend: {
      colors: {
        cream: "#f5efe6",
        pink: "#e8c9a8",
        black: "#111111",
        darkGray: "#1f1f1f",
      },
      fontFamily: {
        display: ["League Gothic", "sans-serif"],
        body: ["Plus Jakarta Sans", "sans-serif"],
        script: ["Dancing Script", "cursive"],
        headline: ["Space Grotesk", "sans-serif"]
      }
    }
  }
}
