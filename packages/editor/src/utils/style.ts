import { isObject } from "lodash-es"

export const setStyle = (
    element: HTMLElement,
    styleName: string | Record<string, string | number>,
    value?: string | number
  ) => {
    if (!element || !styleName) return
  
    if (isObject(styleName)) {
      Object.entries(styleName).forEach(([prop, value]) =>
        setStyle(element, prop as any, value as any)
      )
    } else {
    
      element.style[styleName as any] = value as any
    }
  }