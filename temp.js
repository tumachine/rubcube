
function colorRubik(matrix, cubes, sideLength) {
    const totalColors = sideLength * sideLength
    const faceSides = {
        left: 0,
        right: 2,
        top: 4,
        bottom: 6,
        front: 8,
        back: 10,
    }

    let counter = 0
    for (let cube = 0; cube < totalColors; cube++) {
        cubes[cube].setColor(faceSides.bottom, matrix[sides.bottom][cube])
    }

    // color bottom
    let counter = 0
    for (let cube = 0; cube < totalColors; cube++) {
        const matrixColor = matrix[3][counter]
        cubes[cube].setColor(faceSides.bottom, matrixColor)
        counter++
    }

    // color top
    counter = 0
    for (let cube = cubes.length - totalColors; cube < cubes.length; cube++) {
        const matrixColor = matrix[2][counter]
        cubes[cube].setColor(faceSides.top, matrixColor)
        counter++
    }

    // color left
    counter = 0
    for (let cube = 0; cube < cubes.length; cube += sideLength) {
        const matrixColor = matrix[0][counter]
        cubes[cube].setColor(faceSides.right, matrixColor)
        counter++
    }
    // color right
    counter = 0
    for (let cube = sideLength - 1; cube < cubes.length; cube += sideLength) {
        const matrixColor = matrix[1][counter]
        cubes[cube].setColor(faceSides.left, matrixColor)
        counter++
    }

    // color back and front
    counter = 0
    const lastSide = sideLength * sideLength - sideLength
    for (let slice = 0; slice < sideLength; slice++) {
        const start = slice * totalColors
        const end = start + sideLength
        for (let cube = start; cube < end; cube++) {
            // color back
            let matrixColor = matrix[5][counter]
            cubes[cube].setColor(faceSides.back, matrixColor)
            // color front
            matrixColor = matrix[4][counter]
            cubes[cube+lastSide].setColor(faceSides.front, matrixColor)
            counter++
        }
    }
}