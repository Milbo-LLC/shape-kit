import { mat4, vec3 } from 'gl-matrix'

type Transform = {
  position?: vec3
  rotation?: vec3
  scale?: vec3
}

export const identityMatrix = () => mat4.create()

export const composeTransform = ({
  position = vec3.create(),
  rotation = vec3.create(),
  scale = vec3.fromValues(1, 1, 1)
}: Transform = {}) => {
  const matrix = mat4.create()
  mat4.translate(matrix, matrix, position)
  mat4.rotateX(matrix, matrix, rotation[0] ?? 0)
  mat4.rotateY(matrix, matrix, rotation[1] ?? 0)
  mat4.rotateZ(matrix, matrix, rotation[2] ?? 0)
  mat4.scale(matrix, matrix, scale)
  return matrix
}
