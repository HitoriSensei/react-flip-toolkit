import React, {
  FunctionComponent,
  Children,
  cloneElement,
  ReactElement
} from 'react'
import PropTypes from 'prop-types'
import { utilities, constants } from '../FlipToolkit'
import { FlippedProps, SerializableFlippedProps } from '../FlipToolkit/types'
import { FlipContext, PortalContext } from '../Flipper/context'
import { assign } from '../FlipToolkit/utilities'

function isFunction(child: any): child is Function {
  return typeof child === 'function'
}

// This wrapper creates child components for the main Flipper component
export const Flipped: FunctionComponent<SerializableFlippedProps> = ({
  children,
  flipId,
  inverseFlipId,
  portalKey,
  gestureHandlers,
  ...rest
}) => {
  let child = children
  const isFunctionAsChildren = isFunction(child)

  if (!isFunctionAsChildren) {
    try {
      child = Children.only(children)
    } catch (e) {
      throw new Error('Each Flipped component must wrap a single child')
    }
  }

  // if nothing is being animated, assume everything is being animated
  if (!rest.scale && !rest.translate && !rest.opacity) {
    utilities.assign(rest, {
      translate: true,
      scale: true,
      opacity: true
    })
  }

  const dataAttributes: Record<string, string | undefined> = {
    [constants.DATA_FLIP_CONFIG]: JSON.stringify(rest)
  }

  if (flipId) dataAttributes[constants.DATA_FLIP_ID] = String(flipId)
  else if (inverseFlipId)
    dataAttributes[constants.DATA_INVERSE_FLIP_ID] = String(inverseFlipId)

  if (portalKey) {
    dataAttributes[constants.DATA_PORTAL_KEY] = portalKey
  }
  if (isFunctionAsChildren) {
    return (child as Function)(dataAttributes)
  }
  if (gestureHandlers) {
    assign(dataAttributes, gestureHandlers)
  }
  return cloneElement(child as ReactElement<any>, dataAttributes)
}
// @ts-ignore
export const FlippedWithContext: FunctionComponent<FlippedProps> = ({
  children,
  flipId,
  shouldFlip,
  shouldInvert,
  onAppear,
  onStart,
  onStartImmediate,
  onComplete,
  onExit,
  onSpringUpdate,
  gestureHandlers,
  ...rest
}) => {
  if (!children) {
    return null
  }
  if (rest.inverseFlipId) {
    return <Flipped {...rest}>{children}</Flipped>
  }

  return (
    <PortalContext.Consumer>
      {portalKey => (
        <FlipContext.Consumer>
          {data => {
            // if there is no surrounding Flipper component,
            // we don't want to throw an error, so check
            // that data exists and is not the default string
            if (utilities.isObject(data) && flipId) {
              data[flipId] = {
                shouldFlip,
                shouldInvert,
                onAppear,
                onStart,
                onStartImmediate,
                onComplete,
                onExit,
                onSpringUpdate
              }
            }
            return (
              <Flipped
                flipId={flipId}
                {...rest}
                portalKey={portalKey}
                gestureHandlers={gestureHandlers}
              >
                {children}
              </Flipped>
            )
          }}
        </FlipContext.Consumer>
      )}
    </PortalContext.Consumer>
  )
}
if (process.env.NODE_ENV !== 'production') {
  // @ts-ignore
  FlippedWithContext.propTypes = {
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
    inverseFlipId: PropTypes.string,
    flipId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    opacity: PropTypes.bool,
    translate: PropTypes.bool,
    scale: PropTypes.bool,
    transformOrigin: PropTypes.string,
    spring: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    onStart: PropTypes.func,
    onStartImmediate: PropTypes.func,
    onComplete: PropTypes.func,
    onAppear: PropTypes.func,
    onSpringUpdate: PropTypes.func,
    shouldFlip: PropTypes.func,
    shouldInvert: PropTypes.func,
    onExit: PropTypes.func,
    portalKey: PropTypes.string,
    stagger: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    gestureHandlers: PropTypes.object
  }
}

FlippedWithContext.displayName = 'Flipped'

export default FlippedWithContext
