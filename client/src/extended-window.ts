// This is our solution to using the window object in typescript
export const extendedWindow: ExtendedWindow = window as any

interface ExtendedWindow extends Window {
	s3: any
}
