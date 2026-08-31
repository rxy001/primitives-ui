import type { Placement, Coordinates, Rect } from './types'
import { getSide, getAlignment, getAlignmentAxis, getAxisLength } from './utils'

export function computeCoordinatesByPlacement(
  rects: { reference: Rect; floating: Rect },
  placement: Placement,
): Coordinates {
  const side = getSide(placement)
  const alignment = getAlignment(placement)
  const crossAxis = getAlignmentAxis(placement)
  const crossAxisLength = getAxisLength(crossAxis)

  let coordinates: Coordinates

  const commonX =
    rects.reference.x + rects.reference.width / 2 - rects.floating.width / 2
  const commonY =
    rects.reference.y + rects.reference.height / 2 - rects.floating.height / 2

  const commonCrossAxis =
    rects.reference[crossAxisLength] / 2 - rects.floating[crossAxisLength] / 2

  switch (side) {
    case 'top':
      coordinates = {
        x: commonX,
        y: rects.reference.y - rects.floating.height,
      }
      break
    case 'bottom':
      coordinates = {
        x: commonX,
        y: rects.reference.y + rects.reference.height,
      }
      break
    case 'right':
      coordinates = {
        x: rects.reference.x + rects.reference.width,
        y: commonY,
      }
      break
    case 'left':
      coordinates = {
        x: rects.reference.x - rects.floating.width,
        y: commonY,
      }
      break
    default:
      console.error('Warning: Invalid placement')
      coordinates = {
        x: commonX,
        y: rects.reference.y + rects.reference.height,
      }
  }

  switch (alignment) {
    case 'start':
      coordinates[crossAxis] -= commonCrossAxis
      break

    case 'end':
      coordinates[crossAxis] += commonCrossAxis
      break
    default:
      break
  }

  return coordinates
}
