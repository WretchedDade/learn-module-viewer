import { useCallback } from 'react'

export interface ScrollResetOptions {
	/** The scroll container (defaults to window). */
	container?: MaybeRef<ScrollContainer>
	/** Element inside the container to scroll to (defaults to top). */
	element?: MaybeRef<HTMLElement>
}

/**
 * Hook returning a function that resets scroll position.
 *
 * Accepts a single options object for clarity:
 *  - container: The scroll container (defaults to window)
 *  - element: The element inside the container to scroll to (defaults to top of container)
 *
 * Both fields may be the element itself or a React ref object.
 */
export function useScrollReset(options?: ScrollResetOptions) {
	const { container, element } = options ?? {}

	// SSR safety – return a stable no-op until mounted in a browser.
	if (typeof window === 'undefined') {
		return useCallback(() => {}, [])
	}

	const resolve = <T,>(value: MaybeRef<T>): T | undefined => {
		if (!value) return undefined
		if (typeof (value as any).current !== 'undefined') {
			return (value as any).current ?? undefined
		}
		return value as T
	}

	const getContainer = () => (resolve(container) as ScrollContainer | undefined) ?? window
	const getElement = () => resolve(element)

	/** Scrolls the container (or window) to the specified element or top. */
	const resetScroll = useCallback(() => {
		const c = getContainer()
		const el = getElement()
		if (!c) return

		if (isWindow(c)) {
			if (el) {
				try {
					el.scrollIntoView({ block: 'start', inline: 'nearest' })
				} catch {
					c.scrollTo({ top: 0, left: 0 })
				}
			} else {
				c.scrollTo({ top: 0, left: 0 })
			}
			return
		}

		if (el && c.contains(el)) {
			const top = computeOffsetWithinContainer(c, el)
			c.scrollTo({ top })
		} else {
			c.scrollTo({ top: 0, left: 0 })
		}
	}, [container, element])

	return resetScroll
}

// Types & helpers
type ScrollContainer = Window | HTMLElement
type MaybeRef<T> = T | { current: T | null } | null | undefined

function isWindow(obj: any): obj is Window {
	return obj && obj === obj.window
}

function computeOffsetWithinContainer(container: HTMLElement, el: HTMLElement) {
	// Uses bounding rects to compute position relative to container's current scroll position.
	const containerRect = container.getBoundingClientRect()
	const elRect = el.getBoundingClientRect()
	return elRect.top - containerRect.top + container.scrollTop
}

export default useScrollReset
