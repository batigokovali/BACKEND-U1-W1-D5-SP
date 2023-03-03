import Express from "express";
import uniqid from "uniqid"
import createHttpError from "http-errors";
import { getReviews, writeReviews, getProducts } from "../../lib/fs-tools.js";
import { checkReviewsSchema, triggerBadRequest } from "./validation.js";

const reviewsRouter = Express.Router()

//POST a review
reviewsRouter.post("/:productID/reviews", checkReviewsSchema, triggerBadRequest, async (req, res, next) => {
    try {
        const products = await getProducts()
        const i = products.findIndex(product => product.productID === req.params.productID)
        if (i !== -1) {
            const newReview = { ...req.body, reviewID: uniqid(), productID: req.params.productID, createdAt: new Date(), updatedAt: new Date() }
            const reviews = await getReviews()
            reviews.push(newReview)
            await writeReviews(reviews)
            res.status(201).send({ reviewID: newReview.reviewID })
        } else {
            next(createHttpError(404, `Product with ID ${req.params.productID} that you're trying to post a review for was not found!`))
        }
    } catch (error) {
        next(error)
    }
})

//GET list of reviews
reviewsRouter.get("/:productID/reviews", async (req, res, next) => {
    try {
        const products = await getProducts()
        const i = products.findIndex(product => product.productID === req.params.productID)
        if (i !== -1) {
            const reviews = await getReviews()
            const specificReviews = reviews.filter(product => product.productID === req.params.productID)
            res.send(specificReviews)
        } else {
            next(createHttpError(404, `Product with ID ${req.params.productID} that you're trying to see reviews for was not found!`))
        }
    } catch (error) {
        next(error)
    }
})

//GET a single review
reviewsRouter.get("/:productID/reviews/:reviewID", async (req, res, next) => {
    try {
        const products = await getProducts()
        const i = products.findIndex(product => product.productID === req.params.productID)
        if (i !== -1) {
            const reviews = await getReviews()
            const filteredReviews = reviews.filter(review => review.reviewID === req.params.reviewID)
            res.send(filteredReviews)
        } else {
            next(createHttpError(404, `Product with ID ${req.params.productID} that you're trying to see reviews for was not found!`))
        }
    } catch (error) {
        next(error)
    }
})

//PUT a review
reviewsRouter.put("/:productID/reviews/:reviewID", async (req, res, next) => {
    try {
        const products = await getProducts()
        const i = products.findIndex(product => product.productID === req.params.productID)
        if (i !== -1) {
            const reviews = await getReviews()
            const j = reviews.findIndex(review => review.reviewID === req.params.reviewID)
            if (j !== -1) {
                const oldReview = reviews[j]
                const updatedReview = { ...oldReview, ...req.body, updatedAt: new Date() }
                reviews[j] = updatedReview
                await writeReviews(reviews)
                res.send(updatedReview)
            } else {
                next(createHttpError(404, `Review with ID ${req.params.productID} was not found!`))
            }
        } else {
            next(createHttpError(404, `Product with ID ${req.params.productID} that you're trying to see update the review was not found!`))
        }
    } catch (error) {
        next(error)
    }
})

//DELETE a review
reviewsRouter.delete("/:productID/reviews/:reviewID", async (req, res, next) => {
    try {
        const products = await getProducts()
        const i = products.findIndex(product => product.productID === req.params.productID)
        if (i !== -1) {
            const reviews = await getReviews()
            const j = reviews.findIndex(review => review.reviewID === req.params.reviewID)
            if (j !== -1) {
                const remainingReviews = reviews.filter(review => review.reviewID === req.params.reviewID)
                await writeReviews(remainingReviews)
                res.status(204).send({ message: `Review with ID ${req.params.productID} has been terminated!` })
            } else {
                next(createHttpError(404, `Review with ID ${req.params.productID} was not found!`))
            }
        } else {
            next(createHttpError(404, `Product with ID ${req.params.productID} that you're trying to delete the review was not found!`))
        }
    } catch (error) {
        next(error)
    }
})

export default reviewsRouter