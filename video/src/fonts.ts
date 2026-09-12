import {loadFont as loadFraunces} from '@remotion/google-fonts/Fraunces';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';

// Each stack keeps a real fallback, so a font that fails to fetch degrades
// rather than blocking the render.
const fraunces = loadFraunces('normal', {weights: ['600', '700'], subsets: ['latin']});
// the slogan is set in a real italic, not a slanted roman
loadFraunces('italic', {weights: ['600'], subsets: ['latin']});
const inter = loadInter('normal', {weights: ['400', '500', '600'], subsets: ['latin']});
const mono = loadMono('normal', {weights: ['400', '500'], subsets: ['latin']});

export const SERIF = `${fraunces.fontFamily}, Georgia, 'Times New Roman', serif`;
export const SANS = `${inter.fontFamily}, system-ui, -apple-system, sans-serif`;
export const MONO = `${mono.fontFamily}, Menlo, 'SF Mono', monospace`;
