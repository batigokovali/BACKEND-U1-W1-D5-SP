import Express from "express";
import uniqid from "uniqid"
import createHttpError from "http-errors";
import multer from "multer"
import { checkProductsSchema, triggerBadRequest } from "./validation.js";
import { extname } from "path"
import { getProducts, writeProducts, saveProductPictures } from "../../lib/fs-tools.js";

const productsRouter = Express.Router()

//POST a new Product
productsRouter.post("/", checkProductsSchema, triggerBadRequest, async (req, res, next) => {
    try {
        const newProduct = { ...req.body, productID: uniqid(), createdAt: new Date(), updatedAt: new Date() }
        const productsArray = await getProducts()
        productsArray.push(newProduct)
        await writeProducts(productsArray)
        res.status(201).send({ productID: newProduct.productID })
    } catch (error) {
        next(error)
    }
})

//GET all products
productsRouter.get("/", async (req, res, next) => {
    try {
        const allProducts = await getProducts()
        if (req.query && req.query.category) {
            const filteredProducts = allProducts.filter(product => product.category === req.query.category)
            res.send(filteredProducts)
        }
        res.send(allProducts)
    } catch (error) {
        next(error)
    }
})

//GET a single product with product ID
productsRouter.get("/:productID", async (req, res, next) => {
    try {
        const allProducts = await getProducts()
        const foundProduct = allProducts.find(product => product.productID === req.params.productID)
        if (foundProduct) {
            res.send(foundProduct)
        } else {
            next(createHttpError(404, `Product with ID ${req.params.productID} not found!`))
        }
    } catch (error) {
        next(error)
    }
})

//PUT a single product
productsRouter.put("/:productID", async (req, res, next) => {
    try {
        const allProducts = await getProducts()
        const i = allProducts.findIndex(product => product.productID === req.params.productID)

        if (i !== -1) {
            const oldProduct = allProducts[i]
            const updatedProduct = { ...oldProduct, ...req.body, updatedAt: new Date() }
            allProducts[i] = updatedProduct
            await writeProducts(allProducts)
            res.send(updatedProduct)
        } else {
            next(createHttpError(404, `Product with ID ${req.params.productID} not found!`))
        }
    } catch (error) {
        next(error)
    }
})

//DELETE a single product
productsRouter.delete("/:productID", async (req, res, next) => {
    try {
        const allProducts = await getProducts()
        const remainingProducts = allProducts.filter(product => product.productID !== req.params.productID)

        if (allProducts.length !== remainingProducts.length) {
            await writeProducts(remainingProducts)
            res.status(204).send()
        } else {
            next(createHttpError(404, `Product with ID ${req.params.productID} not found!`))
        }

    } catch (error) {
        next(error)
    }
})

//POST product picture
productsRouter.post("/:productID/upload", multer().single("productpicture"), async (req, res, next) => {
    try {
        const allProducts = await getProducts()
        const i = allProducts.findIndex(product => product.productID === req.params.productID)
        if (i !== -1) {
            console.log("FILE:", req.file)
            console.log("BODY:", req.body)
            const originalFileExtension = extname(req.file.originalname)
            const fileName = req.params.productID + originalFileExtension
            await saveProductPictures(fileName, req.file.buffer)

            const oldProduct = allProducts[i]
            const updatedProduct = { ...oldProduct, ...req.body, imageURL: `http://localhost:3001/img/products/${fileName}`, updatedAt: new Date() }
            allProducts[i] = updatedProduct
            await writeProducts(allProducts)
            res.send({ message: "Product image has been uploaded!" })
        } else {
            next(createHttpError(404, `Product with ID ${req.params.productID} not found!`))
        }

    } catch (error) {
        next(error)
    }
})

export default productsRouter