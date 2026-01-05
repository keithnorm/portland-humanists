/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				// Custom brand colors from logo
				'brand': {
					'navy': '#1e3a5f',     // Main navy blue from logo
					'navy-light': '#2a4d7f', // Lighter navy for hovers
					'navy-dark': '#162d4a',  // Darker navy
					'blue': '#4a90e2',      // Light blue from logo
					'gold': '#f4b942',      // Gold/yellow from logo
				},
			},
		},
	},
	plugins: [],
}
