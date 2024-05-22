// @ts-check
import { defineConfig } from 'tsup';

const config = defineConfig({
	format: ['cjs'],
	dts: false,
	clean: true,
	bundle: true,
	entry: ['src'],
	noExternal: ['countries-and-timezones'],
});

export default config;
