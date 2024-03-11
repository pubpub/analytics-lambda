// @ts-check
import { defineConfig } from 'tsup';

const config = defineConfig({
	format: ['cjs'],
	dts: false,
	clean: true,
	bundle: true,
	entry: ['src'],
	minify: true,
	noExternal: ['crypto-js'],
});

export default config;
