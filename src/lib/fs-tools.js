import fs from "fs-extra"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const { readJSON, writeJSON, writeFile } = fs

const dataFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../data")
const productsJSONPath = join(dataFolderPath, "products.json")
const reviewsJSONPath = join(dataFolderPath, "reviews.json")

const productsPicturesPublicFolderPath = join(process.cwd(), "./public/img/products")

export const getProducts = () => readJSON(productsJSONPath)
export const writeProducts = productsArray => writeJSON(productsJSONPath, productsArray)
export const saveProductPictures = (fileName, fileContentAsBuffer) => writeFile(join(productsPicturesPublicFolderPath, fileName), fileContentAsBuffer)

export const getReviews = () => readJSON(reviewsJSONPath)
export const writeReviews = reviewsArray => writeJSON(reviewsJSONPath, reviewsArray)