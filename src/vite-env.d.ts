/// <reference types="vite/client" />

declare global {
	interface Window {
		Buffer: typeof Buffer
	}

	// eslint-disable-next-line no-var
	var Buffer: typeof import('buffer').Buffer
}

export {}
